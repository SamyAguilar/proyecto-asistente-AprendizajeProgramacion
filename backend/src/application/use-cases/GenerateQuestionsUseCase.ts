import { GenerarPreguntasRequest, GenerarPreguntasResponse, PreguntaGenerada } from '../../domain/entities/QuestionGeneration';
import { IGeminiClient } from '../../domain/interfaces/IGeminiClient';
import { ICacheService } from '../../domain/interfaces/ICacheService';
import { AppDataSource } from '../../config/database';
import { Subtema } from '../../models/Subtema';
import { PreguntaQuiz } from '../../models/PreguntaQuiz';
import { OpcionRespuesta } from '../../models/OpcionRespuesta';

export class GenerateQuestionsUseCase {
  constructor(
    private geminiClient: IGeminiClient,
    private cacheService: ICacheService
  ) {}

  async execute(request: GenerarPreguntasRequest): Promise<GenerarPreguntasResponse> {
    console.log('🔍 [UseCase] Iniciando generación de preguntas...');

    try {
      // 1. Buscar en caché primero
      const cacheResult = await this.cacheService.buscarPreguntasEnCache(
        request.subtema_id,
        request.cantidad,
        request.dificultad
      );

      if (cacheResult.encontrado && cacheResult.data.length >= request.cantidad) {
        console.log(`✓ [UseCase] ${cacheResult.data.length} preguntas encontradas en caché`);
        return {
          preguntas: cacheResult.data.slice(0, request.cantidad),
          subtema_id: request.subtema_id,
          cantidad_generada: request.cantidad
        };
      }

      // 2. Obtener contexto del subtema de BD
      const subtemaRepo = AppDataSource.getRepository(Subtema);
      const subtema = await subtemaRepo.findOne({
        where: { id: request.subtema_id },
        relations: ['tema']
      });

      if (!subtema) {
        throw new Error(`Subtema ${request.subtema_id} no encontrado`);
      }

      // 3. Construir prompt para Gemini (Prompt 1 del documento)
      const prompt = this.buildPrompt(subtema, request);

      console.log('🤖 [UseCase] Llamando a Gemini para generar preguntas...');
      const respuestaGemini = await this.geminiClient.generate(prompt, {
        temperature: 0.7,
        maxTokens: 2048,
        tipo: 'question_generation'
      });

      // 4. Parsear respuesta JSON
      const preguntasGeneradas = this.parseResponse(respuestaGemini);

      // 5. Validar formato
      this.validateQuestions(preguntasGeneradas);

      // 6. Guardar en base de datos
      await this.saveQuestionsToDatabase(preguntasGeneradas, request.subtema_id);

      // 7. Guardar en caché
      await this.cacheService.guardarPreguntasEnCache(request.subtema_id, preguntasGeneradas);

      console.log(`✓ [UseCase] ${preguntasGeneradas.length} preguntas generadas y guardadas`);

      return {
        preguntas: preguntasGeneradas.slice(0, request.cantidad),
        subtema_id: request.subtema_id,
        cantidad_generada: preguntasGeneradas.length
      };

    } catch (error: any) {
      console.error('❌ [UseCase] Error al generar preguntas:', error.message);
      throw new Error(`Error al generar preguntas: ${error.message}`);
    }
  }

