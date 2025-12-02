// lib/models/intento_quiz_model.dart

class IntentoQuizModel {
  final int id;
  final int usuarioId;
  final int preguntaId;
  final int opcionSeleccionadaId;
  final bool esCorrecta;
  final DateTime? timestampRespuesta;
  final int puntosObtenidos;
  final String? retroalimentacion;

  IntentoQuizModel({
    required this.id,
    required this.usuarioId,
    required this.preguntaId,
    required this.opcionSeleccionadaId,
    required this.esCorrecta,
    this.timestampRespuesta,
    this.puntosObtenidos = 0,
    this.retroalimentacion,
  });

  // Getters útiles
  String get resultadoTexto => esCorrecta ? '✓ Correcta' : '✗ Incorrecta';

  // Formatear fecha
  String get fechaFormateada {
    if (timestampRespuesta == null) return 'Sin fecha';
    final fecha = timestampRespuesta!;
    return '${fecha.day}/${fecha.month}/${fecha.year} ${fecha.hour.toString().padLeft(2, '0')}:${fecha.minute.toString().padLeft(2, '0')}';
  }

  // Tiempo relativo
  String get tiempoRelativo {
    if (timestampRespuesta == null) return '';
    final ahora = DateTime.now();
    final diferencia = ahora.difference(timestampRespuesta!);

    if (diferencia.inMinutes < 1) return 'Hace un momento';
    if (diferencia.inMinutes < 60) return 'Hace ${diferencia.inMinutes} min';
    if (diferencia.inHours < 24) return 'Hace ${diferencia.inHours} horas';
    if (diferencia.inDays < 7) return 'Hace ${diferencia.inDays} días';
    return fechaFormateada;
  }

  // Crear desde JSON
  factory IntentoQuizModel.fromJson(Map<String, dynamic> json) {
    return IntentoQuizModel(
      id: json['id'] ?? 0,
      usuarioId: json['usuarioId'] ?? json['usuario_id'] ?? 0,
      preguntaId: json['preguntaId'] ?? json['pregunta_id'] ?? 0,
      opcionSeleccionadaId: json['opcionSeleccionadaId'] ?? json['opcion_seleccionada_id'] ?? json['opcion_seleccionada'] ?? 0,
      esCorrecta: json['esCorrecta'] ?? json['es_correcta'] ?? false,
      timestampRespuesta: json['timestampRespuesta'] != null
          ? DateTime.tryParse(json['timestampRespuesta'].toString())
          : json['timestamp'] != null
              ? DateTime.tryParse(json['timestamp'].toString())
              : null,
      puntosObtenidos: json['puntosObtenidos'] ?? json['puntos_obtenidos'] ?? 0,
      retroalimentacion: json['retroalimentacion'] ?? json['explicacion'],
    );
  }

  // Convertir a JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'usuarioId': usuarioId,
      'preguntaId': preguntaId,
      'opcionSeleccionadaId': opcionSeleccionadaId,
      'esCorrecta': esCorrecta,
      'timestampRespuesta': timestampRespuesta?.toIso8601String(),
      'puntosObtenidos': puntosObtenidos,
      'retroalimentacion': retroalimentacion,
    };
  }

  // Crear copia con modificaciones
  IntentoQuizModel copyWith({
    int? id,
    int? usuarioId,
    int? preguntaId,
    int? opcionSeleccionadaId,
    bool? esCorrecta,
    DateTime? timestampRespuesta,
    int? puntosObtenidos,
    String? retroalimentacion,
  }) {
    return IntentoQuizModel(
      id: id ?? this.id,
      usuarioId: usuarioId ?? this.usuarioId,
      preguntaId: preguntaId ?? this.preguntaId,
      opcionSeleccionadaId: opcionSeleccionadaId ?? this.opcionSeleccionadaId,
      esCorrecta: esCorrecta ?? this.esCorrecta,
      timestampRespuesta: timestampRespuesta ?? this.timestampRespuesta,
      puntosObtenidos: puntosObtenidos ?? this.puntosObtenidos,
      retroalimentacion: retroalimentacion ?? this.retroalimentacion,
    );
  }

  @override
  String toString() {
    return 'IntentoQuizModel(id: $id, preguntaId: $preguntaId, esCorrecta: $esCorrecta)';
  }
}

// Modelo para los resultados agregados del quiz
class ResultadosQuizModel {
  final int totalIntentos;
  final int correctas;
  final int incorrectas;
  final double porcentajeAciertos;
  final int puntosTotal;
  final List<IntentoQuizModel> intentos;

  ResultadosQuizModel({
    required this.totalIntentos,
    required this.correctas,
    required this.incorrectas,
    required this.porcentajeAciertos,
    required this.puntosTotal,
    this.intentos = const [],
  });

  // Crear desde JSON
  factory ResultadosQuizModel.fromJson(Map<String, dynamic> json) {
    List<IntentoQuizModel> intentosList = [];
    
    if (json['intentos'] != null) {
      intentosList = (json['intentos'] as List)
          .map((i) => IntentoQuizModel.fromJson(i))
          .toList();
    }

    return ResultadosQuizModel(
      totalIntentos: json['totalIntentos'] ?? json['total_intentos'] ?? json['total'] ?? 0,
      correctas: json['correctas'] ?? json['aciertos'] ?? 0,
      incorrectas: json['incorrectas'] ?? json['errores'] ?? 0,
      porcentajeAciertos: (json['porcentajeAciertos'] ?? json['porcentaje_aciertos'] ?? json['porcentaje'] ?? 0).toDouble(),
      puntosTotal: json['puntosTotal'] ?? json['puntos_total'] ?? json['puntos'] ?? 0,
      intentos: intentosList,
    );
  }

  // Crear desde lista de intentos (cálculo local)
  factory ResultadosQuizModel.fromIntentos(List<IntentoQuizModel> intentos) {
    final correctas = intentos.where((i) => i.esCorrecta).length;
    final total = intentos.length;
    
    return ResultadosQuizModel(
      totalIntentos: total,
      correctas: correctas,
      incorrectas: total - correctas,
      porcentajeAciertos: total > 0 ? (correctas / total) * 100 : 0,
      puntosTotal: intentos.fold(0, (sum, i) => sum + i.puntosObtenidos),
      intentos: intentos,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'totalIntentos': totalIntentos,
      'correctas': correctas,
      'incorrectas': incorrectas,
      'porcentajeAciertos': porcentajeAciertos,
      'puntosTotal': puntosTotal,
      'intentos': intentos.map((i) => i.toJson()).toList(),
    };
  }
}
