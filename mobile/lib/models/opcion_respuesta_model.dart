// lib/models/opcion_respuesta_model.dart

class OpcionRespuestaModel {
  final int id;
  final int preguntaId;
  final String textoOpcion;
  final int orden;
  final String? explicacion;
  // NOTA: esCorrecta NO se incluye porque es secreto (viene del backend solo después de responder)

  OpcionRespuestaModel({
    required this.id,
    required this.preguntaId,
    required this.textoOpcion,
    this.orden = 0,
    this.explicacion,
  });

  // Obtener letra de la opción (A, B, C, D...)
  String get letra {
    if (orden >= 0 && orden < 26) {
      return String.fromCharCode(65 + orden); // A=65 en ASCII
    }
    return (orden + 1).toString();
  }

  // Crear desde JSON
  factory OpcionRespuestaModel.fromJson(Map<String, dynamic> json) {
    return OpcionRespuestaModel(
      id: json['id'] ?? 0,
      preguntaId: json['preguntaId'] ?? json['pregunta_id'] ?? 0,
      textoOpcion: json['textoOpcion'] ?? json['texto_opcion'] ?? json['texto'] ?? '',
      orden: json['orden'] ?? 0,
      explicacion: json['explicacion'],
    );
  }

  // Convertir a JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'preguntaId': preguntaId,
      'textoOpcion': textoOpcion,
      'orden': orden,
      'explicacion': explicacion,
    };
  }

  // Crear copia con modificaciones
  OpcionRespuestaModel copyWith({
    int? id,
    int? preguntaId,
    String? textoOpcion,
    int? orden,
    String? explicacion,
  }) {
    return OpcionRespuestaModel(
      id: id ?? this.id,
      preguntaId: preguntaId ?? this.preguntaId,
      textoOpcion: textoOpcion ?? this.textoOpcion,
      orden: orden ?? this.orden,
      explicacion: explicacion ?? this.explicacion,
    );
  }

  @override
  String toString() {
    return 'OpcionRespuestaModel(id: $id, letra: $letra, texto: $textoOpcion)';
  }
}