// lib/screens/ejercicios/ejercicio_detail_screen.dart

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/ejercicio_provider.dart';
import '../../models/ejercicio_model.dart';
import '../../models/intento_ejercicio_model.dart';
import '../../config/theme.dart';
import '../../widgets/loading_widget.dart';
import '../../widgets/error_widget.dart' as custom;
import '../../widgets/dificultad_badge.dart';
import '../../widgets/code_editor.dart';
import '../../widgets/code_viewer.dart';
import '../../widgets/retroalimentacion_card.dart';
import 'intentos_screen.dart';

class EjercicioDetailScreen extends StatefulWidget {
  final int ejercicioId;

  const EjercicioDetailScreen({
    super.key,
    required this.ejercicioId,
  });

  @override
  State<EjercicioDetailScreen> createState() => _EjercicioDetailScreenState();
}

class _EjercicioDetailScreenState extends State<EjercicioDetailScreen> {
  final TextEditingController _codigoController = TextEditingController();
  bool _mostrarRetroalimentacion = false;

  @override
  void initState() {
    super.initState();
    _cargarEjercicio();
  }

  @override
  void dispose() {
    _codigoController.dispose();
    super.dispose();
  }

  Future<void> _cargarEjercicio() async {
    final provider = context.read<EjercicioProvider>();
    await provider.obtenerEjercicio(widget.ejercicioId);
    
    // Si hay código base, ponerlo en el editor
    final ejercicio = provider.ejercicioSeleccionado;
    if (ejercicio?.codigoBase != null && ejercicio!.codigoBase!.isNotEmpty) {
      _codigoController.text = ejercicio.codigoBase!;
    }
  }

