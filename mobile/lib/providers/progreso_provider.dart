// mobile/lib/providers/progreso_provider.dart
import 'package:flutter/foundation.dart';
import '../models/progreso_model.dart';
import '../services/http_service.dart';

class ProgresoProvider with ChangeNotifier {
  final HttpService _httpService;

  ProgresoProvider(this._httpService);

  // Estados internos para gestionar el progreso
  ProgresoModel? _progresoGeneral;
  Map<int, ProgresoModel> _progresosPorMateria = {};
  Map<int, ProgresoModel> _progresosPorTema = {};
  Map<int, double> _porcentajesPorMateria = {};
  Map<int, double> _porcentajesPorTema = {};
  bool _isLoading = false;
  String? _error;

  // Getters para acceder a los estados internos
  ProgresoModel? get progresoGeneral => _progresoGeneral;
  Map<int, ProgresoModel> get progresosPorMateria => _progresosPorMateria;
  Map<int, ProgresoModel> get progresosPorTema => _progresosPorTema;
  bool get isLoading => _isLoading;
  String? get error => _error;

  // Metodos de utilidad para obtener progreso y estado de materias

  /// Obtiene el porcentaje de progreso de una materia
  /// Si no existe, devuelve 0.0
  double getProgresoPorMateria(int materiaId) {
    if (_porcentajesPorMateria.containsKey(materiaId)) {
      return _porcentajesPorMateria[materiaId]!;
    }
    return _progresosPorMateria[materiaId]?.porcentajeCompletado ?? 0.0;
  }

  /// Obtiene el porcentaje de progreso de un tema
  /// Si no existe, devuelve 0.0
  double getProgresoPorTema(int temaId) {
    if (_porcentajesPorTema.containsKey(temaId)) {
      return _porcentajesPorTema[temaId]!;
    }
    return _progresosPorTema[temaId]?.porcentajeCompletado ?? 0.0;
  }

  /// Obtiene el estado de progreso de una materia
  /// Por defecto: 'no_iniciado'
  String getEstadoPorMateria(int materiaId) {
    return _progresosPorMateria[materiaId]?.estado ?? 'no_iniciado';
  }

  /// Obtiene el estado de progreso de un tema
  /// Por defecto: 'no_iniciado'
  String getEstadoPorTema(int temaId) {
    return _progresosPorTema[temaId]?.estado ?? 'no_iniciado';
  }

  /// Actualiza el progreso de un tema
  /// [temaId]: Identificador del tema
  /// [progreso]: Porcentaje de progreso (0.0 - 100.0)
  Future<void> actualizarProgresoTema(int temaId, double progreso) async {
    try {
      final response = await _httpService.put(
          '/progreso/actualizar',
          data: {
            'temaId': temaId,
            'estado': progreso == 100 ? 'completado' :
            progreso > 0 ? 'en_progreso' : 'no_iniciado',
            'porcentajeCompletado': progreso
          }
      );

      // Depuracion detallada de la solicitud y respuesta
      debugPrint('Datos enviados para actualizar progreso: {');
      debugPrint('  temaId: $temaId');
      debugPrint('  estado: ${progreso == 100 ? 'completado' : progreso > 0 ? 'en_progreso' : 'no_iniciado'}');
      debugPrint('  porcentajeCompletado: $progreso');
      debugPrint('}');

      debugPrint('Respuesta del servidor: $response');

      if (response.data != null) {
        debugPrint('Datos de respuesta: ${response.data}');

        if (response.data['success'] == true) {
          final progresoActualizado = ProgresoModel.fromJson(response.data['data']);

          debugPrint('Progreso actualizado: ${progresoActualizado.porcentajeCompletado}%');

          if (progresoActualizado.temaId != null) {
            _progresosPorTema[progresoActualizado.temaId!] = progresoActualizado;
            _porcentajesPorTema[progresoActualizado.temaId!] = progresoActualizado.porcentajeCompletado;
          }

          notifyListeners();
        } else {
          debugPrint('Respuesta sin exito: ${response.data}');
        }
      }
    } catch (e) {
      debugPrint('Error completo al actualizar progreso: $e');
    }
  }

  /// Calcula el progreso de un tema basado en ejercicios completados
  /// [temaId]: Identificador del tema a calcular
  Future<void> calcularProgresoTema(int temaId) async {
    try {
      final response = await _httpService.post('/progreso/calcular/$temaId');

      debugPrint('Respuesta de calculo de progreso: $response');

      if (response.data != null && response.data['success'] == true) {
        final progresoActualizado = ProgresoModel.fromJson(response.data['data']);

        debugPrint('Progreso calculado: ${progresoActualizado.porcentajeCompletado}%');

        if (progresoActualizado.temaId != null) {
          _progresosPorTema[progresoActualizado.temaId!] = progresoActualizado;
          _porcentajesPorTema[progresoActualizado.temaId!] = progresoActualizado.porcentajeCompletado;
        }

        notifyListeners();
      }
    } catch (e) {
      debugPrint('Error al calcular progreso: $e');
    }
  }

