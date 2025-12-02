import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/progreso_provider.dart';
import '../../providers/materia_provider.dart';
import '../../widgets/estadistica_card.dart';
import '../../widgets/progreso_circular.dart';
import 'materia_detail_screen.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({Key? key}) : super(key: key);

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  Map<String, dynamic>? _estadisticas;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _cargarDashboard();
    });
  }

  Future<void> _cargarDashboard() async {
    final materiaProvider = context.read<MateriaProvider>();
    final progresoProvider = context.read<ProgresoProvider>();

    await materiaProvider.obtenerMisMaterias();
    await progresoProvider.obtenerMiProgreso();

    final stats = await progresoProvider.obtenerProgresoGeneral();
    if (mounted) {
      setState(() {
        _estadisticas = stats;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Dashboard'),
        automaticallyImplyLeading: false,
      ),
      body: RefreshIndicator(
        onRefresh: _cargarDashboard,
        child: Consumer2<MateriaProvider, ProgresoProvider>(
          builder: (context, materiaProvider, progresoProvider, child) {
            if (materiaProvider.isLoading || progresoProvider.isLoading) {
              return const Center(
                child: CircularProgressIndicator(),
              );
            }

            final misMaterias = materiaProvider.misMaterias;
            final materiasEnProgreso = misMaterias.where((materia) {
              final progreso =
                  progresoProvider.getProgresoPorMateria(materia.id);
              return progreso > 0 && progreso < 100;
            }).toList();

            // Calcular estadísticas locales
            final totalMaterias = misMaterias.length;
            final progresoPromedio = totalMaterias > 0
                ? misMaterias
                        .map((m) =>
                            progresoProvider.getProgresoPorMateria(m.id))
                        .reduce((a, b) => a + b) /
                    totalMaterias
                : 0.0;

            final materiasCompletadas = misMaterias
                .where((m) =>
                    progresoProvider.getProgresoPorMateria(m.id) == 100)
                .length;

            return SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Saludo
                    Text(
                      '¡Hola! 👋',
                      style: Theme.of(context).textTheme.headlineMedium,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Aquí está tu resumen de aprendizaje',
                      style: TextStyle(
                        fontSize: 16,
                        color: Colors.grey[600],
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Tarjetas de estadísticas ✅ ARREGLADO
                    GridView.count(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      crossAxisCount: 2,
                      childAspectRatio: 1.3,
                      crossAxisSpacing: 16,
                      mainAxisSpacing: 16,
                      children: [
                        EstadisticaCard(
                          icono: Icons.school, // ✅ Cambié "icon" a "icono"
                          titulo: 'Materias',
                          valor: totalMaterias.toString(),
                          subtitulo: 'Matriculadas',
                          color: Colors.blue,
                        ),
                        EstadisticaCard(
                          icono: Icons.trending_up, // ✅ Cambié "icon" a "icono"
                          titulo: 'Progreso',
                          valor: '${progresoPromedio.toStringAsFixed(0)}%',
                          subtitulo: 'Promedio',
                          color: Colors.green,
                        ),
                        EstadisticaCard(
                          icono: Icons.play_circle, // ✅ Cambié "icon" a "icono"
                          titulo: 'En progreso',
                          valor: materiasEnProgreso.length.toString(),
                          subtitulo: 'Materias',
                          color: Colors.orange,
                        ),
                        EstadisticaCard(
                          icono: Icons.check_circle, // ✅ Cambié "icon" a "icono"
                          titulo: 'Completadas',
                          valor: materiasCompletadas.toString(),
                          subtitulo: 'Materias',
                          color: Colors.purple,
                        ),
                      ],
                    ),

                    const SizedBox(height: 32),

                    // Continuar donde lo dejaste
                    if (materiasEnProgreso.isNotEmpty) ...[
                      const Text(
                        'Continuar donde lo dejaste',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 16),
                      ...materiasEnProgreso.take(3).map((materia) {
                        final progreso =
                            progresoProvider.getProgresoPorMateria(materia.id);
                        return Padding(
                          padding: const EdgeInsets.only(bottom: 12),
                          child: Card(
                            child: ListTile(
                              leading: CircleAvatar(
                                backgroundColor: Theme.of(context)
                                    .primaryColor
                                    .withOpacity(0.1),
                                child: Icon(
                                  Icons.book,
                                  color: Theme.of(context).primaryColor,
                                ),
                              ),
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
                                    height: 6,
                                    // ✅ QUITADO: showPercentage: false,
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    '${progreso.toStringAsFixed(0)}% completado',
                                    style: TextStyle(
                                      fontSize: 12,
                                      color: Colors.grey[600],
                                    ),
                                  ),
                                ],
                              ),
                              trailing: const Icon(Icons.arrow_forward_ios,
                                  size: 16),
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
                          ),
                        );
                      }).toList(),
                    ],

                    // Estado vacío
                    if (misMaterias.isEmpty) ...[
                      const SizedBox(height: 32),
                      Center(
                        child: Column(
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
                                // TODO: Navegar a lista de materias
                              },
                              icon: const Icon(Icons.add),
                              label: const Text('Explorar Materias'),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}