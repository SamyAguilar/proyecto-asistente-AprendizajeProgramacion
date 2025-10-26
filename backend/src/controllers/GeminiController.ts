import { Request, Response } from 'express';
import { ValidateCodeUseCase } from '../application/use-cases/ValidateCodeUseCase';
import { GenerateQuestionsUseCase } from '../application/use-cases/GenerateQuestionsUseCase';
import { ChatAssistantUseCase } from '../application/use-cases/ChatAssistantUseCase';
import { geminiUsageMonitor } from '../infrastructure/monitoring/GeminiUsageMonitor';
import { geminiRateLimiter } from '../infrastructure/middleware/GeminiRateLimiter';

export class GeminiController {
  constructor(
    private validateCodeUseCase: ValidateCodeUseCase,
    private generateQuestionsUseCase: GenerateQuestionsUseCase,
    private chatAssistantUseCase: ChatAssistantUseCase
  ) {}

  validateCode = async (req: Request, res: Response) => {
    try {
      const { codigo_enviado, ejercicio_id, casos_prueba, lenguaje, enunciado } = req.body;

      if (!codigo_enviado || !ejercicio_id || !lenguaje) {
        return res.status(400).json({
          error: 'Faltan campos requeridos: codigo_enviado, ejercicio_id, lenguaje'
        });
      }

      // Obtener usuario_id del token JWT (authMiddleware)
      const usuario_id = req.user?.id;

      if (!usuario_id) {
        return res.status(401).json({
          error: 'Usuario no autenticado'
        });
      }

      const resultado = await this.validateCodeUseCase.execute({
        codigo_enviado,
        ejercicio_id,
        usuario_id,
        casos_prueba: casos_prueba || [],
        lenguaje,
        enunciado
      });

      res.json({
        success: true,
        data: resultado
      });

    } catch (error: any) {
      console.error('[Controller] Error en validateCode:', error);
      res.status(500).json({
        error: 'Error al validar código',
        mensaje: error.message
      });
    }
  };

  /**
   * Generar preguntas de quiz (Pancho lo llama)
   */
  generateQuestions = async (req: Request, res: Response) => {
    const startTime = Date.now();
    
    try {
      const { subtema_id, cantidad = 5, dificultad = 'intermedia' } = req.body;

      if (!subtema_id) {
        return res.status(400).json({
          error: 'Falta campo requerido: subtema_id'
        });
      }

      const resultado = await this.generateQuestionsUseCase.execute({
        subtema_id,
        cantidad,
        dificultad,
        contexto_estudiante: {}
      });

      // Registrar en monitor
      geminiUsageMonitor.registrarLlamada({
        tipo: 'question_generation',
        tokensEstimados: resultado.cantidad_generada * 200,
        fueCache: false,
        tiempoRespuesta: Date.now() - startTime,
        userId: req.user?.id
      });

      res.json({
        success: true,
        data: resultado
      });

    } catch (error: any) {
      console.error('[Controller] Error en generateQuestions:', error);
      res.status(500).json({
        error: 'Error al generar preguntas',
        mensaje: error.message
      });
    }
  };

  /**
   * Chat educativo con el asistente
   */
  chat = async (req: Request, res: Response) => {
    const startTime = Date.now();
    
    try {
      const { mensaje, historial, contexto } = req.body;

      if (!mensaje) {
        return res.status(400).json({
          error: 'Falta campo requerido: mensaje'
        });
      }

      const resultado = await this.chatAssistantUseCase.execute({
        mensaje,
        historial: historial || [],
        contexto
      });

      // Registrar en monitor
      geminiUsageMonitor.registrarLlamada({
        tipo: 'chat',
        tokensEstimados: mensaje.length + resultado.respuesta.length,
        fueCache: false,
        tiempoRespuesta: Date.now() - startTime,
        userId: req.user?.id
      });

      res.json({
        success: true,
        data: resultado
      });

    } catch (error: any) {
      console.error('[Controller] Error en chat:', error);
      res.status(500).json({
        error: 'Error en chat',
        mensaje: error.message
      });
    }
  };

