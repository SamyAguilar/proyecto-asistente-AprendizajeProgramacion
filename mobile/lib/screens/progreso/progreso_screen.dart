import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/materia_provider.dart';
import '../../providers/progreso_provider.dart';
import '../../widgets/progreso_bar.dart';
import '../materias/materia_detail_screen.dart';

class ProgresoScreen extends StatefulWidget {
  const ProgresoScreen({Key? key}) : super(key: key);

  @override
  State<ProgresoScreen> createState() => _ProgresoScreenState();
}

class _ProgresoScreenState extends State<ProgresoScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _cargarProgreso();
    });
  }

  Future<void> _cargarProgreso() async {
    final materiaProvider = context.read<MateriaProvider>();
    final progresoProvider = context.read<ProgresoProvider>();

    await materiaProvider.obtenerMisMaterias();
    await progresoProvider.obtenerMiProgreso();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Mi Progreso'),
        centerTitle: true,
      ),
      body: RefreshIndicator(
        onRefresh: _cargarProgreso,
        child: Consumer2<MateriaProvider, ProgresoProvider>(
          builder: (context, materiaProvider, progresoProvider, child) {
            if (materiaProvider.isLoading || progresoProvider.isLoading) {
              return const Center(child: CircularProgressIndicator());
            }

            final misMaterias = materiaProvider.misMaterias;

            if (misMaterias.isEmpty) {
              return Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.school_outlined,
                      size: 64,
                      color: Colors.grey[400],
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'No estás matriculado en ninguna materia',
                      style: TextStyle(
                        fontSize: 16,
                        color: Colors.grey[600],
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              );
            }

            return ListView.builder(
              itemCount: misMaterias.length,
              itemBuilder: (context, index) {
                final materia = misMaterias[index];
                final progreso = progresoProvider.getProgresoPorMateria(materia.id);
                final estado = progresoProvider.getEstadoPorMateria(materia.id);

                return Card(
                  margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  child: ListTile(
                    title: Text(
                      materia.nombre,
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    subtitle: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const SizedBox(height: 8),
                        ProgresoBar(
                          progreso: progreso,
                          height: 10,
                        ),
                        const SizedBox(height: 8),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              '${progreso.toStringAsFixed(0)}% completado',
                              style: TextStyle(
                                fontSize: 12,
                                color: Colors.grey[600],
                              ),
                            ),
                            Text(
                              _getEstadoTexto(estado),
                              style: TextStyle(
                                fontSize: 12,
                                color: _getEstadoColor(estado),
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                    trailing: const Icon(Icons.chevron_right),
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => MateriaDetailScreen(materia: materia),
                        ),
                      );
                    },
                  ),
                );
              },
            );
          },
        ),
      ),
    );
  }

  String _getEstadoTexto(String estado) {
    switch (estado) {
      case 'no_iniciado':
        return 'No iniciado';
      case 'en_progreso':
        return 'En progreso';
      case 'completado':
        return 'Completado';
      default:
        return estado;
    }
  }

  Color _getEstadoColor(String estado) {
    switch (estado) {
      case 'no_iniciado':
        return Colors.grey;
      case 'en_progreso':
        return Colors.orange;
      case 'completado':
        return Colors.green;
      default:
        return Colors.grey;
    }
  }
}