import 'package:flutter/foundation.dart';
import '../models/materia_model.dart';
import '../services/http_service.dart';

class MateriaProvider with ChangeNotifier {
  final HttpService _httpService;

  MateriaProvider(this._httpService);

  // Estados
  List<MateriaModel> _materias = [];
  List<MateriaModel> _misMaterias = [];
  MateriaModel? _materiaSeleccionada;
  bool _isLoading = false;
  String? _error;

  // Getters
  List<MateriaModel> get materias => _materias;
  List<MateriaModel> get misMaterias => _misMaterias;
  MateriaModel? get materiaSeleccionada => _materiaSeleccionada;
  bool get isLoading => _isLoading;
  String? get error => _error;

  // Métodos
  Future<void> listarMaterias() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _httpService.get('/materias');
      
      debugPrint('Response type: ${response.data.runtimeType}');
      debugPrint('Response data: ${response.data}');
      
      if (response.data != null) {
        List<dynamic> materiasData = [];
        
        // Intentar diferentes formatos de respuesta
        if (response.data is List) {
          materiasData = response.data as List;
        } else if (response.data is Map) {
          // Intentar varias posibles claves
          final data = response.data as Map<String, dynamic>;
          if (data.containsKey('data')) {
            materiasData = data['data'] as List? ?? [];
          } else if (data.containsKey('materias')) {
            materiasData = data['materias'] as List? ?? [];
          } else if (data.containsKey('results')) {
            materiasData = data['results'] as List? ?? [];
          } else {
            // Si no hay ninguna clave conocida, intentar convertir el mapa mismo
            materiasData = [data];
          }
        }
        
        _materias = materiasData
            .map((json) {
              try {
                return MateriaModel.fromJson(json as Map<String, dynamic>);
              } catch (e) {
                debugPrint('Error parsing materia: $e');
                debugPrint('JSON: $json');
                return null;
              }
            })
            .whereType<MateriaModel>()
            .toList();
            
        debugPrint('Materias cargadas: ${_materias.length}');
      }
    } catch (e) {
      _error = 'Error al cargar materias: ${e.toString()}';
      debugPrint('Error completo: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> obtenerMateria(int id) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _httpService.get('/materias/$id');
      
      if (response.data != null) {
        _materiaSeleccionada = MateriaModel.fromJson(
          response.data is Map 
            ? response.data as Map<String, dynamic>
            : (response.data as Map).cast<String, dynamic>()
        );
      }
    } catch (e) {
      _error = e.toString();
      debugPrint('Error al obtener materia: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<List<MateriaModel>> buscarMaterias(String query) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _httpService.get('/materias/buscar', 
        queryParameters: {'q': query}
      );
      
      if (response.data != null) {
        List<dynamic> materiasData = [];
        
        if (response.data is List) {
          materiasData = response.data as List;
        } else if (response.data is Map) {
          final data = response.data as Map<String, dynamic>;
          materiasData = data['data'] ?? data['materias'] ?? data['results'] ?? [];
        }
        
        final resultados = materiasData
            .map((json) => MateriaModel.fromJson(json as Map<String, dynamic>))
            .toList();
            
        _isLoading = false;
        notifyListeners();
        return resultados;
      }
    } catch (e) {
      _error = e.toString();
      debugPrint('Error al buscar materias: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
    
    return [];
  }

  Future<void> obtenerMisMaterias() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _httpService.get('/materias/mis-materias');
      
      debugPrint('Mis materias response: ${response.data}');
      
      if (response.data != null) {
        List<dynamic> materiasData = [];
        
        if (response.data is List) {
          materiasData = response.data as List;
        } else if (response.data is Map) {
          final data = response.data as Map<String, dynamic>;
          materiasData = data['data'] ?? data['materias'] ?? data['results'] ?? [];
        }
        
        _misMaterias = materiasData
            .map((json) => MateriaModel.fromJson(json as Map<String, dynamic>))
            .toList();
            
        debugPrint('Mis materias cargadas: ${_misMaterias.length}');
      }
    } catch (e) {
      _error = e.toString();
      debugPrint('Error al obtener mis materias: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> matricularMateria(int id) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      await _httpService.post('/materias/$id/matricular');
      
      // Recargar mis materias después de matricular
      await obtenerMisMaterias();
      
      return true;
    } catch (e) {
      _error = e.toString();
      debugPrint('Error al matricular materia: $e');
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  void limpiarError() {
    _error = null;
    notifyListeners();
  }

  void seleccionarMateria(MateriaModel materia) {
    _materiaSeleccionada = materia;
    notifyListeners();
  }

  void limpiarSeleccion() {
    _materiaSeleccionada = null;
    notifyListeners();
  }
}