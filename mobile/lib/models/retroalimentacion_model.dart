// lib/models/retroalimentacion_model.dart
// [LUZIA] Modelo para retroalimentaciones generadas por IA

class RetroalimentacionModel {
  final int id;
  final int usuarioId;
  final String tipo; // 'ejercicio', 'quiz', 'general', 'codigo'
  final String contenido;
  final Map<String, dynamic>? contextoOriginal;
  final DateTime timestamp;
  final bool generadoPorLlm;
  final String? modeloUsado;

  RetroalimentacionModel({
    required this.id,
    required this.usuarioId,
    required this.tipo,
    required this.contenido,
    this.contextoOriginal,
    required this.timestamp,
    this.generadoPorLlm = true,
    this.modeloUsado,
  });

  // ============================================
  // FACTORY CONSTRUCTORS
  // ============================================

  factory RetroalimentacionModel.fromJson(Map<String, dynamic> json) {
    return RetroalimentacionModel(
      id: json['id'] as int? ?? 0,
      usuarioId: json['usuario_id'] as int? ?? json['usuarioId'] as int? ?? 0,
      tipo: json['tipo'] as String? ?? 
            json['tipo_retroalimentacion'] as String? ?? 
            'general',
      contenido: json['contenido'] as String? ?? 
                 json['contenido_retroalimentacion'] as String? ?? 
                 '',
      contextoOriginal: json['contexto_original'] as Map<String, dynamic>? ??
                        json['contextoOriginal'] as Map<String, dynamic>?,
      timestamp: json['fecha_generacion'] != null
          ? DateTime.parse(json['fecha_generacion'] as String)
          : json['timestamp'] != null
              ? DateTime.parse(json['timestamp'] as String)
              : DateTime.now(),
      generadoPorLlm: json['generado_por_llm'] as bool? ?? 
                      json['generadoPorLlm'] as bool? ?? 
                      true,
      modeloUsado: json['modelo_llm_usado'] as String? ?? 
                   json['modeloUsado'] as String?,
    );
  }

  // ============================================
  // SERIALIZATION
  // ============================================

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'usuario_id': usuarioId,
      'tipo': tipo,
      'contenido': contenido,
      if (contextoOriginal != null) 'contexto_original': contextoOriginal,
      'timestamp': timestamp.toIso8601String(),
      'generado_por_llm': generadoPorLlm,
      if (modeloUsado != null) 'modelo_llm_usado': modeloUsado,
    };
  }

  // ============================================
  // HELPERS
  // ============================================

  /// Icono segun el tipo de retroalimentacion
  String get iconoTipo {
    switch (tipo.toLowerCase()) {
      case 'ejercicio':
        return '💻';
      case 'quiz':
        return '📝';
      case 'codigo':
        return '🔍';
      case 'general':
      default:
        return '💡';
    }
  }

  /// Titulo formateado segun el tipo
  String get tituloTipo {
    switch (tipo.toLowerCase()) {
      case 'ejercicio':
        return 'Retroalimentación de Ejercicio';
      case 'quiz':
        return 'Retroalimentación de Quiz';
      case 'codigo':
        return 'Análisis de Código';
      case 'general':
      default:
        return 'Retroalimentación General';
    }
  }

  /// Fecha formateada para mostrar
  String get fechaFormateada {
    final dia = timestamp.day.toString().padLeft(2, '0');
    final mes = timestamp.month.toString().padLeft(2, '0');
    final anio = timestamp.year;
    return '$dia/$mes/$anio';
  }

  /// Fecha y hora formateada
  String get fechaHoraFormateada {
    final hora = timestamp.hour.toString().padLeft(2, '0');
    final minuto = timestamp.minute.toString().padLeft(2, '0');
    return '${fechaFormateada} $hora:$minuto';
  }

  /// Contenido resumido para preview
  String get contenidoResumido {
    if (contenido.length <= 100) return contenido;
    return '${contenido.substring(0, 100)}...';
  }

  // ============================================
  // COPY WITH
  // ============================================

  RetroalimentacionModel copyWith({
    int? id,
    int? usuarioId,
    String? tipo,
    String? contenido,
    Map<String, dynamic>? contextoOriginal,
    DateTime? timestamp,
    bool? generadoPorLlm,
    String? modeloUsado,
  }) {
    return RetroalimentacionModel(
      id: id ?? this.id,
      usuarioId: usuarioId ?? this.usuarioId,
      tipo: tipo ?? this.tipo,
      contenido: contenido ?? this.contenido,
      contextoOriginal: contextoOriginal ?? this.contextoOriginal,
      timestamp: timestamp ?? this.timestamp,
      generadoPorLlm: generadoPorLlm ?? this.generadoPorLlm,
      modeloUsado: modeloUsado ?? this.modeloUsado,
    );
  }

  @override
  String toString() {
    return 'RetroalimentacionModel(id: $id, tipo: $tipo, usuarioId: $usuarioId)';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is RetroalimentacionModel && other.id == id;
  }

  @override
  int get hashCode => id.hashCode;
}

