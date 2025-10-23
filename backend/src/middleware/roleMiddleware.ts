import { Request, Response, NextFunction } from 'express';
import { RolUsuario } from '../models';

/**
 * Middleware de verificación de roles
 * Verifica que el usuario tenga uno de los roles permitidos
 * 
 * DEBE usarse DESPUÉS de authMiddleware
 */
export const roleMiddleware = (...rolesPermitidos: RolUsuario[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // 1. Verificar que el usuario esté autenticado
      if (!req.user) {
        res.status(401).json({
          error: 'No autorizado',
          message: 'Debe iniciar sesión para acceder a este recurso'
        });
        return;
      }

      // 2. Verificar que el usuario tenga uno de los roles permitidos
      const usuarioRol = req.user.rol;

      if (!rolesPermitidos.includes(usuarioRol)) {
        res.status(403).json({
          error: 'Acceso denegado',
          message: `No tiene permisos para acceder a este recurso. Roles permitidos: ${rolesPermitidos.join(', ')}`,
          rolActual: usuarioRol,
          rolesPermitidos
        });
        return;
      }

      // 3. El usuario tiene el rol correcto, continuar
      next();

    } catch (error) {
      console.error('Error en roleMiddleware:', error);
      res.status(500).json({
        error: 'Error interno',
        message: 'Error al verificar permisos'
      });
    }
  };
};

/**
 * Middlewares predefinidos para roles comunes
 */

// Solo estudiantes
export const soloEstudiantes = roleMiddleware(RolUsuario.ESTUDIANTE);

// Solo profesores
export const soloProfesores = roleMiddleware(RolUsuario.PROFESOR);

// Solo administradores
export const soloAdmin = roleMiddleware(RolUsuario.ADMIN);

// Profesores y administradores
export const profesorOAdmin = roleMiddleware(RolUsuario.PROFESOR, RolUsuario.ADMIN);

// Cualquier usuario autenticado (estudiante, profesor o admin)
export const usuarioAutenticado = roleMiddleware(
  RolUsuario.ESTUDIANTE,
  RolUsuario.PROFESOR,
  RolUsuario.ADMIN
);

/**
 * Middleware para verificar que un usuario solo acceda a sus propios datos
 * o sea profesor/admin
 */
export const soloPropioDatosOAdmin = (req: Request, res: Response, next: NextFunction): void => {
  try {
    if (!req.user) {
      res.status(401).json({
        error: 'No autorizado',
        message: 'Debe iniciar sesión'
      });
      return;
    }

    // Obtener el ID del recurso solicitado (puede venir en params o body)
    const recursoUsuarioId = parseInt(req.params.usuario_id || req.params.usuarioId || req.body.usuario_id);

    // Si es admin o profesor, permitir acceso
    if (req.user.rol === RolUsuario.ADMIN || req.user.rol === RolUsuario.PROFESOR) {
      next();
      return;
    }

    // Si es estudiante, solo puede acceder a sus propios datos
    if (req.user.id !== recursoUsuarioId) {
      res.status(403).json({
        error: 'Acceso denegado',
        message: 'No puede acceder a datos de otros usuarios'
      });
      return;
    }

    next();

  } catch (error) {
    console.error('Error en soloPropioDatosOAdmin:', error);
    res.status(500).json({
      error: 'Error interno',
      message: 'Error al verificar permisos'
    });
  }
};