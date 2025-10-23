import morgan from 'morgan';
import { morganStream } from '../utils/logger';

/**
 * Middleware para logging de peticiones HTTP
 * 
 * Por que: Registra todas las peticiones que llegan al servidor
 * Cuando se usa: Se aplica en app.ts para registrar TODOS los requests
 * 
 * Formato: metodo URL status tiempo
 * Ejemplo: POST /api/v1/auth/login 200 - 45ms
 */

// En desarrollo usa formato 'dev' (con colores)
// En produccion usa formato personalizado
const format = process.env.NODE_ENV === 'development' 
  ? 'dev' 
  : ':method :url :status :res[content-length] - :response-time ms';

export const httpLogger = morgan(format, {
  stream: morganStream,
  // Opcional: No registrar health checks
  skip: (req) => req.url === '/health',
});

export default httpLogger;