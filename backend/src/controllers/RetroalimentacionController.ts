import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { RetroalimentacionLlm } from '../models/RetroalimentacionLlm';
import { IGeminiClient } from '../domain/interfaces/IGeminiClient';
import { geminiUsageMonitor } from '../infrastructure/monitoring/GeminiUsageMonitor';

export class RetroalimentacionController {
  constructor(private geminiClient: IGeminiClient) {}

  /**
   * Mapea los tipos simplificados a los tipos reales en la BD
   */
  private mapTipoRetroalimentacion(tipoSimple: string): string[] {
    const mapping: { [key: string]: string[] } = {
      'codigo': ['validacion_codigo', 'code_validation'],
      'quiz': ['question_generation', 'quiz'],
      'chat': ['chat', 'explicar_concepto'],
      'general': ['retroalimentacion_personalizada', 'general']
    };

    return mapping[tipoSimple] || [tipoSimple];
  }

  /**
   * GET /api/v1/retroalimentacion/:usuario_id
   * Obtener historial de retroalimentación de un usuario
   */
  getHistorial = async (req: Request, res: Response) => {
    try {
      const { usuario_id } = req.params;
      const { tipo, limit = 50, offset = 0 } = req.query;

      console.log(`[Controller] Obteniendo historial para usuario ${usuario_id}, tipo: ${tipo || 'todos'}`);

      // Verificar permisos: solo puede ver su propia retroalimentación o ser admin
      if (req.user?.id !== parseInt(usuario_id) && req.user?.rol !== 'admin') {
        return res.status(403).json({
          error: 'No tienes permiso para ver esta retroalimentación'
        });
      }

      const retroRepo = AppDataSource.getRepository(RetroalimentacionLlm);
      const queryBuilder = retroRepo
        .createQueryBuilder('retro')
        .where('retro.usuario_id = :usuarioId', { usuarioId: usuario_id })
        .orderBy('retro.fecha_generacion', 'DESC')
        .take(Number(limit))
        .skip(Number(offset));

      // Filtrar por tipo si se especifica
      if (tipo) {
        const tiposReales = this.mapTipoRetroalimentacion(tipo as string);
        console.log(`[Controller] Mapeando tipo '${tipo}' a:`, tiposReales);
        
        queryBuilder.andWhere('retro.tipo_retroalimentacion IN (:...tipos)', { tipos: tiposReales });
      }

      const [retroalimentaciones, total] = await queryBuilder.getManyAndCount();

      console.log(`[Controller] Encontradas ${retroalimentaciones.length} retroalimentaciones (total: ${total})`);

      res.json({
        success: true,
        data: {
          retroalimentaciones: retroalimentaciones.map(r => ({
            id: r.id,
            tipo: r.tipoRetroalimentacion,
            contenido: r.contenidoRetroalimentacion,
            contexto: r.contextoOriginal,
            fecha: r.fechaGeneracion,
            modelo_usado: r.modeloLlmUsado
          })),
          total,
          limit: Number(limit),
          offset: Number(offset)
        }
      });

    } catch (error: any) {
      console.error('[Controller] Error en getHistorial:', error);
      res.status(500).json({
        error: 'Error al obtener historial',
        mensaje: error.message
      });
    }
  };

