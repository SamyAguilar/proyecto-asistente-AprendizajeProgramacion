// backend/src/routes/evaluacion.routes.ts

import { Router } from 'express';
import { EvaluacionController } from '../controllers/evaluacion.controller';
// import { authMiddleware } from '../middlewares/authMiddleware'; // Middleware real de Sam

const router = Router();
const controller = new EvaluacionController();

// SIMULACIÓN DE MIDDLEWARE DE AUTENTICACIÓN: Para que puedas probar.
const authMiddleware = (req: any, res: any, next: any) => { 
    req.user = { id: 1, isAdmin: false }; // Asigna un ID de usuario de prueba
    next(); 
}; 

// --- ENDPOINTS BLOQUE 1: SERVICIO DE EJERCICIOS ---
router.get('/ejercicios/subtema/:subtemaId', authMiddleware, controller.getEjerciciosPorSubtema);
router.get('/ejercicios/:id', authMiddleware, controller.getDetallesEjercicio);
router.post('/ejercicios/:id/enviar', authMiddleware, controller.postEnviarCodigo);
router.get('/ejercicios/:id/intentos', authMiddleware, controller.getHistorialIntentos);

export default router;