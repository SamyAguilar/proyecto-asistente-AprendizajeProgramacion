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

      console.log(`[Controller] Generando retroalimentación tipo: ${tipo}`);

      if (!contexto) {
        return res.status(400).json({
          error: 'Falta campo requerido: contexto'
        });
      }

      // Construir prompt según el tipo de contexto
      const prompt = this.buildPromptRetroalimentacion(contexto, tipo);

      // Llamar a Gemini
      const respuesta = await this.geminiClient.generate(prompt, {
        temperature: 0.7,
        maxTokens: 1024,
        tipo: 'retroalimentacion_personalizada'
      });

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

      console.log(`[Controller] Retroalimentación guardada con ID: ${retroalimentacion.id}`);

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
      console.error('[Controller] Error en generarRetroalimentacion:', error);
      res.status(500).json({
        error: 'Error al generar retroalimentación',
        mensaje: error.message
      });
    }
  };

  private buildPromptRetroalimentacion(contexto: any, tipo: string): string {
    let prompt = `Eres un asistente educativo experto. Proporciona retroalimentación constructiva y pedagógica.\n\n`;

    switch (tipo) {
      case 'codigo':
      case 'validacion_codigo':
        prompt += `CÓDIGO DEL ESTUDIANTE:\n${contexto.codigo}\n\n`;
        prompt += `LENGUAJE: ${contexto.lenguaje}\n\n`;
        prompt += `Proporciona retroalimentación sobre este código, destacando:\n`;
        prompt += `1. Buenas prácticas utilizadas\n`;
        prompt += `2. Áreas de mejora\n`;
        prompt += `3. Sugerencias específicas\n`;
        break;

      case 'quiz':
        prompt += `PREGUNTA: ${contexto.pregunta}\n`;
        prompt += `RESPUESTA DEL ESTUDIANTE: ${contexto.respuesta}\n`;
        prompt += `CORRECTA: ${contexto.es_correcta ? 'Sí' : 'No'}\n\n`;
        prompt += `Proporciona retroalimentación educativa.\n`;
        break;

      case 'general':
      default:
        prompt += `CONTEXTO:\n${JSON.stringify(contexto, null, 2)}\n\n`;
        prompt += `Proporciona orientación educativa basada en este contexto.\n`;
        break;
    }

    prompt += `\nSé motivador, claro y específico en tu retroalimentación.`;
    
    return prompt;
  }
}