  private buildPrompt(subtema: Subtema, request: GenerarPreguntasRequest): string {
    return `
Eres un EXPERTO en educación de programación. Tu tarea es generar preguntas de quiz de alta calidad.

**CONTEXTO DEL SUBTEMA:**
- Tema: ${subtema.tema?.nombre || 'N/A'}
- Subtema: ${subtema.nombre}
- Descripción: ${subtema.descripcion}
- Contenido: ${subtema.contenidoDetalle || 'Ver descripción'}

**REQUISITOS:**
- Generar ${request.cantidad} preguntas de opción múltiple
- Dificultad: ${request.dificultad}
- 4 opciones por pregunta (solo 1 correcta)
- Distractores plausibles (opciones incorrectas que parezcan correctas)
- Explicaciones pedagógicas

**FORMATO DE RESPUESTA (JSON):**
{
  "preguntas": [
    {
      "texto": "¿Pregunta clara y específica?",
      "opciones": [
        {
          "texto": "Opción A",
          "es_correcta": true,
          "explicacion": "Por qué es correcta"
        },
        {
          "texto": "Opción B",
          "es_correcta": false,
          "explicacion": "Por qué es incorrecta"
        },
        {
          "texto": "Opción C",
          "es_correcta": false,
          "explicacion": "Por qué es incorrecta"
        },
        {
          "texto": "Opción D",
          "es_correcta": false,
          "explicacion": "Por qué es incorrecta"
        }
      ],
      "dificultad": "${request.dificultad}",
      "retroalimentacion_correcta": "¡Excelente! Explicación detallada...",
      "retroalimentacion_incorrecta": "No es correcto. La respuesta correcta es... porque...",
      "explicacion_detallada": "Explicación profunda del concepto",
      "puntos": 10
    }
  ]
}

**CRITERIOS DE CALIDAD:**
1. Preguntas claras y sin ambigüedad
2. Cubrir diferentes aspectos del subtema
3. Distractores basados en errores comunes
4. Explicaciones que enseñen, no solo corrijan
5. Progresión de dificultad si se solicitan múltiples preguntas

Responde SOLO con el JSON, sin texto adicional.
`;
  }

  private parseResponse(respuesta: string): PreguntaGenerada[] {
    try {
      // Buscar JSON en la respuesta
      const jsonMatch = respuesta.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No se encontró JSON en la respuesta');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      if (!parsed.preguntas || !Array.isArray(parsed.preguntas)) {
        throw new Error('Formato de respuesta inválido: falta array de preguntas');
      }

      return parsed.preguntas;
    } catch (error: any) {
      console.error('Error al parsear respuesta:', error);
      throw new Error('Respuesta inválida de Gemini');
    }
  }

  private validateQuestions(preguntas: PreguntaGenerada[]): void {
    for (const pregunta of preguntas) {
      if (!pregunta.texto || !pregunta.opciones || pregunta.opciones.length !== 4) {
        throw new Error('Pregunta inválida: debe tener texto y exactamente 4 opciones');
      }

      const correctas = pregunta.opciones.filter(o => o.es_correcta);
      if (correctas.length !== 1) {
        throw new Error('Pregunta inválida: debe tener exactamente 1 opción correcta');
      }
    }
  }

  private async saveQuestionsToDatabase(preguntas: PreguntaGenerada[], subtema_id: number): Promise<void> {
    try {
      const preguntaRepo = AppDataSource.getRepository(PreguntaQuiz);
      const opcionRepo = AppDataSource.getRepository(OpcionRespuesta);

      for (const pregunta of preguntas) {
        // Crear pregunta
        const nuevaPregunta = preguntaRepo.create({
          subtemaId: subtema_id,
          preguntaTexto: pregunta.texto,
          dificultad: pregunta.dificultad as any,
          tipoPregunta: 'opcion_multiple' as any,
          retroalimentacionCorrecta: pregunta.retroalimentacion_correcta,
          retroalimentacionIncorrecta: pregunta.retroalimentacion_incorrecta,
          generadoPorLlm: true
        });

        const preguntaGuardada = await preguntaRepo.save(nuevaPregunta);

        // Crear opciones
        for (let i = 0; i < pregunta.opciones.length; i++) {
          const opcion = pregunta.opciones[i];
          const nuevaOpcion = opcionRepo.create({
            preguntaId: preguntaGuardada.id,
            textoOpcion: opcion.texto,
            esCorrecta: opcion.es_correcta,
            explicacion: opcion.explicacion,
            orden: i + 1
          });

          await opcionRepo.save(nuevaOpcion);
        }
      }

      console.log(`💾 [UseCase] ${preguntas.length} preguntas guardadas en BD`);
    } catch (error: any) {
      console.warn('⚠️ [UseCase] Error al guardar en BD (continuando):', error.message);
    }
  }
}
