// backend/src/routes/ejercicio.routes.ts

import { Router } from 'express';
import { EjercicioController } from '../controllers/ejercicio.controller';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();
const ejercicioController = new EjercicioController();

/**
 * TODAS LAS RUTAS REQUIEREN AUTENTICACION
 */

/**
 * @route   GET /api/v1/ejercicios/subtema/:subtemaId
 * @desc    Listar todos los ejercicios de un subtema
 * @access  Private (requiere token JWT)
 */
router.get(
  '/subtema/:subtemaId',
  authMiddleware,
  (req, res) => ejercicioController.listarEjerciciosPorSubtema(req, res)
);

/**
 * @route   GET /api/v1/ejercicios/:id
 * @desc    Obtener detalle de un ejercicio especifico
 * @access  Private (requiere token JWT)
 */
router.get(
  '/:id',
  authMiddleware,
  (req, res) => ejercicioController.obtenerEjercicioPorId(req, res)
);

/**
 * @route   POST /api/v1/ejercicios/:id/enviar
 * @desc    Enviar solucion de ejercicio (ENDPOINT MAS IMPORTANTE)
 * @access  Private (requiere token JWT)
 * @body    { codigoEnviado: string }
 * @note    CRITICO: Integra con Lulu para validacion y con Tono para progreso
 */
router.post(
  '/:id/enviar',
  authMiddleware,
  (req, res) => ejercicioController.enviarEjercicio(req, res)
);

/**
 * @route   GET /api/v1/ejercicios/:id/intentos
 * @desc    Obtener historial de intentos del usuario en un ejercicio
 * @access  Private (requiere token JWT)
 */
router.get(
  '/:id/intentos',
  authMiddleware,
  (req, res) => ejercicioController.obtenerIntentosEjercicio(req, res)
);

export default router;