// lib/models/intento_ejercicio_model.dart

class IntentoEjercicioModel {
  final int id;
  final int ejercicioId;
  final int usuarioId;
  final String? codigoEnviado;
  final String resultado; // 'correcto', 'incorrecto', 'error'
  final String? retroalimentacion;
  final String? retroalimentacionLlm;
  final int puntosObtenidos;
  final DateTime? timestampEnvio;

  IntentoEjercicioModel({
    required this.id,
    required this.ejercicioId,
    required this.usuarioId,
    this.codigoEnviado,
    required this.resultado,
    this.retroalimentacion,
    this.retroalimentacionLlm,
    this.puntosObtenidos = 0,
    this.timestampEnvio,
  });

  // Getters útiles
  bool get esCorrecto => resultado.toLowerCase() == 'correcto';
  bool get esIncorrecto => resultado.toLowerCase() == 'incorrecto';
  bool get esError => resultado.toLowerCase() == 'error';

  String get resultadoFormateado {
    switch (resultado.toLowerCase()) {
      case 'correcto':
        return '✓ Correcto';
      case 'incorrecto':
        return '✗ Incorrecto';
      case 'error':
        return '⚠ Error';
      default:
        return resultado;
    }
  }

  // Obtener retroalimentación combinada
  String get retroalimentacionCompleta {
    final partes = <String>[];
    if (retroalimentacion != null && retroalimentacion!.isNotEmpty) {
      partes.add(retroalimentacion!);
    }
    if (retroalimentacionLlm != null && retroalimentacionLlm!.isNotEmpty) {
      partes.add(retroalimentacionLlm!);
    }
    return partes.join('\n\n');
  }

  // Formatear fecha
  String get fechaFormateada {
    if (timestampEnvio == null) return 'Sin fecha';
    final fecha = timestampEnvio!;
    return '${fecha.day}/${fecha.month}/${fecha.year} ${fecha.hour.toString().padLeft(2, '0')}:${fecha.minute.toString().padLeft(2, '0')}';
  }

  // Tiempo relativo
  String get tiempoRelativo {
    if (timestampEnvio == null) return '';
    final ahora = DateTime.now();
    final diferencia = ahora.difference(timestampEnvio!);

    if (diferencia.inMinutes < 1) return 'Hace un momento';
    if (diferencia.inMinutes < 60) return 'Hace ${diferencia.inMinutes} min';
    if (diferencia.inHours < 24) return 'Hace ${diferencia.inHours} horas';
    if (diferencia.inDays < 7) return 'Hace ${diferencia.inDays} días';
    return fechaFormateada;
  }

  // Crear desde JSON
  factory IntentoEjercicioModel.fromJson(Map<String, dynamic> json) {
    return IntentoEjercicioModel(
      id: json['id'] ?? 0,
      ejercicioId: json['ejercicioId'] ?? json['ejercicio_id'] ?? 0,
      usuarioId: json['usuarioId'] ?? json['usuario_id'] ?? 0,
      codigoEnviado: json['codigoEnviado'] ?? json['codigo_enviado'],
      resultado: json['resultado'] ?? 'error',
      retroalimentacion: json['retroalimentacion'],
      retroalimentacionLlm: json['retroalimentacionLlm'] ?? json['retroalimentacion_llm'],
      puntosObtenidos: json['puntosObtenidos'] ?? json['puntos_obtenidos'] ?? 0,
      timestampEnvio: json['timestampEnvio'] != null
          ? DateTime.tryParse(json['timestampEnvio'].toString())
          : json['timestamp'] != null
              ? DateTime.tryParse(json['timestamp'].toString())
              : null,
    );
  }

  // Convertir a JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'ejercicioId': ejercicioId,
      'usuarioId': usuarioId,
      'codigoEnviado': codigoEnviado,
      'resultado': resultado,
      'retroalimentacion': retroalimentacion,
      'retroalimentacionLlm': retroalimentacionLlm,
      'puntosObtenidos': puntosObtenidos,
      'timestampEnvio': timestampEnvio?.toIso8601String(),
    };
  }

  // Crear copia con modificaciones
  IntentoEjercicioModel copyWith({
    int? id,
    int? ejercicioId,
    int? usuarioId,
    String? codigoEnviado,
    String? resultado,
    String? retroalimentacion,
    String? retroalimentacionLlm,
    int? puntosObtenidos,
    DateTime? timestampEnvio,
  }) {
    return IntentoEjercicioModel(
      id: id ?? this.id,
      ejercicioId: ejercicioId ?? this.ejercicioId,
      usuarioId: usuarioId ?? this.usuarioId,
      codigoEnviado: codigoEnviado ?? this.codigoEnviado,
      resultado: resultado ?? this.resultado,
      retroalimentacion: retroalimentacion ?? this.retroalimentacion,
      retroalimentacionLlm: retroalimentacionLlm ?? this.retroalimentacionLlm,
      puntosObtenidos: puntosObtenidos ?? this.puntosObtenidos,
      timestampEnvio: timestampEnvio ?? this.timestampEnvio,
    );
  }

  @override
  String toString() {
    return 'IntentoEjercicioModel(id: $id, resultado: $resultado, puntos: $puntosObtenidos)';
  }
}