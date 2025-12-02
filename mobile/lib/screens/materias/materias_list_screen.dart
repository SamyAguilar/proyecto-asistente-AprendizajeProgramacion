// lib/screens/materias/materias_list_screen.dart

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/materia_model.dart';
import '../../providers/materia_provider.dart';
import '../../providers/progreso_provider.dart';
import '../../widgets/materia_card.dart';
import 'materia_detail_screen.dart';

class MateriasListScreen extends StatefulWidget {
  const MateriasListScreen({Key? key}) : super(key: key);

  @override
  State<MateriasListScreen> createState() => _MateriasListScreenState();
}

class _MateriasListScreenState extends State<MateriasListScreen> {
  final TextEditingController _searchController = TextEditingController();
  List<MateriaModel> _materiasFiltradasLocal = [];
  bool _isBuscando = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _cargarMaterias();
    });
  }

  Future<void> _cargarMaterias() async {
    final materiaProvider = context.read<MateriaProvider>();
    await materiaProvider.listarMaterias();
    await materiaProvider.obtenerMisMaterias();
  }

  Future<void> _buscarMaterias(String query) async {
    if (query.isEmpty) {
      setState(() {
        _isBuscando = false;
        _materiasFiltradasLocal = [];
      });
      return;
    }

    setState(() => _isBuscando = true);

    final materiaProvider = context.read<MateriaProvider>();
    final resultados = await materiaProvider.buscarMaterias(query);

    setState(() {
      _materiasFiltradasLocal = resultados;
      _isBuscando = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    // ✅ Detectar si estamos en modo oscuro
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;
    
    return Scaffold(
      appBar: AppBar(
        title: const Text('Materias Disponibles'),
        automaticallyImplyLeading: false,
      ),
      body: Column(
        children: [
          // ✅ Barra de búsqueda ADAPTABLE
          Container(
            padding: const EdgeInsets.all(16),
            color: isDarkMode 
                ? Theme.of(context).primaryColor.withOpacity(0.1)
                : Theme.of(context).primaryColor.withOpacity(0.05),
            child: TextField(
              controller: _searchController,
              onChanged: _buscarMaterias,
              style: TextStyle(
                color: isDarkMode ? Colors.white : Colors.black87,
                fontSize: 16,
              ),
              decoration: InputDecoration(
                hintText: 'Buscar materias...',
                hintStyle: TextStyle(
                  color: isDarkMode 
                      ? Colors.white.withOpacity(0.6)
                      : Colors.black45,
                ),
                prefixIcon: Icon(
                  Icons.search,
                  color: isDarkMode ? Colors.white70 : Colors.black54,
                ),
                suffixIcon: _searchController.text.isNotEmpty
                    ? IconButton(
                        icon: Icon(
                          Icons.clear,
                          color: isDarkMode ? Colors.white70 : Colors.black54,
                        ),
                        onPressed: () {
                          _searchController.clear();
                          _buscarMaterias('');
                        },
                      )
                    : null,
                filled: true,
                fillColor: isDarkMode 
                    ? Colors.white.withOpacity(0.15)
                    : Colors.white.withOpacity(0.8),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(
                    color: isDarkMode 
                        ? Colors.white.withOpacity(0.3)
                        : Colors.black.withOpacity(0.1),
                    width: 1,
                  ),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(
                    color: Theme.of(context).primaryColor,
                    width: 2,
                  ),
                ),
              ),
            ),
          ),

          // Lista de materias
          Expanded(
            child: Consumer2<MateriaProvider, ProgresoProvider>(
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
                          'Error al cargar materias',
                          style: TextStyle(
                            fontSize: 16,
                            color: Colors.grey[600],
                          ),
                        ),
                        const SizedBox(height: 8),
                        ElevatedButton(
                          onPressed: _cargarMaterias,
                          child: const Text('Reintentar'),
                        ),
                      ],
                    ),
                  );
                }

                final materias = _searchController.text.isNotEmpty
                    ? _materiasFiltradasLocal
                    : materiaProvider.materias;

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
                          _searchController.text.isNotEmpty
                              ? 'No se encontraron materias'
                              : 'No hay materias disponibles',
                          style: TextStyle(
                            fontSize: 16,
                            color: Colors.grey[600],
                          ),
                        ),
                      ],
                    ),
                  );
                }

                return RefreshIndicator(
                  onRefresh: _cargarMaterias,
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: materias.length,
                    itemBuilder: (context, index) {
                      final materia = materias[index];
                      final isMatriculado = materiaProvider.misMaterias
                          .any((m) => m.id == materia.id);
                      final progreso =
                          progresoProvider.getProgresoPorMateria(materia.id);

                      return Padding(
                        padding: const EdgeInsets.only(bottom: 16),
                        child: MateriaCard(
                          materia: materia,
                          isMatriculado: isMatriculado,
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
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }
}