# Estructura Final del Proyecto Mobile

```
mobile/
├── android/                          # Configuracion Android (no tocar)
├── ios/                              # Configuracion iOS (no tocar)
├── lib/
│   ├── config/
│   │   ├── constants.dart            # [SAM] URLs y constantes
│   │   └── theme.dart                # [SAM] Tema y estilos
│   │
│   ├── models/
│   │   ├── usuario_model.dart        # [SAM] Modelo de usuario
│   │   ├── materia_model.dart        # [TONO] Modelo de materia
│   │   ├── tema_model.dart           # [TONO] Modelo de tema
│   │   ├── subtema_model.dart        # [TONO] Modelo de subtema
│   │   ├── progreso_model.dart       # [TONO] Modelo de progreso
│   │   ├── ejercicio_model.dart      # [PANCHO] Modelo de ejercicio
│   │   ├── intento_model.dart        # [PANCHO] Modelo de intento
│   │   ├── pregunta_quiz_model.dart  # [PANCHO] Modelo de pregunta
│   │   └── retroalimentacion_model.dart # [LULU] Modelo de retroalimentacion
│   │
│   ├── providers/
│   │   ├── auth_provider.dart        # [SAM] Autenticacion
│   │   ├── materia_provider.dart     # [TONO] Materias y contenido
│   │   ├── progreso_provider.dart    # [TONO] Progreso del estudiante
│   │   ├── ejercicio_provider.dart   # [PANCHO] Ejercicios
│   │   ├── quiz_provider.dart        # [PANCHO] Quizzes
│   │   └── gemini_provider.dart      # [LULU] Asistente IA
│   │
│   ├── services/
│   │   ├── storage_service.dart      # [SAM] Almacenamiento local
│   │   └── http_service.dart         # [SAM] Cliente HTTP
│   │
│   ├── widgets/
│   │   ├── custom_button.dart        # [SAM] Boton reutilizable
│   │   ├── custom_text_field.dart    # [SAM] Campo de texto
│   │   ├── loading_widget.dart       # [SAM] Indicador de carga
│   │   └── error_widget.dart         # [SAM] Widget de error
│   │
│   ├── screens/
│   │   ├── splash_screen.dart        # [SAM] Pantalla inicial
│   │   │
│   │   ├── auth/                     # [SAM] Autenticacion
│   │   │   ├── login_screen.dart
│   │   │   └── register_screen.dart
│   │   │
│   │   ├── home/                     # [SAM] Pantalla principal
│   │   │   └── home_screen.dart
│   │   │
│   │   ├── profile/                  # [SAM] Perfil de usuario
│   │   │   ├── profile_screen.dart
│   │   │   └── edit_profile_screen.dart
│   │   │
│   │   ├── materias/                 # [TONO] Materias
│   │   │   ├── materias_screen.dart
│   │   │   ├── materia_detail_screen.dart
│   │   │   ├── temas_screen.dart
│   │   │   └── subtema_screen.dart
│   │   │
│   │   ├── ejercicios/               # [PANCHO] Ejercicios
│   │   │   ├── ejercicios_screen.dart
│   │   │   ├── ejercicio_detail_screen.dart
│   │   │   ├── editor_codigo_screen.dart
│   │   │   └── resultado_screen.dart
│   │   │
│   │   ├── quiz/                     # [PANCHO] Quizzes
│   │   │   ├── quiz_screen.dart
│   │   │   └── quiz_resultado_screen.dart
│   │   │
│   │   └── ayuda/                    # [LULU] Asistente IA
│   │       ├── ayuda_screen.dart
│   │       ├── chat_screen.dart
│   │       └── explicacion_screen.dart
│   │
│   └── main.dart                     # [SAM] Punto de entrada
│
├── test/                             # Tests (opcional)
├── pubspec.yaml                      # Dependencias
└── README.md                         # Documentacion
```

## Resumen por Miembro del Equipo

### SAM (Samuel) - Autenticacion y Base
**Estado: COMPLETADO**

Archivos creados:
- config/constants.dart
- config/theme.dart
- models/usuario_model.dart
- providers/auth_provider.dart
- services/storage_service.dart
- services/http_service.dart
- widgets/custom_button.dart
- widgets/custom_text_field.dart
- widgets/loading_widget.dart
- widgets/error_widget.dart
- screens/splash_screen.dart
- screens/auth/login_screen.dart
- screens/auth/register_screen.dart
- screens/home/home_screen.dart
- screens/profile/profile_screen.dart
- screens/profile/edit_profile_screen.dart
- main.dart

### TONO (Jose Antonio) - Materias y Progreso
**Estado: PENDIENTE**

Archivos a crear:
- models/materia_model.dart
- models/tema_model.dart
- models/subtema_model.dart
- models/progreso_model.dart
- providers/materia_provider.dart
- providers/progreso_provider.dart
- screens/materias/materias_screen.dart
- screens/materias/materia_detail_screen.dart
- screens/materias/temas_screen.dart
- screens/materias/subtema_screen.dart

### PANCHO (Francisco) - Ejercicios y Quizzes
**Estado: PENDIENTE**

Archivos a crear:
- models/ejercicio_model.dart
- models/intento_model.dart
- models/pregunta_quiz_model.dart
- providers/ejercicio_provider.dart
- providers/quiz_provider.dart
- screens/ejercicios/ejercicios_screen.dart
- screens/ejercicios/ejercicio_detail_screen.dart
- screens/ejercicios/editor_codigo_screen.dart
- screens/ejercicios/resultado_screen.dart
- screens/quiz/quiz_screen.dart
- screens/quiz/quiz_resultado_screen.dart

### LULU (Maria de Lourdes) - Asistente IA
**Estado: PENDIENTE**

Archivos a crear:
- models/retroalimentacion_model.dart
- providers/gemini_provider.dart
- screens/ayuda/ayuda_screen.dart
- screens/ayuda/chat_screen.dart
- screens/ayuda/explicacion_screen.dart

## Notas Importantes

1. Todos los providers deben registrarse en `main.dart` dentro de `MultiProvider`

2. Las nuevas pantallas deben agregarse a la navegacion en `home_screen.dart`

3. Usar los widgets compartidos de SAM:
   - CustomButton
   - CustomTextField
   - LoadingWidget
   - ErrorDisplayWidget

4. Usar HttpService para todas las peticiones HTTP (ya incluye el token automaticamente)

5. Usar StorageService si necesitan guardar datos localmente
