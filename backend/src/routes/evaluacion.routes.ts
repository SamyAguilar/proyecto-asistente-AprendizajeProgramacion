// backend/src/routes/evaluacion.routes.ts

import { Router } from 'express';
import { EvaluacionController } from '../controllers/evaluacion.controller';
// import { authMiddleware } from '../middlewares/authMiddleware'; // Middleware real de Sam

const router = Router();
const controller = new EvaluacionController();

// SIMULACIÓN DE MIDDLEWARE DE AUTENTICACIÓN: Para que puedas probar.
// Nota: isAdmin: true puede ser útil para probar la ruta de resultados de admin
const authMiddleware = (req: any, res: any, next: any) => { 
    req.user = { id: 1, isAdmin: true }; // Asigna un ID de usuario de prueba
    next(); 
}; 

// ============================================
// --- ENDPOINTS BLOQUE 1: SERVICIO DE EJERCICIOS ---
// ============================================
router.get('/ejercicios/subtema/:subtemaId', authMiddleware, controller.getEjerciciosPorSubtema);
router.get('/ejercicios/:id', authMiddleware, controller.getDetallesEjercicio);
router.post('/ejercicios/:id/enviar', authMiddleware, controller.postEnviarCodigo);
router.get('/ejercicios/:id/intentos', authMiddleware, controller.getHistorialIntentos);

// ============================================
// --- ENDPOINTS BLOQUE 2: SERVICIO DE QUIZZES ---
// ============================================

// 1. GET /api/v1/quiz/subtema/:subtema_id/preguntas
router.get('/quiz/subtema/:subtemaId/preguntas', authMiddleware, controller.getPreguntasQuiz);

// 2. POST /api/v1/quiz/responder
router.post('/quiz/responder', authMiddleware, controller.postResponderQuiz);

// 3. GET /api/v1/quiz/resultados/:usuario_id
router.get('/quiz/resultados/:usuarioId', authMiddleware, controller.getResultadosQuiz);

// 4. POST /api/v1/quiz/generar-preguntas (interno o admin)
router.post('/quiz/generar-preguntas', authMiddleware, controller.postGenerarPreguntas); 

export default router;