class ProgresoModel {
  final int id;
  final int usuarioId;
  final int? materiaId;
  final int? temaId;
  final int? subtemaId;
  final String estado; // 'no_iniciado', 'en_progreso', 'completado'
  final double porcentajeCompletado;

  ProgresoModel({
    required this.id,
    required this.usuarioId,
    this.materiaId,
    this.temaId,
    this.subtemaId,
    required this.estado,
    required this.porcentajeCompletado,
  });

  factory ProgresoModel.fromJson(Map<String, dynamic> json) {
    return ProgresoModel(
      id: json['id'] as int,
      usuarioId: json['usuarioId'] as int,
      materiaId: json['materiaId'] as int?,
      temaId: json['temaId'] as int?,
      subtemaId: json['subtemaId'] as int?,
      estado: json['estado'] as String,
      porcentajeCompletado: (json['porcentajeCompletado'] ?? 0).toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'usuarioId': usuarioId,
      'materiaId': materiaId,
      'temaId': temaId,
      'subtemaId': subtemaId,
      'estado': estado,
      'porcentajeCompletado': porcentajeCompletado,
    };
  }

  // Helper para saber si está completado
  bool get isCompletado => estado == 'completado';
  bool get isEnProgreso => estado == 'en_progreso';
  bool get isNoIniciado => estado == 'no_iniciado';
}