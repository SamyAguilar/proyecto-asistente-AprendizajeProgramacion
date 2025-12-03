// lib/providers/ejercicio_provider.dart

import 'package:flutter/material.dart';
import '../models/ejercicio_model.dart';
import '../models/intento_ejercicio_model.dart';
import '../services/http_service.dart';
import '../config/constants.dart';

class EjercicioProvider extends ChangeNotifier {
  final HttpService _httpService = HttpService();

  // Estado
  List<EjercicioModel> _ejercicios = [];
  EjercicioModel? _ejercicioSeleccionado;
  List<IntentoEjercicioModel> _intentos = [];
  IntentoEjercicioModel? _ultimoIntento;

  bool _isLoading = false;
  bool _isSubmitting = false;
  String? _error;
  String? _filtroActual; // 'facil', 'intermedio', 'dificil', null = todos

  // ============================================
  // GETTERS
  // ============================================

  List<EjercicioModel> get ejercicios => _ejercicios;
  EjercicioModel? get ejercicioSeleccionado => _ejercicioSeleccionado;
  List<IntentoEjercicioModel> get intentos => _intentos;
  IntentoEjercicioModel? get ultimoIntento => _ultimoIntento;
  bool get isLoading => _isLoading;
  bool get isSubmitting => _isSubmitting;
  String? get error => _error;
  String? get filtroActual => _filtroActual;

  // Ejercicios filtrados por dificultad
  List<EjercicioModel> get ejerciciosFiltrados {
    if (_filtroActual == null) return _ejercicios;
    return _ejercicios.where((e) {
      final d = e.dificultad.toLowerCase();
      switch (_filtroActual) {
        case 'facil':
          return d == 'facil' || d == 'fácil' || d == 'básica' || d == 'basica';
        case 'intermedio':
          return d == 'intermedio' || d == 'intermedia';
        case 'dificil':
          return d == 'dificil' || d == 'difícil' || d == 'avanzada' || d == 'avanzado';
        default:
          return true;
      }
    }).toList();
  }

  // Estadísticas
  int get totalEjercicios => _ejercicios.length;
  int get ejerciciosResueltos => _ejercicios.where((e) => e.resuelto == true).length;

  // ============================================
  // LISTAR EJERCICIOS POR SUBTEMA
  // ============================================

  Future<void> listarEjerciciosPorSubtema(int subtemaId) async {
    _setLoading(true);
    _clearError();

    try {
      final response = await _httpService.get(
        AppConstants.ejerciciosBySubtemaUrl(subtemaId),
      );

      if (response.statusCode == 200) {
        final data = response.data;

        List<dynamic> ejerciciosData;
        if (data is List) {
          ejerciciosData = data;
        } else if (data['data'] != null) {
          ejerciciosData = data['data'] as List;
        } else if (data['ejercicios'] != null) {
          ejerciciosData = data['ejercicios'] as List;
        } else {
          ejerciciosData = [];
        }

        _ejercicios = ejerciciosData
            .map((e) => EjercicioModel.fromJson(e))
            .toList();

        notifyListeners();
      }
    } on HttpException catch (e) {
      _setError(e.mensaje);
    } catch (e) {
      _setError('Error al cargar ejercicios: ${e.toString()}');
    }

    _setLoading(false);
  }

  // ============================================
  // OBTENER EJERCICIO POR ID
  // ============================================

  Future<void> obtenerEjercicio(int id) async {
    _setLoading(true);
    _clearError();

    try {
      final response = await _httpService.get(
        AppConstants.ejercicioDetailUrl(id),
      );

      if (response.statusCode == 200) {
        final data = response.data;

        if (data['data'] != null) {
          _ejercicioSeleccionado = EjercicioModel.fromJson(data['data']);
        } else {
          _ejercicioSeleccionado = EjercicioModel.fromJson(data);
        }

        notifyListeners();
      }
    } on HttpException catch (e) {
      _setError(e.mensaje);
    } catch (e) {
      _setError('Error al cargar ejercicio: ${e.toString()}');
    }

    _setLoading(false);
  }

