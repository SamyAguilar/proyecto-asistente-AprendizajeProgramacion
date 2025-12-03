// backend/src/routes/progreso.routes.ts

import { Router } from 'express';
import { ProgresoController } from '../controllers/progreso.controller';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();
const progresoController = new ProgresoController();

/**
 * TODAS LAS RUTAS REQUIEREN AUTENTICACION
 */

/**
 * @route   GET /api/v1/progreso/mi-progreso
 * @desc    Listar todo el progreso del estudiante autenticado
 * @access  Private (requiere token JWT)
 */
router.get(
  '/mi-progreso',
  authMiddleware,
  (req, res) => progresoController.listarMiProgreso(req, res)
);

/**
 * @route   GET /api/v1/progreso/tema/:temaId
 * @desc    Obtener progreso en un tema especifico
 * @access  Private (requiere token JWT)
 */
router.get(
  '/tema/:temaId',
  authMiddleware,
  (req, res) => progresoController.obtenerProgresoEnTema(req, res)
);

/**
 * @route   GET /api/v1/progreso/materia/:materiaId
 * @desc    Obtener resumen de progreso en una materia
 * @access  Private (requiere token JWT)
 */
router.get(
  '/materia/:materiaId',
  authMiddleware,
  (req, res) => progresoController.obtenerProgresoEnMateria(req, res)
);

/**
 * @route   PUT /api/v1/progreso/actualizar
 * @desc    Actualizar progreso de un estudiante
 * @access  Private (requiere token JWT)
 * @body    { temaId?, subtemaId?, estado, porcentajeCompletado? }
 * @note    IMPORTANTE: Pancho usara este endpoint
 */
router.put(
  '/actualizar',
  authMiddleware,
  (req, res) => progresoController.actualizarProgreso(req, res)
);

/**
 * @route   POST /api/v1/progreso/calcular/:temaId
 * @desc    Calcular automaticamente el progreso de un tema
 * @access  Private (requiere token JWT)
 */
router.post(
  '/calcular/:temaId',
  authMiddleware,
  (req, res) => progresoController.calcularProgresoTema(req, res)
);

/**
 * @route   GET /api/v1/progreso/general
 * @desc    Obtener progreso general del estudiante
 * @access  Private (requiere token JWT)
 */
router.get(
  '/general',
  authMiddleware,
  (req, res) => progresoController.obtenerProgresoGeneral(req, res)
);

export default router;