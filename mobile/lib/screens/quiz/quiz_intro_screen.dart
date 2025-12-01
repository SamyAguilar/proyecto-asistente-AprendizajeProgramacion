// lib/screens/quiz/quiz_intro_screen.dart

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/quiz_provider.dart';
import '../../config/theme.dart';
import '../../widgets/loading_widget.dart';
import '../../widgets/custom_button.dart';
import 'quiz_screen.dart';

class QuizIntroScreen extends StatefulWidget {
  final int subtemaId;
  final String? subtemaName;
  final int cantidadPreguntas;

  const QuizIntroScreen({
    super.key,
    required this.subtemaId,
    this.subtemaName,
    this.cantidadPreguntas = 5,
  });

  @override
  State<QuizIntroScreen> createState() => _QuizIntroScreenState();
}

class _QuizIntroScreenState extends State<QuizIntroScreen> {
  int _cantidadSeleccionada = 5;
  bool _cargandoPreguntas = false;

  @override
  void initState() {
    super.initState();
    _cantidadSeleccionada = widget.cantidadPreguntas;
  }

  Future<void> _iniciarQuiz() async {
    setState(() {
      _cargandoPreguntas = true;
    });

    final provider = context.read<QuizProvider>();
    await provider.obtenerPreguntasQuiz(widget.subtemaId, cantidad: _cantidadSeleccionada);

    setState(() {
      _cargandoPreguntas = false;
    });

    if (provider.preguntas.isNotEmpty && mounted) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (context) => QuizScreen(
            subtemaId: widget.subtemaId,
            subtemaName: widget.subtemaName,
          ),
        ),
      );
    } else if (provider.error != null && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(provider.error!),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: Text(widget.subtemaName ?? 'Quiz'),
      ),
      body: _cargandoPreguntas
          ? const LoadingWidget(mensaje: 'Preparando quiz...')
          : SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Column(
                children: [
                  // Icono principal
                  Container(
                    width: 120,
                    height: 120,
                    decoration: BoxDecoration(
                      color: AppTheme.primaryColor.withOpacity(0.1),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(
                      Icons.quiz,
                      size: 60,
                      color: AppTheme.primaryColor,
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Título
                  Text(
                    '¡Hora del Quiz!',
                    style: TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                      color: isDark ? Colors.white : Colors.black87,
                    ),
                  ),
                  const SizedBox(height: 12),

                  // Descripción
                  Text(
                    'Pon a prueba tus conocimientos sobre\n${widget.subtemaName ?? "este tema"}',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 16,
                      color: isDark ? Colors.grey[400] : Colors.grey[600],
                    ),
                  ),
                  const SizedBox(height: 32),

                  // Configuración de preguntas
                  Card(
                    color: isDark ? Colors.grey[850] : null,
                    child: Padding(
                      padding: const EdgeInsets.all(20),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Cantidad de preguntas',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: isDark ? Colors.white : Colors.black87,
                            ),
                          ),
                          const SizedBox(height: 16),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                            children: [5, 10, 15, 20].map((cantidad) {
                              final seleccionado = _cantidadSeleccionada == cantidad;
                              return GestureDetector(
                                onTap: () {
                                  setState(() {
                                    _cantidadSeleccionada = cantidad;
                                  });
                                },
                                child: Container(
                                  width: 60,
                                  height: 60,
                                  decoration: BoxDecoration(
                                    color: seleccionado
                                        ? AppTheme.primaryColor
                                        : (isDark ? Colors.grey[800] : Colors.grey[200]),
                                    borderRadius: BorderRadius.circular(12),
                                    border: seleccionado
                                        ? null
                                        : Border.all(
                                            color: isDark ? Colors.grey[700]! : Colors.grey[300]!,
                                          ),
                                  ),
                                  child: Center(
                                    child: Text(
                                      cantidad.toString(),
                                      style: TextStyle(
                                        fontSize: 20,
                                        fontWeight: FontWeight.bold,
                                        color: seleccionado
                                            ? Colors.white
                                            : (isDark ? Colors.white : Colors.black87),
                                      ),
                                    ),
                                  ),
                                ),
                              );
                            }).toList(),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Instrucciones
                  Card(
                    color: isDark ? Colors.grey[850] : null,
                    child: Padding(
                      padding: const EdgeInsets.all(20),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Icon(
                                Icons.info_outline,
                                color: AppTheme.primaryColor,
                              ),
                              const SizedBox(width: 8),
                              Text(
                                'Instrucciones',
                                style: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                  color: isDark ? Colors.white : Colors.black87,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 16),
                          _buildInstruccion(
                            Icons.touch_app,
                            'Selecciona una opción para cada pregunta',
                            isDark,
                          ),
                          const SizedBox(height: 12),
                          _buildInstruccion(
                            Icons.edit,
                            'Puedes cambiar tu respuesta antes de finalizar',
                            isDark,
                          ),
                          const SizedBox(height: 12),
                          _buildInstruccion(
                            Icons.flag,
                            'Al finalizar verás tus resultados',
                            isDark,
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 32),

                  // Botón comenzar
                  SizedBox(
                    width: double.infinity,
                    height: 56,
                    child: ElevatedButton.icon(
                      onPressed: _iniciarQuiz,
                      icon: const Icon(Icons.play_arrow),
                      label: const Text(
                        'Comenzar Quiz',
                        style: TextStyle(fontSize: 18),
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.primaryColor,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
    );
  }

  Widget _buildInstruccion(IconData icon, String texto, bool isDark) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(
          icon,
          size: 20,
          color: isDark ? Colors.grey[500] : Colors.grey[600],
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Text(
            texto,
            style: TextStyle(
              color: isDark ? Colors.grey[400] : Colors.grey[700],
            ),
          ),
        ),
      ],
    );
  }
}