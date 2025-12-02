# mobile

# Asistente de Programacion - App Mobile

Aplicacion movil desarrollada en Flutter para el proyecto de Asistente de Aprendizaje de Programacion.

## Descripcion

Esta aplicacion permite a los estudiantes acceder al sistema de aprendizaje de programacion desde sus dispositivos moviles. Incluye autenticacion, gestion de perfil y navegacion principal.

## Modulo Implementado: SAM (Autenticacion y Perfil)

### Funcionalidades

- Splash Screen con verificacion de sesion
- Registro de usuario
- Inicio de sesion con JWT
- Almacenamiento seguro de tokens
- Refresh token automatico
- Ver perfil de usuario
- Editar perfil
- Cerrar sesion
- Navegacion principal (Bottom Navigation Bar)
- Dashboard con estadisticas (placeholder)

## Requisitos Previos

### 1. Flutter SDK

Descargar e instalar Flutter desde: https://docs.flutter.dev/get-started/install

Verificar instalacion:
```bash
flutter doctor
```

### 2. Android Studio

Descargar desde: https://developer.android.com/studio

Instalar los siguientes plugins en Android Studio:
- Flutter
- Dart

### 3. Emulador Android o Dispositivo Fisico

**Opcion A: Emulador**
1. Abrir Android Studio
2. Tools -> Device Manager
3. Create Device -> Seleccionar Pixel 5 -> Next
4. Descargar imagen del sistema (API 33 o superior) -> Next -> Finish
5. Iniciar el emulador con el boton Play

**Opcion B: Dispositivo Fisico**
1. Activar Opciones de desarrollador en el telefono
2. Activar Depuracion USB
3. Activar Instalacion por USB (importante en Xiaomi/Redmi)
4. Conectar por cable USB
5. Aceptar la depuracion USB en el telefono

## Instalacion

### 1. Clonar el repositorio (si no lo tienes)

```bash
git clone <url-del-repositorio>
cd proyecto-asistente-AprendizajeProgramacion
```

### 2. Instalar dependencias de Flutter

```bash
cd mobile
flutter pub get
```

### 3. Verificar dispositivos disponibles

```bash
flutter devices
```

Debe mostrar al menos un dispositivo (emulador o fisico).

## Configuracion

### Configurar URL del Backend

Editar el archivo `lib/config/constants.dart`:

```dart
class AppConstants {
  // Para emulador Android:
  static const String baseUrl = 'http://10.0.2.2:3000';
  
  // Para dispositivo fisico, usar la IP de tu computadora:
  // static const String baseUrl = 'http://192.168.1.XXX:3000';
  
  // Para produccion (Render):
  // static const String baseUrl = 'https://tu-app.onrender.com';
```

**Como obtener tu IP local (para dispositivo fisico):**

Windows:
```bash
ipconfig
```
Buscar "IPv4 Address" (ejemplo: 192.168.1.100)

Mac/Linux:
```bash
ifconfig
```

**Importante:** El telefono y la computadora deben estar en la misma red WiFi.

## Ejecucion

### 1. Iniciar el Backend

En una terminal separada:
```bash
cd backend
npm install
npm run dev
```

Verificar que muestre: "Servidor corriendo en puerto 3000"

### 2. Iniciar la App Mobile

```bash
cd mobile
flutter run
```

Si hay multiples dispositivos, seleccionar el deseado o especificarlo:
```bash
flutter run -d <device-id>
```

### 3. Hot Reload y Hot Restart

Mientras la app esta corriendo:
- Presionar `r` para hot reload (cambios rapidos)
- Presionar `R` para hot restart (reinicio completo)
- Presionar `q` para salir

## Estructura del Proyecto

```
mobile/
├── lib/
│   ├── config/
│   │   ├── constants.dart      # URLs y constantes
│   │   └── theme.dart          # Tema y estilos
│   ├── models/
│   │   └── usuario_model.dart  # Modelo de usuario
│   ├── providers/
│   │   └── auth_provider.dart  # Logica de autenticacion
│   ├── services/
│   │   ├── http_service.dart   # Cliente HTTP con interceptor
│   │   └── storage_service.dart # Almacenamiento de tokens
│   ├── screens/
│   │   ├── splash_screen.dart
│   │   ├── auth/
│   │   │   ├── login_screen.dart
│   │   │   └── register_screen.dart
│   │   ├── profile/
│   │   │   ├── profile_screen.dart
│   │   │   └── edit_profile_screen.dart
│   │   └── home/
│   │       └── home_screen.dart
│   ├── widgets/
│   │   ├── custom_button.dart
│   │   ├── custom_text_field.dart
│   │   ├── loading_widget.dart
│   │   └── error_widget.dart
│   └── main.dart
├── android/                    # Configuracion Android
├── ios/                        # Configuracion iOS
├── pubspec.yaml               # Dependencias
└── README.md
```

## Dependencias Principales

| Paquete | Version | Descripcion |
|---------|---------|-------------|
| provider| ^6.1.2 | State management |
| dio     | ^5.4.3 | Cliente HTTP |
| shared_preferences | ^2.2.2 | Almacenamiento local |
| flutter_secure_storage | ^9.2.2 | Almacenamiento seguro de tokens |
| google_fonts | ^6.2.1 | Fuentes de Google |

## Solucion de Problemas

### Error: "No devices available"

- Verificar que el emulador este corriendo o el dispositivo conectado
- Ejecutar `flutter devices` para ver dispositivos disponibles

### Error: "Connection refused" o "Error de conexion"

1. Verificar que el backend este corriendo
2. Verificar la URL en `constants.dart`
3. Para dispositivo fisico:
   - Usar la IP de la computadora, no localhost
   - Verificar que esten en la misma red WiFi
   - Desactivar temporalmente el firewall de Windows

### Error: "Install canceled by user" (Xiaomi/Redmi)

1. Ir a Configuracion -> Opciones de desarrollador
2. Activar "Instalar via USB"
3. Activar "Depuracion USB (Configuracion de seguridad)"

### Error: "NDK not found"

1. Eliminar carpeta: `C:\Users\<tu-usuario>\AppData\Local\Android\sdk\ndk\`
2. Ejecutar:
   ```bash
   flutter clean
   flutter pub get
   flutter run
   ```

### Error de compilacion con CardTheme

En `lib/config/theme.dart`, cambiar `CardTheme` por `CardThemeData`:
```dart
cardTheme: CardThemeData(
  // ...
),
```

### Limpiar proyecto

```bash
flutter clean
flutter pub get
```

## Pruebas Funcionales

Para verificar que todo funciona correctamente:

1. **Registro**: Crear una cuenta nueva con email, nombre, apellido y contrasena
2. **Login**: Cerrar sesion e iniciar con las credenciales creadas
3. **Perfil**: Verificar que se muestren los datos del usuario
4. **Editar Perfil**: Cambiar nombre o apellido y guardar
5. **Persistencia**: Cerrar la app completamente y volver a abrirla (debe mantener la sesion)
6. **Logout**: Cerrar sesion y verificar que redirige al login

## Credenciales de Prueba

Si ya tienes usuarios en el backend:
- Email: sam@test.com
- Password: test123

O registra un usuario nuevo desde la app.



## Contacto

Desarrollado por: Samuel Aguilar Ambrosio (SAM)

Proyecto para la materia: Desarrollo de Servicios Web
Instituto Tecnologico de Oaxaca
