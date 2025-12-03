import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/tema_model.dart';
import '../../providers/contenido_provider.dart';
import '../../providers/progreso_provider.dart';
import '../../widgets/progreso_bar.dart';
import '../../widgets/subtema_card.dart';
import 'subtema_detail_screen.dart';

class TemaDetailScreen extends StatefulWidget {
  final TemaModel tema;

  const TemaDetailScreen({Key? key, required this.tema}) : super(key: key);

  @override
  State<TemaDetailScreen> createState() => _TemaDetailScreenState();
}

class _TemaDetailScreenState extends State<TemaDetailScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _cargarDatos();
    });
  }

  Future<void> _cargarDatos() async {
    final contenidoProvider = context.read<ContenidoProvider>();
    // Solo cargar los subtemas, el progreso ya viene cargado
    await contenidoProvider.listarSubtemasPorTema(widget.tema.id);
  }

  Future<void> _refrescarDatos() async {
    final contenidoProvider = context.read<ContenidoProvider>();
    final progresoProvider = context.read<ProgresoProvider>();

    await contenidoProvider.listarSubtemasPorTema(widget.tema.id);
    // Forzar recarga del progreso del tema
    await progresoProvider.obtenerProgresoTema(widget.tema.id, forceRefresh: true);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Tema ${widget.tema.orden}'),
      ),
      body: RefreshIndicator(
        onRefresh: _refrescarDatos,
        child: Consumer2<ContenidoProvider, ProgresoProvider>(
          builder: (context, contenidoProvider, progresoProvider, child) {
            final progreso = progresoProvider.getProgresoPorTema(widget.tema.id);
            final subtemas = contenidoProvider.subtemas;

            return SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Header con info del tema
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(24),
                    color: Theme.of(context).primaryColor,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          widget.tema.nombre,
                          style: const TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                        const SizedBox(height: 16),
                        ProgresoBar(
                          progreso: progreso,
                          label: 'Progreso',
                          height: 10,
                          useDynamicColors: true, // Usar colores dinámicos
                          backgroundColor: Colors.white.withOpacity(0.3),
                        ),
                      ],
                    ),
                  ),

                  // Descripción del tema
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
                          widget.tema.descripcion ?? 'Sin descripción disponible', // ✅ ARREGLADO
                          style: TextStyle(
                            fontSize: 15,
                            color: Colors.grey[700],
                            height: 1.5,
                          ),
                        ),
                        const SizedBox(height: 24),
                        const Text(
                          'Contenido',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 12),
                        Text(
                          widget.tema.contenido ?? 'Sin contenido disponible', // ✅ ARREGLADO
                          style: TextStyle(
                            fontSize: 15,
                            color: Colors.grey[700],
                            height: 1.5,
                          ),
                        ),
                      ],
                    ),
                  ),

                  const Divider(height: 1),

                  // Lista de subtemas
                  Padding(
                    padding: const EdgeInsets.all(24),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Subtemas',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        if (subtemas.isNotEmpty)
                          Text(
                            '${subtemas.length} subtemas',
                            style: TextStyle(
                              fontSize: 14,
                              color: Colors.grey[600],
                            ),
                          ),
                      ],
                    ),
                  ),

                  if (contenidoProvider.isLoading)
                    const Center(
                      child: Padding(
                        padding: EdgeInsets.all(32.0),
                        child: CircularProgressIndicator(),
                      ),
                    )
                  else if (subtemas.isEmpty)
                    Center(
                      child: Padding(
                        padding: const EdgeInsets.all(32.0),
                        child: Text(
                          'No hay subtemas disponibles',
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
                      itemCount: subtemas.length,
                      itemBuilder: (context, index) {
                        final subtema = subtemas[index];
                        final isCompletado = false;

                        return SubtemaCard(
                          subtema: subtema,
                          isCompletado: isCompletado,
                          onTap: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (context) => SubtemaDetailScreen(
                                  subtema: subtema,
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
      ),
    );
  }
}