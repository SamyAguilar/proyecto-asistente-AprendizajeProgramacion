import 'package:flutter/material.dart';
import '../../models/subtema_model.dart';
// NUEVO - Imports para navegacion a PANCHO
import '../ejercicios/ejercicios_list_screen.dart';
import '../quiz/quiz_intro_screen.dart';

class SubtemaDetailScreen extends StatelessWidget {
  final SubtemaModel subtema;

  const SubtemaDetailScreen({Key? key, required this.subtema})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: Text('Subtema ${subtema.orden}'),
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    Theme.of(context).primaryColor,
                    Theme.of(context).primaryColor.withOpacity(0.8),
                  ],
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    subtema.nombre,
                    style: const TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                ],
              ),
            ),

            // Descripcion
            Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Descripcion',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: isDark ? Colors.white : Colors.black87,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    subtema.descripcion,
                    style: TextStyle(
                      fontSize: 15,
                      color: isDark ? Colors.grey[400] : Colors.grey[700],
                      height: 1.5,
                    ),
                  ),
                  const SizedBox(height: 24),
                  Text(
                    'Contenido Detallado',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: isDark ? Colors.white : Colors.black87,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    subtema.contenidoDetalle,
                    style: TextStyle(
                      fontSize: 15,
                      color: isDark ? Colors.grey[400] : Colors.grey[700],
                      height: 1.5,
                    ),
                  ),
                ],
              ),
            ),

            const Divider(height: 1),

            // BOTONES DE ACCION - NAVEGACION ACTIVADA
            Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Boton Ver Ejercicios - NAVEGACION ACTIVA
                  ElevatedButton.icon(
                    onPressed: () {
                      // NAVEGACION A MODULO DE PANCHO - EJERCICIOS (ACTIVADA)
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => EjerciciosListScreen(
                            subtemaId: subtema.id,
                            subtemaName: subtema.nombre,
                          ),
                        ),
                      );
                    },
                    icon: const Icon(Icons.code),
                    label: const Text('Ver Ejercicios'),
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.all(16),
                      backgroundColor: Theme.of(context).primaryColor,
                      foregroundColor: Colors.white,
                    ),
                  ),

                  const SizedBox(height: 12),

                  // Boton Tomar Quiz - NAVEGACION ACTIVA
                  OutlinedButton.icon(
                    onPressed: () {
                      // NAVEGACION A MODULO DE PANCHO - QUIZ (ACTIVADA)
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => QuizIntroScreen(
                            subtemaId: subtema.id,
                            subtemaName: subtema.nombre,
                          ),
                        ),
                      );
                    },
                    icon: const Icon(Icons.quiz),
                    label: const Text('Tomar Quiz'),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.all(16),
                      side: BorderSide(
                        color: Theme.of(context).primaryColor,
                        width: 2,
                      ),
                    ),
                  ),

                  const SizedBox(height: 12),

                  // Boton Ver Progreso (opcional)
                  OutlinedButton.icon(
                    onPressed: () {
                      // Mostrar progreso del subtema
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text(
                            'Progreso del subtema: ${subtema.nombre}',
                          ),
                          backgroundColor: Colors.green,
                        ),
                      );
                    },
                    icon: const Icon(Icons.trending_up),
                    label: const Text('Ver mi Progreso'),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.all(16),
                      side: const BorderSide(
                        color: Colors.green,
                        width: 2,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}