// backend/src/routes/tema.routes.ts

import { Router } from 'express';
import { TemaController } from '../controllers/tema.controller';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();
const temaController = new TemaController();

/**
 * TODAS LAS RUTAS REQUIEREN AUTENTICACION
 */

/**
 * @route   GET /api/v1/temas/:id
 * @desc    Obtener detalle de un tema especifico
 * @access  Private (requiere token JWT)
 */
router.get(
  '/temas/:id',
  authMiddleware,
  (req, res) => temaController.obtenerTemaPorId(req, res)
);

/**
 * @route   GET /api/v1/temas/:temaId/subtemas
 * @desc    Listar todos los subtemas de un tema
 * @access  Private (requiere token JWT)
 */
router.get(
  '/temas/:temaId/subtemas',
  authMiddleware,
  (req, res) => temaController.listarSubtemasPorTema(req, res)
);

/**
 * @route   GET /api/v1/subtemas/:id
 * @desc    Obtener detalle de un subtema especifico
 * @access  Private (requiere token JWT)
 */
router.get(
  '/subtemas/:id',
  authMiddleware,
  (req, res) => temaController.obtenerSubtemaPorId(req, res)
);

/**
 * @route   GET /api/v1/materias/:materiaId/temas
 * @desc    Listar todos los temas de una materia
 * @access  Private (requiere token JWT)
 */
router.get(
  '/materias/:materiaId/temas',
  authMiddleware,
  (req, res) => temaController.listarTemasPorMateria(req, res)
);

/**
 * @route   GET /api/v1/materias/:materiaId/temas-con-progreso
 * @desc    Listar temas con progreso del estudiante
 * @access  Private (requiere token JWT)
 */
router.get(
  '/materias/:materiaId/temas-con-progreso',
  authMiddleware,
  (req, res) => temaController.listarTemasConProgreso(req, res)
);

export default router;