// backend/src/routes/materia-admin.routes.ts

import { Router } from 'express';
import { MateriaAdminController } from '../controllers/materia-admin.controller';
import { authMiddleware } from '../middleware/authMiddleware';
import { profesorOAdmin, soloAdmin } from '../middleware/roleMiddleware';

const router = Router();
const materiaAdminController = new MateriaAdminController();

/**
 * TODAS LAS RUTAS REQUIEREN AUTENTICACIÓN + ROL ADMIN/PROFESOR
 */

/**
 * @route   POST /api/v1/admin/materias
 * @desc    Crear una nueva materia
 * @access  Private (requiere token JWT + rol profesor o admin)
 * @body    { nombre, codigo, descripcion?, semestre?, prerequisitos?, creditos? }
 */
router.post(
  '/',
  authMiddleware,
  profesorOAdmin,  // Solo admin o profesor pueden crear
  (req, res) => materiaAdminController.crearMateria(req, res)
);

/**
 * @route   PUT /api/v1/admin/materias/:id
 * @desc    Actualizar una materia existente
 * @access  Private (requiere token JWT + rol profesor o admin)
 * @body    { nombre?, codigo?, descripcion?, semestre?, prerequisitos?, creditos? }
 */
router.put(
  '/:id',
  authMiddleware,
  profesorOAdmin,  // Solo admin o profesor pueden editar
  (req, res) => materiaAdminController.actualizarMateria(req, res)
);

/**
 * @route   DELETE /api/v1/admin/materias/:id
 * @desc    Eliminar una materia
 * @access  Private (requiere token JWT + rol admin)
 * @note    Solo admin puede eliminar. Verifica que no haya estudiantes matriculados.
 */
router.delete(
  '/:id',
  authMiddleware,
  soloAdmin,  // Solo admin puede eliminar (más restrictivo)
  (req, res) => materiaAdminController.eliminarMateria(req, res)
);

export default router;