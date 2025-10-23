import { Router } from 'express';
import authController from '../controllers/AuthController';
import { authRateLimiter, registroRateLimiter } from '../middleware/rateLimiter';

const router = Router();

/**
 * @route   POST /api/v1/auth/registro
 * @desc    Registrar nuevo usuario
 * @access  Public
 * @rateLimit 3 registros por hora por IP
 */
router.post(
  '/registro',
  registroRateLimiter,
  (req, res) => authController.registro(req, res)
);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Iniciar sesión
 * @access  Public
 * @rateLimit 5 intentos por 15 minutos por IP
 */
router.post(
  '/login',
  authRateLimiter,
  (req, res) => authController.login(req, res)
);

/**
 * @route   POST /api/v1/auth/refresh-token
 * @desc    Renovar access token usando refresh token
 * @access  Public (pero requiere refresh token válido)
 */
router.post(
  '/refresh-token',
  (req, res) => authController.refreshToken(req, res)
);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Cerrar sesión (invalidar refresh token)
 * @access  Public
 */
router.post(
  '/logout',
  (req, res) => authController.logout(req, res)
);

export default router;