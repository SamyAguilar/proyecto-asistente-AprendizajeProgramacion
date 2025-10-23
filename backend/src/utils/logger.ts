import winston from 'winston';
import path from 'path';

/**
 * Niveles de logging:
 * - error: 0
 * - warn: 1
 * - info: 2
 * - http: 3
 * - debug: 4
 */

// Determinar el nivel de log segun el entorno
const level = (): string => {
  const env = process.env.NODE_ENV || 'development';
  return env === 'development' ? 'debug' : 'info';
};

// Definir colores para cada nivel (solo para consola)
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Aplicar los colores a winston
winston.addColors(colors);

// Formato para logs en consola (con colores)
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `[${info.timestamp}] ${info.level}: ${info.message}`
  )
);

// Formato para logs en archivo (sin colores)
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Directorio de logs
const logsDir = path.join(process.cwd(), 'logs');

// Crear array de transports
const transports: winston.transport[] = [];

// 1. CONSOLA - Siempre activo en desarrollo
if (process.env.NODE_ENV !== 'production') {
  transports.push(
    new winston.transports.Console({
      format: consoleFormat,
    })
  );
}

// 2. ARCHIVO - Todos los logs (info, warn, error, debug)
transports.push(
  new winston.transports.File({
    filename: path.join(logsDir, 'combined.log'),
    format: fileFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  })
);

// 3. ARCHIVO - Solo errores
transports.push(
  new winston.transports.File({
    filename: path.join(logsDir, 'error.log'),
    level: 'error',
    format: fileFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  })
);

// 4. CONSOLA en producción (sin colores, formato JSON)
if (process.env.NODE_ENV === 'production') {
  transports.push(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
    })
  );
}

// Crear el logger
const logger = winston.createLogger({
  level: level(),
  levels: winston.config.npm.levels,
  format: fileFormat,
  transports,
  exitOnError: false,
});

/**
 * Stream para Morgan (logging HTTP)
 * Morgan enviará los logs a través de este stream
 */
export const morganStream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

/**
 * Funciones helper para logging
 */

// Log de error
export const logError = (message: string, error?: any, meta?: any) => {
  const errorInfo: any = {
    message,
    meta: meta || {},
  };

  if (error) {
    errorInfo.error = {
      message: error.message,
      stack: error.stack,
      name: error.name,
    };
  }

  logger.error(errorInfo);
};

// Log de warning
export const logWarn = (message: string, meta?: any) => {
  logger.warn(message, meta || {});
};

// Log de info
export const logInfo = (message: string, meta?: any) => {
  logger.info(message, meta || {});
};

// Log de debug
export const logDebug = (message: string, meta?: any) => {
  logger.debug(message, meta || {});
};

// Log HTTP (para requests)
export const logHttp = (message: string, meta?: any) => {
  logger.http(message, meta || {});
};

/**
 * Logger para eventos específicos de la aplicación
 */

// Login exitoso
export const logLoginSuccess = (userId: number, email: string, ip?: string) => {
  logger.info('Login exitoso', {
    event: 'LOGIN_SUCCESS',
    userId,
    email,
    ip,
    timestamp: new Date().toISOString(),
  });
};

// Login fallido
export const logLoginFailure = (email: string, ip?: string, reason?: string) => {
  logger.warn('Login fallido', {
    event: 'LOGIN_FAILURE',
    email,
    ip,
    reason,
    timestamp: new Date().toISOString(),
  });
};

// Registro de nuevo usuario
export const logUserRegistration = (userId: number, email: string, rol: string) => {
  logger.info('Nuevo usuario registrado', {
    event: 'USER_REGISTRATION',
    userId,
    email,
    rol,
    timestamp: new Date().toISOString(),
  });
};

// Acceso denegado
export const logAccessDenied = (userId?: number, resource?: string, reason?: string) => {
  logger.warn('Acceso denegado', {
    event: 'ACCESS_DENIED',
    userId,
    resource,
    reason,
    timestamp: new Date().toISOString(),
  });
};

// Llamada a API externa (ej: Gemini)
export const logExternalApiCall = (
  service: string,
  endpoint: string,
  statusCode?: number,
  duration?: number
) => {
  logger.info('Llamada a API externa', {
    event: 'EXTERNAL_API_CALL',
    service,
    endpoint,
    statusCode,
    duration,
    timestamp: new Date().toISOString(),
  });
};

// Rate limit excedido
export const logRateLimitExceeded = (ip: string, endpoint: string) => {
  logger.warn('Rate limit excedido', {
    event: 'RATE_LIMIT_EXCEEDED',
    ip,
    endpoint,
    timestamp: new Date().toISOString(),
  });
};

// Error de base de datos
export const logDatabaseError = (operation: string, error: any, query?: string) => {
  logger.error('Error de base de datos', {
    event: 'DATABASE_ERROR',
    operation,
    error: {
      message: error.message,
      code: error.code,
      stack: error.stack,
    },
    query,
    timestamp: new Date().toISOString(),
  });
};

// Inicio de aplicacion
export const logAppStart = (port: number, env: string) => {
  logger.info('Aplicacion iniciada', {
    event: 'APP_START',
    port,
    environment: env,
    nodeVersion: process.version,
    timestamp: new Date().toISOString(),
  });
};

// Cierre de aplicacion
export const logAppShutdown = (reason?: string) => {
  logger.info('Aplicacion detenida', {
    event: 'APP_SHUTDOWN',
    reason,
    timestamp: new Date().toISOString(),
  });
};

// Exportar el logger principal
export default logger;