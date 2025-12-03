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
  // NUEVO: Variable para rastrear la opción múltiple seleccionada
  String? _selectedOptionId;
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

  // MODIFICADO: Lógica de envío que construye el PAYLOAD DTO correcto
  Future<void> _enviarSolucion() async {
    final provider = context.read<EjercicioProvider>();
    final ejercicio = provider.ejercicioSeleccionado;

    if (ejercicio == null) return;

    // Usaremos un Map para el payload de la solución que coincide con EnviarEjercicioDto del backend.
    Map<String, dynamic> payload = {};
    String? mensajeError;

    // Lógica de validación y obtención de payload según el tipo de ejercicio
    final tipo = ejercicio.tipoEjercicio.toLowerCase();

    if (tipo == 'codificacion') {
      final codigo = _codigoController.text.trim();
      if (codigo.isEmpty) {
        mensajeError = 'Por favor, escribe tu código antes de enviar';
      } else {
        payload = {'codigoEnviado': codigo}; // DTO para codificación
      }
    } else if (tipo == 'multiple') {
      if (_selectedOptionId == null) {
        mensajeError = 'Por favor, selecciona una opción antes de enviar';
      } else {
        // FIX CRÍTICO: Envía el ID en el campo DTO esperado por el backend.
        payload = {'opcionSeleccionadaId': _selectedOptionId!};
      }
    } else if (tipo == 'completar') {
      // El payload esperado sería: {'respuestasCompletadas': ['...', '...']}
      mensajeError = 'La lógica para ejercicios de completar aún no está implementada.';
    } else {
      mensajeError = 'Tipo de ejercicio no reconocido para el envío.';
    }

    if (mensajeError != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(mensajeError),
          backgroundColor: Colors.orange,
        ),
      );
      return;
    }

    // ✅ FIX FINAL: El método en el proveedor ahora es enviarEjercicio(int id, Map<String, dynamic> payload)
    final resultado = await provider.enviarEjercicio(widget.ejercicioId, payload);

    if (resultado != null) {
      setState(() {
        _mostrarRetroalimentacion = true;
        // Reiniciar la opción seleccionada después del envío
        if (tipo == 'multiple') {
          _selectedOptionId = null;
        }
      });
    }
  }

  // NUEVO: Widget condicional para el contenido del ejercicio
  Widget _buildEjercicioContent(EjercicioModel ejercicio, bool isDark) {
    switch (ejercicio.tipoEjercicio.toLowerCase()) {
      case 'codificacion':
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
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
          ],
        );

      case 'multiple':
      // LÓGICA PARA OPCIÓN MÚLTIPLE
        final opciones = ejercicio.opcionesRespuesta ?? [];

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildSeccionTitulo('Selecciona la Respuesta', Icons.radio_button_checked, isDark),
            const SizedBox(height: 12),
            if (opciones.isEmpty)
              Text(
                'Este ejercicio de opción múltiple no tiene opciones configuradas. Revise el Admin.',
                style: TextStyle(color: Theme.of(context).colorScheme.error),
              ),
            ...opciones.map((opcion) {
              final id = opcion['id'].toString();
              final texto = opcion['texto'].toString();
              return Card(
                color: _selectedOptionId == id
                    ? AppTheme.primaryColor.withOpacity(0.1)
                    : (isDark ? Colors.grey[800] : Colors.white),
                margin: const EdgeInsets.only(bottom: 8.0),
                child: RadioListTile<String>(
                  title: Text(texto, style: TextStyle(color: _selectedOptionId == id ? AppTheme.primaryColor : (isDark ? Colors.white : Colors.black))),
                  value: id,
                  groupValue: _selectedOptionId,
                  onChanged: (value) {
                    setState(() {
                      _selectedOptionId = value;
                    });
                  },
                ),
              );
            }).toList(),
          ],
        );

      case 'completar':
      // LÓGICA PARA COMPLETAR ESPACIOS EN BLANCO
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildSeccionTitulo('Completa los Espacios en Blanco', Icons.space_bar, isDark),
            const SizedBox(height: 12),
            // FALTA IMPLEMENTAR UN WIDGET COMPLEJO para parsear textoConEspacios
            Text(ejercicio.textoConEspacios ?? 'Texto de completar no configurado.', style: TextStyle(fontStyle: FontStyle.italic)),
            const SizedBox(height: 12),
            const Text('NOTA: Se requiere implementar un widget que analice el campo textoConEspacios para mostrar los campos de entrada necesarios.',
                style: TextStyle(color: Colors.red)),
          ],
        );

      default:
        return Center(
          child: Text(
              'Tipo de ejercicio "${ejercicio.tipoEjercicioFormateado}" no soportado en la UI.',
              style: TextStyle(color: Theme.of(context).colorScheme.error)
          ),
        );
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
          // Solo se muestra si el ejercicio es de Codificación
          if (context.watch<EjercicioProvider>().ejercicioSeleccionado?.tipoEjercicio.toLowerCase() == 'codificacion')
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

                // Contenido dinámico del ejercicio (Codificación, Múltiple, Completar)
                _buildEjercicioContent(ejercicio, isDark),
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
                const Icon(
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
            if (ejercicio.lenguajeProgramacion != null && ejercicio.lenguajeProgramacion!.isNotEmpty) ...[
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
    final ejercicio = context.read<EjercicioProvider>().ejercicioSeleccionado;
    if (ejercicio?.tipoEjercicio.toLowerCase() != 'codificacion') {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('La ayuda de LULU solo está disponible para ejercicios de codificación.'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

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