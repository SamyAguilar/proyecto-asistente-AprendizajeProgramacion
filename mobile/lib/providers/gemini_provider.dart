// lib/providers/gemini_provider.dart
// [LUZIA] Provider para manejar la comunicacion con Gemini AI

import 'package:flutter/material.dart';
import '../models/mensaje_chat_model.dart';
import '../models/retroalimentacion_model.dart';
import '../services/http_service.dart';
import '../config/constants.dart';

class GeminiProvider extends ChangeNotifier {
  final HttpService _httpService = HttpService();

  // ============================================
  // ESTADOS
  // ============================================

  bool _isLoading = false;
  String? _error;
  String? _respuestaActual;
  List<MensajeChatModel> _historialChat = [];
  List<RetroalimentacionModel> _retroalimentaciones = [];
  ExplicacionCodigoModel? _ultimaExplicacion;
  AnalisisCodigoModel? _ultimoAnalisis;

  // ============================================
  // GETTERS
  // ============================================

  bool get isLoading => _isLoading;
  String? get error => _error;
  String? get respuestaActual => _respuestaActual;
  List<MensajeChatModel> get historialChat => _historialChat;
  List<RetroalimentacionModel> get retroalimentaciones => _retroalimentaciones;
  ExplicacionCodigoModel? get ultimaExplicacion => _ultimaExplicacion;
  AnalisisCodigoModel? get ultimoAnalisis => _ultimoAnalisis;
  bool get tieneError => _error != null;

  // ============================================
  // CHAT CON LUZIA
  // ============================================

  /// Enviar mensaje al chat con LUZIA
  /// Endpoint: POST /gemini/chat
  Future<MensajeChatModel?> enviarMensajeChat(
      String mensaje, {
        Map<String, dynamic>? contexto,
      }) async {
    _setLoading(true);
    _clearError();

    try {
      // Agregar mensaje del usuario al historial
      final mensajeUsuario = MensajeChatModel.usuario(mensaje);
      _historialChat.add(mensajeUsuario);
      notifyListeners();

      // Preparar historial para enviar (ultimos 10 mensajes)
      final historialParaEnviar = _historialChat
          .take(10)
          .map((m) => {
        'role': m.esUsuario ? 'user' : 'assistant',
        'content': m.contenido,
      })
          .toList();

      final response = await _httpService.post(
        '/gemini/chat',
        data: {
          'mensaje': mensaje,
          if (contexto != null) 'contexto': contexto,
          'historial': historialParaEnviar,
        },
      );

      if (response.statusCode == 200) {
        final data = response.data;

        // Extraer respuesta y sugerencias
        String respuestaTexto = '';
        List<String>? sugerencias;

        if (data['data'] != null) {
          respuestaTexto = data['data']['respuesta'] as String? ?? '';
          sugerencias = (data['data']['sugerencias'] as List<dynamic>?)
              ?.map((s) => s as String)
              .toList();
        } else {
          respuestaTexto = data['respuesta'] as String? ??
              data['mensaje'] as String? ??
              '';
        }

        // Crear mensaje del asistente
        final mensajeAsistente = MensajeChatModel.asistente(
          respuestaTexto,
          sugerencias: sugerencias,
        );

        _historialChat.add(mensajeAsistente);
        _respuestaActual = respuestaTexto;

        _setLoading(false);
        return mensajeAsistente;
      }

      _setError('Error al obtener respuesta de LUZIA');
      _setLoading(false);
      return null;
    } on HttpException catch (e) {
      _setError(e.mensaje);
      _setLoading(false);
      return null;
    } catch (e) {
      _setError('Error de conexion. Intenta de nuevo.');
      _setLoading(false);
      return null;
    }
  }

  /// Limpiar historial del chat
  void limpiarChat() {
    _historialChat.clear();
    _respuestaActual = null;
    notifyListeners();
  }

  // ============================================
  // EXPLICAR CONCEPTO
  // ============================================

