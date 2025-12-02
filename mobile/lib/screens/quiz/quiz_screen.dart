// lib/screens/quiz/quiz_screen.dart

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/quiz_provider.dart';
import '../../models/pregunta_quiz_model.dart';
import '../../config/theme.dart';
import '../../widgets/loading_widget.dart';
import '../../widgets/pregunta_card.dart';
import '../../widgets/opcion_button.dart';
import 'quiz_resultados_screen.dart';

class QuizScreen extends StatefulWidget {
  final int subtemaId;
  final String? subtemaName;

  const QuizScreen({
    super.key,
    required this.subtemaId,
    this.subtemaName,
  });

  @override
  State<QuizScreen> createState() => _QuizScreenState();
}

class _QuizScreenState extends State<QuizScreen> {
  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return WillPopScope(
      onWillPop: () async {
        final confirmar = await _mostrarDialogoSalir();
        return confirmar ?? false;
      },
      child: Scaffold(
        appBar: AppBar(
          title: Text(widget.subtemaName ?? 'Quiz'),
          leading: IconButton(
            icon: const Icon(Icons.close),
            onPressed: () async {
              final confirmar = await _mostrarDialogoSalir();
              if (confirmar == true && mounted) {
                Navigator.pop(context);
              }
            },
          ),
          actions: [
            // Indicador de progreso
            Consumer<QuizProvider>(
              builder: (context, provider, _) {
                return Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Center(
                    child: Text(
                      provider.progresoTexto,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                );
              },
            ),
          ],
        ),
        body: Consumer<QuizProvider>(
          builder: (context, provider, _) {
            if (provider.isLoading) {
              return const LoadingWidget(mensaje: 'Cargando pregunta...');
            }

            final pregunta = provider.preguntaActual;
            if (pregunta == null) {
              return const Center(child: Text('No hay preguntas disponibles'));
            }

            return Column(
              children: [
                // Barra de progreso
                LinearProgressIndicator(
                  value: provider.progresoPorcentaje,
                  backgroundColor: isDark ? Colors.grey[800] : Colors.grey[200],
                  valueColor: AlwaysStoppedAnimation<Color>(AppTheme.primaryColor),
                ),

                // Contenido
                Expanded(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Pregunta
                        PreguntaCard(pregunta: pregunta),
                        const SizedBox(height: 24),

                        // Opciones
                        ...pregunta.opciones.map((opcion) {
                          final seleccionada = provider.opcionSeleccionadaActual == opcion.id;
                          return Padding(
                            padding: const EdgeInsets.only(bottom: 12),
                            child: OpcionButton(
                              opcion: opcion,
                              seleccionada: seleccionada,
                              onTap: () {
                                provider.seleccionarRespuesta(pregunta.id, opcion.id);
                              },
                            ),
                          );
                        }),
                      ],
                    ),
                  ),
                ),

                // Navegación
                _buildNavegacion(provider, isDark),
              ],
            );
          },
        ),
      ),
    );
  }

  Widget _buildNavegacion(QuizProvider provider, bool isDark) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? Colors.grey[900] : Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 4,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: SafeArea(
        child: Row(
          children: [
            // Botón anterior
            if (provider.hayPreguntaAnterior)
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: provider.anteriorPregunta,
                  icon: const Icon(Icons.arrow_back),
                  label: const Text('Anterior'),
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 12),
                  ),
                ),
              )
            else
              const Expanded(child: SizedBox()),
            
            const SizedBox(width: 16),

            // Botón siguiente o finalizar
            Expanded(
              flex: 2,
              child: provider.esUltimaPregunta
                  ? ElevatedButton.icon(
                      onPressed: provider.preguntaActualRespondida
                          ? () => _finalizarQuiz(provider)
                          : null,
                      icon: provider.isSubmitting
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                              ),
                            )
                          : const Icon(Icons.flag),
                      label: Text(provider.isSubmitting ? 'Enviando...' : 'Finalizar'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.green,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                      ),
                    )
                  : ElevatedButton.icon(
                      onPressed: provider.preguntaActualRespondida
                          ? provider.siguientePregunta
                          : null,
                      icon: const Icon(Icons.arrow_forward),
                      label: const Text('Siguiente'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.primaryColor,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                      ),
                    ),
            ),
          ],
        ),
      ),
    );
  }

  Future<bool?> _mostrarDialogoSalir() {
    return showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('¿Salir del quiz?'),
        content: const Text(
          'Si sales ahora, perderás tu progreso en este quiz.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Continuar'),
          ),
          TextButton(
            onPressed: () {
              context.read<QuizProvider>().limpiar();
              Navigator.pop(context, true);
            },
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: const Text('Salir'),
          ),
        ],
      ),
    );
  }

  Future<void> _finalizarQuiz(QuizProvider provider) async {
    // Confirmar finalización
    final confirmar = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Finalizar Quiz'),
        content: Text(
          'Has respondido ${provider.preguntasRespondidas} de ${provider.totalPreguntas} preguntas.\n\n'
          '¿Deseas enviar tus respuestas?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Revisar'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.green,
              foregroundColor: Colors.white,
            ),
            child: const Text('Finalizar'),
          ),
        ],
      ),
    );

    if (confirmar == true && mounted) {
      await provider.finalizarQuiz();
      
      if (mounted && provider.quizFinalizado) {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(
            builder: (context) => QuizResultadosScreen(
              subtemaId: widget.subtemaId,
              subtemaName: widget.subtemaName,
            ),
          ),
        );
      }
    }
  }
}
