// lib/models/mensaje_chat_model.dart
// [LUZIA] Modelo para mensajes del chat con el asistente IA

import 'dart:math';

class MensajeChatModel {
  final String id;
  final String rol; // 'usuario' o 'asistente'
  final String contenido;
  final DateTime timestamp;
  final List<String>? sugerencias; // Sugerencias que puede dar LUZIA

  MensajeChatModel({
    String? id,
    required this.rol,
    required this.contenido,
    DateTime? timestamp,
    this.sugerencias,
  })  : id = id ?? _generateId(),
        timestamp = timestamp ?? DateTime.now();

  /// Genera un ID unico sin dependencias externas
  static String _generateId() {
    final random = Random();
    final timestamp = DateTime.now().millisecondsSinceEpoch;
    final randomPart = random.nextInt(999999).toString().padLeft(6, '0');
    return 'msg_${timestamp}_$randomPart';
  }

  // ============================================
  // FACTORY CONSTRUCTORS
  // ============================================

  /// Crear mensaje del usuario
  factory MensajeChatModel.usuario(String contenido) {
    return MensajeChatModel(
      rol: 'usuario',
      contenido: contenido,
    );
  }

  /// Crear mensaje del asistente (LUZIA)
  factory MensajeChatModel.asistente(String contenido, {List<String>? sugerencias}) {
    return MensajeChatModel(
      rol: 'asistente',
      contenido: contenido,
      sugerencias: sugerencias,
    );
  }

  /// Crear desde JSON (respuesta del backend)
  factory MensajeChatModel.fromJson(Map<String, dynamic> json) {
    return MensajeChatModel(
      id: json['id'] as String?,
      rol: json['rol'] as String? ?? 'asistente',
      contenido: json['contenido'] as String? ?? json['respuesta'] as String? ?? '',
      timestamp: json['timestamp'] != null 
          ? DateTime.parse(json['timestamp'] as String)
          : DateTime.now(),
      sugerencias: json['sugerencias'] != null
          ? List<String>.from(json['sugerencias'] as List)
          : null,
    );
  }

  // ============================================
  // SERIALIZATION
  // ============================================

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'rol': rol,
      'contenido': contenido,
      'timestamp': timestamp.toIso8601String(),
      if (sugerencias != null) 'sugerencias': sugerencias,
    };
  }

  // ============================================
  // HELPERS
  // ============================================

  bool get esUsuario => rol == 'usuario';
  bool get esAsistente => rol == 'asistente';
  bool get tieneSugerencias => sugerencias != null && sugerencias!.isNotEmpty;

  /// Formato de hora para mostrar en UI
  String get horaFormateada {
    final hora = timestamp.hour.toString().padLeft(2, '0');
    final minuto = timestamp.minute.toString().padLeft(2, '0');
    return '$hora:$minuto';
  }

  // ============================================
  // COPY WITH
  // ============================================

  MensajeChatModel copyWith({
    String? id,
    String? rol,
    String? contenido,
    DateTime? timestamp,
    List<String>? sugerencias,
  }) {
    return MensajeChatModel(
      id: id ?? this.id,
      rol: rol ?? this.rol,
      contenido: contenido ?? this.contenido,
      timestamp: timestamp ?? this.timestamp,
      sugerencias: sugerencias ?? this.sugerencias,
    );
  }

  @override
  String toString() {
    return 'MensajeChatModel(id: $id, rol: $rol, contenido: ${contenido.substring(0, contenido.length > 50 ? 50 : contenido.length)}...)';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is MensajeChatModel && other.id == id;
  }

  @override
  int get hashCode => id.hashCode;
}