  /// Solicitar explicacion de un concepto
  /// Endpoint: POST /gemini/explicar-concepto
  Future<String?> explicarConcepto(
      String concepto, {
        String? tema,
        String? subtema,
      }) async {
    _setLoading(true);
    _clearError();

    try {
      final response = await _httpService.post(
        '/gemini/explicar-concepto',
        data: {
          'concepto': concepto,
          // Siempre enviar un tema por defecto si no se especifica
          'tema': tema ?? 'Programacion',
          if (subtema != null) 'subtema': subtema,
        },
      );

      if (response.statusCode == 200) {
        final data = response.data;
        String explicacion = '';

        if (data['data'] != null) {
          explicacion = data['data']['explicacion'] as String? ?? '';
        } else {
          explicacion = data['explicacion'] as String? ??
              data['respuesta'] as String? ??
              '';
        }

        // Si la explicacion esta vacia, mostrar mensaje
        if (explicacion.isEmpty) {
          _setError('No se pudo obtener la explicacion. Intenta de nuevo.');
          _setLoading(false);
          return null;
        }

        _respuestaActual = explicacion;
        _setLoading(false);
        return explicacion;
      }

      _setError('Error al obtener explicacion');
      _setLoading(false);
      return null;
    } on HttpException catch (e) {
      _setError(e.mensaje);
      _setLoading(false);
      return null;
    } catch (e) {
      _setError('Error de conexion. Intenta de nuevo.');
      _setLoading(false);
      return null;
    }
  }

  // ============================================
  // GENERAR EXPLICACION DE CODIGO
  // ============================================

  /// Generar explicacion linea por linea de codigo
  /// Endpoint: POST /gemini/generar-explicacion
  Future<ExplicacionCodigoModel?> generarExplicacionCodigo(
      String codigo, {
        String lenguaje = 'javascript',
      }) async {
    _setLoading(true);
    _clearError();

    try {
      final response = await _httpService.post(
        '/gemini/generar-explicacion',
        data: {
          'codigo': codigo,
          'lenguaje': lenguaje,
        },
      );

      if (response.statusCode == 200) {
        final data = response.data;

        Map<String, dynamic> explicacionData;
        if (data['data'] != null) {
          explicacionData = data['data'] as Map<String, dynamic>;
        } else {
          explicacionData = data as Map<String, dynamic>;
        }

        final explicacion = ExplicacionCodigoModel.fromJson(explicacionData);
        _ultimaExplicacion = explicacion;

        _setLoading(false);
        return explicacion;
      }

      _setError('Error al generar explicacion de codigo');
      _setLoading(false);
      return null;
    } on HttpException catch (e) {
      _setError(e.mensaje);
      _setLoading(false);
      return null;
    } catch (e) {
      _setError('Error de conexion. Intenta de nuevo.');
      _setLoading(false);
      return null;
    }
  }

  // ============================================
  // ANALIZAR / VALIDAR CODIGO
  // ============================================

  /// Analizar codigo con Gemini
  /// Endpoint: POST /gemini/validate-code
  Future<AnalisisCodigoModel?> analizarCodigo(
      String codigo, {
        String? lenguaje,
        String? enunciado,
        String? errorMensaje,
      }) async {
    _setLoading(true);
    _clearError();

    try {
      final response = await _httpService.post(
        '/gemini/validate-code',
        data: {
          'codigo': codigo,
          if (lenguaje != null) 'lenguaje': lenguaje,
          if (enunciado != null) 'enunciado': enunciado,
          if (errorMensaje != null) 'errorMensaje': errorMensaje,
          'tipoAnalisis': 'ayuda', // Para indicar que es ayuda, no evaluacion
        },
      );

      if (response.statusCode == 200) {
        final data = response.data;

        Map<String, dynamic> analisisData;
        if (data['data'] != null) {
          analisisData = data['data'] as Map<String, dynamic>;
        } else {
          analisisData = data as Map<String, dynamic>;
        }

        final analisis = AnalisisCodigoModel.fromJson(analisisData);
        _ultimoAnalisis = analisis;
        _respuestaActual = analisis.retroalimentacion;

        _setLoading(false);
        return analisis;
      }

      _setError('Error al analizar codigo');
      _setLoading(false);
      return null;
    } on HttpException catch (e) {
      _setError(e.mensaje);
      _setLoading(false);
      return null;
    } catch (e) {
      _setError('Error de conexion. Intenta de nuevo.');
      _setLoading(false);
      return null;
    }
  }

