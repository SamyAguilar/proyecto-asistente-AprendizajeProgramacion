// backend/src/routes/ejercicio-admin.routes.ts

import { Router } from 'express';
import { EjercicioAdminController } from '../controllers/ejercicio-admin.controller';
import { authMiddleware } from '../middleware/authMiddleware';
import { profesorOAdmin, soloAdmin } from '../middleware/roleMiddleware';

const router = Router();
const ejercicioAdminController = new EjercicioAdminController();

/**
 * @route   POST /api/v1/admin/ejercicios
 * @desc    Crear un nuevo ejercicio
 * @access  Private (requiere token JWT + rol profesor o admin)
 */
router.post(
  '/',
  authMiddleware,
  profesorOAdmin,
  (req, res) => ejercicioAdminController.crearEjercicio(req, res)
);

/**
 * @route   PUT /api/v1/admin/ejercicios/:id
 * @desc    Actualizar un ejercicio existente
 * @access  Private (requiere token JWT + rol profesor o admin)
 */
router.put(
  '/:id',
  authMiddleware,
  profesorOAdmin,
  (req, res) => ejercicioAdminController.actualizarEjercicio(req, res)
);

/**
 * @route   DELETE /api/v1/admin/ejercicios/:id
 * @desc    Eliminar un ejercicio
 * @access  Private (requiere token JWT + rol admin)
 */
router.delete(
  '/:id',
  authMiddleware,
  soloAdmin,
  (req, res) => ejercicioAdminController.eliminarEjercicio(req, res)
);

export default router;