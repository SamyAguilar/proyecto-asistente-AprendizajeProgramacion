// lib/services/storage_service.dart

import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../config/constants.dart';

class StorageService {
  static final StorageService _instance = StorageService._internal();
  factory StorageService() => _instance;
  StorageService._internal();

  final _secureStorage = const FlutterSecureStorage();
  SharedPreferences? _prefs;

  // ============================================
  // INICIALIZACION
  // ============================================

  Future<void> init() async {
    _prefs = await SharedPreferences.getInstance();
  }

  // ============================================
  // TOKENS JWT (Almacenamiento Seguro)
  // ============================================

  Future<void> saveAccessToken(String token) async {
    await _secureStorage.write(
      key: AppConstants.keyAccessToken,
      value: token,
    );
  }

  Future<String?> getAccessToken() async {
    return await _secureStorage.read(key: AppConstants.keyAccessToken);
  }

  Future<void> saveRefreshToken(String token) async {
    await _secureStorage.write(
      key: AppConstants.keyRefreshToken,
      value: token,
    );
  }

  Future<String?> getRefreshToken() async {
    return await _secureStorage.read(key: AppConstants.keyRefreshToken);
  }

  Future<void> saveTokens({
    required String accessToken,
    required String refreshToken,
  }) async {
    await Future.wait([
      saveAccessToken(accessToken),
      saveRefreshToken(refreshToken),
    ]);
  }

  Future<void> deleteTokens() async {
    await Future.wait([
      _secureStorage.delete(key: AppConstants.keyAccessToken),
      _secureStorage.delete(key: AppConstants.keyRefreshToken),
    ]);
  }

  Future<bool> hasTokens() async {
    final accessToken = await getAccessToken();
    return accessToken != null && accessToken.isNotEmpty;
  }

  // ============================================
  // DATOS DE USUARIO
  // ============================================

  Future<void> saveUserId(int userId) async {
    await _prefs?.setInt(AppConstants.keyUserId, userId);
  }

  int? getUserId() {
    return _prefs?.getInt(AppConstants.keyUserId);
  }

  Future<void> saveUserEmail(String email) async {
    await _prefs?.setString(AppConstants.keyUserEmail, email);
  }

  String? getUserEmail() {
    return _prefs?.getString(AppConstants.keyUserEmail);
  }

  // ============================================
  // PREFERENCIAS GENERALES
  // ============================================

  Future<void> saveString(String key, String value) async {
    await _prefs?.setString(key, value);
  }

  String? getString(String key) {
    return _prefs?.getString(key);
  }

  Future<void> saveInt(String key, int value) async {
    await _prefs?.setInt(key, value);
  }

  int? getInt(String key) {
    return _prefs?.getInt(key);
  }

  Future<void> saveBool(String key, bool value) async {
    await _prefs?.setBool(key, value);
  }

  bool? getBool(String key) {
    return _prefs?.getBool(key);
  }

  Future<void> remove(String key) async {
    await _prefs?.remove(key);
  }

  // ============================================
  // LIMPIAR DATOS
  // ============================================

  Future<void> clearAll() async {
    await _secureStorage.deleteAll();
    await _prefs?.clear();
  }

  Future<void> clearSession() async {
    await deleteTokens();
    await _prefs?.remove(AppConstants.keyUserId);
    await _prefs?.remove(AppConstants.keyUserEmail);
  }
}