// src/routes/user.routes.ts

import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();
const userController = new UserController();

/**
 * Todas las rutas de usuario requieren autenticación
 * Por eso aplicamos authMiddleware a todas
 */

/**
 * @route   GET /api/v1/usuarios/perfil
 * @desc    Obtener información del perfil del usuario autenticado
 * @access  Private (requiere token JWT)
 * @returns {Object} - Datos del perfil (Usuario_id, email, nombre, apellido, rol, matricula, foto_perfil)
 */
router.get(
  '/perfil',
  authMiddleware,
  (req, res) => userController.obtenerPerfil(req, res)
);

/**
 * @route   PUT /api/v1/usuarios/perfil
 * @desc    Actualizar perfil del usuario autenticado
 * @access  Private (requiere token JWT)
 * @body    {nombre?, apellido?, foto_perfil?}
 * @returns {Object} - Perfil actualizado
 * @note    NO permite cambiar email, rol o contraseña
 */
router.put(
  '/perfil',
  authMiddleware,
  (req, res) => userController.actualizarPerfil(req, res)
);

/**
 * @route   GET /api/v1/usuarios/progreso
 * @desc    Obtener progreso general del usuario en todas sus materias
 * @access  Private (requiere token JWT)
 * @returns {Object} - Estadísticas de progreso agregadas
 * @note    Incluye: materias inscritas, temas completados, promedio general, etc.
 */
router.get(
  '/progreso',
  authMiddleware,
  (req, res) => userController.obtenerProgresoGeneral(req, res)
);

export default router;