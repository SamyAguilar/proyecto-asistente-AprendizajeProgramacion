// lib/config/constants.dart

class AppConstants {
  // ============================================
  // URLs DEL BACKEND
  // ============================================

  // Para desarrollo local con emulador Android
  static const String baseUrl = 'http://10.0.2.2:3000';
  //'http://172.16.30.42:3000';

  // Para desarrollo local con iOS simulator, usa:
  // static const String baseUrl = 'http://localhost:3000';

  // Para produccion (Render), cambia a:
  // static const String baseUrl = 'https://tu-app.onrender.com';

  static const String apiVersion = '/api/v1';

  static String get apiUrl => '$baseUrl$apiVersion';

  // ============================================
  // ENDPOINTS DE AUTENTICACION
  // ============================================

  static String get registerUrl => '$apiUrl/auth/registro';
  static String get loginUrl => '$apiUrl/auth/login';
  static String get logoutUrl => '$apiUrl/auth/logout';
  static String get refreshTokenUrl => '$apiUrl/auth/refresh-token';

  // ============================================
  // ENDPOINTS DE USUARIO
  // ============================================

  static String get profileUrl => '$apiUrl/usuarios/perfil';
  static String get progresoUrl => '$apiUrl/usuarios/progreso';

  // ============================================
  // ENDPOINTS DE MATERIAS
  // ============================================

  static String get materiasUrl => '$apiUrl/materias';
  static String get misMateriasUrl => '$apiUrl/materias/mis-materias';

  static String materiaDetailUrl(int id) => '$apiUrl/materias/$id';
  static String matricularUrl(int id) => '$apiUrl/materias/$id/matricular';
  static String buscarMateriasUrl(String query) => '$apiUrl/materias/buscar?q=$query';

  // ============================================
  // ENDPOINTS DE TEMAS Y SUBTEMAS
  // ============================================

  static String temasByMateriaUrl(int materiaId) => '$apiUrl/materias/$materiaId/temas';
  static String temasConProgresoUrl(int materiaId) => '$apiUrl/materias/$materiaId/temas-con-progreso';
  static String temaDetailUrl(int id) => '$apiUrl/temas/$id';
  static String subtemasByTemaUrl(int temaId) => '$apiUrl/temas/$temaId/subtemas';
  static String subtemaDetailUrl(int id) => '$apiUrl/subtemas/$id';

  // ============================================
  // ENDPOINTS DE EJERCICIOS
  // ============================================

  static String ejerciciosBySubtemaUrl(int subtemaId) => '$apiUrl/ejercicios/subtema/$subtemaId';
  static String ejercicioDetailUrl(int id) => '$apiUrl/ejercicios/$id';
  static String enviarEjercicioUrl(int id) => '$apiUrl/ejercicios/$id/enviar';
  static String intentosEjercicioUrl(int id) => '$apiUrl/ejercicios/$id/intentos';

  // ============================================
  // ENDPOINTS DE QUIZZES
  // ============================================

  static String quizPreguntasUrl(int subtemaId, {int cantidad = 5}) {
    return '$apiUrl/quiz/subtema/$subtemaId/preguntas?cantidad=$cantidad';
  }
  static String get responderQuizUrl => '$apiUrl/quiz/responder';
  static String quizResultadosUrl(int usuarioId) => '$apiUrl/quiz/resultados/$usuarioId';

  // ============================================
  // ENDPOINTS DE GEMINI/IA
  // ============================================

  static String get procesarCodigoUrl => '$apiUrl/gemini/procesar-codigo';
  static String get generarExplicacionUrl => '$apiUrl/gemini/generar-explicacion';
  static String retroalimentacionUrl(int usuarioId) => '$apiUrl/retroalimentacion/$usuarioId';
  static String get generarRetroalimentacionUrl => '$apiUrl/retroalimentacion/generar';

  // ============================================
  // ENDPOINTS DE PROGRESO
  // ============================================

  static String get miProgresoUrl => '$apiUrl/progreso/mi-progreso';
  static String progresoMateriaUrl(int materiaId) => '$apiUrl/progreso/materia/$materiaId';
  static String progresoTemaUrl(int temaId) => '$apiUrl/progreso/tema/$temaId';

  // ============================================
  // CLAVES DE STORAGE
  // ============================================

  static const String keyAccessToken = 'access_token';
  static const String keyRefreshToken = 'refresh_token';
  static const String keyUserId = 'user_id';
  static const String keyUserEmail = 'user_email';

  // ============================================
  // CONFIGURACION DE TIMEOUTS
  // ============================================

  static const int connectionTimeout = 30;
  static const int receiveTimeout = 30;
  static const int sendTimeout = 30;

  // ============================================
  // MENSAJES DE ERROR
  // ============================================

  static const String errorGenerico = 'Ocurrio un error. Por favor, intenta de nuevo.';
  static const String errorConexion = 'Error de conexion. Verifica tu internet.';
  static const String errorAutenticacion = 'Sesion expirada. Por favor, inicia sesion nuevamente.';
  static const String errorServidor = 'Error del servidor. Intenta mas tarde.';

  // ============================================
  // VALIDACIONES
  // ============================================

  static const int minPasswordLength = 6;

  static final RegExp emailRegex = RegExp(
    r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$',
  );
}