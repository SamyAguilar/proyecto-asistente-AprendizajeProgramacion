import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/database';
import { Usuario } from '../models';

// Extender la interfaz Request de Express para incluir el usuario
declare global {
  namespace Express {
    interface Request {
      user?: Usuario;
      userId?: number;
    }
  }
}

interface JwtPayload {
  userId: number;
  email: string;
  rol: string;
  iat?: number;
  exp?: number;
}

/**
 * Middleware de autenticación JWT
 * Verifica que el token sea válido y adjunta el usuario al request
 */
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 1. Obtener el token del header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({
        error: 'No autorizado',
        message: 'No se proporcionó token de autenticación'
      });
      return;
    }

    // 2. Verificar formato: "Bearer TOKEN"
    const parts = authHeader.split(' ');
    
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      res.status(401).json({
        error: 'No autorizado',
        message: 'Formato de token inválido. Use: Bearer <token>'
      });
      return;
    }

    const token = parts[1];

    // 3. Verificar y decodificar el token JWT
    const JWT_SECRET = process.env.JWT_SECRET;
    
    if (!JWT_SECRET) {
      throw new Error('JWT_SECRET no está configurado en las variables de entorno');
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    // 4. Buscar el usuario en la base de datos
    const usuarioRepository = AppDataSource.getRepository(Usuario);
    const usuario = await usuarioRepository.findOne({
      where: { id: decoded.userId }
    });

    if (!usuario) {
      res.status(401).json({
        error: 'No autorizado',
        message: 'Usuario no encontrado'
      });
      return;
    }

    // 5. Verificar que el usuario esté activo
    if (usuario.estado !== 'activo') {
      res.status(403).json({
        error: 'Acceso denegado',
        message: 'Usuario inactivo o suspendido'
      });
      return;
    }

    // 6. Adjuntar usuario al request para que esté disponible en los controladores
    req.user = usuario;
    req.userId = usuario.id;

    // 7. Continuar con el siguiente middleware/controlador
    next();

  } catch (error) {
    // Manejar errores específicos de JWT
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        error: 'No autorizado',
        message: 'Token inválido'
      });
      return;
    }

    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        error: 'Token expirado',
        message: 'El token ha expirado. Por favor, inicie sesión nuevamente'
      });
      return;
    }

    // Error genérico
    console.error('Error en authMiddleware:', error);
    res.status(500).json({
      error: 'Error interno',
      message: 'Error al verificar autenticación'
    });
  }
};

/**
 * Middleware opcional de autenticación
 * Adjunta el usuario si hay token válido, pero no bloquea si no hay token
 */
export const optionalAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      // No hay token, pero no es un error
      next();
      return;
    }

    const parts = authHeader.split(' ');
    
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      next();
      return;
    }

    const token = parts[1];
    const JWT_SECRET = process.env.JWT_SECRET;
    
    if (!JWT_SECRET) {
      next();
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    const usuarioRepository = AppDataSource.getRepository(Usuario);
    const usuario = await usuarioRepository.findOne({
      where: { id: decoded.userId }
    });

    if (usuario && usuario.estado === 'activo') {
      req.user = usuario;
      req.userId = usuario.id;
    }

    next();

  } catch (error) {
    // Si hay error, simplemente continúa sin usuario
    next();
  }
};