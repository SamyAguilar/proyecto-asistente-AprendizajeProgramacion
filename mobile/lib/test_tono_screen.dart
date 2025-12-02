import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'features/materias/providers/providers.dart';
import 'features/materias/widgets/widgets.dart';

class TestTonoScreen extends StatefulWidget {
  const TestTonoScreen({Key? key}) : super(key: key);

  @override
  State<TestTonoScreen> createState() => _TestTonoScreenState();
}

class _TestTonoScreenState extends State<TestTonoScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _cargarDatos();
    });
  }

  Future<void> _cargarDatos() async {
    final materiaProvider = context.read<MateriaProvider>();
    await materiaProvider.listarMaterias();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('🧪 Prueba Módulo de Toño'),
        backgroundColor: Theme.of(context).primaryColor,
      ),
      body: Consumer<MateriaProvider>(
        builder: (context, materiaProvider, child) {
          // Estado de carga
          if (materiaProvider.isLoading) {
            return const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  CircularProgressIndicator(),
                  SizedBox(height: 16),
                  Text('Cargando materias...'),
                ],
              ),
            );
          }

          // Estado de error
          if (materiaProvider.error != null) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.error_outline, size: 64, color: Colors.red),
                    const SizedBox(height: 16),
                    const Text(
                      'Error al cargar materias',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      materiaProvider.error!,
                      textAlign: TextAlign.center,
                      style: TextStyle(color: Colors.grey[600]),
                    ),
                    const SizedBox(height: 24),
                    ElevatedButton.icon(
                      onPressed: _cargarDatos,
                      icon: const Icon(Icons.refresh),
                      label: const Text('Reintentar'),
                    ),
                  ],
                ),
              ),
            );
          }

          final materias = materiaProvider.materias;

          // Estado vacío
          if (materias.isEmpty) {
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
                    'No hay materias disponibles',
                    style: TextStyle(
                      fontSize: 16,
                      color: Colors.grey[600],
                    ),
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: _cargarDatos,
                    child: const Text('Recargar'),
                  ),
                ],
              ),
            );
          }

          // Lista de materias
          return RefreshIndicator(
            onRefresh: _cargarDatos,
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: materias.length,
              itemBuilder: (context, index) {
                final materia = materias[index];
                return Padding(
                  padding: const EdgeInsets.only(bottom: 16),
                  child: MateriaCard(
                    materia: materia,
                    onTap: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text('✅ Seleccionaste: ${materia.nombre}'),
                          backgroundColor: Colors.green,
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
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          showDialog(
            context: context,
            builder: (context) => AlertDialog(
              title: const Text('ℹ️ Info de Prueba'),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('✅ Providers: Funcionando'),
                  const Text('✅ Widgets: Cargados'),
                  const Text('✅ Modelos: OK'),
                  const SizedBox(height: 16),
                  Text(
                    'Total materias: ${context.read<MateriaProvider>().materias.length}',
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                ],
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text('Cerrar'),
                ),
              ],
            ),
          );
        },
        child: const Icon(Icons.info_outline),
      ),
    );
  }
}