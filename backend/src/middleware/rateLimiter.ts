import rateLimit, { RateLimitRequestHandler } from 'express-rate-limit';
import { Request, Response } from 'express';

// Extender la interfaz Request para incluir rateLimit
declare module 'express-serve-static-core' {
  interface Request {
    rateLimit?: {
      limit: number;
      current: number;
      remaining: number;
      resetTime?: Date;
    };
  }
}

/**
 * Rate limiter general para toda la API
 * Límite: 100 requests por 15 minutos por IP
 */
export const generalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requests por ventana
  message: {
    error: 'Demasiadas solicitudes',
    message: 'Has excedido el límite de solicitudes. Por favor, intenta más tarde.',
    retryAfter: '15 minutos'
  },
  standardHeaders: true, // Incluir headers `RateLimit-*`
  legacyHeaders: false, // Deshabilitar headers `X-RateLimit-*`
  handler: (req: Request, res: Response) => {
    const resetTime = req.rateLimit?.resetTime;
    const retryAfter = resetTime ? Math.ceil(resetTime.getTime() / 1000) : 900; // 15 minutos por defecto
    
    res.status(429).json({
      error: 'TooManyRequests',
      message: 'Has excedido el límite de solicitudes. Por favor, intenta más tarde.',
      retryAfter
    });
  }
});

/**
 * Rate limiter estricto para autenticación
 * Límite: 5 intentos por 15 minutos por IP
 * Previene ataques de fuerza bruta en login
 */
export const authRateLimiter = rateLimit({
  //windowMs: 15 * 60 * 1000, // 15 minutos
  //windowMs: 15 * 60 * 0, // 15 minutos
   windowMs: 0 * 60 * 0, // 15 minutos
  max: 55, // 5 intentos por ventana
  message: {
    error: 'Demasiados intentos de inicio de sesión',
    message: 'Has excedido el límite de intentos de inicio de sesión. Por favor, intenta en 15 minutos.',
    retryAfter: '15 minutos'
  },
  skipSuccessfulRequests: true, // No contar requests exitosos
  handler: (req: Request, res: Response) => {
    console.warn(`🚨 Rate limit excedido para IP: ${req.ip} en ruta de autenticación`);
    const resetTime = req.rateLimit?.resetTime;
    const retryAfter = resetTime ? Math.ceil(resetTime.getTime() / 1000) : 900;
    
    res.status(429).json({
      error: 'TooManyAuthAttempts',
      message: 'Demasiados intentos de inicio de sesión. Por favor, intenta en 15 minutos.',
      retryAfter
    });
  }
});

/**
 * Rate limiter para registro de usuarios
 * Límite: 3 registros por hora por IP
 * Previene spam de cuentas
 */
export const registroRateLimiter = rateLimit({
  //windowMs: 60 * 60 * 1000, // 1 hora
   windowMs: (60 * 60 * 1000)*0, // 1 hora
  max: 90, // 3 registros por hora
  message: {
    error: 'Demasiados registros',
    message: 'Has excedido el límite de registros. Por favor, intenta en 1 hora.',
    retryAfter: '1 hora'
  },
  handler: (req: Request, res: Response) => {
    console.warn(`🚨 Rate limit excedido para IP: ${req.ip} en registro`);
    const resetTime = req.rateLimit?.resetTime;
    const retryAfter = resetTime ? Math.ceil(resetTime.getTime() / 1000) : 3600;
    
    res.status(429).json({
      error: 'TooManyRegistrations',
      message: 'Demasiados intentos de registro. Por favor, intenta en 1 hora.',
      retryAfter
    });
  }
});

/**
 * Rate limiter para endpoints de ejercicios
 * Límite: 20 envíos por 10 minutos por usuario autenticado
 * Previene spam de soluciones
 */
export const ejerciciosRateLimiter = rateLimit({
  windowMs: (10 * 60 * 1000)*0, // 10 minutos
  max: 20, // 20 envíos por ventana
  keyGenerator: (req: Request) => {
    // Usar ID de usuario si está autenticado, sino usar IP
    return (req as any).userId?.toString() || req.ip || 'unknown';
  },
  message: {
    error: 'Demasiados envíos de ejercicios',
    message: 'Has excedido el límite de envíos de ejercicios. Por favor, intenta más tarde.',
    retryAfter: '10 minutos'
  },
  handler: (req: Request, res: Response) => {
    const resetTime = req.rateLimit?.resetTime;
    const retryAfter = resetTime ? Math.ceil(resetTime.getTime() / 1000) : 600;
    
    res.status(429).json({
      error: 'TooManySubmissions',
      message: 'Demasiados envíos de ejercicios. Por favor, espera antes de intentar nuevamente.',
      retryAfter
    });
  }
});

/**
 * Rate limiter para endpoints de quiz
 * Límite: 30 respuestas por 10 minutos por usuario
 */
export const quizRateLimiter = rateLimit({
  windowMs: (10 * 60 * 1000)*0, // 10 minutos
  max: 30, // 30 respuestas por ventana
  keyGenerator: (req: Request) => {
    return (req as any).userId?.toString() || req.ip || 'unknown';
  },
  message: {
    error: 'Demasiadas respuestas de quiz',
    message: 'Has excedido el límite de respuestas. Por favor, intenta más tarde.',
    retryAfter: '10 minutos'
  }
});

/**
 * Rate limiter flexible configurable
 */
export const createCustomRateLimiter = (options: {
  windowMs: number;
  max: number;
  message: string;
  useUserId?: boolean;
}) => {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    keyGenerator: options.useUserId
      ? (req: Request) => (req as any).userId?.toString() || req.ip || 'unknown'
      : undefined,
    message: {
      error: 'RateLimitExceeded',
      message: options.message
    },
    standardHeaders: true,
    legacyHeaders: false
  });
};

/**
 * Rate limiter para integraciones con Gemini API
 * NO SE USA DIRECTAMENTE EN RUTAS EXPRESS
 * Se implementará en el servicio de Gemini
 */
export const geminiRateLimiterConfig = {
  requestsPerMinute: 15, // Free tier de Gemini
  requestsPerDay: 1500, // Free tier de Gemini
  tokensPerMinute: 1000000 // Free tier de Gemini
};