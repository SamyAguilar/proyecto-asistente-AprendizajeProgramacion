import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'config/theme.dart';
import 'providers/auth_provider.dart';
import 'providers/theme_provider.dart';
import 'providers/gemini_provider.dart'; // Mantener el provider de Lulu
import 'services/storage_service.dart';
import 'services/http_service.dart'; // Necesario para los nuevos providers
import 'screens/splash_screen.dart';

// 🆕 IMPORTA TUS PROVIDERS DE TOÑO
import 'providers/materia_provider.dart';
import 'providers/contenido_provider.dart';
import 'providers/progreso_provider.dart';

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
    // Se agregan los providers de Toño, inicializándolos con HttpService()
    return MultiProvider(
      providers: [
        // Providers de Base
        ChangeNotifierProvider(create: (_) => AuthProvider()..init()),
        ChangeNotifierProvider(create: (_) => ThemeProvider()..init()),
        ChangeNotifierProvider(create: (_) => GeminiProvider()), // Provider de Lulu

        // 🆕 Providers del módulo de Materias (Toño)
        ChangeNotifierProvider(
          create: (_) => MateriaProvider(HttpService()),
        ),
        ChangeNotifierProvider(
          create: (_) => ContenidoProvider(HttpService()),
        ),
        ChangeNotifierProvider(
          create: (_) => ProgresoProvider(HttpService()),
        ),
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