import { Router } from 'express';
import { RetroalimentacionController } from '../controllers/RetroalimentacionController';
import { authMiddleware } from '../middleware/authMiddleware';
import { GeminiClient } from '../infrastructure/gemini/GeminiClient';
import { geminiRateLimiter } from '../infrastructure/middleware/GeminiRateLimiter';

export function createRetroalimentacionRoutes(): Router {
  const router = Router();

  // Dependency Injection
  const geminiClient = new GeminiClient();
  const retroController = new RetroalimentacionController(geminiClient);

  /**
   * GET /api/v1/retroalimentacion/:usuario_id
   * Obtener historial de retroalimentación de un usuario
   * 🔒 Requiere autenticación
   * 📝 Solo puede ver su propia retroalimentación (o admin)
   */
  router.get(
    '/:usuario_id',
    authMiddleware,
    retroController.getHistorial
  );

  /**
   * POST /api/v1/retroalimentacion/generar
   * Generar retroalimentación personalizada
   * 🔒 Requiere autenticación
   * 🚦 Rate limited: 15 RPM
   */
  router.post(
    '/generar',
    authMiddleware,
    geminiRateLimiter.middleware,
    retroController.generarRetroalimentacion
  );

  return router;
}
