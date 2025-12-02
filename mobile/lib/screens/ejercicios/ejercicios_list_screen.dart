// lib/screens/ejercicios/ejercicios_list_screen.dart

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/ejercicio_provider.dart';
import '../../models/ejercicio_model.dart';
import '../../config/theme.dart';
import '../../widgets/loading_widget.dart';
import '../../widgets/error_widget.dart' as custom;
import '../../widgets/ejercicio_card.dart';
import '../../widgets/dificultad_badge.dart';
import 'ejercicio_detail_screen.dart';

class EjerciciosListScreen extends StatefulWidget {
  final int subtemaId;
  final String? subtemaName;

  const EjerciciosListScreen({
    super.key,
    required this.subtemaId,
    this.subtemaName,
  });

  @override
  State<EjerciciosListScreen> createState() => _EjerciciosListScreenState();
}

class _EjerciciosListScreenState extends State<EjerciciosListScreen> {
  @override
  void initState() {
    super.initState();
    _cargarEjercicios();
  }

  Future<void> _cargarEjercicios() async {
    await context.read<EjercicioProvider>().listarEjerciciosPorSubtema(widget.subtemaId);
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: Text(widget.subtemaName ?? 'Ejercicios'),
        actions: [
          // Botón de filtro
          PopupMenuButton<String>(
            icon: const Icon(Icons.filter_list),
            tooltip: 'Filtrar por dificultad',
            onSelected: (value) {
              final provider = context.read<EjercicioProvider>();
              if (value == 'todos') {
                provider.limpiarFiltro();
              } else {
                provider.setFiltro(value);
              }
            },
            itemBuilder: (context) => [
              const PopupMenuItem(
                value: 'todos',
                child: Text('Todos'),
              ),
              const PopupMenuItem(
                value: 'facil',
                child: Row(
                  children: [
                    Icon(Icons.circle, color: Colors.green, size: 12),
                    SizedBox(width: 8),
                    Text('Fácil'),
                  ],
                ),
              ),
              const PopupMenuItem(
                value: 'intermedio',
                child: Row(
                  children: [
                    Icon(Icons.circle, color: Colors.orange, size: 12),
                    SizedBox(width: 8),
                    Text('Intermedio'),
                  ],
                ),
              ),
              const PopupMenuItem(
                value: 'dificil',
                child: Row(
                  children: [
                    Icon(Icons.circle, color: Colors.red, size: 12),
                    SizedBox(width: 8),
                    Text('Difícil'),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
      body: Consumer<EjercicioProvider>(
        builder: (context, provider, _) {
          if (provider.isLoading) {
            return const LoadingWidget(mensaje: 'Cargando ejercicios...');
          }

          if (provider.error != null) {
            return custom.ErrorWidget(
              mensaje: provider.error!,
              onRetry: _cargarEjercicios,
            );
          }

          final ejercicios = provider.ejerciciosFiltrados;

          if (ejercicios.isEmpty) {
            return _buildEmptyState(isDark, provider.filtroActual != null);
          }

          return RefreshIndicator(
            onRefresh: _cargarEjercicios,
            child: Column(
              children: [
                // Header con estadísticas
                _buildHeader(provider, isDark),
                
                // Filtro activo
                if (provider.filtroActual != null)
                  _buildFiltroActivo(provider, isDark),
                
                // Lista de ejercicios
                Expanded(
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: ejercicios.length,
                    itemBuilder: (context, index) {
                      final ejercicio = ejercicios[index];
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: EjercicioCard(
                          ejercicio: ejercicio,
                          onTap: () => _abrirEjercicio(ejercicio),
                        ),
                      );
                    },
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildHeader(EjercicioProvider provider, bool isDark) {
    return Container(
      padding: const EdgeInsets.all(16),
      color: isDark ? Colors.grey[850] : Colors.grey[100],
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _buildStatItem(
            Icons.assignment,
            'Total',
            provider.totalEjercicios.toString(),
            AppTheme.primaryColor,
            isDark,
          ),
          _buildStatItem(
            Icons.check_circle,
            'Resueltos',
            provider.ejerciciosResueltos.toString(),
            Colors.green,
            isDark,
          ),
          _buildStatItem(
            Icons.pending,
            'Pendientes',
            (provider.totalEjercicios - provider.ejerciciosResueltos).toString(),
            Colors.orange,
            isDark,
          ),
        ],
      ),
    );
  }

  Widget _buildStatItem(IconData icon, String label, String value, Color color, bool isDark) {
    return Column(
      children: [
        Icon(icon, color: color, size: 24),
        const SizedBox(height: 4),
        Text(
          value,
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: isDark ? Colors.white : Colors.black87,
          ),
        ),
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            color: isDark ? Colors.grey[400] : Colors.grey[600],
          ),
        ),
      ],
    );
  }

  Widget _buildFiltroActivo(EjercicioProvider provider, bool isDark) {
    String filtroTexto;
    Color filtroColor;

    switch (provider.filtroActual) {
      case 'facil':
        filtroTexto = 'Fácil';
        filtroColor = Colors.green;
        break;
      case 'intermedio':
        filtroTexto = 'Intermedio';
        filtroColor = Colors.orange;
        break;
      case 'dificil':
        filtroTexto = 'Difícil';
        filtroColor = Colors.red;
        break;
      default:
        filtroTexto = provider.filtroActual ?? '';
        filtroColor = Colors.grey;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Row(
        children: [
          Text(
            'Filtro: ',
            style: TextStyle(
              color: isDark ? Colors.grey[400] : Colors.grey[600],
            ),
          ),
          Chip(
            label: Text(filtroTexto),
            backgroundColor: filtroColor.withOpacity(0.2),
            labelStyle: TextStyle(color: filtroColor),
            deleteIcon: const Icon(Icons.close, size: 18),
            onDeleted: () => provider.limpiarFiltro(),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState(bool isDark, bool tieneFiltro) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            tieneFiltro ? Icons.filter_alt_off : Icons.assignment_outlined,
            size: 80,
            color: isDark ? Colors.grey[600] : Colors.grey[400],
          ),
          const SizedBox(height: 16),
          Text(
            tieneFiltro 
                ? 'No hay ejercicios con este filtro'
                : 'No hay ejercicios disponibles',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: isDark ? Colors.white : Colors.black87,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            tieneFiltro
                ? 'Intenta con otro nivel de dificultad'
                : 'Pronto se agregarán nuevos ejercicios',
            textAlign: TextAlign.center,
            style: TextStyle(
              color: isDark ? Colors.grey[400] : Colors.grey[600],
            ),
          ),
          if (tieneFiltro) ...[
            const SizedBox(height: 16),
            TextButton.icon(
              onPressed: () => context.read<EjercicioProvider>().limpiarFiltro(),
              icon: const Icon(Icons.clear),
              label: const Text('Quitar filtro'),
            ),
          ],
        ],
      ),
    );
  }

  void _abrirEjercicio(EjercicioModel ejercicio) {
    context.read<EjercicioProvider>().seleccionarEjercicio(ejercicio);
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => EjercicioDetailScreen(
          ejercicioId: ejercicio.id,
        ),
      ),
    );
  }
}
