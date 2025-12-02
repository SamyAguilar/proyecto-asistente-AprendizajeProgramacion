import 'package:flutter/material.dart';
import '../models/models.dart';

class SubtemaDetailScreen extends StatelessWidget {
  final SubtemaModel subtema;

  const SubtemaDetailScreen({Key? key, required this.subtema})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
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
              color: Theme.of(context).primaryColor,
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

            // Descripción
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
                    subtema.descripcion,
                    style: TextStyle(
                      fontSize: 15,
                      color: Colors.grey[700],
                      height: 1.5,
                    ),
                  ),
                  const SizedBox(height: 24),
                  const Text(
                    'Contenido Detallado',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    subtema.contenidoDetalle,
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

            // ✅ BOTONES DE ACCIÓN - CONEXIÓN CON PANCHO
            Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Botón Ver Ejercicios
                  ElevatedButton.icon(
                    onPressed: () {
                      // ✅ NAVEGACIÓN A MÓDULO DE PANCHO - EJERCICIOS
                      // Cuando Pancho tenga su pantalla lista, descomenta esto:
                      /*
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => EjerciciosListScreen(
                            subtemaId: subtema.id,
                            subtemaName: subtema.nombre,
                          ),
                        ),
                      );
                      */
                      
                      // Mientras tanto, mostramos un mensaje
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text(
                            'Navegando a ejercicios del subtema: ${subtema.nombre}',
                          ),
                          backgroundColor: Colors.blue,
                          duration: const Duration(seconds: 2),
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
                  
                  // Botón Tomar Quiz
                  OutlinedButton.icon(
                    onPressed: () {
                      // ✅ NAVEGACIÓN A MÓDULO DE PANCHO - QUIZ
                      // Cuando Pancho tenga su pantalla lista, descomenta esto:
                      /*
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => QuizIntroScreen(
                            subtemaId: subtema.id,
                            subtemaName: subtema.nombre,
                          ),
                        ),
                      );
                      */
                      
                      // Mientras tanto, mostramos un mensaje
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text(
                            'Navegando a quiz del subtema: ${subtema.nombre}',
                          ),
                          backgroundColor: Colors.orange,
                          duration: const Duration(seconds: 2),
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
                ],
              ),
            ),

            // Info adicional
            Container(
              margin: const EdgeInsets.all(24),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.blue.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: Colors.blue.withOpacity(0.3),
                  width: 1,
                ),
              ),
              child: Row(
                children: [
                  Icon(
                    Icons.info_outline,
                    color: Colors.blue[700],
                    size: 24,
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      'Completa los ejercicios y el quiz para avanzar al siguiente subtema',
                      style: TextStyle(
                        color: Colors.blue[900],
                        fontSize: 14,
                        height: 1.4,
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