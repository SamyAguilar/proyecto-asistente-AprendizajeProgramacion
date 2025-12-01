// lib/providers/quiz_provider.dart

import 'package:flutter/material.dart';
import '../models/pregunta_quiz_model.dart';
import '../models/intento_quiz_model.dart';
import '../services/http_service.dart';
import '../config/constants.dart';

class QuizProvider extends ChangeNotifier {
  final HttpService _httpService = HttpService();

  // Estado de preguntas
  List<PreguntaQuizModel> _preguntas = [];
  int _preguntaActualIndex = 0;
  Map<int, int> _respuestasSeleccionadas = {}; // preguntaId → opcionId
  
  // Estado de resultados
  List<IntentoQuizModel> _resultados = [];
  ResultadosQuizModel? _resultadosFinales;
  
  // Estado general
  bool _isLoading = false;
  bool _isSubmitting = false;
  String? _error;
  bool _quizFinalizado = false;

  // ============================================
  // GETTERS
  // ============================================

  List<PreguntaQuizModel> get preguntas => _preguntas;
  int get preguntaActualIndex => _preguntaActualIndex;
  Map<int, int> get respuestasSeleccionadas => _respuestasSeleccionadas;
  List<IntentoQuizModel> get resultados => _resultados;
  ResultadosQuizModel? get resultadosFinales => _resultadosFinales;
  bool get isLoading => _isLoading;
  bool get isSubmitting => _isSubmitting;
  String? get error => _error;
  bool get quizFinalizado => _quizFinalizado;

  // Getters de navegación
  PreguntaQuizModel? get preguntaActual {
    if (_preguntas.isEmpty || _preguntaActualIndex >= _preguntas.length) {
      return null;
    }
    return _preguntas[_preguntaActualIndex];
  }

  bool get hayPreguntaSiguiente => _preguntaActualIndex < _preguntas.length - 1;
  bool get hayPreguntaAnterior => _preguntaActualIndex > 0;
  bool get esUltimaPregunta => _preguntaActualIndex == _preguntas.length - 1;

  int get totalPreguntas => _preguntas.length;
  int get preguntasRespondidas => _respuestasSeleccionadas.length;
  
  String get progresoTexto => '${_preguntaActualIndex + 1}/$totalPreguntas';
  double get progresoPorcentaje => totalPreguntas > 0 
      ? (_preguntaActualIndex + 1) / totalPreguntas 
      : 0;

  // Verificar si la pregunta actual ya fue respondida
  bool get preguntaActualRespondida {
    if (preguntaActual == null) return false;
    return _respuestasSeleccionadas.containsKey(preguntaActual!.id);
  }

  // Obtener la opción seleccionada para la pregunta actual
  int? get opcionSeleccionadaActual {
    if (preguntaActual == null) return null;
    return _respuestasSeleccionadas[preguntaActual!.id];
  }

  // ============================================
  // OBTENER PREGUNTAS DEL QUIZ
  // ============================================

  Future<void> obtenerPreguntasQuiz(int subtemaId, {int cantidad = 5}) async {
    _setLoading(true);
    _clearError();
    _resetQuiz();

    try {
      final response = await _httpService.get(
        AppConstants.quizPreguntasUrl(subtemaId, cantidad: cantidad),
      );

      if (response.statusCode == 200) {
        final data = response.data;
        
        List<dynamic> preguntasData;
        if (data is List) {
          preguntasData = data;
        } else if (data['data'] != null) {
          preguntasData = data['data'] as List;
        } else if (data['preguntas'] != null) {
          preguntasData = data['preguntas'] as List;
        } else {
          preguntasData = [];
        }

        _preguntas = preguntasData
            .map((p) => PreguntaQuizModel.fromJson(p))
            .toList();
        
        notifyListeners();
      }
    } on HttpException catch (e) {
      _setError(e.message);
    } catch (e) {
      _setError('Error al cargar preguntas: ${e.toString()}');
    }

    _setLoading(false);
  }

  // ============================================
  // SELECCIONAR RESPUESTA
  // ============================================

  void seleccionarRespuesta(int preguntaId, int opcionId) {
    _respuestasSeleccionadas[preguntaId] = opcionId;
    notifyListeners();
  }

