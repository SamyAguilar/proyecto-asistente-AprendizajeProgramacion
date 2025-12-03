import { Router } from 'express';
import { UsuarioAdminController } from '../controllers/usuario-admin.controller';
import { authMiddleware } from '../middleware/authMiddleware';
import { soloAdmin } from '../middleware/roleMiddleware';

const router = Router();
const controller = new UsuarioAdminController();

// Todas las rutas requieren autenticación y rol de admin
router.use(authMiddleware);
router.use(soloAdmin);

/**
 * @route GET /api/v1/admin/usuarios
 * @desc Listar todos los usuarios con su progreso
 * @access Admin
 */
router.get('/usuarios', controller.listarUsuariosConProgreso);

/**
 * @route GET /api/v1/admin/materias/:materiaId/estudiantes
 * @desc Listar estudiantes inscritos en una materia específica
 * @access Admin
 */
router.get('/materias/:materiaId/estudiantes', controller.listarEstudiantesPorMateria);

/**
 * @route PUT /api/v1/admin/usuarios/:usuarioId/estado
 * @desc Cambiar estado de un usuario (activar, desactivar, suspender)
 * @access Admin
 */
router.put('/usuarios/:usuarioId/estado', controller.cambiarEstadoUsuario);

/**
 * @route POST /api/v1/admin/usuarios/crear-admin
 * @desc Crear un nuevo usuario administrador
 * @access Admin
 */
router.post('/usuarios/crear-admin', controller.crearAdmin);

/**
 * @route GET /api/v1/admin/estadisticas
 * @desc Obtener estadísticas generales del sistema
 * @access Admin
 */
router.get('/estadisticas', controller.obtenerEstadisticas);

export default router;