// lib/models/pregunta_quiz_model.dart

import 'opcion_respuesta_model.dart';

class PreguntaQuizModel {
  final int id;
  final int subtemaId;
  final String preguntaTexto;
  final String? dificultad;
  final String? retroalimentacionCorrecta;
  final String? retroalimentacionIncorrecta;
  final List<OpcionRespuestaModel> opciones;

  PreguntaQuizModel({
    required this.id,
    required this.subtemaId,
    required this.preguntaTexto,
    this.dificultad,
    this.retroalimentacionCorrecta,
    this.retroalimentacionIncorrecta,
    this.opciones = const [],
  });

  // Getters útiles
  String get dificultadNormalizada {
    if (dificultad == null) return 'Normal';
    final d = dificultad!.toLowerCase();
    if (d == 'facil' || d == 'fácil' || d == 'básica' || d == 'basica') return 'Fácil';
    if (d == 'intermedio' || d == 'intermedia') return 'Intermedio';
    if (d == 'dificil' || d == 'difícil' || d == 'avanzada' || d == 'avanzado') return 'Difícil';
    return dificultad!;
  }

  // Obtener cantidad de opciones
  int get cantidadOpciones => opciones.length;

  // Verificar si tiene opciones
  bool get tieneOpciones => opciones.isNotEmpty;

  // Crear desde JSON
  factory PreguntaQuizModel.fromJson(Map<String, dynamic> json) {
    List<OpcionRespuestaModel> opcionesList = [];
    
    if (json['opciones'] != null) {
      opcionesList = (json['opciones'] as List)
          .map((o) => OpcionRespuestaModel.fromJson(o))
          .toList();
    }

    return PreguntaQuizModel(
      id: json['id'] ?? 0,
      subtemaId: json['subtemaId'] ?? json['subtema_id'] ?? 0,
      preguntaTexto: json['preguntaTexto'] ?? json['pregunta_texto'] ?? json['texto'] ?? '',
      dificultad: json['dificultad'],
      retroalimentacionCorrecta: json['retroalimentacionCorrecta'] ?? json['retroalimentacion_correcta'],
      retroalimentacionIncorrecta: json['retroalimentacionIncorrecta'] ?? json['retroalimentacion_incorrecta'],
      opciones: opcionesList,
    );
  }

  // Convertir a JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'subtemaId': subtemaId,
      'preguntaTexto': preguntaTexto,
      'dificultad': dificultad,
      'retroalimentacionCorrecta': retroalimentacionCorrecta,
      'retroalimentacionIncorrecta': retroalimentacionIncorrecta,
      'opciones': opciones.map((o) => o.toJson()).toList(),
    };
  }

  // Crear copia con modificaciones
  PreguntaQuizModel copyWith({
    int? id,
    int? subtemaId,
    String? preguntaTexto,
    String? dificultad,
    String? retroalimentacionCorrecta,
    String? retroalimentacionIncorrecta,
    List<OpcionRespuestaModel>? opciones,
  }) {
    return PreguntaQuizModel(
      id: id ?? this.id,
      subtemaId: subtemaId ?? this.subtemaId,
      preguntaTexto: preguntaTexto ?? this.preguntaTexto,
      dificultad: dificultad ?? this.dificultad,
      retroalimentacionCorrecta: retroalimentacionCorrecta ?? this.retroalimentacionCorrecta,
      retroalimentacionIncorrecta: retroalimentacionIncorrecta ?? this.retroalimentacionIncorrecta,
      opciones: opciones ?? this.opciones,
    );
  }

  @override
  String toString() {
    return 'PreguntaQuizModel(id: $id, pregunta: ${preguntaTexto.substring(0, preguntaTexto.length > 50 ? 50 : preguntaTexto.length)}...)';
  }
}