  // ============================================
  // ENVIAR SOLUCIÓN DE EJERCICIO (MODIFICADO)
  // ============================================

  // FIX CLAVE: La firma del método debe aceptar un Map (payload) para enviar
  // el DTO correcto (opcionSeleccionadaId o codigoEnviado) al backend.
  Future<IntentoEjercicioModel?> enviarEjercicio(int id, Map<String, dynamic> payload) async {
    _isSubmitting = true;
    _clearError();
    notifyListeners();

    try {
      final response = await _httpService.post(
        AppConstants.enviarEjercicioUrl(id),
        data: payload, // <--- Ahora envía el payload DTO correcto (FIX)
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = response.data;

        IntentoEjercicioModel intento;
        if (data['data'] != null) {
          intento = IntentoEjercicioModel.fromJson(data['data']);
        } else {
          intento = IntentoEjercicioModel.fromJson(data);
        }

        _ultimoIntento = intento;

        // Agregar al inicio de la lista de intentos
        _intentos.insert(0, intento);

        // Actualizar estado del ejercicio en la lista
        final index = _ejercicios.indexWhere((e) => e.id == id);
        if (index != -1) {
          _ejercicios[index] = _ejercicios[index].copyWith(
            resuelto: intento.esCorrecto || _ejercicios[index].resuelto == true,
            intentos: (_ejercicios[index].intentos ?? 0) + 1,
          );
        }

        _isSubmitting = false;
        notifyListeners();
        return intento;
      }
    } on HttpException catch (e) {
      // ⚠️ El error 400 (Bad Request) del backend se captura aquí.
      _setError(e.mensaje);
    } catch (e) {
      _setError('Error al enviar ejercicio: ${e.toString()}');
    }

    _isSubmitting = false;
    notifyListeners();
    return null;
  }

  // ============================================
  // OBTENER INTENTOS DE UN EJERCICIO
  // ============================================

  Future<void> obtenerIntentosEjercicio(int id) async {
    _setLoading(true);
    _clearError();

    try {
      final response = await _httpService.get(
        AppConstants.intentosEjercicioUrl(id),
      );

      if (response.statusCode == 200) {
        final data = response.data;

        List<dynamic> intentosData;
        if (data is List) {
          intentosData = data;
        } else if (data['data'] != null) {
          intentosData = data['data'] as List;
        } else if (data['intentos'] != null) {
          intentosData = data['intentos'] as List;
        } else {
          intentosData = [];
        }

        _intentos = intentosData
            .map((i) => IntentoEjercicioModel.fromJson(i))
            .toList();

        // Ordenar por fecha más reciente
        _intentos.sort((a, b) {
          if (a.timestampEnvio == null) return 1;
          if (b.timestampEnvio == null) return -1;
          return b.timestampEnvio!.compareTo(a.timestampEnvio!);
        });

        notifyListeners();
      }
    } on HttpException catch (e) {
      _setError(e.mensaje);
    } catch (e) {
      _setError('Error al cargar intentos: ${e.toString()}');
    }

    _setLoading(false);
  }

  // ============================================
  // FILTRAR POR DIFICULTAD
  // ============================================

  void setFiltro(String? dificultad) {
    _filtroActual = dificultad;
    notifyListeners();
  }

  void limpiarFiltro() {
    _filtroActual = null;
    notifyListeners();
  }

  // ============================================
  // SELECCIONAR EJERCICIO
  // ============================================

  void seleccionarEjercicio(EjercicioModel ejercicio) {
    _ejercicioSeleccionado = ejercicio;
    _ultimoIntento = null;
    _intentos = [];
    notifyListeners();
  }

  void limpiarSeleccion() {
    _ejercicioSeleccionado = null;
    _ultimoIntento = null;
    _intentos = [];
    notifyListeners();
  }

  // ============================================
  // LIMPIAR TODO
  // ============================================

  void limpiar() {
    _ejercicios = [];
    _ejercicioSeleccionado = null;
    _intentos = [];
    _ultimoIntento = null;
    _filtroActual = null;
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