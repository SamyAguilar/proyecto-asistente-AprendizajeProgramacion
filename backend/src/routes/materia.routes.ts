import { Router } from 'express';
import { MateriaController } from '../controllers/materia.controller';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();
const materiaController = new MateriaController();

/**
 * TODAS LAS RUTAS REQUIEREN AUTENTICACIÓN
 * Los estudiantes deben estar registrados para acceder al contenido
 */

/**
 * @route   GET /api/v1/materias
 * @desc    Listar todas las materias disponibles
 * @access  Private (requiere token JWT)
 */
router.get(
  '/',
  authMiddleware,
  (req, res) => materiaController.listarMaterias(req, res)
);

/**
 * @route   GET /api/v1/materias/buscar
 * @desc    Buscar materias por nombre o codigo
 * @access  Private (requiere token JWT)
 * @query   q - Texto de busqueda
 */
router.get(
  '/buscar',
  authMiddleware,
  (req, res) => materiaController.buscarMaterias(req, res)
);

/**
 * @route   GET /api/v1/materias/mis-materias
 * @desc    Listar materias del estudiante autenticado
 * @access  Private (requiere token JWT)
 */
router.get(
  '/mis-materias',
  authMiddleware,
  (req, res) => materiaController.listarMisMaterias(req, res)
);

/**
 * @route   GET /api/v1/materias/:id
 * @desc    Obtener detalle de una materia especifica
 * @access  Private (requiere token JWT)
 */
router.get(
  '/:id',
  authMiddleware,
  (req, res) => materiaController.obtenerMateriaPorId(req, res)
);

/**
 * @route   POST /api/v1/materias/:id/matricular
 * @desc    Matricular al estudiante en una materia
 * @access  Private (requiere token JWT)
 */
router.post(
  '/:id/matricular',
  authMiddleware,
  (req, res) => materiaController.matricularEnMateria(req, res)
);

export default router;