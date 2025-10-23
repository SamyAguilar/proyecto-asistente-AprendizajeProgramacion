// src/app.ts
import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { AppDataSource } from './config/database';
import { generalRateLimiter } from './middleware/rateLimiter';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { httpLogger } from './middleware/httpLogger';
import { logAppStart, logAppShutdown } from './utils/logger';
// Importar rutas
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
const app = express();
const PORT = process.env.PORT || 3000;
// ============================================
// MIDDLEWARES GLOBALES
// ============================================
// Seguridad
app.use(helmet());
// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
// Parser de JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Logging de peticiones HTTP
app.use(httpLogger);
// Rate limiting general
app.use(generalRateLimiter);
// ============================================
// RUTAS
// ============================================
// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});
// Rutas de autenticacion
app.use('/api/v1/auth', authRoutes);
// Rutas de usuarios (requieren autenticacion)
app.use('/api/v1/usuarios', userRoutes);
// TODO: Agregar mas rutas aqui cuando se implementen
// app.use('/api/v1/materias', materiasRoutes);
// app.use('/api/v1/temas', temasRoutes);
// app.use('/api/v1/ejercicios', ejerciciosRoutes);
// app.use('/api/v1/quiz', quizRoutes);
// app.use('/api/v1/reportes', reportesRoutes);
// app.use('/api/v1/gemini', geminiRoutes);
// ============================================
// MANEJO DE ERRORES
// ============================================
// 404 - Ruta no encontrada
app.use(notFoundHandler);
// Error handler global
app.use(errorHandler);
// ============================================
// INICIAR SERVIDOR
// ============================================
async function iniciarServidor() {
  try {
    // 1. Conectar a la base de datos
    await AppDataSource.initialize();
    console.log(' Conexion a base de datos establecida');
    // 2. Iniciar servidor
    app.listen(PORT, () => {
      console.log(`\n Servidor corriendo en puerto ${PORT}`);
      console.log(` Entorno: ${process.env.NODE_ENV || 'development'}`);
      console.log(` Health check: http://localhost:${PORT}/health`);
      console.log('\n Endpoints disponibles:');
      console.log('   POST   /api/v1/auth/registro');
      console.log('   POST   /api/v1/auth/login');
      console.log('   POST   /api/v1/auth/refresh-token');
      console.log('   POST   /api/v1/auth/logout');
      console.log('   GET    /api/v1/usuarios/perfil        (requiere auth)');
      console.log('   PUT    /api/v1/usuarios/perfil        (requiere auth)');
      console.log('   GET    /api/v1/usuarios/progreso      (requiere auth)');
      console.log('\n Servidor listo para recibir peticiones\n');
           logAppStart(Number(PORT), process.env.NODE_ENV || 'development');
    });
  } catch (error) {
    console.error(' Error al iniciar servidor:', error);
    process.exit(1);
  }
}
// Manejo de cierre graceful
process.on('SIGTERM', async () => {
  console.log('\n  SIGTERM recibido, cerrando servidor...');
  logAppShutdown('SIGTERM');
  await AppDataSource.destroy();
  process.exit(0);
});
process.on('SIGINT', async () => {
  console.log('\n  SIGINT recibido, cerrando servidor...');
  logAppShutdown('SIGINT');
  await AppDataSource.destroy();
  process.exit(0);
});
// Iniciar
iniciarServidor();
export default app;