// lib/screens/ejercicios/intentos_screen.dart

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/ejercicio_provider.dart';
import '../../models/intento_ejercicio_model.dart';
import '../../config/theme.dart';
import '../../widgets/loading_widget.dart';
import '../../widgets/error_widget.dart' as custom;
import '../../widgets/code_viewer.dart';

class IntentosScreen extends StatefulWidget {
  final int ejercicioId;

  const IntentosScreen({
    super.key,
    required this.ejercicioId,
  });

  @override
  State<IntentosScreen> createState() => _IntentosScreenState();
}

class _IntentosScreenState extends State<IntentosScreen> {
  @override
  void initState() {
    super.initState();
    _cargarIntentos();
  }

  Future<void> _cargarIntentos() async {
    await context.read<EjercicioProvider>().obtenerIntentosEjercicio(widget.ejercicioId);
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Intentos Anteriores'),
      ),
      body: Consumer<EjercicioProvider>(
        builder: (context, provider, _) {
          if (provider.isLoading) {
            return const LoadingWidget(mensaje: 'Cargando intentos...');
          }

          if (provider.error != null) {
            return custom.ErrorWidget(
              mensaje: provider.error!,
              onRetry: _cargarIntentos,
            );
          }

          final intentos = provider.intentos;

          if (intentos.isEmpty) {
            return _buildEmptyState(isDark);
          }

          return RefreshIndicator(
            onRefresh: _cargarIntentos,
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: intentos.length,
              itemBuilder: (context, index) {
                final intento = intentos[index];
                return Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: _IntentoCard(
                    intento: intento,
                    numero: intentos.length - index,
                    isDark: isDark,
                  ),
                );
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
          Icon(
            Icons.history,
            size: 80,
            color: isDark ? Colors.grey[600] : Colors.grey[400],
          ),
          const SizedBox(height: 16),
          Text(
            'No hay intentos anteriores',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: isDark ? Colors.white : Colors.black87,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Tus intentos aparecerán aquí\ndespués de enviar soluciones',
            textAlign: TextAlign.center,
            style: TextStyle(
              color: isDark ? Colors.grey[400] : Colors.grey[600],
            ),
          ),
        ],
      ),
    );
  }
}

class _IntentoCard extends StatefulWidget {
  final IntentoEjercicioModel intento;
  final int numero;
  final bool isDark;

  const _IntentoCard({
    required this.intento,
    required this.numero,
    required this.isDark,
  });

  @override
  State<_IntentoCard> createState() => _IntentoCardState();
}

class _IntentoCardState extends State<_IntentoCard> {
  bool _expandido = false;

  @override
  Widget build(BuildContext context) {
    final intento = widget.intento;

    Color colorResultado;
    IconData iconResultado;

    switch (intento.resultado.toLowerCase()) {
      case 'correcto':
        colorResultado = Colors.green;
        iconResultado = Icons.check_circle;
        break;
      case 'incorrecto':
        colorResultado = Colors.red;
        iconResultado = Icons.cancel;
        break;
      default:
        colorResultado = Colors.orange;
        iconResultado = Icons.warning;
    }

    return Card(
      color: widget.isDark ? Colors.grey[850] : null,
      clipBehavior: Clip.antiAlias,
      child: Column(
        children: [
          // Header del intento
          InkWell(
            onTap: () {
              setState(() {
                _expandido = !_expandido;
              });
            },
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  // Número de intento
                  Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: colorResultado.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Center(
                      child: Text(
                        '#${widget.numero}',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          color: colorResultado,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  
                  // Info del intento
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Icon(
                              iconResultado,
                              color: colorResultado,
                              size: 18,
                            ),
                            const SizedBox(width: 4),
                            Text(
                              intento.resultadoFormateado,
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                color: colorResultado,
                              ),
                            ),
                            const Spacer(),
                            Text(
                              '${intento.puntosObtenidos} pts',
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                color: widget.isDark ? Colors.white : Colors.black87,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Text(
                          intento.tiempoRelativo,
                          style: TextStyle(
                            fontSize: 12,
                            color: widget.isDark ? Colors.grey[500] : Colors.grey[600],
                          ),
                        ),
                      ],
                    ),
                  ),
                  
                  // Icono expandir
                  Icon(
                    _expandido ? Icons.expand_less : Icons.expand_more,
                    color: widget.isDark ? Colors.grey[500] : Colors.grey[600],
                  ),
                ],
              ),
            ),
          ),
          
          // Contenido expandido
          if (_expandido) ...[
            const Divider(height: 1),
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Código enviado
                  if (intento.codigoEnviado != null && intento.codigoEnviado!.isNotEmpty) ...[
                    Text(
                      'Código Enviado:',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        color: widget.isDark ? Colors.white : Colors.black87,
                      ),
                    ),
                    const SizedBox(height: 8),
                    CodeViewer(
                      codigo: intento.codigoEnviado!,
                      maxHeight: 200,
                    ),
                    const SizedBox(height: 16),
                  ],
                  
                  // Retroalimentación
                  if (intento.retroalimentacionCompleta.isNotEmpty) ...[
                    Text(
                      'Retroalimentación:',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        color: widget.isDark ? Colors.white : Colors.black87,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: widget.isDark 
                            ? Colors.grey[800] 
                            : Colors.grey[100],
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(
                          color: colorResultado.withOpacity(0.5),
                        ),
                      ),
                      child: Text(
                        intento.retroalimentacionCompleta,
                        style: TextStyle(
                          color: widget.isDark ? Colors.grey[300] : Colors.black87,
                        ),
                      ),
                    ),
                  ],
                  
                  // Fecha exacta
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Icon(
                        Icons.access_time,
                        size: 14,
                        color: widget.isDark ? Colors.grey[500] : Colors.grey[600],
                      ),
                      const SizedBox(width: 4),
                      Text(
                        intento.fechaFormateada,
                        style: TextStyle(
                          fontSize: 12,
                          color: widget.isDark ? Colors.grey[500] : Colors.grey[600],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }
}
