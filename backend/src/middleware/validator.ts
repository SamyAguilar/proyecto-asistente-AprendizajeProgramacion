import { Request, Response, NextFunction } from 'express';
import { validate, ValidationError as ClassValidatorError } from 'class-validator';
import { plainToClass } from 'class-transformer';

/**
 * Tipo para indicar de dónde obtener los datos a validar
 */
type ValidationType = 'body' | 'query' | 'params';

/**
 * Middleware genérico de validación usando class-validator
 * 
 * @param dtoClass - Clase DTO con decoradores de class-validator
 * @param validationType - De dónde obtener los datos ('body', 'query', 'params')
 * @param skipMissingProperties - Si true, no valida propiedades undefined
 */
export const validator = <T extends object>(
  dtoClass: new () => T,
  validationType: ValidationType = 'body',
  skipMissingProperties: boolean = false
) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // 1. Obtener los datos según el tipo de validación
      let dataToValidate: any;
      
      switch (validationType) {
        case 'body':
          dataToValidate = req.body;
          break;
        case 'query':
          dataToValidate = req.query;
          break;
        case 'params':
          dataToValidate = req.params;
          break;
        default:
          dataToValidate = req.body;
      }

      // 2. Transformar datos planos a instancia de clase
      const dtoInstance = plainToClass(dtoClass, dataToValidate);

      // 3. Validar la instancia
      const errors = await validate(dtoInstance, {
        skipMissingProperties,
        whitelist: true, // Eliminar propiedades que no estén en el DTO
        forbidNonWhitelisted: true // Rechazar propiedades no definidas en el DTO
      });

      // 4. Si hay errores, formatearlos y responder
      if (errors.length > 0) {
        const formattedErrors = formatValidationErrors(errors);
        
        res.status(400).json({
          error: 'ValidationError',
          message: 'Error de validación de datos',
          errors: formattedErrors,
          timestamp: new Date().toISOString()
        });
        return;
      }

      // 5. Si todo está bien, reemplazar los datos originales con la instancia validada
      switch (validationType) {
        case 'body':
          req.body = dtoInstance;
          break;
        case 'query':
          req.query = dtoInstance as any;
          break;
        case 'params':
          req.params = dtoInstance as any;
          break;
      }

      next();

    } catch (error) {
      console.error('Error en validator middleware:', error);
      res.status(500).json({
        error: 'InternalServerError',
        message: 'Error al validar datos'
      });
    }
  };
};

/**
 * Formatea los errores de class-validator a un formato más legible
 */
const formatValidationErrors = (errors: ClassValidatorError[]): any[] => {
  return errors.map(error => {
    const constraints = error.constraints || {};
    
    return {
      field: error.property,
      value: error.value,
      errors: Object.values(constraints)
    };
  });
};

/**
 * Middleware para validar IDs numéricos en los parámetros de ruta
 */
export const validateIdParam = (paramName: string = 'id') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const id = req.params[paramName];
    const numericId = parseInt(id, 10);

    if (isNaN(numericId) || numericId <= 0) {
      res.status(400).json({
        error: 'ValidationError',
        message: `El parámetro '${paramName}' debe ser un número entero positivo`,
        field: paramName,
        value: id
      });
      return;
    }

    // Reemplazar el string con el número parseado
    req.params[paramName] = numericId.toString();
    next();
  };
};

/**
 * Middleware para validar paginación (page y limit)
 */
export const validatePagination = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  // Validar que page sea >= 1
  if (page < 1) {
    res.status(400).json({
      error: 'ValidationError',
      message: 'El parámetro "page" debe ser mayor o igual a 1',
      field: 'page',
      value: page
    });
    return;
  }

  // Validar que limit esté entre 1 y 100
  if (limit < 1 || limit > 100) {
    res.status(400).json({
      error: 'ValidationError',
      message: 'El parámetro "limit" debe estar entre 1 y 100',
      field: 'limit',
      value: limit
    });
    return;
  }

  // Adjuntar valores validados al request
  req.query.page = page.toString();
  req.query.limit = limit.toString();

  next();
};

/**
 * Middleware para sanitizar strings (prevenir XSS básico)
 */
export const sanitizeStrings = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const sanitize = (obj: any): any => {
    if (typeof obj === 'string') {
      // Eliminar scripts y HTML básico
      return obj
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .trim();
    }
    
    if (Array.isArray(obj)) {
      return obj.map(sanitize);
    }
    
    if (typeof obj === 'object' && obj !== null) {
      const sanitized: any = {};
      for (const key in obj) {
        sanitized[key] = sanitize(obj[key]);
      }
      return sanitized;
    }
    
    return obj;
  };

  if (req.body) {
    req.body = sanitize(req.body);
  }
  
  if (req.query) {
    req.query = sanitize(req.query);
  }
  
  if (req.params) {
    req.params = sanitize(req.params);
  }

  next();
};

/**
 * Ejemplo de DTOs para validación
 * Estos deberían estar en una carpeta separada (src/dtos/)
 */

// Ejemplo: DTO para login
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'El email debe ser válido' })
  @IsNotEmpty({ message: 'El email es requerido' })
  email: string;

  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  contraseña: string;
}

// Ejemplo: DTO para registro
import { IsEnum, IsOptional, Length } from 'class-validator';
import { RolUsuario } from '../models';

export class RegistroDto {
  @IsEmail({}, { message: 'El email debe ser válido' })
  @IsNotEmpty({ message: 'El email es requerido' })
  email: string;

  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  contraseña: string;

  @IsNotEmpty({ message: 'El nombre es requerido' })
  @Length(2, 255, { message: 'El nombre debe tener entre 2 y 255 caracteres' })
  nombre: string;

  @IsOptional()
  @Length(2, 255, { message: 'El apellido debe tener entre 2 y 255 caracteres' })
  apellido?: string;

  @IsEnum(RolUsuario, { message: 'El rol debe ser estudiante, profesor o admin' })
  rol: RolUsuario;

  @IsOptional()
  @Length(5, 20, { message: 'La matrícula debe tener entre 5 y 20 caracteres' })
  matricula?: string;
}

// Ejemplo: DTO para actualizar perfil
export class ActualizarPerfilDto {
  @IsOptional()
  @Length(2, 255, { message: 'El nombre debe tener entre 2 y 255 caracteres' })
  nombre?: string;

  @IsOptional()
  @Length(2, 255, { message: 'El apellido debe tener entre 2 y 255 caracteres' })
  apellido?: string;

  @IsOptional()
  fotoPerfil?: string;
}