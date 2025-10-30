// backend/src/controllers/QuizController.ts

import { Request, Response } from 'express';
import { quizService } from '../services/QuizService';

export class QuizController {
    /**
     * GET /api/v1/quiz/questions/:subtemaId
     * Obtiene preguntas de quiz para un subtema específico.
     */
    async getQuestions(req: Request, res: Response) {
        try {
            const subtemaId = parseInt(req.params.subtemaId);
            // El límite se puede pasar como query param (ej: ?limite=10)
            const limite = req.query.limite ? parseInt(req.query.limite as string) : 5; 
            
            if (isNaN(subtemaId) || subtemaId <= 0 || isNaN(limite) || limite <= 0) {
                return res.status(400).json({ message: 'IDs de subtema y límite inválidos.' });
            }

            // Llama a tu servicio, que se encarga de la lógica de negocio (BD de Sam, IA de Lulu)
            const questions = await quizService.getQuestionsBySubtopic(subtemaId, limite);
            
            return res.json({ 
                message: 'Preguntas obtenidas con éxito.', 
                data: questions 
            });

        } catch (error) {
            console.error('Error al obtener preguntas:', error);
            // Manejo de error genérico de servidor
            return res.status(500).json({ message: 'Error interno del servidor al obtener preguntas.' });
        }
    }

    /**
     * POST /api/v1/quiz/submit
     * Procesa el envío de un quiz.
     */
    async submitAttempt(req: Request, res: Response) {
        try {
            // El campo req.userId es inyectado por el authMiddleware (de Sam/Toño)
            const usuarioId = req.userId; 
            const { subtemaId, respuestas } = req.body;

            if (!usuarioId || !subtemaId || !Array.isArray(respuestas) || respuestas.length === 0) {
                return res.status(400).json({ message: 'Datos de envío de quiz incompletos o inválidos.' });
            }

            const submissionRequest = {
                usuarioId,
                subtemaId,
                respuestas,
            };

            const resultado = await quizService.submitQuizAttempt(submissionRequest);

            return res.json({
                message: 'Quiz enviado y calificado con éxito.',
                data: resultado
            });

        } catch (error) {
            console.error('Error al procesar el quiz:', error);
            return res.status(500).json({ message: 'Error interno del servidor al calificar el quiz.' });
        }
    }
}