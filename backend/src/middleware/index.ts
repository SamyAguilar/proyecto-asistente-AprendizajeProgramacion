// Exportar middleware de autenticación
export { authMiddleware, optionalAuthMiddleware } from './authMiddleware';

// Exportar middleware de roles
export {
  roleMiddleware,
  soloEstudiantes,
  soloProfesores,
  soloAdmin,
  profesorOAdmin,
  usuarioAutenticado,
  soloPropioDatosOAdmin
} from './roleMiddleware';

// Exportar middleware de manejo de errores
export {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  AppError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  BadRequestError,
  ConflictError
} from './errorHandler';

// Exportar middleware de rate limiting
export {
  generalRateLimiter,
  authRateLimiter,
  registroRateLimiter,
  ejerciciosRateLimiter,
  quizRateLimiter,
  createCustomRateLimiter,
  geminiRateLimiterConfig
} from './rateLimiter';

// Exportar middleware de validación
export {
  validator,
  validateIdParam,
  validatePagination,
  sanitizeStrings,
  LoginDto,
  RegistroDto,
  ActualizarPerfilDto
} from './validator';