class MateriaModel {
  final int id;
  final String nombre;
  final String codigo;
  final String? descripcion;
  final int? semestre;
  final int? creditos;
  final dynamic prerequisitos;
  final int? totalTemas;
  final DateTime? fechaCreacion;

  MateriaModel({
    required this.id,
    required this.nombre,
    required this.codigo,
    this.descripcion,
    this.semestre,
    this.creditos,
    this.prerequisitos,
    this.totalTemas,
    this.fechaCreacion,
  });

  factory MateriaModel.fromJson(Map<String, dynamic> json) {
    return MateriaModel(
      id: json['id'] as int,
      nombre: json['nombre'] as String,
      codigo: json['codigo'] as String,
      descripcion: json['descripcion'] as String?,
      semestre: json['semestre'] as int?,
      creditos: json['creditos'] as int?,
      prerequisitos: json['prerequisitos'],
      totalTemas: json['totalTemas'] as int? ?? 0,
      fechaCreacion: json['fechaCreacion'] != null
          ? DateTime.parse(json['fechaCreacion'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'nombre': nombre,
      'codigo': codigo,
      'descripcion': descripcion,
      'semestre': semestre,
      'creditos': creditos,
      'prerequisitos': prerequisitos,
      'totalTemas': totalTemas,
      'fechaCreacion': fechaCreacion?.toIso8601String(),
    };
  }

  List<String> get prerequisitosLista {
    if (prerequisitos == null) return [];
    if (prerequisitos is List) {
      return List<String>.from(prerequisitos);
    }
    if (prerequisitos is String) {
      return (prerequisitos as String)
          .split(',')
          .map((e) => e.trim())
          .where((e) => e.isNotEmpty)
          .toList();
    }
    return [];
  }
}