  /// Obtiene el progreso general del usuario
  /// Recupera y actualiza los progresos de materias y temas
  Future<void> obtenerMiProgreso() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _httpService.get('/progreso/mi-progreso');

      debugPrint('Response mi progreso: ${response.data}');

      if (response.data != null && response.data['success'] == true) {
        final progresos = response.data['data'];

        for (var progreso in progresos) {
          final progresoModel = ProgresoModel.fromJson(progreso);

          if (progresoModel.materiaId != null) {
            _progresosPorMateria[progresoModel.materiaId!] = progresoModel;
            _porcentajesPorMateria[progresoModel.materiaId!] = progresoModel.porcentajeCompletado;
          }

          if (progresoModel.temaId != null) {
            _progresosPorTema[progresoModel.temaId!] = progresoModel;
            _porcentajesPorTema[progresoModel.temaId!] = progresoModel.porcentajeCompletado;
          }
        }

        debugPrint('Progresos cargados: ${_progresosPorMateria.length} materias, ${_progresosPorTema.length} temas');
      }
    } catch (e) {
      _error = e.toString();
      debugPrint('Error al obtener mi progreso: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Obtiene el progreso de una materia especifica
  /// [materiaId]: Identificador de la materia
  Future<void> obtenerProgresoMateria(int materiaId) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _httpService.get('/progreso/materia/$materiaId');

      debugPrint('Response progreso materia $materiaId: ${response.data}');

      if (response.data != null && response.data['success'] == true) {
        final progresoData = response.data['data'];

        // Actualizar porcentaje de materia
        _porcentajesPorMateria[materiaId] =
            (progresoData['promedioProgreso'] as num?)?.toDouble() ?? 0.0;

        debugPrint('Progreso materia $materiaId: ${getProgresoPorMateria(materiaId)}%');
      }
    } catch (e) {
      _error = e.toString();
      debugPrint('Error al obtener progreso de materia: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// NUEVO METODO: Obtiene el progreso de un tema especifico
  /// [temaId]: Identificador del tema
  /// Este metodo es CLAVE para refrescar el progreso despues de resolver ejercicios
  Future<void> obtenerProgresoTema(int temaId) async {
    debugPrint('=== OBTENIENDO PROGRESO TEMA $temaId ===');

    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _httpService.get('/progreso/tema/$temaId');

      debugPrint('Response progreso tema $temaId: ${response.data}');

      if (response.data != null && response.data['success'] == true) {
        final progresoData = response.data['data'];
        final progresoModel = ProgresoModel.fromJson(progresoData);

        _progresosPorTema[temaId] = progresoModel;
        _porcentajesPorTema[temaId] = progresoModel.porcentajeCompletado;

        debugPrint('Progreso tema $temaId actualizado: ${getProgresoPorTema(temaId)}%');
      }
    } catch (e) {
      _error = e.toString();
      debugPrint('Error al obtener progreso de tema: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Obtiene el progreso general de todas las materias
  Future<Map<String, dynamic>?> obtenerProgresoGeneral() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _httpService.get('/usuarios/progreso');

      debugPrint('Response progreso general: ${response.data}');

      if (response.data != null && response.data is Map) {
        final data = response.data as Map<String, dynamic>;

        if (data.containsKey('materias') && data['materias'] is List) {
          for (var materia in data['materias']) {
            if (materia is Map) {
              final materiaId = materia['materiaId'] as int?;
              final progreso = materia['progreso'] ?? materia['porcentajeCompletado'];

              if (materiaId != null && progreso != null) {
                _porcentajesPorMateria[materiaId] = (progreso as num).toDouble();
              }
            }
          }
        }

        _isLoading = false;
        notifyListeners();
        return data;
      }
    } catch (e) {
      _error = e.toString();
      debugPrint('Error al obtener progreso general: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }

    return null;
  }

  /// Actualiza manualmente el progreso de una materia
  /// [materiaId]: Identificador de la materia
  /// [progreso]: Porcentaje de progreso
  void actualizarProgresoMateria(int materiaId, double progreso) {
    _porcentajesPorMateria[materiaId] = progreso;
    notifyListeners();
  }

  /// Obtiene los intentos de ejercicios para un subtema especifico
  /// [subtemaId]: Identificador del subtema
  Future<List<dynamic>> obtenerIntentosSubtema(int subtemaId) async {
    try {
      final response = await _httpService.get('/progreso/subtema/$subtemaId/intentos');

      debugPrint('Intentos de subtema $subtemaId: ${response.data}');

      if (response.data != null && response.data is List) {
        return response.data;
      }

      return [];
    } catch (e) {
      debugPrint('Error al obtener intentos de subtema: $e');
      return [];
    }
  }

  /// Limpia cualquier error almacenado
  void limpiarError() {
    _error = null;
    notifyListeners();
  }

  /// Limpia todos los progresos almacenados
  void limpiarProgreso() {
    _progresoGeneral = null;
    _progresosPorMateria = {};
    _progresosPorTema = {};
    _porcentajesPorMateria = {};
    _porcentajesPorTema = {};
    notifyListeners();
  }
}