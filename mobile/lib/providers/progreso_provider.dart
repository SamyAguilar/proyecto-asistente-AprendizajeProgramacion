import 'package:flutter/foundation.dart';
import '../models/progreso_model.dart';
import '../services/http_service.dart';

class ProgresoProvider with ChangeNotifier {
  final HttpService _httpService;

  ProgresoProvider(this._httpService);

  // Estados
  ProgresoModel? _progresoGeneral;
  Map<int, ProgresoModel> _progresosPorMateria = {};
  Map<int, ProgresoModel> _progresosPorTema = {};
  Map<int, double> _porcentajesPorMateria = {};
  Map<int, double> _porcentajesPorTema = {};
  bool _isLoading = false;
  String? _error;

  // Getters
  ProgresoModel? get progresoGeneral => _progresoGeneral;
  Map<int, ProgresoModel> get progresosPorMateria => _progresosPorMateria;
  Map<int, ProgresoModel> get progresosPorTema => _progresosPorTema;
  bool get isLoading => _isLoading;
  String? get error => _error;

  // Métodos de utilidad
  double getProgresoPorMateria(int materiaId) {
    if (_porcentajesPorMateria.containsKey(materiaId)) {
      return _porcentajesPorMateria[materiaId]!;
    }
    return _progresosPorMateria[materiaId]?.porcentajeCompletado ?? 0.0;
  }

  double getProgresoPorTema(int temaId) {
    if (_porcentajesPorTema.containsKey(temaId)) {
      return _porcentajesPorTema[temaId]!;
    }
    return _progresosPorTema[temaId]?.porcentajeCompletado ?? 0.0;
  }

  String getEstadoPorMateria(int materiaId) {
    return _progresosPorMateria[materiaId]?.estado ?? 'no_iniciado';
  }

  String getEstadoPorTema(int temaId) {
    return _progresosPorTema[temaId]?.estado ?? 'no_iniciado';
  }

  // GET /progreso/mi-progreso
  Future<void> obtenerMiProgreso() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _httpService.get('/progreso/mi-progreso');
      
      debugPrint('Response mi progreso: ${response.data}');
      
