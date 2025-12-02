import '../../providers/materia_provider.dart';
import '../../providers/contenido_provider.dart';
import '../../providers/progreso_provider.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/materia_model.dart';
import '../../models/tema_model.dart';
import '../../providers/contenido_provider.dart';
import '../../widgets/tema_card.dart';
import '../../widgets/progreso_bar.dart';
import 'tema_detail_screen.dart';

class MateriaDetailScreen extends StatefulWidget {
  final MateriaModel materia;

  const MateriaDetailScreen({Key? key, required this.materia})
      : super(key: key);

  @override
  State<MateriaDetailScreen> createState() => _MateriaDetailScreenState();
}

class _MateriaDetailScreenState extends State<MateriaDetailScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _cargarDatos();
    });
  }

  Future<void> _cargarDatos() async {
    final contenidoProvider = context.read<ContenidoProvider>();
    final progresoProvider = context.read<ProgresoProvider>();

    await contenidoProvider.listarTemasConProgreso(widget.materia.id);
    await progresoProvider.obtenerProgresoMateria(widget.materia.id);
  }

  Future<void> _matricularMateria() async {
    final materiaProvider = context.read<MateriaProvider>();

    final confirmacion = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Matricular Materia'),
        content: Text('¿Deseas matricularte en ${widget.materia.nombre}?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancelar'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Matricular'),
          ),
        ],
      ),
    );

    if (confirmacion == true) {
      final exito = await materiaProvider.matricularMateria(widget.materia.id);

      if (exito && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Materia matriculada exitosamente'),
            backgroundColor: Colors.green,
          ),
        );
        await _cargarDatos();
      } else if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(materiaProvider.error ?? 'Error al matricular'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.materia.codigo),
      ),
      body: Consumer3<MateriaProvider, ContenidoProvider, ProgresoProvider>(
        builder: (context, materiaProvider, contenidoProvider,
            progresoProvider, child) {
          final isMatriculado = materiaProvider.misMaterias
              .any((m) => m.id == widget.materia.id);
          final progreso =
              progresoProvider.getProgresoPorMateria(widget.materia.id);
          final temas = contenidoProvider.temas;

          return SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header con info de la materia
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(24),
                  color: Theme.of(context).primaryColor,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        widget.materia.nombre,
                        style: const TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          _buildInfoChip(
                            Icons.school,
                            'Semestre ${widget.materia.semestre}',
                          ),
                          const SizedBox(width: 12),
                          _buildInfoChip(
                            Icons.star,
                            '${widget.materia.creditos} créditos',
                          ),
                        ],
                      ),
                      if (isMatriculado) ...[
                        const SizedBox(height: 16),
                        ProgresoBar(
                          progreso: progreso,
                          height: 10,
                          color: Colors.white,
                        ),
                      ],
                    ],
                  ),
                ),

                // Descripción
                Padding(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Descripción',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 12),
                      Text(
                        widget.materia.descripcion ?? 'Sin descripción disponible',
                        style: TextStyle(
                          fontSize: 15,
                          color: Colors.grey[700],
                          height: 1.5,
                        ),
                      ),
                    ],
                  ),
                ),

                // Botón de matricular (si no está matriculado)
                if (!isMatriculado)
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 24),
                    child: SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        onPressed: materiaProvider.isLoading
                            ? null
                            : _matricularMateria,
                        icon: const Icon(Icons.add_circle_outline),
                        label: const Text('Matricular Materia'),
                        style: ElevatedButton.styleFrom(
                          padding: const EdgeInsets.all(16),
                        ),
                      ),
                    ),
                  ),

                const SizedBox(height: 24),

                // Lista de temas
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Temas',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      if (temas.isNotEmpty)
                        Text(
                          '${temas.length} temas',
                          style: TextStyle(
                            fontSize: 14,
                            color: Colors.grey[600],
                          ),
                        ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),

                if (contenidoProvider.isLoading)
                  const Center(
                    child: Padding(
                      padding: EdgeInsets.all(32.0),
                      child: CircularProgressIndicator(),
                    ),
                  )
                else if (temas.isEmpty)
                  Center(
                    child: Padding(
                      padding: const EdgeInsets.all(32.0),
                      child: Text(
                        'No hay temas disponibles',
                        style: TextStyle(
                          color: Colors.grey[600],
                        ),
                      ),
                    ),
                  )
                else
                  ListView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    padding: const EdgeInsets.symmetric(horizontal: 24),
                    itemCount: temas.length,
                    itemBuilder: (context, index) {
                      final tema = temas[index];
                      final progresoTema =
                          progresoProvider.getProgresoPorTema(tema.id);

                      return TemaCard(
                        tema: tema,
                        progreso: progresoTema,
                        onTap: () {
                          // ✅ NAVEGACIÓN CORREGIDA: Pasamos el objeto tema completo
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => TemaDetailScreen(
                                tema: tema,
                              ),
                            ),
                          );
                        },
                      );
                    },
                  ),

                const SizedBox(height: 24),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildInfoChip(IconData icon, String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.2),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: Colors.white),
          const SizedBox(width: 6),
          Text(
            label,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 13,
            ),
          ),
        ],
      ),
    );
  }
}