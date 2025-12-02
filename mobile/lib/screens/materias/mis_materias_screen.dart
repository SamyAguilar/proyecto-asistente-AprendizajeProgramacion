import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/materia_provider.dart';
import '../../providers/progreso_provider.dart';
import '../../widgets/materia_card.dart';
import 'materia_detail_screen.dart';

class MisMateriasScreen extends StatefulWidget {
  const MisMateriasScreen({Key? key}) : super(key: key);

  @override
  State<MisMateriasScreen> createState() => _MisMateriasScreenState();
}

class _MisMateriasScreenState extends State<MisMateriasScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _cargarMisMaterias();
    });
  }

  Future<void> _cargarMisMaterias() async {
    final materiaProvider = context.read<MateriaProvider>();
    final progresoProvider = context.read<ProgresoProvider>();

    await materiaProvider.obtenerMisMaterias();
    await progresoProvider.obtenerMiProgreso();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Mis Materias'),
        automaticallyImplyLeading: false,
      ),
      body: Consumer2<MateriaProvider, ProgresoProvider>(
        builder: (context, materiaProvider, progresoProvider, child) {
          if (materiaProvider.isLoading) {
            return const Center(
              child: CircularProgressIndicator(),
            );
          }

          if (materiaProvider.error != null) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.error_outline,
                    size: 64,
                    color: Colors.grey[400],
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Error al cargar tus materias',
                    style: TextStyle(
                      fontSize: 16,
                      color: Colors.grey[600],
                    ),
                  ),
                  const SizedBox(height: 8),
                  ElevatedButton(
                    onPressed: _cargarMisMaterias,
                    child: const Text('Reintentar'),
                  ),
                ],
              ),
            );
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
                  const SizedBox(height: 16),
                  ElevatedButton.icon(
                    onPressed: () {
                      // Navegar a la pestaña de materias disponibles
                      Navigator.pop(context);
                    },
                    icon: const Icon(Icons.add),
                    label: const Text('Explorar Materias'),
                  ),
                ],
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: _cargarMisMaterias,
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: misMaterias.length,
              itemBuilder: (context, index) {
                final materia = misMaterias[index];
                final progreso =
                    progresoProvider.getProgresoPorMateria(materia.id);

                return Padding(
                  padding: const EdgeInsets.only(bottom: 16),
                  child: MateriaCard(
                    materia: materia,
                    isMatriculado: true,
                    showProgress: true, 
                    progreso: progreso,
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) =>
                              MateriaDetailScreen(materia: materia),
                        ),
                      );
                    },
                  ),
                );
              },
            ),
          );
        },
      ),
    );
  }
}