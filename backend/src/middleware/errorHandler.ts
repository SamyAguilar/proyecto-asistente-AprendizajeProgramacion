import { Request, Response, NextFunction } from 'express';
import { QueryFailedError } from 'typeorm';
import { ValidationError } from 'class-validator';

/**
 * Clase personalizada para errores de la aplicación
 */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Errores predefinidos comunes
 */
export class NotFoundError extends AppError {
  constructor(recurso: string = 'Recurso') {
    super(404, `${recurso} no encontrado`);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'No autorizado') {
    super(401, message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Acceso denegado') {
    super(403, message);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = 'Solicitud inválida') {
    super(400, message);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Conflicto con el estado actual del recurso') {
    super(409, message);
  }
}

/**
 * Interfaz para el formato de respuesta de error
 */
interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
  path: string;
  stack?: string;
  details?: any;
}

/**
 * Middleware global de manejo de errores
 * Debe ser el ÚLTIMO middleware registrado en la aplicación
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Preparar respuesta de error base
  let statusCode = 500;
  let message = 'Error interno del servidor';
  let errorType = 'InternalServerError';
  let details: any = undefined;

  // 1. Manejar errores personalizados de la aplicación
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errorType = err.constructor.name;
  }

  // 2. Manejar errores de validación de class-validator
  else if (err.name === 'ValidationError') {
    statusCode = 400;
    errorType = 'ValidationError';
    message = 'Error de validación de datos';
    details = err.message;
  }

  // 3. Manejar errores de base de datos (TypeORM)
  else if (err instanceof QueryFailedError) {
    statusCode = 400;
    errorType = 'DatabaseError';
    
    const dbError = err as any;
    
    // Errores específicos de PostgreSQL
    switch (dbError.code) {
      case '23505': // Unique violation
        message = 'Ya existe un registro con estos datos';
        details = 'Violación de restricción única';
        statusCode = 409;
        break;
      
      case '23503': // Foreign key violation
        message = 'Referencia a un registro inexistente';
        details = 'Violación de clave foránea';
        break;
      
      case '23502': // Not null violation
        message = 'Faltan campos requeridos';
        details = 'Violación de campo requerido';
        break;
      
      default:
        message = 'Error en la operación de base de datos';
        details = process.env.NODE_ENV === 'development' ? dbError.message : undefined;
    }
  }

  // 4. Manejar errores de sintaxis JSON
  else if (err instanceof SyntaxError && 'body' in err) {
    statusCode = 400;
    errorType = 'SyntaxError';
    message = 'JSON inválido en el cuerpo de la solicitud';
  }

  // 5. Manejar otros errores conocidos
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    errorType = 'AuthenticationError';
    message = 'Token JWT inválido';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    errorType = 'AuthenticationError';
    message = 'Token JWT expirado';
  }

  // Construir respuesta de error estandarizada
  const errorResponse: ErrorResponse = {
    error: errorType,
    message,
    statusCode,
    timestamp: new Date().toISOString(),
    path: req.originalUrl
  };

  // Agregar detalles solo en desarrollo
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
    if (details) {
      errorResponse.details = details;
    }
  }

  // Loguear el error
  logError(err, req);

  // Enviar respuesta
  res.status(statusCode).json(errorResponse);
};

/**
 * Función para loguear errores usando Winston
 */
const logError = (err: Error, req: Request): void => {
  // Importar logger dinámicamente para evitar dependencias circulares
  const { logError: winstonLogError } = require('../utils/logger');
  
  const errorMeta = {
    method: req.method,
    path: req.originalUrl,
    userId: req.userId,
    userEmail: req.user?.email,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  };

  winstonLogError('Error en request HTTP', err, errorMeta);
};

/**
 * Middleware para capturar rutas no encontradas (404)
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const error = new NotFoundError(`Ruta ${req.originalUrl} no encontrada`);
  next(error);
};

/**
 * Wrapper asíncrono para controladores
 * Captura errores en funciones asíncronas y los pasa al error handler
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};