  // Deseleccionar respuesta
  void deseleccionarRespuesta(int preguntaId) {
    _respuestasSeleccionadas.remove(preguntaId);
    notifyListeners();
  }

  // ============================================
  // NAVEGACIÓN ENTRE PREGUNTAS
  // ============================================

  void siguientePregunta() {
    if (hayPreguntaSiguiente) {
      _preguntaActualIndex++;
      notifyListeners();
    }
  }

  void anteriorPregunta() {
    if (hayPreguntaAnterior) {
      _preguntaActualIndex--;
      notifyListeners();
    }
  }

  void irAPregunta(int index) {
    if (index >= 0 && index < _preguntas.length) {
      _preguntaActualIndex = index;
      notifyListeners();
    }
  }

  // ============================================
  // RESPONDER PREGUNTA (Enviar al backend)
  // ============================================

  Future<IntentoQuizModel?> responderPregunta(int preguntaId, int opcionId) async {
    _isSubmitting = true;
    notifyListeners();

    try {
      final response = await _httpService.post(
        AppConstants.responderQuizUrl,
        data: {
          'preguntaId': preguntaId,
          'opcionSeleccionadaId': opcionId,
        },
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = response.data;
        
        IntentoQuizModel intento;
        if (data['data'] != null) {
          intento = IntentoQuizModel.fromJson(data['data']);
        } else {
          intento = IntentoQuizModel.fromJson(data);
        }
        
        // Guardar el resultado
        _resultados.add(intento);
        
        _isSubmitting = false;
        notifyListeners();
        return intento;
      }
    } on HttpException catch (e) {
      _setError(e.message);
    } catch (e) {
      _setError('Error al enviar respuesta: ${e.toString()}');
    }

    _isSubmitting = false;
    notifyListeners();
    return null;
  }

  // ============================================
  // FINALIZAR QUIZ (Enviar todas las respuestas)
  // ============================================

  Future<void> finalizarQuiz() async {
    _isSubmitting = true;
    _clearError();
    notifyListeners();

    try {
      // Enviar cada respuesta pendiente
      for (var entry in _respuestasSeleccionadas.entries) {
        final preguntaId = entry.key;
        final opcionId = entry.value;
        
        // Verificar si ya se envió esta respuesta
        final yaEnviada = _resultados.any((r) => r.preguntaId == preguntaId);
        if (!yaEnviada) {
          await responderPregunta(preguntaId, opcionId);
        }
      }

      // Calcular resultados finales
      _resultadosFinales = ResultadosQuizModel.fromIntentos(_resultados);
      _quizFinalizado = true;
      
    } catch (e) {
      _setError('Error al finalizar quiz: ${e.toString()}');
    }

    _isSubmitting = false;
    notifyListeners();
  }

  // ============================================
  // OBTENER RESULTADOS DEL USUARIO
  // ============================================

  Future<void> obtenerResultadosUsuario(int usuarioId) async {
    _setLoading(true);
    _clearError();

    try {
      final response = await _httpService.get(
        AppConstants.quizResultadosUrl(usuarioId),
      );

      if (response.statusCode == 200) {
        final data = response.data;
        
        if (data['data'] != null) {
          _resultadosFinales = ResultadosQuizModel.fromJson(data['data']);
        } else {
          _resultadosFinales = ResultadosQuizModel.fromJson(data);
        }
        
        notifyListeners();
      }
    } on HttpException catch (e) {
      _setError(e.message);
    } catch (e) {
      _setError('Error al cargar resultados: ${e.toString()}');
    }

    _setLoading(false);
  }

  // ============================================
  // RESET Y LIMPIEZA
  // ============================================

  void _resetQuiz() {
    _preguntas = [];
    _preguntaActualIndex = 0;
    _respuestasSeleccionadas = {};
    _resultados = [];
    _resultadosFinales = null;
    _quizFinalizado = false;
  }

  void reiniciarQuiz() {
    _preguntaActualIndex = 0;
    _respuestasSeleccionadas = {};
    _resultados = [];
    _resultadosFinales = null;
    _quizFinalizado = false;
    _clearError();
    notifyListeners();
  }

  void limpiar() {
    _resetQuiz();
    _error = null;
    notifyListeners();
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

  void clearError() {
    _clearError();
    notifyListeners();
  }
}