class TemaModel {
  final int id;
  final int materiaId;
  final String nombre;
  final String? descripcion;
  final String? contenido;
  final int? orden;
  final DateTime? fechaCreacion;
  final int? totalSubtemas;

  TemaModel({
    required this.id,
    required this.materiaId,
    required this.nombre,
    this.descripcion,
    this.contenido,
    this.orden,
    this.fechaCreacion,
    this.totalSubtemas,
  });

  factory TemaModel.fromJson(Map<String, dynamic> json) {
    return TemaModel(
      id: json['id'] as int,
      materiaId: json['materiaId'] as int? ?? json['materia_id'] as int,
      nombre: json['nombre'] as String,
      descripcion: json['descripcion'] as String?,
      contenido: json['contenido'] as String?,
      orden: json['orden'] as int?,
      fechaCreacion: json['fechaCreacion'] != null
          ? DateTime.parse(json['fechaCreacion'] as String)
          : json['fecha_creacion'] != null
              ? DateTime.parse(json['fecha_creacion'] as String)
              : null,
      totalSubtemas: json['totalSubtemas'] as int? ?? json['total_subtemas'] as int? ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'materiaId': materiaId,
      'nombre': nombre,
      'descripcion': descripcion,
      'contenido': contenido,
      'orden': orden,
      'fechaCreacion': fechaCreacion?.toIso8601String(),
      'totalSubtemas': totalSubtemas,
    };
  }
}