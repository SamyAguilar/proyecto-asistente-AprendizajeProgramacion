// backend/src/routes/quiz.routes.ts

import { Router } from 'express';
import { QuizController } from '../controllers/quiz.controller';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();
const quizController = new QuizController();

/**
 * TODAS LAS RUTAS REQUIEREN AUTENTICACION
 */

/**
 * @route   GET /api/v1/quiz/subtema/:subtemaId/preguntas
 * @desc    Obtener preguntas de quiz para un subtema
 * @access  Private (requiere token JWT)
 * @query   cantidad - Numero de preguntas a obtener (default: 5, max: 20)
 * @note    Si no hay suficientes preguntas, Lulu genera nuevas automaticamente
 */
router.get(
  '/subtema/:subtemaId/preguntas',
  authMiddleware,
  (req, res) => quizController.obtenerPreguntasQuiz(req, res)
);

/**
 * @route   POST /api/v1/quiz/responder
 * @desc    Responder una pregunta de quiz
 * @access  Private (requiere token JWT)
 * @body    { preguntaId: number, opcionSeleccionadaId: number }
 * @note    CRITICO: Integra con Tono para actualizar progreso
 */
router.post(
  '/responder',
  authMiddleware,
  (req, res) => quizController.responderPregunta(req, res)
);

/**
 * @route   GET /api/v1/quiz/resultados/:usuarioId
 * @desc    Obtener estadisticas de quizzes de un usuario
 * @access  Private (requiere token JWT)
 * @note    Estudiantes solo pueden ver sus propios resultados
 *          Profesores/Admin pueden ver resultados de cualquier usuario
 */
router.get(
  '/resultados/:usuarioId',
  authMiddleware,
  (req, res) => quizController.obtenerResultadosUsuario(req, res)
);

/**
 * @route   POST /api/v1/quiz/generar-preguntas
 * @desc    Generar preguntas manualmente (interno/admin)
 * @access  Private (requiere token JWT)
 * @body    { subtemaId: number, cantidad?: number, dificultad?: string }
 * @note    Llama a Lulu para generar preguntas y las almacena en BD
 */
router.post(
  '/generar-preguntas',
  authMiddleware,
  (req, res) => quizController.generarPreguntasManualmente(req, res)
);

export default router;