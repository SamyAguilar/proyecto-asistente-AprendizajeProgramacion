// backend/src/routes/quiz.routes.ts

import { Router } from 'express';
import { QuizController } from '../controllers/QuizController';
import { authMiddleware } from '../middleware/authMiddleware';
// ✅ CORREGIDO: Usando el nombre de exportación real de Lulu
import { authRateLimiter } from '../middleware/rateLimiter'; 

const router = Router();
const quizController = new QuizController();

// GET /api/v1/quiz/questions/:subtemaId?limite=N
// Protegida por Auth y Rate Limiter (porque puede activar la IA de Lulu)
router.get(
    '/questions/:subtemaId', 
    authMiddleware,
    authRateLimiter, // Aplicación del Rate Limiter
    quizController.getQuestions
);

// POST /api/v1/quiz/submit
// Protegida por Auth
router.post(
    '/submit', 
    authMiddleware,
    quizController.submitAttempt
);

export default router;