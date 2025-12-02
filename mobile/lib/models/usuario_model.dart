// lib/models/usuario_model.dart

class UsuarioModel {
  final int id;
  final String email;
  final String nombre;
  final String apellido;
  final String rol;
  final String? matricula;
  final String? fotoPerfil;
  final String? estado;
  final DateTime? fechaRegistro;

  UsuarioModel({
    required this.id,
    required this.email,
    required this.nombre,
    required this.apellido,
    required this.rol,
    this.matricula,
    this.fotoPerfil,
    this.estado,
    this.fechaRegistro,
  });

  // Getter para nombre completo
  String get nombreCompleto => '$nombre $apellido';

  // Verificar si es estudiante
  bool get esEstudiante => rol == 'estudiante';

  // Verificar si es profesor
  bool get esProfesor => rol == 'profesor';

  // Verificar si es admin
  bool get esAdmin => rol == 'admin';

  // Obtener iniciales para avatar
  String get iniciales {
    final n = nombre.isNotEmpty ? nombre[0].toUpperCase() : '';
    final a = apellido.isNotEmpty ? apellido[0].toUpperCase() : '';
    return '$n$a';
  }

  // Crear desde JSON
  factory UsuarioModel.fromJson(Map<String, dynamic> json) {
    return UsuarioModel(
      id: json['id'] ?? 0,
      email: json['email'] ?? '',
      nombre: json['nombre'] ?? '',
      apellido: json['apellido'] ?? '',
      rol: json['rol'] ?? 'estudiante',
      matricula: json['matricula'],
      fotoPerfil: json['fotoPerfil'] ?? json['foto_perfil'],
      estado: json['estado'],
      fechaRegistro: json['fechaRegistro'] != null 
          ? DateTime.tryParse(json['fechaRegistro'].toString())
          : null,
    );
  }

  // Convertir a JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'nombre': nombre,
      'apellido': apellido,
      'rol': rol,
      'matricula': matricula,
      'fotoPerfil': fotoPerfil,
      'estado': estado,
      'fechaRegistro': fechaRegistro?.toIso8601String(),
    };
  }

  // Crear copia con modificaciones
  UsuarioModel copyWith({
    int? id,
    String? email,
    String? nombre,
    String? apellido,
    String? rol,
    String? matricula,
    String? fotoPerfil,
    String? estado,
    DateTime? fechaRegistro,
  }) {
    return UsuarioModel(
      id: id ?? this.id,
      email: email ?? this.email,
      nombre: nombre ?? this.nombre,
      apellido: apellido ?? this.apellido,
      rol: rol ?? this.rol,
      matricula: matricula ?? this.matricula,
      fotoPerfil: fotoPerfil ?? this.fotoPerfil,
      estado: estado ?? this.estado,
      fechaRegistro: fechaRegistro ?? this.fechaRegistro,
    );
  }

  @override
  String toString() {
    return 'UsuarioModel(id: $id, email: $email, nombre: $nombreCompleto, rol: $rol)';
  }
}