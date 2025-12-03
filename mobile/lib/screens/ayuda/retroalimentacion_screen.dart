// lib/screens/ayuda/retroalimentacion_screen.dart
// [LUZIA] Pantalla para ver retroalimentaciones del usuario

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/gemini_provider.dart';
import '../../providers/auth_provider.dart';
import '../../models/retroalimentacion_model.dart';
import '../../widgets/loading_widget.dart';
import '../../widgets/error_widget.dart';

class RetroalimentacionScreen extends StatefulWidget {
  const RetroalimentacionScreen({super.key});

  @override
  State<RetroalimentacionScreen> createState() => _RetroalimentacionScreenState();
}

class _RetroalimentacionScreenState extends State<RetroalimentacionScreen> {
  String _filtroTipo = 'todos';

  @override
  void initState() {
    super.initState();
    _cargarRetroalimentaciones();
  }

  Future<void> _cargarRetroalimentaciones() async {
    final auth = context.read<AuthProvider>();
    final gemini = context.read<GeminiProvider>();
    
    if (auth.usuario != null) {
      await gemini.obtenerRetroalimentaciones(auth.usuario!.id);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    return Scaffold(
      appBar: AppBar(
        title: const Text('Mis Retroalimentaciones'),
        centerTitle: true,
        actions: [
          PopupMenuButton<String>(
            icon: const Icon(Icons.filter_list),
            tooltip: 'Filtrar',
            onSelected: (value) {
              setState(() {
                _filtroTipo = value;
              });
            },
            itemBuilder: (context) => [
              const PopupMenuItem(
                value: 'todos',
                child: Text('Todos'),
              ),
              const PopupMenuItem(
                value: 'ejercicio',
                child: Text('Ejercicios'),
              ),
              const PopupMenuItem(
                value: 'quiz',
                child: Text('Quizzes'),
              ),
              const PopupMenuItem(
                value: 'codigo',
                child: Text('Analisis de codigo'),
              ),
            ],
          ),
        ],
      ),
      body: Consumer<GeminiProvider>(
        builder: (context, gemini, _) {
          if (gemini.isLoading) {
            return const LoadingWidget(message: 'Cargando retroalimentaciones...');
          }

          if (gemini.error != null) {
            return ErrorDisplayWidget(
              message: gemini.error!,
              onRetry: _cargarRetroalimentaciones,
            );
          }

          final retroalimentaciones = _filtroTipo == 'todos'
              ? gemini.retroalimentaciones
              : gemini.retroalimentaciones
                  .where((r) => r.tipo.toLowerCase() == _filtroTipo)
                  .toList();

          if (retroalimentaciones.isEmpty) {
            return _buildEmptyState(isDark);
          }

          return RefreshIndicator(
            onRefresh: _cargarRetroalimentaciones,
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: retroalimentaciones.length,
              itemBuilder: (context, index) {
                return _buildRetroalimentacionCard(retroalimentaciones[index], isDark);
              },
            ),
          );
        },
      ),
    );
  }

  Widget _buildEmptyState(bool isDark) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: Colors.purple.withOpacity(isDark ? 0.2 : 0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(
              Icons.history,
              size: 64,
              color: isDark ? Colors.purple[300] : Colors.purple,
            ),
          ),
          const SizedBox(height: 24),
          Text(
            'Sin retroalimentaciones',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: isDark ? Colors.white : Colors.black87,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            _filtroTipo == 'todos'
                ? 'Aun no tienes retroalimentaciones.\nResuelve ejercicios o quizzes para obtenerlas.'
                : 'No hay retroalimentaciones de este tipo.',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 14,
              color: isDark ? Colors.grey[400] : Colors.grey[600],
            ),
          ),
          const SizedBox(height: 24),
          if (_filtroTipo != 'todos')
            TextButton(
              onPressed: () {
                setState(() {
                  _filtroTipo = 'todos';
                });
              },
              child: const Text('Ver todas'),
            ),
        ],
      ),
    );
  }

  Widget _buildRetroalimentacionCard(RetroalimentacionModel retro, bool isDark) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      color: isDark ? Colors.grey[850] : Colors.white,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: InkWell(
        onTap: () => _mostrarDetalle(retro, isDark),
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header con tipo e icono
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: _getColorTipo(retro.tipo).withOpacity(isDark ? 0.2 : 0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      retro.iconoTipo,
                      style: const TextStyle(fontSize: 20),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          retro.tituloTipo,
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                            color: isDark ? Colors.white : Colors.black87,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          retro.fechaHoraFormateada,
                          style: TextStyle(
                            fontSize: 12,
                            color: isDark ? Colors.grey[400] : Colors.grey[600],
                          ),
                        ),
                      ],
                    ),
                  ),
                  Icon(
                    Icons.chevron_right,
                    color: isDark ? Colors.grey[500] : Colors.grey[400],
                  ),
                ],
              ),
              
              const SizedBox(height: 12),
              
              // Preview del contenido
              Text(
                retro.contenidoResumido,
                style: TextStyle(
                  fontSize: 14,
                  color: isDark ? Colors.grey[300] : Colors.grey[700],
                  height: 1.4,
                ),
                maxLines: 3,
                overflow: TextOverflow.ellipsis,
              ),
              
              // Badge de IA
              if (retro.generadoPorLlm) ...[
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.blue.withOpacity(isDark ? 0.2 : 0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        Icons.auto_awesome,
                        size: 14,
                        color: isDark ? Colors.blue[300] : Colors.blue,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        'Generado por IA',
                        style: TextStyle(
                          fontSize: 11,
                          color: isDark ? Colors.blue[300] : Colors.blue,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Color _getColorTipo(String tipo) {
    switch (tipo.toLowerCase()) {
      case 'ejercicio':
        return Colors.green;
      case 'quiz':
        return Colors.orange;
      case 'codigo':
        return Colors.blue;
      default:
        return Colors.purple;
    }
  }

  void _mostrarDetalle(RetroalimentacionModel retro, bool isDark) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.7,
        minChildSize: 0.5,
        maxChildSize: 0.95,
        builder: (context, scrollController) {
          return Container(
            decoration: BoxDecoration(
              color: isDark ? Colors.grey[900] : Colors.white,
              borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
            ),
            child: Column(
              children: [
                // Handle
                Container(
                  margin: const EdgeInsets.only(top: 12),
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: isDark ? Colors.grey[700] : Colors.grey[300],
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
                
                // Header
                Padding(
                  padding: const EdgeInsets.all(16),
                  child: Row(
                    children: [
                      Text(
                        retro.iconoTipo,
                        style: const TextStyle(fontSize: 28),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              retro.tituloTipo,
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                                color: isDark ? Colors.white : Colors.black87,
                              ),
                            ),
                            Text(
                              retro.fechaHoraFormateada,
                              style: TextStyle(
                                fontSize: 13,
                                color: isDark ? Colors.grey[400] : Colors.grey[600],
                              ),
                            ),
                          ],
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.close),
                        onPressed: () => Navigator.pop(context),
                      ),
                    ],
                  ),
                ),
                
                Divider(color: isDark ? Colors.grey[800] : Colors.grey[200]),
                
                // Contenido
                Expanded(
                  child: SingleChildScrollView(
                    controller: scrollController,
                    padding: const EdgeInsets.all(16),
                    child: SelectableText(
                      retro.contenido,
                      style: TextStyle(
                        fontSize: 15,
                        height: 1.6,
                        color: isDark ? Colors.grey[300] : Colors.grey[800],
                      ),
                    ),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
