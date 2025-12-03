// lib/models/ejercicio_model.dart

class EjercicioModel {
  final int id;
  final int subtemaId;
  final String enunciado;
  final String dificultad; // 'facil', 'intermedio', 'dificil'
  final String? codigoBase;
  final String tipoEjercicio; // 'codigo_abierto', 'opcion_multiple', 'llenar_blancos'
  final String? lenguajeProgramacion;
  final int puntosMaximos;
  final bool? resuelto; // Indica si el usuario ya lo resolvió
  final int? intentos; // Cantidad de intentos del usuario

  // NUEVOS CAMPOS AGREGADOS para ejercicios no-código
  final List<Map<String, dynamic>>? opcionesRespuesta;
  final String? textoConEspacios;
  final List<String>? respuestasCorrectas;

  EjercicioModel({
    required this.id,
    required this.subtemaId,
    required this.enunciado,
    required this.dificultad,
    this.codigoBase,
    required this.tipoEjercicio,
    this.lenguajeProgramacion,
    this.puntosMaximos = 10,
    this.resuelto,
    this.intentos,
    // Inicialización de nuevos campos
    this.opcionesRespuesta,
    this.textoConEspacios,
    this.respuestasCorrectas,
  });

  // Getters útiles
  bool get esFacil => dificultad.toLowerCase() == 'facil' || dificultad.toLowerCase() == 'básica';
  bool get esIntermedio => dificultad.toLowerCase() == 'intermedio' || dificultad.toLowerCase() == 'intermedia';
  bool get esDificil => dificultad.toLowerCase() == 'dificil' || dificultad.toLowerCase() == 'avanzada';

  String get dificultadNormalizada {
    final d = dificultad.toLowerCase();
    if (d == 'facil' || d == 'fácil' || d == 'básica' || d == 'basica') return 'Fácil';
    if (d == 'intermedio' || d == 'intermedia') return 'Intermedio';
    if (d == 'dificil' || d == 'difícil' || d == 'avanzada' || d == 'avanzado') return 'Difícil';
    return dificultad;
  }

  String get tipoEjercicioFormateado {
    switch (tipoEjercicio.toLowerCase()) {
      case 'codigo_abierto':
      case 'codificación':
      case 'codificacion':
        return 'Código Abierto';
      case 'opcion_multiple':
      case 'múltiple':
      case 'multiple':
        return 'Opción Múltiple';
      case 'llenar_blancos':
      case 'completar':
        return 'Completar';
      default:
        return tipoEjercicio;
    }
  }

  // Obtener resumen del enunciado (primeras palabras)
  String get enunciadoResumido {
    if (enunciado.length <= 100) return enunciado;
    return '${enunciado.substring(0, 100)}...';
  }

  // Crear desde JSON
  factory EjercicioModel.fromJson(Map<String, dynamic> json) {

    // FIX DE ROBUSTEZ: Helper para asegurar que el booleano se parsee correctamente
    bool? parseBool(dynamic value) {
      if (value is bool) return value;
      if (value is int) return value != 0;
      if (value is String) return value.toLowerCase() == 'true';
      return null;
    }

    // Helper para parsear la lista de respuestas correctas (String[])
    List<String>? parseRespuestas(dynamic list) {
      if (list is List) {
        return list.whereType<String>().toList();
      }
      return null;
    }

    // Helper para parsear las opciones de respuesta (Array de objetos JSON)
    List<Map<String, dynamic>>? parseOpciones(dynamic list) {
      if (list is List) {
        return list
            .whereType<Map<String, dynamic>>()
            .toList();
      }
      return null;
    }

    return EjercicioModel(
      id: json['id'] ?? 0,
      subtemaId: json['subtemaId'] ?? json['subtema_id'] ?? 0,
      enunciado: json['enunciado'] ?? '',
      dificultad: json['dificultad'] ?? 'intermedio',
      codigoBase: json['codigoBase'] ?? json['codigo_base'],
      tipoEjercicio: json['tipoEjercicio'] ?? json['tipo_ejercicio'] ?? 'codificacion',
      lenguajeProgramacion: json['lenguajeProgramacion'] ?? json['lenguaje_programacion'],
      puntosMaximos: json['puntosMaximos'] ?? json['puntos_maximos'] ?? 10,
      resuelto: parseBool(json['resuelto']), // ⬅️ FIX APLICADO AQUÍ
      intentos: json['intentos'],
      // PARSEO DE NUEVOS CAMPOS
      opcionesRespuesta: parseOpciones(json['opcionesRespuesta'] ?? json['opciones_respuesta']),
      textoConEspacios: json['textoConEspacios'] ?? json['texto_con_espacios'],
      respuestasCorrectas: parseRespuestas(json['respuestasCorrectas'] ?? json['respuestas_correctas']),
    );
  }

  // Convertir a JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'subtemaId': subtemaId,
      'enunciado': enunciado,
      'dificultad': dificultad,
      'codigoBase': codigoBase,
      'tipoEjercicio': tipoEjercicio,
      'lenguajeProgramacion': lenguajeProgramacion,
      'puntosMaximos': puntosMaximos,
      'resuelto': resuelto,
      'intentos': intentos,
      // NUEVOS CAMPOS
      'opcionesRespuesta': opcionesRespuesta,
      'textoConEspacios': textoConEspacios,
      'respuestasCorrectas': respuestasCorrectas,
    };
  }

  // Crear copia con modificaciones
  EjercicioModel copyWith({
    int? id,
    int? subtemaId,
    String? enunciado,
    String? dificultad,
    String? codigoBase,
    String? tipoEjercicio,
    String? lenguajeProgramacion,
    int? puntosMaximos,
    bool? resuelto,
    int? intentos,
    // Nuevos campos en copyWith
    List<Map<String, dynamic>>? opcionesRespuesta,
    String? textoConEspacios,
    List<String>? respuestasCorrectas,
  }) {
    return EjercicioModel(
      id: id ?? this.id,
      subtemaId: subtemaId ?? this.subtemaId,
      enunciado: enunciado ?? this.enunciado,
      dificultad: dificultad ?? this.dificultad,
      codigoBase: codigoBase ?? this.codigoBase,
      tipoEjercicio: tipoEjercicio ?? this.tipoEjercicio,
      lenguajeProgramacion: lenguajeProgramacion ?? this.lenguajeProgramacion,
      puntosMaximos: puntosMaximos ?? this.puntosMaximos,
      resuelto: resuelto ?? this.resuelto,
      intentos: intentos ?? this.intentos,
      // Copiar nuevos campos
      opcionesRespuesta: opcionesRespuesta ?? this.opcionesRespuesta,
      textoConEspacios: textoConEspacios ?? this.textoConEspacios,
      respuestasCorrectas: respuestasCorrectas ?? this.respuestasCorrectas,
    );
  }

  @override
  String toString() {
    return 'EjercicioModel(id: $id, enunciado: $enunciadoResumido, dificultad: $dificultad)';
  }
}


