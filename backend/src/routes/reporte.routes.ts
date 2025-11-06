import { Router } from 'express';
import { ReporteController } from '../controllers/reporte.controller';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();
const reporteController = new ReporteController();

/**
 * Todas las rutas de reportes requieren autenticacion
 */

/**
 * @route   GET /api/v1/reportes/rendimiento
 * @desc    Generar reporte de rendimiento general del estudiante
 * @access  Private (requiere token JWT)
 * @query   fechaInicio - Fecha de inicio (opcional)
 * @query   fechaFin - Fecha de fin (opcional)
 */
router.get(
  '/rendimiento',
  authMiddleware,
  (req, res) => reporteController.generarReporteRendimiento(req, res)
);

/**
 * @route   GET /api/v1/reportes/por-materia/:materiaId
 * @desc    Generar reporte por materia especifica
 * @access  Private (requiere token JWT)
 */
router.get(
  '/por-materia/:materiaId',
  authMiddleware,
  (req, res) => reporteController.generarReportePorMateria(req, res)
);

/**
 * @route   GET /api/v1/reportes/actividad
 * @desc    Generar reporte de actividad diaria
 * @access  Private (requiere token JWT)
 * @query   dias - Numero de dias a analizar (default: 7, max: 90)
 */
router.get(
  '/actividad',
  authMiddleware,
  (req, res) => reporteController.generarReporteActividad(req, res)
);

/**
 * @route   GET /api/v1/reportes/comparativo
 * @desc    Generar reporte comparativo con otros estudiantes
 * @access  Private (requiere token JWT)
 */
router.get(
  '/comparativo',
  authMiddleware,
  (req, res) => reporteController.generarReporteComparativo(req, res)
);

export default router;