  /**
   * POST /api/v1/retroalimentacion/generar
   * Generar retroalimentación personalizada
   */
  generarRetroalimentacion = async (req: Request, res: Response) => {
    const startTime = Date.now();
    
    try {
      const { contexto, tipo = 'general' } = req.body;
      const usuario_id = req.user?.id;

      console.log(`[RetroController] ========= INICIO TEST 13 =========`);
      console.log(`[RetroController] Usuario ID: ${usuario_id}`);
      console.log(`[RetroController] Tipo: ${tipo}`);
      console.log(`[RetroController] Contexto:`, JSON.stringify(contexto, null, 2));

      if (!contexto) {
        return res.status(400).json({
          error: 'Falta campo requerido: contexto'
        });
      }

      // Construir prompt según el tipo de contexto
      const prompt = this.buildPromptRetroalimentacion(contexto, tipo);
      
      console.log(`[RetroController] ==================== PROMPT ====================`);
      console.log(prompt);
      console.log(`[RetroController] ==================== FIN PROMPT ====================`);
      console.log(`[RetroController] Longitud del prompt: ${prompt.length} caracteres`);

      // Llamar a Gemini
      console.log(`[RetroController] Llamando a Gemini...`);
      const respuesta = await this.geminiClient.generate(prompt, {
        temperature: 0.7,
        maxTokens: 1500,  // Reducido de 2048 a 1500 para evitar respuestas muy largas
        tipo: 'retroalimentacion_personalizada'
      });

      console.log(`[RetroController] Respuesta recibida de Gemini`);
      console.log(`[RetroController] Longitud de respuesta: ${respuesta?.length || 0} caracteres`);
      
      if (!respuesta || respuesta.trim() === '') {
        console.error(`[RetroController] PROBLEMA: Gemini devolvió respuesta VACÍA`);
        console.error(`[RetroController] Prompt usado tenía ${prompt.length} caracteres`);
        console.error(`[RetroController] Tipo de retroalimentación: ${tipo}`);
        
        return res.status(500).json({
          error: 'Error al generar retroalimentación',
          mensaje: 'La IA no pudo generar una respuesta. Revisa el prompt.',
          debug: {
            promptLength: prompt.length,
            tipo: tipo,
            contexto: contexto
          }
        });
      }

      console.log(`[RetroController] Respuesta válida recibida`);
      console.log(`[RetroController] Primeros 150 chars:`, respuesta.substring(0, 150) + '...');

      // Guardar en base de datos
      const retroRepo = AppDataSource.getRepository(RetroalimentacionLlm);
      const retroalimentacion = await retroRepo.save({
        usuarioId: usuario_id,
        tipoRetroalimentacion: tipo,
        contenidoRetroalimentacion: respuesta.trim(),
        contextoOriginal: contexto,
        generadoPorLlm: true,
        modeloLlmUsado: process.env.GEMINI_MODEL || 'gemini-1.5-flash-002'
      });

      console.log(`[RetroController] Retroalimentación guardada con ID: ${retroalimentacion.id}`);
      console.log(`[RetroController] ========= FIN TEST 13 =========`);

      // Registrar en monitor
      await geminiUsageMonitor.registrarLlamada({
        tipo: 'retroalimentacion_personalizada',
        tokensEstimados: 500,
        fueCache: false,
        tiempoRespuesta: Date.now() - startTime,
        userId: usuario_id
      });

      res.json({
        success: true,
        data: {
          id: retroalimentacion.id,
          retroalimentacion: respuesta.trim(),
          tipo,
          fecha: retroalimentacion.fechaGeneracion
        }
      });

    } catch (error: any) {
      console.error('[RetroController] ERROR en generarRetroalimentacion:', error);
      console.error('[RetroController] Stack:', error.stack);
      res.status(500).json({
        error: 'Error al generar retroalimentación',
        mensaje: error.message
      });
    }
  };

  private buildPromptRetroalimentacion(contexto: any, tipo: string): string {
    let prompt = '';

    switch (tipo) {
      case 'codigo':
      case 'validacion_codigo':
        prompt = `Eres un profesor de programación experto y amigable que está revisando el código de un estudiante.

TAREA: Analiza el siguiente código y proporciona retroalimentación educativa completa.

CÓDIGO DEL ESTUDIANTE:
\`\`\`${contexto.lenguaje || 'python'}
${contexto.codigo}
\`\`\`

LENGUAJE: ${contexto.lenguaje || 'python'}

INSTRUCCIONES DE RESPUESTA:
1. Identifica errores: Si el código tiene errores de sintaxis o lógica, explícalos claramente
2. Explica el problema: Usa lenguaje sencillo y educativo
3. Proporciona la solución: Muestra el código corregido si es necesario
4. Da sugerencias: Proporciona consejos para mejorar el código
5. Sé motivador: Termina con un mensaje positivo

EJEMPLO DE RESPUESTA:
"Tu código tiene un error de sintaxis. En Python, después de la declaración del bucle for debes usar dos puntos (:) antes del bloque de código.

Código corregido:
\`\`\`python
for i in range(10):
    print(i)
\`\`\`

También recuerda indentar el código dentro del bucle con 4 espacios o un tab. ¡Sigue practicando, vas por buen camino!"

AHORA ANALIZA EL CÓDIGO Y RESPONDE:`;
        break;

      case 'quiz':
        prompt = `Eres un tutor educativo que está proporcionando retroalimentación sobre una respuesta de quiz.

CONTEXTO:
- Pregunta: ${contexto.pregunta || 'No especificada'}
- Respuesta del estudiante: ${contexto.respuesta || 'No especificada'}
- Es correcta: ${contexto.es_correcta ? 'Sí' : 'No'}

INSTRUCCIONES:
1. Si es correcta: Felicita al estudiante y refuerza el concepto
2. Si es incorrecta: Explica por qué está mal y proporciona la respuesta correcta
3. Sé claro y educativo
4. Proporciona contexto adicional si ayuda al aprendizaje

RESPONDE AHORA:`;
        break;

      case 'general':
      default:
        prompt = `Eres un asistente educativo experto en programación. Proporciona orientación clara y útil basada en el siguiente contexto.

CONTEXTO:
${JSON.stringify(contexto, null, 2)}

INSTRUCCIONES:
- Proporciona retroalimentación clara y específica
- Usa ejemplos cuando sea útil
- Sé motivador y constructivo
- Enfócate en el aprendizaje del estudiante

RESPONDE AHORA:`;
        break;
    }

    return prompt;
  }
}