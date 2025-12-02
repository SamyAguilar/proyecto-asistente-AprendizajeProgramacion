// lib/providers/theme_provider.dart

import 'package:flutter/material.dart';
import '../services/storage_service.dart';

class ThemeProvider extends ChangeNotifier {
  final StorageService _storageService = StorageService();

  ThemeMode _themeMode = ThemeMode.light;

  ThemeMode get themeMode => _themeMode;
  bool get isDarkMode => _themeMode == ThemeMode.dark;
  bool get isDark => _themeMode == ThemeMode.dark;  // ← AGREGAR ESTA LÍNEA

  // Inicializar con el tema guardado
  Future<void> init() async {
    final savedTheme = _storageService.getString('theme_mode');
    if (savedTheme != null) {
      _themeMode = savedTheme == 'dark' ? ThemeMode.dark : ThemeMode.light;
      notifyListeners();
    }
  }

  // Cambiar tema
  Future<void> toggleTheme() async {
    _themeMode = _themeMode == ThemeMode.light ? ThemeMode.dark : ThemeMode.light;
    await _storageService.saveString('theme_mode', _themeMode == ThemeMode.dark ? 'dark' : 'light');
    notifyListeners();
  }

  // Establecer tema especifico
  Future<void> setThemeMode(ThemeMode mode) async {
    _themeMode = mode;
    await _storageService.saveString('theme_mode', mode == ThemeMode.dark ? 'dark' : 'light');
    notifyListeners();
  }
}