// backend/src/routes/subtema-admin.routes.ts

import { Router } from 'express';
import { SubtemaAdminController } from '../controllers/subtema-admin.controller';
import { authMiddleware } from '../middleware/authMiddleware';
import { profesorOAdmin, soloAdmin } from '../middleware/roleMiddleware';

const router = Router();
const subtemaAdminController = new SubtemaAdminController();

/**
 * @route   POST /api/v1/admin/subtemas
 * @desc    Crear un nuevo subtema
 * @access  Private (requiere token JWT + rol profesor o admin)
 */
router.post(
  '/',
  authMiddleware,
  profesorOAdmin,
  (req, res) => subtemaAdminController.crearSubtema(req, res)
);

/**
 * @route   PUT /api/v1/admin/subtemas/:id
 * @desc    Actualizar un subtema existente
 * @access  Private (requiere token JWT + rol profesor o admin)
 */
router.put(
  '/:id',
  authMiddleware,
  profesorOAdmin,
  (req, res) => subtemaAdminController.actualizarSubtema(req, res)
);

/**
 * @route   DELETE /api/v1/admin/subtemas/:id
 * @desc    Eliminar un subtema
 * @access  Private (requiere token JWT + rol admin)
 */
router.delete(
  '/:id',
  authMiddleware,
  soloAdmin,
  (req, res) => subtemaAdminController.eliminarSubtema(req, res)
);

export default router;