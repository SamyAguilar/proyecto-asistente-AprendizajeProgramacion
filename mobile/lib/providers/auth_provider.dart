// lib/providers/auth_provider.dart

import 'package:flutter/material.dart';
import '../models/usuario_model.dart';
import '../services/http_service.dart';
import '../services/storage_service.dart';
import '../config/constants.dart';

enum AuthStatus {
  initial,
  authenticated,
  unauthenticated,
  loading,
}

class AuthProvider extends ChangeNotifier {
  final HttpService _httpService = HttpService();
  final StorageService _storageService = StorageService();

  AuthStatus _status = AuthStatus.initial;
  UsuarioModel? _usuario;
  String? _error;
  bool _isLoading = false;

  // ============================================
  // GETTERS
  // ============================================

  AuthStatus get status => _status;
  UsuarioModel? get usuario => _usuario;
  String? get error => _error;
  bool get isLoading => _isLoading;
  bool get isAuthenticated => _status == AuthStatus.authenticated;

  // ============================================
  // INICIALIZACION
  // ============================================

  Future<void> init() async {
    await _storageService.init();
  }

  // ============================================
  // VERIFICAR ESTADO DE AUTENTICACION
  // ============================================

  Future<void> checkAuthStatus() async {
    _setLoading(true);
    _clearError();

    try {
      final hasTokens = await _storageService.hasTokens();

      if (!hasTokens) {
        _status = AuthStatus.unauthenticated;
        _setLoading(false);
        return;
      }

      // Intentar obtener perfil del usuario
      await loadUserProfile();

      if (_usuario != null) {
        _status = AuthStatus.authenticated;
      } else {
        _status = AuthStatus.unauthenticated;
        await _storageService.clearSession();
      }
    } catch (e) {
      _status = AuthStatus.unauthenticated;
      await _storageService.clearSession();
    }

    _setLoading(false);
  }

  // ============================================
  // REGISTRO
  // ============================================

  Future<bool> register({
    required String email,
    required String password,
    required String nombre,
    required String apellido,
    String? matricula,
  }) async {
    _setLoading(true);
    _clearError();

    try {
      final response = await _httpService.post(
        AppConstants.registerUrl,
        data: {
          'email': email,
          'contraseña': password,
          'nombre': nombre,
          'apellido': apellido,
          if (matricula != null && matricula.isNotEmpty) 'matricula': matricula,
        },
      );

      if (response.statusCode == 201 || response.statusCode == 200) {
        final data = response.data;

        if (data['accessToken'] != null && data['refreshToken'] != null) {
          await _storageService.saveTokens(
            accessToken: data['accessToken'],
            refreshToken: data['refreshToken'],
          );

          if (data['usuario'] != null) {
            _usuario = UsuarioModel.fromJson(data['usuario']);
            await _storageService.saveUserId(_usuario!.id);
            await _storageService.saveUserEmail(_usuario!.email);
          }

          _status = AuthStatus.authenticated;
          _setLoading(false);
          return true;
        }
      }

      _setError('Error al registrar usuario');
      _setLoading(false);
      return false;
    } on HttpException catch (e) {
      _setError(e.message);
      _setLoading(false);
      return false;
    } catch (e) {
      _setError(AppConstants.errorGenerico);
      _setLoading(false);
      return false;
    }
  }

  // ============================================
  // LOGIN
  // ============================================

  Future<bool> login({
    required String email,
    required String password,
  }) async {
    _setLoading(true);
    _clearError();

    try {
      final response = await _httpService.post(
        AppConstants.loginUrl,
        data: {
          'email': email,
          'contraseña': password,
        },
      );

      if (response.statusCode == 200) {
        final data = response.data;

        if (data['accessToken'] != null && data['refreshToken'] != null) {
          await _storageService.saveTokens(
            accessToken: data['accessToken'],
            refreshToken: data['refreshToken'],
          );

          if (data['usuario'] != null) {
            _usuario = UsuarioModel.fromJson(data['usuario']);
            await _storageService.saveUserId(_usuario!.id);
            await _storageService.saveUserEmail(_usuario!.email);
          } else {
            await loadUserProfile();
          }

          _status = AuthStatus.authenticated;
          _setLoading(false);
          return true;
        }
      }

      _setError('Credenciales invalidas');
      _setLoading(false);
      return false;
    } on HttpException catch (e) {
      _setError(e.message);
      _setLoading(false);
      return false;
    } catch (e) {
      _setError(AppConstants.errorGenerico);
      _setLoading(false);
      return false;
    }
  }

  // ============================================
  // LOGOUT
  // ============================================

  Future<void> logout() async {
    _setLoading(true);

    try {
      final refreshToken = await _storageService.getRefreshToken();

      if (refreshToken != null) {
        await _httpService.post(
          AppConstants.logoutUrl,
          data: {'refreshToken': refreshToken},
        );
      }
    } catch (e) {
      // Ignorar errores en logout
    }

    await _storageService.clearSession();
    _usuario = null;
    _status = AuthStatus.unauthenticated;
    _setLoading(false);
  }

  // ============================================
  // CARGAR PERFIL
  // ============================================

  Future<void> loadUserProfile() async {
    try {
      final response = await _httpService.get(AppConstants.profileUrl);

      if (response.statusCode == 200) {
        final data = response.data;
        
        if (data['data'] != null) {
          _usuario = UsuarioModel.fromJson(data['data']);
        } else {
          _usuario = UsuarioModel.fromJson(data);
        }
        
        notifyListeners();
      }
    } on HttpException catch (e) {
      if (e.statusCode == 401) {
        _status = AuthStatus.unauthenticated;
        await _storageService.clearSession();
      }
      rethrow;
    }
  }

  // ============================================
  // ACTUALIZAR PERFIL
  // ============================================

  Future<bool> updateProfile({
    String? nombre,
    String? apellido,
    String? fotoPerfil,
  }) async {
    _setLoading(true);
    _clearError();

    try {
      final data = <String, dynamic>{};
      if (nombre != null) data['nombre'] = nombre;
      if (apellido != null) data['apellido'] = apellido;
      if (fotoPerfil != null) data['fotoPerfil'] = fotoPerfil;

      final response = await _httpService.put(
        AppConstants.profileUrl,
        data: data,
      );

      if (response.statusCode == 200) {
        await loadUserProfile();
        _setLoading(false);
        return true;
      }

      _setError('Error al actualizar perfil');
      _setLoading(false);
      return false;
    } on HttpException catch (e) {
      _setError(e.message);
      _setLoading(false);
      return false;
    } catch (e) {
      _setError(AppConstants.errorGenerico);
      _setLoading(false);
      return false;
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

  void clearError() {
    _clearError();
    notifyListeners();
  }
}