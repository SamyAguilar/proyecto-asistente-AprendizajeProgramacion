// backend/src/routes/tema-admin.routes.ts

import { Router } from 'express';
import { TemaAdminController } from '../controllers/tema-admin.controller';
import { authMiddleware } from '../middleware/authMiddleware';
import { profesorOAdmin, soloAdmin } from '../middleware/roleMiddleware';

const router = Router();
const temaAdminController = new TemaAdminController();

/**
 * TODAS LAS RUTAS REQUIEREN AUTENTICACIÓN + ROL ADMIN/PROFESOR
 */

/**
 * @route   POST /api/v1/admin/temas
 * @desc    Crear un nuevo tema
 * @access  Private (requiere token JWT + rol profesor o admin)
 * @body    { materiaId, nombre, descripcion?, contenido?, orden? }
 */
router.post(
  '/',
  authMiddleware,
  profesorOAdmin,
  (req, res) => temaAdminController.crearTema(req, res)
);

/**
 * @route   PUT /api/v1/admin/temas/:id
 * @desc    Actualizar un tema existente
 * @access  Private (requiere token JWT + rol profesor o admin)
 * @body    { nombre?, descripcion?, contenido?, orden? }
 */
router.put(
  '/:id',
  authMiddleware,
  profesorOAdmin,
  (req, res) => temaAdminController.actualizarTema(req, res)
);

/**
 * @route   DELETE /api/v1/admin/temas/:id
 * @desc    Eliminar un tema
 * @access  Private (requiere token JWT + rol admin)
 * @note    Solo admin puede eliminar. Verifica que no tenga subtemas.
 */
router.delete(
  '/:id',
  authMiddleware,
  soloAdmin,
  (req, res) => temaAdminController.eliminarTema(req, res)
);

export default router;