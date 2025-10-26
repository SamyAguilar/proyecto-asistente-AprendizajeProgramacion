import { Router } from 'express';
import { GeminiController } from '../controllers/GeminiController';
import { authMiddleware } from '../middleware/authMiddleware';
import { GeminiClient } from '../infrastructure/gemini/GeminiClient';
import { InMemoryCacheService } from '../infrastructure/cache/InMemoryCacheService';
import { ValidateCodeUseCase } from '../application/use-cases/ValidateCodeUseCase';
import { GenerateQuestionsUseCase } from '../application/use-cases/GenerateQuestionsUseCase';
import { ChatAssistantUseCase } from '../application/use-cases/ChatAssistantUseCase';
import { geminiRateLimiter } from '../infrastructure/middleware/GeminiRateLimiter';

export function createGeminiRoutes(): Router {
  const router = Router();

  // Dependency Injection
  const geminiClient = new GeminiClient();
  const cacheService = new InMemoryCacheService();
  
  const validateCodeUseCase = new ValidateCodeUseCase(geminiClient, cacheService);
  const generateQuestionsUseCase = new GenerateQuestionsUseCase(geminiClient, cacheService);
  const chatAssistantUseCase = new ChatAssistantUseCase(geminiClient);
  
  const geminiController = new GeminiController(
    validateCodeUseCase,
    generateQuestionsUseCase,
    chatAssistantUseCase
  );

  /**
   * POST /api/v1/gemini/validate-code
   * Validar código de estudiante con Gemini AI
   * 🔒 Requiere autenticación
   * 🚦 Rate limited: 15 RPM
   */
  router.post(
    '/validate-code',
    authMiddleware,
    geminiRateLimiter.middleware,
    geminiController.validateCode
  );

  /**
   * POST /api/v1/gemini/generate-questions
   * Generar preguntas de quiz para un subtema (Pancho lo llama)
   * 🔒 Requiere autenticación
   * 🚦 Rate limited: 15 RPM
   */
  router.post(
    '/generate-questions',
    authMiddleware,
    geminiRateLimiter.middleware,
    geminiController.generateQuestions
  );

  /**
   * POST /api/v1/gemini/chat
   * Chat educativo con el asistente LULU
   * 🔒 Requiere autenticación
   * 🚦 Rate limited: 15 RPM
   */
  router.post(
    '/chat',
    authMiddleware,
    geminiRateLimiter.middleware,
    geminiController.chat
  );

  /**
   * POST /api/v1/gemini/explicar-concepto
   * Explicar un concepto de programación
   * 🔒 Requiere autenticación
   * 🚦 Rate limited: 15 RPM
   */
  router.post(
    '/explicar-concepto',
    authMiddleware,
    geminiRateLimiter.middleware,
    geminiController.explicarConcepto
  );

  /**
   * POST /api/v1/gemini/generar-explicacion
   * Generar explicación línea por línea de código
   * 🔒 Requiere autenticación
   * 🚦 Rate limited: 15 RPM
   */
  router.post(
    '/generar-explicacion',
    authMiddleware,
    geminiRateLimiter.middleware,
    geminiController.generarExplicacion
  );

  /**
   * GET /api/v1/gemini/stats
   * Estadísticas de uso de Gemini (monitoreo)
   * 📊 Ruta pública (considerar restringir a admin en producción)
   */
  router.get('/stats', geminiController.getStats);

  return router;
}
