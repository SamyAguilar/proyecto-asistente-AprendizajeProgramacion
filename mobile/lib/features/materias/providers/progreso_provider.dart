import 'package:flutter/foundation.dart';
import '../models/models.dart';
import '../../../services/http_service.dart';

class ProgresoProvider with ChangeNotifier {
  final HttpService _httpService;

  ProgresoProvider(this._httpService);

  // Estados
  ProgresoModel? _progresoGeneral;
  Map<int, ProgresoModel> _progresosPorMateria = {};
  Map<int, ProgresoModel> _progresosPorTema = {};
  bool _isLoading = false;
  String? _error;

  // Getters
  ProgresoModel? get progresoGeneral => _progresoGeneral;
  Map<int, ProgresoModel> get progresosPorMateria => _progresosPorMateria;
  Map<int, ProgresoModel> get progresosPorTema => _progresosPorTema;
  bool get isLoading => _isLoading;
  String? get error => _error;

  // Métodos
  Future<void> obtenerMiProgreso() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _httpService.get('/progreso/mi-progreso');
      
      if (response.data != null) {
        // El backend puede devolver una lista o un objeto
        if (response.data is List) {
          final progresos = (response.data as List)
              .map((json) => ProgresoModel.fromJson(json))
              .toList();
          
          // Organizar por materia
          for (var progreso in progresos) {
            if (progreso.materiaId != null) {
              _progresosPorMateria[progreso.materiaId!] = progreso;
            }
            if (progreso.temaId != null) {
              _progresosPorTema[progreso.temaId!] = progreso;
            }
          }
        } else {
          _progresoGeneral = ProgresoModel.fromJson(response.data);
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

  Future<void> obtenerProgresoMateria(int materiaId) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _httpService.get('/progreso/materia/$materiaId');
      
      if (response.data != null) {
        final progreso = ProgresoModel.fromJson(response.data);
        _progresosPorMateria[materiaId] = progreso;
      }
    } catch (e) {
      _error = e.toString();
      debugPrint('Error al obtener progreso de materia: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> obtenerProgresoTema(int temaId) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _httpService.get('/progreso/tema/$temaId');
      
      if (response.data != null) {
        final progreso = ProgresoModel.fromJson(response.data);
        _progresosPorTema[temaId] = progreso;
      }
    } catch (e) {
      _error = e.toString();
      debugPrint('Error al obtener progreso de tema: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<Map<String, dynamic>?> obtenerProgresoGeneral() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _httpService.get('/usuarios/progreso');
      
      if (response.data != null) {
        _isLoading = false;
        notifyListeners();
        return response.data as Map<String, dynamic>;
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

  // Métodos de utilidad
  double getProgresoPorMateria(int materiaId) {
    return _progresosPorMateria[materiaId]?.porcentajeCompletado ?? 0.0;
  }

  double getProgresoPorTema(int temaId) {
    return _progresosPorTema[temaId]?.porcentajeCompletado ?? 0.0;
  }

  String getEstadoPorMateria(int materiaId) {
    return _progresosPorMateria[materiaId]?.estado ?? 'no_iniciado';
  }

  String getEstadoPorTema(int temaId) {
    return _progresosPorTema[temaId]?.estado ?? 'no_iniciado';
  }

  void limpiarError() {
    _error = null;
    notifyListeners();
  }

  void limpiarProgreso() {
    _progresoGeneral = null;
    _progresosPorMateria = {};
    _progresosPorTema = {};
    notifyListeners();
  }
}