// ============================================
// MODELO PARA EXPLICACION DE CODIGO
// ============================================

class ExplicacionCodigoModel {
  final String explicacionGeneral;
  final List<LineaExplicada> lineas;
  final List<String> conceptosClave;
  final List<String> sugerencias;

  ExplicacionCodigoModel({
    required this.explicacionGeneral,
    required this.lineas,
    required this.conceptosClave,
    required this.sugerencias,
  });

  factory ExplicacionCodigoModel.fromJson(Map<String, dynamic> json) {
    return ExplicacionCodigoModel(
      explicacionGeneral: json['explicacion_general'] as String? ?? 
                          json['explicacionGeneral'] as String? ?? 
                          '',
      lineas: (json['lineas'] as List<dynamic>?)
              ?.map((l) => LineaExplicada.fromJson(l as Map<String, dynamic>))
              .toList() ?? [],
      conceptosClave: (json['conceptos_clave'] as List<dynamic>?)
              ?.map((c) => c as String)
              .toList() ?? 
                      (json['conceptosClave'] as List<dynamic>?)
              ?.map((c) => c as String)
              .toList() ?? [],
      sugerencias: (json['sugerencias'] as List<dynamic>?)
              ?.map((s) => s as String)
              .toList() ?? [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'explicacion_general': explicacionGeneral,
      'lineas': lineas.map((l) => l.toJson()).toList(),
      'conceptos_clave': conceptosClave,
      'sugerencias': sugerencias,
    };
  }
}

class LineaExplicada {
  final int numero;
  final String codigo;
  final String explicacion;

  LineaExplicada({
    required this.numero,
    required this.codigo,
    required this.explicacion,
  });

  factory LineaExplicada.fromJson(Map<String, dynamic> json) {
    return LineaExplicada(
      numero: json['numero'] as int? ?? 0,
      codigo: json['codigo'] as String? ?? '',
      explicacion: json['explicacion'] as String? ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'numero': numero,
      'codigo': codigo,
      'explicacion': explicacion,
    };
  }
}

// ============================================
// MODELO PARA ANALISIS DE CODIGO
// ============================================

class AnalisisCodigoModel {
  final bool esValido;
  final String? error;
  final String retroalimentacion;
  final List<String> sugerencias;
  final int? puntuacion;

  AnalisisCodigoModel({
    required this.esValido,
    this.error,
    required this.retroalimentacion,
    required this.sugerencias,
    this.puntuacion,
  });

  factory AnalisisCodigoModel.fromJson(Map<String, dynamic> json) {
    return AnalisisCodigoModel(
      esValido: json['esValido'] as bool? ?? 
                json['es_valido'] as bool? ?? 
                json['correcto'] as bool? ?? 
                false,
      error: json['error'] as String?,
      retroalimentacion: json['retroalimentacion'] as String? ?? 
                         json['feedback'] as String? ?? 
                         json['mensaje'] as String? ?? 
                         '',
      sugerencias: (json['sugerencias'] as List<dynamic>?)
              ?.map((s) => s as String)
              .toList() ?? [],
      puntuacion: json['puntuacion'] as int? ?? json['score'] as int?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'esValido': esValido,
      if (error != null) 'error': error,
      'retroalimentacion': retroalimentacion,
      'sugerencias': sugerencias,
      if (puntuacion != null) 'puntuacion': puntuacion,
    };
  }
}
