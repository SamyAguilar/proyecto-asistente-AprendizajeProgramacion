import { Router } from 'express';
import { TemaController } from '../controllers/tema.controller';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();
const temaController = new TemaController();

/**
 * TODAS LAS RUTAS REQUIEREN AUTENTICACIÓN
 * Los estudiantes deben estar registrados para acceder al contenido
 */

/**
 * @route   GET /api/v1/temas/:id
 * @desc    Obtener detalle de un tema especifico
 * @access  Private (requiere token JWT)
 */
router.get(
  '/:id',
  authMiddleware,
  (req, res) => temaController.obtenerTemaPorId(req, res)
);

/**
 * @route   GET /api/v1/temas/:temaId/subtemas
 * @desc    Listar todos los subtemas de un tema
 * @access  Private (requiere token JWT)
 */
router.get(
  '/:temaId/subtemas',
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

export default router;