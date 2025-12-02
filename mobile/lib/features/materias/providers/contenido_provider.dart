import 'package:flutter/foundation.dart';
import '../models/models.dart';
import '../../../services/http_service.dart';

class ContenidoProvider with ChangeNotifier {
  final HttpService _httpService;

  ContenidoProvider(this._httpService);

  // Estados
  List<TemaModel> _temas = [];
  TemaModel? _temaSeleccionado;
  List<SubtemaModel> _subtemas = [];
  SubtemaModel? _subtemaSeleccionado;
  bool _isLoading = false;
  String? _error;

  // Getters
  List<TemaModel> get temas => _temas;
  TemaModel? get temaSeleccionado => _temaSeleccionado;
  List<SubtemaModel> get subtemas => _subtemas;
  SubtemaModel? get subtemaSeleccionado => _subtemaSeleccionado;
  bool get isLoading => _isLoading;
  String? get error => _error;

  // Métodos para Temas
  Future<void> listarTemasPorMateria(int materiaId) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _httpService.get('/materias/$materiaId/temas');
      
      debugPrint('Response temas: ${response.data}');
      
      if (response.data != null) {
        List<dynamic> temasData = [];
        
        if (response.data is List) {
          temasData = response.data as List;
        } else if (response.data is Map) {
          final data = response.data as Map<String, dynamic>;
          temasData = data['data'] ?? data['temas'] ?? [];
        }
        
        _temas = temasData
            .map((json) => TemaModel.fromJson(json as Map<String, dynamic>))
            .toList();
        
        // Ordenar por orden (manejo seguro de nullables)
        _temas.sort((a, b) {
          final ordenA = a.orden ?? 999;
          final ordenB = b.orden ?? 999;
          return ordenA.compareTo(ordenB);
        });
        
        debugPrint('Temas cargados: ${_temas.length}');
      }
    } catch (e) {
      _error = e.toString();
      debugPrint('Error al listar temas: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> listarTemasConProgreso(int materiaId) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _httpService.get('/materias/$materiaId/temas-con-progreso');
      
      debugPrint('Response temas con progreso: ${response.data}');
      
      if (response.data != null) {
        List<dynamic> temasData = [];
        
        if (response.data is List) {
          temasData = response.data as List;
        } else if (response.data is Map) {
          final data = response.data as Map<String, dynamic>;
          temasData = data['data'] ?? data['temas'] ?? [];
        }
        
        _temas = temasData
            .map((json) => TemaModel.fromJson(json as Map<String, dynamic>))
            .toList();
        
        _temas.sort((a, b) {
          final ordenA = a.orden ?? 999;
          final ordenB = b.orden ?? 999;
          return ordenA.compareTo(ordenB);
        });
        
        debugPrint('Temas con progreso cargados: ${_temas.length}');
      }
    } catch (e) {
      _error = e.toString();
      debugPrint('Error al listar temas con progreso: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> obtenerTema(int id) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _httpService.get('/temas/$id');
      
      if (response.data != null) {
        _temaSeleccionado = TemaModel.fromJson(
          response.data is Map 
            ? response.data as Map<String, dynamic>
            : (response.data as Map).cast<String, dynamic>()
        );
      }
    } catch (e) {
      _error = e.toString();
      debugPrint('Error al obtener tema: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Métodos para Subtemas
  Future<void> listarSubtemasPorTema(int temaId) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _httpService.get('/temas/$temaId/subtemas');
      
      debugPrint('Response subtemas: ${response.data}');
      
      if (response.data != null) {
        List<dynamic> subtemasData = [];
        
        if (response.data is List) {
          subtemasData = response.data as List;
        } else if (response.data is Map) {
          final data = response.data as Map<String, dynamic>;
          subtemasData = data['data'] ?? data['subtemas'] ?? [];
        }
        
        _subtemas = subtemasData
            .map((json) => SubtemaModel.fromJson(json as Map<String, dynamic>))
            .toList();
        
        _subtemas.sort((a, b) {
          final ordenA = a.orden ?? 999;
          final ordenB = b.orden ?? 999;
          return ordenA.compareTo(ordenB);
        });
        
        debugPrint('Subtemas cargados: ${_subtemas.length}');
      }
    } catch (e) {
      _error = e.toString();
      debugPrint('Error al listar subtemas: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> obtenerSubtema(int id) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _httpService.get('/subtemas/$id');
      
      if (response.data != null) {
        _subtemaSeleccionado = SubtemaModel.fromJson(
          response.data is Map 
            ? response.data as Map<String, dynamic>
            : (response.data as Map).cast<String, dynamic>()
        );
      }
    } catch (e) {
      _error = e.toString();
      debugPrint('Error al obtener subtema: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Métodos de utilidad
  void seleccionarTema(TemaModel tema) {
    _temaSeleccionado = tema;
    notifyListeners();
  }

  void seleccionarSubtema(SubtemaModel subtema) {
    _subtemaSeleccionado = subtema;
    notifyListeners();
  }

  void limpiarTemas() {
    _temas = [];
    _temaSeleccionado = null;
    notifyListeners();
  }

  void limpiarSubtemas() {
    _subtemas = [];
    _subtemaSeleccionado = null;
    notifyListeners();
  }

  void limpiarError() {
    _error = null;
    notifyListeners();
  }
}