  // ============================================
  // RETROALIMENTACIONES
  // ============================================

  /// Obtener retroalimentaciones del usuario
  /// Endpoint: GET /retroalimentacion/:usuarioId
  Future<List<RetroalimentacionModel>> obtenerRetroalimentaciones(
      int usuarioId,
      ) async {
    _setLoading(true);
    _clearError();

    try {
      final response = await _httpService.get(
        '/retroalimentacion/$usuarioId',
      );

      if (response.statusCode == 200) {
        final data = response.data;
        List<dynamic> retroalimentacionesData;

        if (data['data'] != null) {
          retroalimentacionesData = data['data'] as List<dynamic>;
        } else if (data is List) {
          retroalimentacionesData = data;
        } else {
          retroalimentacionesData = [];
        }

        _retroalimentaciones = retroalimentacionesData
            .map((r) => RetroalimentacionModel.fromJson(r as Map<String, dynamic>))
            .toList();

        // Ordenar por fecha descendente
        _retroalimentaciones.sort((a, b) => b.timestamp.compareTo(a.timestamp));

        _setLoading(false);
        return _retroalimentaciones;
      }

      _setError('Error al obtener retroalimentaciones');
      _setLoading(false);
      return [];
    } on HttpException catch (e) {
      _setError(e.mensaje);
      _setLoading(false);
      return [];
    } catch (e) {
      _setError('Error de conexion. Intenta de nuevo.');
      _setLoading(false);
      return [];
    }
  }

  /// Generar retroalimentacion personalizada
  /// Endpoint: POST /retroalimentacion/generar
  Future<String?> generarRetroalimentacion({
    String? tipo,
    required Map<String, dynamic> contexto,
  }) async {
    _setLoading(true);
    _clearError();

    try {
      final response = await _httpService.post(
        '/retroalimentacion/generar',
        data: {
          if (tipo != null) 'tipo': tipo,
          'contexto': contexto,
        },
      );

      if (response.statusCode == 200) {
        final data = response.data;
        String retroalimentacion = '';

        if (data['data'] != null) {
          retroalimentacion = data['data']['retroalimentacion'] as String? ?? '';
        } else {
          retroalimentacion = data['retroalimentacion'] as String? ??
              data['respuesta'] as String? ??
              '';
        }

        _respuestaActual = retroalimentacion;
        _setLoading(false);
        return retroalimentacion;
      }

      _setError('Error al generar retroalimentacion');
      _setLoading(false);
      return null;
    } on HttpException catch (e) {
      _setError(e.mensaje);
      _setLoading(false);
      return null;
    } catch (e) {
      _setError('Error de conexion. Intenta de nuevo.');
      _setLoading(false);
      return null;
    }
  }

  // ============================================
  // HELPERS PRIVADOS
  // ============================================

  void _setLoading(bool value) {
    _isLoading = value;
    notifyListeners();
  }

  void _setError(String message) {
    _error = message;
    notifyListeners();
  }

  void _clearError() {
    _error = null;
  }

  /// Limpiar respuesta actual
  void limpiarRespuesta() {
    _respuestaActual = null;
    _ultimaExplicacion = null;
    _ultimoAnalisis = null;
    notifyListeners();
  }

  /// Limpiar todo el estado
  void limpiarTodo() {
    _isLoading = false;
    _error = null;
    _respuestaActual = null;
    _historialChat.clear();
    _retroalimentaciones.clear();
    _ultimaExplicacion = null;
    _ultimoAnalisis = null;
    notifyListeners();
  }
}