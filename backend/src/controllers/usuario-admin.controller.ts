import { Request, Response } from 'express';
import { UsuarioAdminService } from '../services/usuario-admin.service';
import { EstadoUsuario } from '../models/Usuario';
import { logError } from '../utils/logger';

export class UsuarioAdminController {
  private usuarioAdminService: UsuarioAdminService;

  constructor() {
    this.usuarioAdminService = new UsuarioAdminService();
  }

  /**
   * GET /api/v1/admin/usuarios
   * Listar todos los usuarios con su progreso
   */
  listarUsuariosConProgreso = async (req: Request, res: Response): Promise<void> => {
    try {
      const usuarios = await this.usuarioAdminService.listarUsuariosConProgreso();

      res.status(200).json({
        success: true,
        data: usuarios,
        total: usuarios.length
      });
    } catch (error: any) {
      logError('Error al listar usuarios:', error);
      res.status(500).json({
        success: false,
        error: 'Error al listar usuarios',
        mensaje: error.message
      });
    }
  };

  /**
   * GET /api/v1/admin/materias/:materiaId/estudiantes
   * Listar estudiantes inscritos en una materia
   */
  listarEstudiantesPorMateria = async (req: Request, res: Response): Promise<void> => {
    try {
      const materiaId = parseInt(req.params.materiaId);

      if (isNaN(materiaId)) {
        res.status(400).json({
          success: false,
          error: 'ID de materia inválido'
        });
        return;
      }

      const resultado = await this.usuarioAdminService.listarEstudiantesPorMateria(materiaId);

      res.status(200).json({
        success: true,
        data: resultado
      });
    } catch (error: any) {
      logError('Error al listar estudiantes por materia:', error);
      res.status(500).json({
        success: false,
        error: 'Error al listar estudiantes',
        mensaje: error.message
      });
    }
  };

  /**
   * PUT /api/v1/admin/usuarios/:usuarioId/estado
   * Cambiar estado de un usuario
   */
  cambiarEstadoUsuario = async (req: Request, res: Response): Promise<void> => {
    try {
      const usuarioId = parseInt(req.params.usuarioId);
      const { estado } = req.body;

      if (isNaN(usuarioId)) {
        res.status(400).json({
          success: false,
          error: 'ID de usuario inválido'
        });
        return;
      }

      if (!Object.values(EstadoUsuario).includes(estado)) {
        res.status(400).json({
          success: false,
          error: 'Estado inválido. Debe ser: activo, inactivo o suspendido'
        });
        return;
      }

      const usuario = await this.usuarioAdminService.cambiarEstadoUsuario(
        usuarioId,
        estado as EstadoUsuario
      );

      res.status(200).json({
        success: true,
        mensaje: `Usuario ${estado === 'suspendido' ? 'suspendido' : estado === 'inactivo' ? 'desactivado' : 'activado'} exitosamente`,
        data: {
          id: usuario.id,
          email: usuario.email,
          nombre: usuario.nombre,
          estado: usuario.estado
        }
      });
    } catch (error: any) {
      logError('Error al cambiar estado de usuario:', error);
      res.status(500).json({
        success: false,
        error: 'Error al cambiar estado',
        mensaje: error.message
      });
    }
  };

  /**
   * POST /api/v1/admin/usuarios/crear-admin
   * Crear un nuevo usuario administrador
   */
  crearAdmin = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, contraseña, nombre, apellido } = req.body;

      // Validaciones básicas
      if (!email || !contraseña || !nombre || !apellido) {
        res.status(400).json({
          success: false,
          error: 'Todos los campos son requeridos: email, contraseña, nombre, apellido'
        });
        return;
      }

      if (contraseña.length < 6) {
        res.status(400).json({
          success: false,
          error: 'La contraseña debe tener al menos 6 caracteres'
        });
        return;
      }

      const nuevoAdmin = await this.usuarioAdminService.crearAdmin({
        email,
        contraseña,
        nombre,
        apellido
      });

      res.status(201).json({
        success: true,
        mensaje: 'Administrador creado exitosamente',
        data: {
          id: nuevoAdmin.id,
          email: nuevoAdmin.email,
          nombre: nuevoAdmin.nombre,
          apellido: nuevoAdmin.apellido,
          rol: nuevoAdmin.rol
        }
      });
    } catch (error: any) {
      logError('Error al crear admin:', error);
      res.status(500).json({
        success: false,
        error: 'Error al crear administrador',
        mensaje: error.message
      });
    }
  };

  /**
   * GET /api/v1/admin/estadisticas
   * Obtener estadísticas generales del sistema
   */
  obtenerEstadisticas = async (req: Request, res: Response): Promise<void> => {
    try {
      const estadisticas = await this.usuarioAdminService.obtenerEstadisticasGenerales();

      res.status(200).json({
        success: true,
        data: estadisticas
      });
    } catch (error: any) {
      logError('Error al obtener estadísticas:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener estadísticas',
        mensaje: error.message
      });
    }
  };
}