  /**
   * Explicar un concepto de programación
   */
  explicarConcepto = async (req: Request, res: Response) => {
    const startTime = Date.now();
    
    try {
      const { tema, subtema, concepto } = req.body;

      if (!concepto) {
        return res.status(400).json({
          error: 'Falta campo requerido: concepto'
        });
      }

      // Usar chat assistant con contexto específico
      const resultado = await this.chatAssistantUseCase.execute({
        mensaje: `Explícame el concepto: ${concepto}`,
        contexto: {
          tema_actual: tema,
          subtema_actual: subtema
        }
      });

      // Registrar en monitor
      geminiUsageMonitor.registrarLlamada({
        tipo: 'explicar_concepto',
        tokensEstimados: 300,
        fueCache: false,
        tiempoRespuesta: Date.now() - startTime,
        userId: req.user?.id
      });

      res.json({
        success: true,
        data: {
          concepto,
          explicacion: resultado.respuesta
        }
      });

    } catch (error: any) {
      console.error('[Controller] Error en explicarConcepto:', error);
      res.status(500).json({
        error: 'Error al explicar concepto',
        mensaje: error.message
      });
    }
  };

  /**
   * Generar explicación línea por línea de código
   */
  generarExplicacion = async (req: Request, res: Response) => {
    const startTime = Date.now();
    
    try {
      const { codigo, lenguaje } = req.body;

      if (!codigo || !lenguaje) {
        return res.status(400).json({
          error: 'Faltan campos requeridos: codigo, lenguaje'
        });
      }

      // Construir prompt para explicación línea por línea
      const prompt = `
Eres un profesor de programación experto. Explica el siguiente código línea por línea de forma clara y educativa.

**CÓDIGO:**
\`\`\`${lenguaje}
${codigo}
\`\`\`

**INSTRUCCIONES:**
1. Explica cada línea de código
2. Si hay varias líneas relacionadas, agrúpalas
3. Usa lenguaje simple y claro
4. Incluye el propósito de cada parte
5. Menciona buenas prácticas si las hay

**FORMATO DE RESPUESTA (JSON):**
{
  "explicacion_general": "Breve descripción de qué hace el código en general",
  "lineas": [
    {
      "numero": 1,
      "codigo": "línea de código",
      "explicacion": "Qué hace esta línea"
    }
  ],
  "conceptos_clave": ["concepto1", "concepto2"],
  "sugerencias": ["sugerencia1", "sugerencia2"]
}

Responde SOLO con el JSON, sin texto adicional.
`;

      const respuesta = await this.validateCodeUseCase['geminiClient'].generate(prompt, {
        temperature: 0.5,
        maxTokens: 2048,
        tipo: 'code_explanation'
      });

      // Parsear respuesta
      const jsonMatch = respuesta.match(/\{[\s\S]*\}/);
      const explicacion = jsonMatch ? JSON.parse(jsonMatch[0]) : { error: 'No se pudo parsear' };

      // Registrar en monitor
      await geminiUsageMonitor.registrarLlamada({
        tipo: 'generar_explicacion',
        tokensEstimados: codigo.length + 500,
        fueCache: false,
        tiempoRespuesta: Date.now() - startTime,
        userId: req.user?.id
      });

      res.json({
        success: true,
        data: {
          codigo,
          lenguaje,
          explicacion
        }
      });

    } catch (error: any) {
      console.error('[Controller] Error en generarExplicacion:', error);
      res.status(500).json({
        error: 'Error al generar explicación',
        mensaje: error.message
      });
    }
  };

  /**
   * Estadísticas de uso de Gemini (solo admin)
   */
  getStats = async (req: Request, res: Response) => {
    try {
      const statsHoy = geminiUsageMonitor.getStatsHoy();
      const statsMes = geminiUsageMonitor.getStatsMes();
      const statsPorTipo = geminiUsageMonitor.getStatsPorTipo();
      const rateLimiterStats = geminiRateLimiter.getStats();

      res.json({
        success: true,
        data: {
          status: 'active',
          service: 'gemini-integration',
          hoy: statsHoy,
          mes: statsMes,
          por_tipo: statsPorTipo,
          rate_limiter: rateLimiterStats
        }
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'Error al obtener estadísticas',
        mensaje: error.message
      });
    }
  };
}
