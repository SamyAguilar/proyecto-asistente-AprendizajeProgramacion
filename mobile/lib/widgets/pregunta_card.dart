// lib/widgets/pregunta_card.dart

import 'package:flutter/material.dart';
import '../models/pregunta_quiz_model.dart';
import '../config/theme.dart';
import 'dificultad_badge.dart';

class PreguntaCard extends StatelessWidget {
  final PreguntaQuizModel pregunta;
  final int? numero;
  final bool showDificultad;

  const PreguntaCard({
    super.key,
    required this.pregunta,
    this.numero,
    this.showDificultad = true,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Card(
      color: isDark ? Colors.grey[850] : null,
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header con número y dificultad
            Row(
              children: [
                if (numero != null) ...[
                  Container(
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(
                      color: AppTheme.primaryColor,
                      borderRadius: BorderRadius.circular(18),
                    ),
                    child: Center(
                      child: Text(
                        '$numero',
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                ],
                
                Expanded(
                  child: Text(
                    numero != null ? 'Pregunta $numero' : 'Pregunta',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                      color: isDark ? Colors.grey[400] : Colors.grey[600],
                    ),
                  ),
                ),
                
                if (showDificultad && pregunta.dificultad != null)
                  DificultadBadge(
                    dificultad: pregunta.dificultad!,
                    compact: true,
                  ),
              ],
            ),
            const SizedBox(height: 16),
            
            // Texto de la pregunta
            Text(
              pregunta.preguntaTexto,
              style: TextStyle(
                fontSize: 17,
                fontWeight: FontWeight.w500,
                height: 1.4,
                color: isDark ? Colors.white : Colors.black87,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
