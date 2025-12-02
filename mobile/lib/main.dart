// lib/main.dart

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'config/theme.dart';
import 'providers/auth_provider.dart';
import 'providers/theme_provider.dart';
import 'providers/gemini_provider.dart';
import 'providers/ejercicio_provider.dart';
import 'providers/quiz_provider.dart';
import 'providers/materia_provider.dart';
import 'providers/contenido_provider.dart';
import 'providers/progreso_provider.dart';
import 'services/storage_service.dart';
import 'services/http_service.dart';
import 'screens/splash_screen.dart';

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
        // [SAM] Providers de autenticacion y tema
        ChangeNotifierProvider(create: (_) => AuthProvider()..init()),
        ChangeNotifierProvider(create: (_) => ThemeProvider()..init()),
        
        // [LULU] Provider de asistente IA
        ChangeNotifierProvider(create: (_) => GeminiProvider()),
        
        // [PANCHO] Providers de ejercicios y quizzes
        ChangeNotifierProvider(create: (_) => EjercicioProvider()),
        ChangeNotifierProvider(create: (_) => QuizProvider()),
        
        // [TONO] Providers de materias y progreso
        ChangeNotifierProvider(create: (_) => MateriaProvider(HttpService())),
        ChangeNotifierProvider(create: (_) => ContenidoProvider(HttpService())),
        ChangeNotifierProvider(create: (_) => ProgresoProvider(HttpService())),
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