      if (response.data != null) {
        if (response.data is List) {
          final progresos = (response.data as List)
              .map((json) {
                try {
                  return ProgresoModel.fromJson(json as Map<String, dynamic>);
                } catch (e) {
                  debugPrint('Error parsing progreso: $e');
                  return null;
                }
              })
              .whereType<ProgresoModel>()
              .toList();
          
          for (var progreso in progresos) {
            if (progreso.materiaId != null) {
              _progresosPorMateria[progreso.materiaId!] = progreso;
              _porcentajesPorMateria[progreso.materiaId!] = progreso.porcentajeCompletado;
            }
            if (progreso.temaId != null) {
              _progresosPorTema[progreso.temaId!] = progreso;
              _porcentajesPorTema[progreso.temaId!] = progreso.porcentajeCompletado;
            }
          }
          
          debugPrint('Progresos cargados: ${_progresosPorMateria.length} materias, ${_progresosPorTema.length} temas');
          
        } else if (response.data is Map) {
          final data = response.data as Map<String, dynamic>;
          
          if (data.containsKey('progresoGeneral')) {
            try {
              _progresoGeneral = ProgresoModel.fromJson(
                data['progresoGeneral'] as Map<String, dynamic>
              );
            } catch (e) {
              debugPrint('Error parsing progresoGeneral: $e');
            }
          }
          
          if (data.containsKey('materias') && data['materias'] is List) {
            for (var materia in data['materias']) {
              if (materia is Map) {
                final materiaId = materia['materiaId'] as int?;
                final progreso = materia['progreso'] ?? materia['porcentajeCompletado'];
                
                if (materiaId != null && progreso != null) {
                  _porcentajesPorMateria[materiaId] = (progreso as num).toDouble();
                  
                  if (materia.containsKey('estado')) {
                    try {
                      _progresosPorMateria[materiaId] = ProgresoModel.fromJson(
                        Map<String, dynamic>.from(materia)
                      );
                    } catch (e) {
                      debugPrint('Error creando ProgresoModel para materia: $e');
                    }
                  }
                }
              }
            }
          }
          
          if (data.containsKey('temas') && data['temas'] is List) {
            for (var tema in data['temas']) {
              if (tema is Map) {
                final temaId = tema['temaId'] as int?;
                final progreso = tema['progreso'] ?? tema['porcentajeCompletado'];
                
                if (temaId != null && progreso != null) {
                  _porcentajesPorTema[temaId] = (progreso as num).toDouble();
                  
                  if (tema.containsKey('estado')) {
                    try {
                      _progresosPorTema[temaId] = ProgresoModel.fromJson(
                        Map<String, dynamic>.from(tema)
                      );
                    } catch (e) {
                      debugPrint('Error creando ProgresoModel para tema: $e');
                    }
                  }
                }
              }
            }
          }
          
          debugPrint('Progresos cargados desde objeto: ${_porcentajesPorMateria.length} materias');
          
        } else {
          try {
            _progresoGeneral = ProgresoModel.fromJson(response.data);
          } catch (e) {
            debugPrint('Error parsing progreso general: $e');
          }
        }
      }
    } catch (e) {
      _error = e.toString();
      debugPrint('Error al obtener mi progreso: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // GET /progreso/materia/:materiaId
  Future<void> obtenerProgresoMateria(int materiaId) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _httpService.get('/progreso/materia/$materiaId');
      
      debugPrint('Response progreso materia $materiaId: ${response.data}');
      
      if (response.data != null) {
        if (response.data is Map) {
          final data = response.data as Map<String, dynamic>;
          
          try {
            final progreso = ProgresoModel.fromJson(data);
            _progresosPorMateria[materiaId] = progreso;
            _porcentajesPorMateria[materiaId] = progreso.porcentajeCompletado;
          } catch (e) {
            final porcentaje = data['progreso'] ?? data['porcentajeCompletado'];
            if (porcentaje != null) {
              _porcentajesPorMateria[materiaId] = (porcentaje as num).toDouble();
            }
            debugPrint('Error parsing progreso materia, usando porcentaje directo: $e');
          }
        } else if (response.data is num) {
          _porcentajesPorMateria[materiaId] = (response.data as num).toDouble();
        }
        
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

  // GET /progreso/tema/:temaId
  Future<void> obtenerProgresoTema(int temaId) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _httpService.get('/progreso/tema/$temaId');
      
      debugPrint('Response progreso tema $temaId: ${response.data}');
      
      if (response.data != null) {
        if (response.data is Map) {
          final data = response.data as Map<String, dynamic>;
          
          try {
            final progreso = ProgresoModel.fromJson(data);
            _progresosPorTema[temaId] = progreso;
            _porcentajesPorTema[temaId] = progreso.porcentajeCompletado;
          } catch (e) {
            final porcentaje = data['progreso'] ?? data['porcentajeCompletado'];
            if (porcentaje != null) {
              _porcentajesPorTema[temaId] = (porcentaje as num).toDouble();
            }
            debugPrint('Error parsing progreso tema, usando porcentaje directo: $e');
          }
        } else if (response.data is num) {
          _porcentajesPorTema[temaId] = (response.data as num).toDouble();
        }
        
        debugPrint('Progreso tema $temaId: ${getProgresoPorTema(temaId)}%');
      }
    } catch (e) {
      _error = e.toString();
      debugPrint('Error al obtener progreso de tema: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // GET /usuarios/progreso
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

  void actualizarProgresoMateria(int materiaId, double progreso) {
    _porcentajesPorMateria[materiaId] = progreso;
    notifyListeners();
  }

  void actualizarProgresoTema(int temaId, double progreso) {
    _porcentajesPorTema[temaId] = progreso;
    notifyListeners();
  }

  void limpiarError() {
    _error = null;
    notifyListeners();
  }

  void limpiarProgreso() {
    _progresoGeneral = null;
    _progresosPorMateria = {};
    _progresosPorTema = {};
    _porcentajesPorMateria = {};
    _porcentajesPorTema = {};
    notifyListeners();
  }
}