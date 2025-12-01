// lib/screens/quiz/quiz_resultados_screen.dart

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/quiz_provider.dart';
import '../../models/intento_quiz_model.dart';
import '../../config/theme.dart';
import '../../widgets/resultado_quiz_card.dart';

class QuizResultadosScreen extends StatelessWidget {
  final int subtemaId;
  final String? subtemaName;

  const QuizResultadosScreen({
    super.key,
    required this.subtemaId,
    this.subtemaName,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return WillPopScope(
      onWillPop: () async {
        _volverASubtema(context);
        return false;
      },
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Resultados'),
          leading: IconButton(
            icon: const Icon(Icons.close),
            onPressed: () => _volverASubtema(context),
          ),
          automaticallyImplyLeading: false,
        ),
        body: Consumer<QuizProvider>(
          builder: (context, provider, _) {
            final resultados = provider.resultadosFinales;

            if (resultados == null) {
              return const Center(child: Text('No hay resultados'));
            }

            return SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  // Header con resultado principal
                  _buildResultadoPrincipal(resultados, isDark),
                  const SizedBox(height: 24),

                  // Estadísticas
                  _buildEstadisticas(resultados, isDark),
                  const SizedBox(height: 24),

                  // Detalle de respuestas
                  _buildDetalleRespuestas(provider, isDark),
                  const SizedBox(height: 24),

                  // Botones de acción
                  _buildAcciones(context, provider),
                ],
              ),
            );
          },
        ),
      ),
    );
  }

  Widget _buildResultadoPrincipal(ResultadosQuizModel resultados, bool isDark) {
    final porcentaje = resultados.porcentajeAciertos;
    Color colorResultado;
    String mensaje;
    IconData icono;

    if (porcentaje >= 80) {
      colorResultado = Colors.green;
      mensaje = '¡Excelente!';
      icono = Icons.emoji_events;
    } else if (porcentaje >= 60) {
      colorResultado = Colors.blue;
      mensaje = '¡Bien hecho!';
      icono = Icons.thumb_up;
    } else if (porcentaje >= 40) {
      colorResultado = Colors.orange;
      mensaje = 'Puedes mejorar';
      icono = Icons.trending_up;
    } else {
      colorResultado = Colors.red;
      mensaje = 'Sigue practicando';
      icono = Icons.school;
    }

    return Card(
      color: isDark ? Colors.grey[850] : null,
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            // Icono y mensaje
            Container(
              width: 100,
              height: 100,
              decoration: BoxDecoration(
                color: colorResultado.withOpacity(0.2),
                shape: BoxShape.circle,
              ),
              child: Icon(
                icono,
                size: 50,
                color: colorResultado,
              ),
            ),
            const SizedBox(height: 16),
            Text(
              mensaje,
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: colorResultado,
              ),
            ),
            const SizedBox(height: 24),

            // Porcentaje circular
            Stack(
              alignment: Alignment.center,
              children: [
                SizedBox(
                  width: 150,
                  height: 150,
                  child: CircularProgressIndicator(
                    value: porcentaje / 100,
                    strokeWidth: 12,
                    backgroundColor: isDark ? Colors.grey[800] : Colors.grey[200],
                    valueColor: AlwaysStoppedAnimation<Color>(colorResultado),
                  ),
                ),
                Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      '${porcentaje.toStringAsFixed(0)}%',
                      style: TextStyle(
                        fontSize: 36,
                        fontWeight: FontWeight.bold,
                        color: isDark ? Colors.white : Colors.black87,
                      ),
                    ),
                    Text(
                      'Aciertos',
                      style: TextStyle(
                        fontSize: 14,
                        color: isDark ? Colors.grey[400] : Colors.grey[600],
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEstadisticas(ResultadosQuizModel resultados, bool isDark) {
    return Row(
      children: [
        Expanded(
          child: _buildStatCard(
            Icons.check_circle,
            'Correctas',
            resultados.correctas.toString(),
            Colors.green,
            isDark,
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: _buildStatCard(
            Icons.cancel,
            'Incorrectas',
            resultados.incorrectas.toString(),
            Colors.red,
            isDark,
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: _buildStatCard(
            Icons.star,
            'Puntos',
            resultados.puntosTotal.toString(),
            Colors.amber,
            isDark,
          ),
        ),
      ],
    );
  }

  Widget _buildStatCard(IconData icon, String label, String value, Color color, bool isDark) {
    return Card(
      color: isDark ? Colors.grey[850] : null,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Icon(icon, color: color, size: 28),
            const SizedBox(height: 8),
            Text(
              value,
              style: TextStyle(
                fontSize: 24,
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
        ),
      ),
    );
  }

  Widget _buildDetalleRespuestas(QuizProvider provider, bool isDark) {
    final preguntas = provider.preguntas;
    final resultados = provider.resultados;

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
                  Icons.list_alt,
                  color: AppTheme.primaryColor,
                ),
                const SizedBox(width: 8),
                Text(
                  'Detalle de Respuestas',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: isDark ? Colors.white : Colors.black87,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            const Divider(),
            
            // Lista de preguntas con resultados
            ...preguntas.asMap().entries.map((entry) {
              final index = entry.key;
              final pregunta = entry.value;
              
              // Buscar el resultado para esta pregunta
              final resultado = resultados.firstWhere(
                (r) => r.preguntaId == pregunta.id,
                orElse: () => IntentoQuizModel(
                  id: 0,
                  usuarioId: 0,
                  preguntaId: pregunta.id,
                  opcionSeleccionadaId: 0,
                  esCorrecta: false,
                ),
              );

              return ResultadoQuizCard(
                numero: index + 1,
                pregunta: pregunta,
                resultado: resultado,
                respuestaSeleccionada: provider.respuestasSeleccionadas[pregunta.id],
              );
            }),
          ],
        ),
      ),
    );
  }

  Widget _buildAcciones(BuildContext context, QuizProvider provider) {
    return Column(
      children: [
        // Botón reintentar
        SizedBox(
          width: double.infinity,
          height: 50,
          child: OutlinedButton.icon(
            onPressed: () {
              provider.reiniciarQuiz();
              Navigator.pop(context);
            },
            icon: const Icon(Icons.refresh),
            label: const Text('Intentar de Nuevo'),
          ),
        ),
        const SizedBox(height: 12),
        
        // Botón volver
        SizedBox(
          width: double.infinity,
          height: 50,
          child: ElevatedButton.icon(
            onPressed: () => _volverASubtema(context),
            icon: const Icon(Icons.arrow_back),
            label: const Text('Volver al Subtema'),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.primaryColor,
              foregroundColor: Colors.white,
            ),
          ),
        ),
      ],
    );
  }

  void _volverASubtema(BuildContext context) {
    context.read<QuizProvider>().limpiar();
    // Volver a la pantalla del subtema (pop hasta encontrarla o ir al inicio)
    Navigator.popUntil(context, (route) {
      // Si es la primera ruta o es la pantalla del subtema, detenerse
      return route.isFirst || route.settings.name?.contains('subtema') == true;
    });
  }
}