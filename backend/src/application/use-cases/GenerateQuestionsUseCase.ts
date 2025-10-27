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
    console.log('[UseCase] Iniciando generación de preguntas...');

    try {
      // 1. Buscar en caché primero
      const cacheResult = await this.cacheService.buscarPreguntasEnCache(
        request.subtema_id,
        request.cantidad,
        request.dificultad
      );

      if (cacheResult.encontrado && cacheResult.data.length >= request.cantidad) {
        console.log(`OK [UseCase] ${cacheResult.data.length} preguntas encontradas en caché`);
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

      console.log('GEMINI [UseCase] Llamando a Gemini para generar preguntas...');
      const respuestaGemini = await this.geminiClient.generate(prompt, {
        temperature: 0.7,
        maxTokens: 3000,  // Reducido de 6000 a 3000 para evitar respuestas muy largas
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

      console.log(`OK [UseCase] ${preguntasGeneradas.length} preguntas generadas y guardadas`);

      return {
        preguntas: preguntasGeneradas.slice(0, request.cantidad),
        subtema_id: request.subtema_id,
        cantidad_generada: preguntasGeneradas.length
      };

    } catch (error: any) {
      console.error('ERROR [UseCase] Error al generar preguntas:', error.message);
      throw new Error(`Error al generar preguntas: ${error.message}`);
    }
  }

  /**
   * PROMPT 1 del documento (Generación de Preguntas)
   * Optimizado para respuestas concisas y evitar truncamiento
   */
  private buildPrompt(subtema: Subtema, request: GenerarPreguntasRequest): string {
    return `Eres un experto en educación. Genera ${request.cantidad} preguntas de opción múltiple.

CONTEXTO:
Tema: ${subtema.tema?.nombre || 'N/A'}
Subtema: ${subtema.nombre}
Contenido: ${subtema.contenidoDetalle?.substring(0, 200) || subtema.descripcion}

REQUISITOS:
- ${request.cantidad} preguntas
- Dificultad: ${request.dificultad}
- 4 opciones (1 correcta)
- Explicaciones ULTRA BREVES (máximo 8 palabras cada una)

IMPORTANTE - LÍMITES ESTRICTOS:
- Responde SOLO JSON válido sin markdown
- Explicaciones de opciones: máximo 8 palabras
- Retroalimentaciones: máximo 15 palabras
- Explicación detallada: máximo 25 palabras
- RESPUESTAS CONCISAS para evitar truncamiento

FORMATO JSON:
{
  "preguntas": [
    {
      "texto": "Pregunta clara",
      "opciones": [
        {"texto": "Opción A", "es_correcta": true, "explicacion": "Breve (max 10 palabras)"},
        {"texto": "Opción B", "es_correcta": false, "explicacion": "Breve (max 10 palabras)"},
        {"texto": "Opción C", "es_correcta": false, "explicacion": "Breve (max 10 palabras)"},
        {"texto": "Opción D", "es_correcta": false, "explicacion": "Breve (max 10 palabras)"}
      ],
      "dificultad": "${request.dificultad}",
      "retroalimentacion_correcta": "Breve (max 20 palabras)",
      "retroalimentacion_incorrecta": "Breve (max 20 palabras)",
      "explicacion_detallada": "Breve (max 30 palabras)",
      "puntos": 10
    }
  ]
}

Responde SOLO el JSON.`;
  }

  /**
   * Parsea la respuesta de Gemini y extrae el JSON de preguntas
   * Maneja respuestas truncadas y con formato markdown
   */
  private parseResponse(respuesta: string): PreguntaGenerada[] {
    try {
      console.log('DEBUG [Parse] Iniciando parseo de preguntas...');
      console.log('INFO [Parse] Longitud de respuesta:', respuesta.length);
      
      // Verificar si la respuesta está vacía
      if (!respuesta || respuesta.trim().length === 0) {
        console.error('ERROR [Parse] La respuesta de Gemini está vacía');
        throw new Error('Respuesta vacía de Gemini');
      }
      
      // Limpiar la respuesta: remover bloques de código markdown
      let cleanResponse = respuesta.trim();
      
      // Remover múltiples variantes de bloques markdown
      cleanResponse = cleanResponse
        .replace(/^```json\s*/i, '')
        .replace(/^```javascript\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();
      
      console.log('CLEAN [Parse] Longitud después de limpieza:', cleanResponse.length);
      
      // Buscar el primer { y el último }
      const primerLlave = cleanResponse.indexOf('{');
      let ultimaLlave = cleanResponse.lastIndexOf('}');
      
      console.log('DEBUG [Parse] Índice primera llave {:', primerLlave);
      console.log('DEBUG [Parse] Índice última llave }:', ultimaLlave);
      
      // SUCCESS MANEJO DE RESPUESTA TRUNCADA
      if (primerLlave === -1 || ultimaLlave === -1 || ultimaLlave < primerLlave) {
        console.warn('WARNING [Parse] Respuesta parece truncada - intentando reparar JSON...');
        console.log('INFO [Parse] Respuesta recibida:', cleanResponse.substring(0, 500));
        
        // Intentar agregar las llaves de cierre faltantes
        if (primerLlave !== -1 && ultimaLlave === -1) {
          console.log('REPAIR [Parse] Agregando llaves de cierre faltantes...');
          // Cerrar el array de preguntas y el objeto principal
          cleanResponse += '\n      ]\n    }\n  ]\n}';
          ultimaLlave = cleanResponse.lastIndexOf('}');
          console.log('REPAIR [Parse] Nueva última llave }:', ultimaLlave);
        } else {
          throw new Error('No se encontró JSON válido en la respuesta');
        }
      }

      const jsonStr = cleanResponse.substring(primerLlave, ultimaLlave + 1);
      console.log('EXTRACT [Parse] JSON extraído (longitud):', jsonStr.length);
      console.log('EXTRACT [Parse] JSON extraído (primeros 500):', jsonStr.substring(0, 500));
      
      // Intentar parsear
      let parsed;
      try {
        parsed = JSON.parse(jsonStr);
        console.log('SUCCESS [Parse] JSON parseado correctamente');
      } catch (parseError: any) {
        console.error('ERROR [Parse] Error en JSON.parse:', parseError.message);
        console.error('INFO [Parse] String que causó el error:', jsonStr.substring(0, 1000));
        
        // Último intento: reparar JSON malformado común en arrays
        try {
          console.log('REPAIR [Parse] Intentando reparar JSON malformado...');
          let repairedJson = jsonStr;
          
          // CRÍTICO: Si el error es por string incompleto, encontrar y cerrar
          if (parseError.message.includes('Expected') || parseError.message.includes('Unexpected')) {
            console.log('REPAIR [Parse] Detectado string incompleto, buscando última estructura válida...');
            
            // Encontrar la última coma antes del error para truncar ahí
            const errorPos = parseError.message.match(/position (\d+)/);
            if (errorPos) {
              const pos = parseInt(errorPos[1]);
              // Buscar hacia atrás desde la posición del error hasta encontrar una estructura completa
              let truncatePos = pos;
              
              // Buscar el último objeto completo antes del error
              for (let i = pos - 1; i >= 0; i--) {
                if (repairedJson[i] === '}' && repairedJson[i-1] !== '"') {
                  // Encontramos el cierre de un objeto, verificar si hay una coma después
                  let j = i + 1;
                  while (j < repairedJson.length && /\s/.test(repairedJson[j])) j++;
                  if (repairedJson[j] === ',') {
                    truncatePos = j + 1;
                    break;
                  }
                }
              }
              
              console.log('REPAIR [Parse] Truncando en posición:', truncatePos);
              repairedJson = repairedJson.substring(0, truncatePos);
            }
            
            // Limpiar cualquier string o valor incompleto al final
            repairedJson = repairedJson.replace(/,\s*$/, '');  // Quitar coma final
            repairedJson = repairedJson.replace(/"\s*:\s*"[^"]*$/, '');  // Quitar string incompleto
            repairedJson = repairedJson.replace(/"\s*:\s*[^,}\]]*$/, '');  // Quitar valor incompleto
          }
          
          // Si hay una coma colgando antes del cierre de array, quitarla
          repairedJson = repairedJson.replace(/,(\s*)\]/g, '$1]');
          // Si hay una coma colgando antes del cierre de objeto, quitarla
          repairedJson = repairedJson.replace(/,(\s*)\}/g, '$1}');
          
          // Si termina abruptamente, intentar cerrar estructuras
          const lastChar = repairedJson.trim().slice(-1);
          if (lastChar !== '}' && lastChar !== ']') {
            console.log('REPAIR [Parse] JSON no termina correctamente, agregando cierres...');
            
            // Contar llaves y corchetes abiertos vs cerrados
            const openBraces = (repairedJson.match(/\{/g) || []).length;
            const closeBraces = (repairedJson.match(/\}/g) || []).length;
            const openBrackets = (repairedJson.match(/\[/g) || []).length;
            const closeBrackets = (repairedJson.match(/\]/g) || []).length;
            
            console.log('REPAIR [Parse] Llaves abiertas:', openBraces, 'cerradas:', closeBraces);
            console.log('REPAIR [Parse] Corchetes abiertos:', openBrackets, 'cerrados:', closeBrackets);
            
            // Primero cerrar objetos, luego arrays (orden importante)
            const bracesToClose = openBraces - closeBraces;
            const bracketsToClose = openBrackets - closeBrackets;
            
            // Agregar cierres en el orden correcto
            for (let i = 0; i < bracesToClose; i++) {
              repairedJson += '\n}';
            }
            for (let i = 0; i < bracketsToClose; i++) {
              repairedJson += '\n]';
            }
          }
          
          console.log('REPAIR [Parse] JSON reparado (longitud):', repairedJson.length);
          console.log('REPAIR [Parse] Últimos 200 chars:', repairedJson.substring(repairedJson.length - 200));
          
          parsed = JSON.parse(repairedJson);
          console.log('SUCCESS [Parse] JSON reparado y parseado correctamente');
        } catch (repairError: any) {
          console.error('ERROR [Parse] Fallo en reparación:', repairError.message);
          throw new Error(`Error parseando JSON: ${parseError.message}`);
        }
      }
      
      // Validar estructura básica
      if (!parsed.preguntas || !Array.isArray(parsed.preguntas)) {
        console.error('ERROR [Parse] Formato inválido: falta array de preguntas');
        throw new Error('Formato de respuesta inválido: falta array de preguntas');
      }
      
      console.log(`SUCCESS [Parse] ${parsed.preguntas.length} preguntas parseadas correctamente`);
      
      // Asegurar que todas las preguntas tengan los campos necesarios
      const preguntasValidadas = parsed.preguntas.map((p: any, index: number) => {
        console.log(`DEBUG [Parse] Validando pregunta ${index + 1}...`);
        
        return {
          texto: p.texto || `Pregunta ${index + 1}`,
          opciones: (p.opciones || []).map((o: any, i: number) => ({
            texto: o.texto || `Opción ${i + 1}`,
            es_correcta: o.es_correcta || false,
            explicacion: o.explicacion || 'Sin explicación'
          })),
          dificultad: p.dificultad || 'intermedia',
          retroalimentacion_correcta: p.retroalimentacion_correcta || '¡Correcto!',
          retroalimentacion_incorrecta: p.retroalimentacion_incorrecta || 'Incorrecto.',
          explicacion_detallada: p.explicacion_detallada || p.retroalimentacion_correcta || 'Ver retroalimentación',
          puntos: p.puntos || 10
        };
      });
      
      return preguntasValidadas;
      
    } catch (error: any) {
      console.error('ERROR [Parse] Error general en parseResponse:', error.message);
      console.error('INFO [Parse] Respuesta original (primeros 2000 chars):', respuesta.substring(0, 2000));
      throw new Error(`Respuesta inválida de Gemini: ${error.message}`);
    }
  }

  private validateQuestions(preguntas: PreguntaGenerada[]): void {
    console.log(`DEBUG [Validate] Validando ${preguntas.length} preguntas...`);
    
    if (preguntas.length === 0) {
      throw new Error('No se generaron preguntas');
    }
    
    for (let i = 0; i < preguntas.length; i++) {
      const pregunta = preguntas[i];
      console.log(`DEBUG [Validate] Pregunta ${i + 1}: "${pregunta.texto?.substring(0, 50)}..."`);
      
      if (!pregunta.texto || typeof pregunta.texto !== 'string') {
        throw new Error(`Pregunta ${i + 1} inválida: debe tener texto válido`);
      }
      
      if (!pregunta.opciones || !Array.isArray(pregunta.opciones)) {
        throw new Error(`Pregunta ${i + 1} inválida: debe tener array de opciones`);
      }
      
      if (pregunta.opciones.length !== 4) {
        console.warn(`WARNING [Validate] Pregunta ${i + 1} tiene ${pregunta.opciones.length} opciones (esperadas: 4)`);
        // No lanzar error, solo advertir
      }

      const correctas = pregunta.opciones.filter(o => o.es_correcta);
      if (correctas.length !== 1) {
        throw new Error(`Pregunta ${i + 1} inválida: debe tener exactamente 1 opción correcta (tiene ${correctas.length})`);
      }
    }
    
    console.log(`SUCCESS [Validate] Todas las preguntas son válidas`);
  }

  private async saveQuestionsToDatabase(preguntas: PreguntaGenerada[], subtema_id: number): Promise<void> {
    try {
      console.log(`SAVE [Save] Guardando ${preguntas.length} preguntas en BD...`);
      
      const preguntaRepo = AppDataSource.getRepository(PreguntaQuiz);
      const opcionRepo = AppDataSource.getRepository(OpcionRespuesta);

      for (let i = 0; i < preguntas.length; i++) {
        const pregunta = preguntas[i];
        console.log(`SAVE [Save] Guardando pregunta ${i + 1}/${preguntas.length}...`);
        
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
        console.log(`OK [Save] Pregunta ${i + 1} guardada con ID: ${preguntaGuardada.id}`);

        // Crear opciones
        for (let j = 0; j < pregunta.opciones.length; j++) {
          const opcion = pregunta.opciones[j];
          const nuevaOpcion = opcionRepo.create({
            preguntaId: preguntaGuardada.id,
            textoOpcion: opcion.texto,
            esCorrecta: opcion.es_correcta,
            explicacion: opcion.explicacion,
            orden: j + 1
          });

          await opcionRepo.save(nuevaOpcion);
        }
        
        console.log(`OK [Save] ${pregunta.opciones.length} opciones guardadas para pregunta ${i + 1}`);
      }

      console.log(`SUCCESS [Save] ${preguntas.length} preguntas guardadas exitosamente en BD`);
    } catch (error: any) {
      console.error('ERROR [Save] Error al guardar en BD:', error.message);
      console.warn('WARNING [Save] Continuando sin guardar en BD...');
      // No lanzar error para no interrumpir el flujo
    }
  }
}