// backend/src/app.ts
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
import { createGeminiRoutes } from './routes/gemini.routes';
import { createRetroalimentacionRoutes } from './routes/retroalimentacion.routes';

// RUTAS DE TONO (Francisco)
import materiaRoutes from './routes/materia.routes';
import temaRoutes from './routes/tema.routes';
import progresoRoutes from './routes/progreso.routes';
import reporteRoutes from './routes/reporte.routes';

// RUTAS DE PANCHO (Francisco)
import ejercicioRoutes from './routes/ejercicio.routes';
import quizRoutes from './routes/quiz.routes';

// RUTAS DE ADMINISTRACIÓN
import materiaAdminRoutes from './routes/materia-admin.routes';
import temaAdminRoutes from './routes/tema-admin.routes';
import subtemaAdminRoutes from './routes/subtema-admin.routes';
import ejercicioAdminRoutes from './routes/ejercicio-admin.routes';

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// MIDDLEWARES GLOBALES
// ============================================

// Seguridad
app.use(helmet());

// CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
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

// Rutas de autenticacion (Sam)
app.use('/api/v1/auth', authRoutes);

// Rutas de usuarios (Sam)
app.use('/api/v1/usuarios', userRoutes);

// Rutas de Gemini AI (Lulu)
app.use('/api/v1/gemini', createGeminiRoutes());

// Rutas de Retroalimentacion (Lulu)
app.use('/api/v1/retroalimentacion', createRetroalimentacionRoutes());

// ============================================
// RUTAS DE TONO (Francisco)
// ============================================

// Rutas de Materias
app.use('/api/v1/materias', materiaRoutes);

// Rutas de Temas y Subtemas
app.use('/api/v1', temaRoutes);

// Rutas de Progreso
app.use('/api/v1/progreso', progresoRoutes);

// Rutas de Reportes
app.use('/api/v1/reportes', reporteRoutes);

// ============================================
// RUTAS DE PANCHO (Francisco)
// ============================================

// Rutas de Ejercicios
app.use('/api/v1/ejercicios', ejercicioRoutes);

// Rutas de Quizzes
app.use('/api/v1/quiz', quizRoutes);

// ============================================
// RUTAS DE ADMINISTRACIÓN
// ============================================

// Rutas de administración de Materias (requiere auth + rol admin/profesor)
app.use('/api/v1/admin/materias', materiaAdminRoutes);

// Rutas de administración de Temas (requiere auth + rol admin/profesor)
app.use('/api/v1/admin/temas', temaAdminRoutes);

// Rutas de administración de Subtemas (requiere auth + rol admin/profesor)
app.use('/api/v1/admin/subtemas', subtemaAdminRoutes);