  Future<void> _enviarSolucion() async {
    final codigo = _codigoController.text.trim();
    
    if (codigo.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Por favor, escribe tu código antes de enviar'),
          backgroundColor: Colors.orange,
        ),
      );
      return;
    }

    final provider = context.read<EjercicioProvider>();
    final resultado = await provider.enviarEjercicio(widget.ejercicioId, codigo);
    
    if (resultado != null) {
      setState(() {
        _mostrarRetroalimentacion = true;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Ejercicio'),
        actions: [
          // Botón para ver intentos anteriores
          IconButton(
            icon: const Icon(Icons.history),
            tooltip: 'Ver intentos anteriores',
            onPressed: () => _abrirIntentos(),
          ),
          // Botón para pedir ayuda (integración con Lulu)
          IconButton(
            icon: const Icon(Icons.help_outline),
            tooltip: 'Pedir ayuda',
            onPressed: () => _pedirAyuda(),
          ),
        ],
      ),
      body: Consumer<EjercicioProvider>(
        builder: (context, provider, _) {
          if (provider.isLoading) {
            return const LoadingWidget(mensaje: 'Cargando ejercicio...');
          }

          if (provider.error != null) {
            return custom.ErrorWidget(
              mensaje: provider.error!,
              onRetry: _cargarEjercicio,
            );
          }

          final ejercicio = provider.ejercicioSeleccionado;
          if (ejercicio == null) {
            return const Center(child: Text('Ejercicio no encontrado'));
          }

          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header con dificultad y puntos
                _buildHeader(ejercicio, isDark),
                const SizedBox(height: 16),

                // Enunciado
                _buildEnunciado(ejercicio, isDark),
                const SizedBox(height: 20),

                // Código base (si existe) - Solo lectura
                if (ejercicio.codigoBase != null && ejercicio.codigoBase!.isNotEmpty) ...[
                  _buildSeccionTitulo('Código Base', Icons.code, isDark),
                  const SizedBox(height: 8),
                  CodeViewer(
                    codigo: ejercicio.codigoBase!,
                    lenguaje: ejercicio.lenguajeProgramacion,
                  ),
                  const SizedBox(height: 20),
                ],

                // Editor de código
                _buildSeccionTitulo('Tu Solución', Icons.edit_note, isDark),
                const SizedBox(height: 8),
                CodeEditor(
                  controller: _codigoController,
                  lenguaje: ejercicio.lenguajeProgramacion,
                  placeholder: 'Escribe tu código aquí...',
                ),
                const SizedBox(height: 16),

                // Botón enviar
                SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: ElevatedButton.icon(
                    onPressed: provider.isSubmitting ? null : _enviarSolucion,
                    icon: provider.isSubmitting
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                            ),
                          )
                        : const Icon(Icons.send),
                    label: Text(
                      provider.isSubmitting ? 'Enviando...' : 'Enviar Solución',
                      style: const TextStyle(fontSize: 16),
                    ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.primaryColor,
                      foregroundColor: Colors.white,
                    ),
                  ),
                ),
                const SizedBox(height: 20),

                // Retroalimentación (después de enviar)
                if (_mostrarRetroalimentacion && provider.ultimoIntento != null)
                  _buildRetroalimentacion(provider.ultimoIntento!, isDark),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildHeader(EjercicioModel ejercicio, bool isDark) {
    return Card(
      color: isDark ? Colors.grey[850] : null,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            DificultadBadge(dificultad: ejercicio.dificultad),
            const Spacer(),
            Row(
              children: [
                Icon(
                  Icons.star,
                  color: Colors.amber,
                  size: 20,
                ),
                const SizedBox(width: 4),
                Text(
                  '${ejercicio.puntosMaximos} pts',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    color: isDark ? Colors.white : Colors.black87,
                  ),
                ),
              ],
            ),
            const SizedBox(width: 16),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: AppTheme.primaryColor.withOpacity(0.1),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Text(
                ejercicio.tipoEjercicioFormateado,
                style: TextStyle(
                  color: AppTheme.primaryColor,
                  fontWeight: FontWeight.w500,
                  fontSize: 12,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEnunciado(EjercicioModel ejercicio, bool isDark) {
    return Card(
      color: isDark ? Colors.grey[850] : null,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(
                  Icons.description,
                  color: AppTheme.primaryColor,
                  size: 20,
                ),
                const SizedBox(width: 8),
                Text(
                  'Enunciado',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: isDark ? Colors.white : Colors.black87,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Text(
              ejercicio.enunciado,
              style: TextStyle(
                fontSize: 15,
                height: 1.5,
                color: isDark ? Colors.grey[300] : Colors.black87,
              ),
            ),
            if (ejercicio.lenguajeProgramacion != null) ...[
              const SizedBox(height: 12),
              Row(
                children: [
                  Icon(
                    Icons.code,
                    size: 16,
                    color: isDark ? Colors.grey[500] : Colors.grey[600],
                  ),
                  const SizedBox(width: 4),
                  Text(
                    'Lenguaje: ${ejercicio.lenguajeProgramacion}',
                    style: TextStyle(
                      fontSize: 13,
                      color: isDark ? Colors.grey[500] : Colors.grey[600],
                    ),
                  ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildSeccionTitulo(String titulo, IconData icon, bool isDark) {
    return Row(
      children: [
        Icon(
          icon,
          color: AppTheme.primaryColor,
          size: 20,
        ),
        const SizedBox(width: 8),
        Text(
          titulo,
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: isDark ? Colors.white : Colors.black87,
          ),
        ),
      ],
    );
  }

  Widget _buildRetroalimentacion(IntentoEjercicioModel intento, bool isDark) {
    return RetroalimentacionCard(
      resultado: intento.resultado,
      retroalimentacion: intento.retroalimentacionCompleta,
      puntosObtenidos: intento.puntosObtenidos,
    );
  }

  void _abrirIntentos() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => IntentosScreen(
          ejercicioId: widget.ejercicioId,
        ),
      ),
    );
  }

  void _pedirAyuda() {
    // Navegar a la pantalla de ayuda con el código actual
    final codigo = _codigoController.text;
    
    // Mostrar diálogo para confirmar
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Pedir Ayuda'),
        content: const Text(
          '¿Deseas pedir ayuda a LULU con tu código actual?\n\n'
          'LULU analizará tu código y te dará sugerencias.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancelar'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              // Navegar a la pantalla de análisis de código de Lulu
              Navigator.pushNamed(
                context,
                '/ayuda/analizar',
                arguments: {'codigo': codigo},
              );
            },
            child: const Text('Pedir Ayuda'),
          ),
        ],
      ),
    );
  }
}