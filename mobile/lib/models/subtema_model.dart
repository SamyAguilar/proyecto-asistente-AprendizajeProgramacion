class SubtemaModel {
  final int id;
  final int temaId;
  final String nombre;
  final String descripcion;
  final String contenidoDetalle;
  final int orden;
  final DateTime fechaCreacion;

  SubtemaModel({
    required this.id,
    required this.temaId,
    required this.nombre,
    required this.descripcion,
    required this.contenidoDetalle,
    required this.orden,
    required this.fechaCreacion,
  });

  factory SubtemaModel.fromJson(Map<String, dynamic> json) {
    return SubtemaModel(
      id: json['id'] as int,
      temaId: json['temaId'] as int,
      nombre: json['nombre'] as String,
      descripcion: json['descripcion'] as String,
      contenidoDetalle: json['contenidoDetalle'] as String,
      orden: json['orden'] as int,
      fechaCreacion: DateTime.parse(json['fechaCreacion'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'temaId': temaId,
      'nombre': nombre,
      'descripcion': descripcion,
      'contenidoDetalle': contenidoDetalle,
      'orden': orden,
      'fechaCreacion': fechaCreacion.toIso8601String(),
    };
  }
}