// Rutas de administración de Ejercicios (requiere auth + rol admin/profesor)
app.use('/api/v1/admin/ejercicios', ejercicioAdminRoutes);

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
    console.log('✓ Conexion a base de datos establecida');

    // 2. Iniciar servidor
    app.listen(PORT, () => {
      console.log(`\n✓ Servidor corriendo en puerto ${PORT}`);
      console.log(`✓ Entorno: ${process.env.NODE_ENV || 'development'}`);
      console.log(`✓ Health check: http://localhost:${PORT}/health`);
      console.log('\n📋 Endpoints disponibles:');
      console.log('   POST   /api/v1/auth/registro');
      console.log('   POST   /api/v1/auth/login');
      console.log('   POST   /api/v1/auth/refresh-token');
      console.log('   POST   /api/v1/auth/logout');
      console.log('   GET    /api/v1/usuarios/perfil        (requiere auth)');
      console.log('   PUT    /api/v1/usuarios/perfil        (requiere auth)');
      console.log('   GET    /api/v1/usuarios/progreso      (requiere auth)');
      
      console.log('\n🤖 Endpoints de IA (Gemini - Lulu):');
      console.log('   POST   /api/v1/gemini/validate-code      (auth + 15 RPM)');
      console.log('   POST   /api/v1/gemini/generate-questions (auth + 15 RPM)');
      console.log('   POST   /api/v1/gemini/chat               (auth + 15 RPM)');
      console.log('   POST   /api/v1/gemini/explicar-concepto  (auth + 15 RPM)');
      console.log('   POST   /api/v1/gemini/generar-explicacion (auth + 15 RPM)');
      console.log('   GET    /api/v1/gemini/stats              (monitoreo)');
      
      console.log('\n📝 Endpoints de Retroalimentacion (Lulu):');
      console.log('   GET    /api/v1/retroalimentacion/:usuario_id (auth)');
      console.log('   POST   /api/v1/retroalimentacion/generar     (auth + 15 RPM)');
      
      console.log('\n📚 Endpoints de Contenido (Tono):');
      console.log('   GET    /api/v1/materias                  (listar todas)');
      console.log('   GET    /api/v1/materias/buscar?q=texto   (buscar)');
      console.log('   GET    /api/v1/materias/mis-materias     (auth)');
      console.log('   GET    /api/v1/materias/:id              (detalle)');
      console.log('   POST   /api/v1/materias/:id/matricular   (auth)');
      console.log('   GET    /api/v1/temas/:id                 (detalle tema)');
      console.log('   GET    /api/v1/temas/:temaId/subtemas    (listar subtemas)');
      console.log('   GET    /api/v1/subtemas/:id              (detalle subtema)');
      console.log('   GET    /api/v1/materias/:materiaId/temas (listar temas)');
      console.log('   GET    /api/v1/materias/:materiaId/temas-con-progreso (auth)');
      
      console.log('\n📈 Endpoints de Progreso (Tono):');
      console.log('   GET    /api/v1/progreso/mi-progreso      (auth)');
      console.log('   GET    /api/v1/progreso/tema/:temaId     (auth)');
      console.log('   GET    /api/v1/progreso/materia/:materiaId (auth)');
      console.log('   PUT    /api/v1/progreso/actualizar       (auth) ← PANCHO USA ESTE');
      
      console.log('\n📊 Endpoints de Reportes (Tono):');
      console.log('   GET    /api/v1/reportes/rendimiento      (auth)');
      console.log('   GET    /api/v1/reportes/por-materia/:id  (auth)');
      console.log('   GET    /api/v1/reportes/actividad        (auth)');
      console.log('   GET    /api/v1/reportes/comparativo      (auth)');
      
      console.log('\n📝 Endpoints de Ejercicios (Pancho):');
      console.log('   GET    /api/v1/ejercicios/subtema/:id    (auth)');
      console.log('   GET    /api/v1/ejercicios/:id            (auth)');
      console.log('   POST   /api/v1/ejercicios/:id/enviar     (auth) ← USA LULU + TONO');
      console.log('   GET    /api/v1/ejercicios/:id/intentos   (auth)');
      
      console.log('\n❓ Endpoints de Quizzes (Pancho):');
      console.log('   GET    /api/v1/quiz/subtema/:id/preguntas     (auth) ← USA LULU');
      console.log('   POST   /api/v1/quiz/responder                  (auth) ← USA TONO');
      console.log('   GET    /api/v1/quiz/resultados/:usuario_id    (auth)');
      console.log('   POST   /api/v1/quiz/generar-preguntas         (auth) ← USA LULU');
      
      console.log('\n🔧 Endpoints de ADMINISTRACIÓN (Admin/Profesor):');
      console.log('   POST   /api/v1/admin/materias             (auth + admin/profesor)');
      console.log('   PUT    /api/v1/admin/materias/:id         (auth + admin/profesor)');
      console.log('   DELETE /api/v1/admin/materias/:id         (auth + admin)');
      console.log('   POST   /api/v1/admin/temas                (auth + admin/profesor)');
      console.log('   PUT    /api/v1/admin/temas/:id            (auth + admin/profesor)');
      console.log('   DELETE /api/v1/admin/temas/:id            (auth + admin)');
      console.log('   POST   /api/v1/admin/subtemas             (auth + admin/profesor)');
      console.log('   PUT    /api/v1/admin/subtemas/:id         (auth + admin/profesor)');
      console.log('   DELETE /api/v1/admin/subtemas/:id         (auth + admin)');
      console.log('   POST   /api/v1/admin/ejercicios           (auth + admin/profesor)');
      console.log('   PUT    /api/v1/admin/ejercicios/:id       (auth + admin/profesor)');
      console.log('   DELETE /api/v1/admin/ejercicios/:id       (auth + admin)');
      
      console.log('\n✅ Servidor listo para recibir peticiones\n');
      
      logAppStart(Number(PORT), process.env.NODE_ENV || 'development');
    });
  } catch (error) {
    console.error('❌ Error al iniciar servidor:', error);
    process.exit(1);
  }
}

// Manejo de cierre graceful
process.on('SIGTERM', async () => {
  console.log('\n🛑 SIGTERM recibido, cerrando servidor...');
  logAppShutdown('SIGTERM');
  await AppDataSource.destroy();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\n🛑 SIGINT recibido, cerrando servidor...');
  logAppShutdown('SIGINT');
  await AppDataSource.destroy();
  process.exit(0);
});

// Iniciar
iniciarServidor();

export default app;