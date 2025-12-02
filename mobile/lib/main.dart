// lib/main.dart

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'config/theme.dart';
import 'providers/auth_provider.dart';
import 'providers/theme_provider.dart';
import 'providers/gemini_provider.dart';
import 'services/storage_service.dart';
import 'services/http_service.dart';
import 'screens/splash_screen.dart';

// 🆕 IMPORTA TUS PROVIDERS DE TOÑO
import 'features/materias/providers/providers.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Inicializar servicios
  await StorageService().init();

  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        // Providers de Sam
        ChangeNotifierProvider(create: (_) => AuthProvider()..init()),
        ChangeNotifierProvider(create: (_) => ThemeProvider()..init()),
        
        // 🆕 TUS PROVIDERS DE TOÑO
        ChangeNotifierProvider(
          create: (_) => MateriaProvider(HttpService()),
        ),
        ChangeNotifierProvider(
          create: (_) => ContenidoProvider(HttpService()),
        ),
        ChangeNotifierProvider(
          create: (_) => ProgresoProvider(HttpService()),
        ),
        ChangeNotifierProvider(create: (_) => GeminiProvider()), // <-- LULU Provider
      ],
      child: Consumer<ThemeProvider>(
        builder: (context, themeProvider, _) {
          return MaterialApp(
            title: 'Asistente de Programacion',
            debugShowCheckedModeBanner: false,
            theme: AppTheme.lightTheme,
            darkTheme: AppTheme.darkTheme,
            themeMode: themeProvider.themeMode,
            home: const SplashScreen(),
          );
        },
      ),
    );
  }
}