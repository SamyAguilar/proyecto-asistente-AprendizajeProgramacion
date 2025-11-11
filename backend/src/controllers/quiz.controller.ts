// backend/src/controllers/quiz.controller.ts

import { Request, Response } from 'express';
import { QuizService } from '../services/quiz.service';
import { GenerateQuestionsUseCase } from '../application/use-cases/GenerateQuestionsUseCase';
import { GeminiClient } from '../infrastructure/gemini/GeminiClient';
import { InMemoryCacheService } from '../infrastructure/cache/InMemoryCacheService';
import { logError } from '../utils/logger';

export class QuizController {
  private quizService: QuizService;

  constructor() {
    // Dependency Injection igual que en otros controladores
    const geminiClient = new GeminiClient();
    const cacheService = new InMemoryCacheService();
    const generateQuestionsUseCase = new GenerateQuestionsUseCase(geminiClient, cacheService);
    
    this.quizService = new QuizService(generateQuestionsUseCase);
  }

  /**
   * GET /api/v1/quiz/subtema/:subtemaId/preguntas
   * Obtener preguntas de quiz para un subtema
   */
  obtenerPreguntasQuiz = async (req: Request, res: Response): Promise<void> => {
    try {
      const subtemaId = parseInt(req.params.subtemaId);
      const cantidad = req.query.cantidad ? parseInt(req.query.cantidad as string) : 5;

      if (isNaN(subtemaId)) {
        res.status(400).json({
          error: 'ID de subtema invalido'
        });
        return;
      }

      if (isNaN(cantidad) || cantidad < 1 || cantidad > 20) {
        res.status(400).json({
          error: 'La cantidad debe ser un numero entre 1 y 20'
        });
        return;
      }

      const preguntas = await this.quizService.obtenerPreguntasQuiz(subtemaId, cantidad);

      res.status(200).json({
        success: true,
        data: preguntas,
        total: preguntas.length
      });
    } catch (error: any) {
      logError('Error al obtener preguntas de quiz:', error);
      res.status(500).json({
        error: 'Error interno al obtener preguntas',
        mensaje: error.message
      });
    }
  };

  /**
   * POST /api/v1/quiz/responder
   * Responder una pregunta de quiz
   */
  responderPregunta = async (req: Request, res: Response): Promise<void> => {
    try {
      const usuarioId = (req as any).userId;
      const { preguntaId, opcionSeleccionadaId } = req.body;

      if (!usuarioId) {
        res.status(401).json({
          error: 'Usuario no autenticado'
        });
        return;
      }

      if (!preguntaId || !opcionSeleccionadaId) {
        res.status(400).json({
          error: 'Campos requeridos: preguntaId, opcionSeleccionadaId'
        });
        return;
      }

      const resultado = await this.quizService.responderPregunta(usuarioId, {
        preguntaId: parseInt(preguntaId),
        opcionSeleccionadaId: parseInt(opcionSeleccionadaId)
      });

      res.status(200).json({
        success: true,
        data: resultado,
        mensaje: resultado.esCorrecta 
          ? 'Respuesta correcta' 
          : 'Respuesta incorrecta'
      });
    } catch (error: any) {
      logError('Error al responder pregunta:', error);

      if (error.message === 'Pregunta no encontrada') {
        res.status(404).json({
          error: 'Pregunta no encontrada'
        });
        return;
      }

      if (error.message === 'Opcion seleccionada invalida') {
        res.status(400).json({
          error: 'Opcion seleccionada invalida'
        });
        return;
      }

      res.status(500).json({
        error: 'Error interno al responder pregunta',
        mensaje: error.message
      });
    }
  };

  /**
   * GET /api/v1/quiz/resultados/:usuarioId
   * Obtener resultados de quizzes de un usuario
   */
  obtenerResultadosUsuario = async (req: Request, res: Response): Promise<void> => {
    try {
      const usuarioId = parseInt(req.params.usuarioId);
      const usuarioSolicitante = (req as any).userId;
      const rolSolicitante = (req as any).user?.rol || 'estudiante';

      if (!usuarioSolicitante) {
        res.status(401).json({
          error: 'Usuario no autenticado'
        });
        return;
      }

      if (isNaN(usuarioId)) {
        res.status(400).json({
          error: 'ID de usuario invalido'
        });
        return;
      }

      const estadisticas = await this.quizService.obtenerResultadosUsuario(
        usuarioId,
        usuarioSolicitante,
        rolSolicitante
      );

      res.status(200).json({
        success: true,
        data: estadisticas
      });
    } catch (error: any) {
      logError('Error al obtener resultados:', error);

      if (error.message.includes('permiso')) {
        res.status(403).json({
          error: error.message
        });
        return;
      }

      res.status(500).json({
        error: 'Error interno al obtener resultados',
        mensaje: error.message
      });
    }
  };

  /**
   * POST /api/v1/quiz/generar-preguntas
   * Generar preguntas manualmente (interno/admin)
   */
  generarPreguntasManualmente = async (req: Request, res: Response): Promise<void> => {
    try {
      const { subtemaId, cantidad = 5, dificultad = 'intermedia' } = req.body;

      if (!subtemaId) {
        res.status(400).json({
          error: 'Campo requerido: subtemaId'
        });
        return;
      }

      const cantidadGenerada = await this.quizService.generarPreguntasManualmente(
        parseInt(subtemaId),
        parseInt(cantidad),
        dificultad
      );

      res.status(200).json({
        success: true,
        mensaje: `Se generaron ${cantidadGenerada} preguntas exitosamente`,
        cantidadGenerada
      });
    } catch (error: any) {
      logError('Error al generar preguntas:', error);

      if (error.message === 'Subtema no encontrado') {
        res.status(404).json({
          error: 'Subtema no encontrado'
        });
        return;
      }

      res.status(500).json({
        error: 'Error interno al generar preguntas',
        mensaje: error.message
      });
    }
  };
}