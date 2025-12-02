// lib/widgets/explicacion_card.dart
// [LULU] Widget para mostrar explicaciones de conceptos

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class ExplicacionCard extends StatelessWidget {
  final String titulo;
  final String contenido;
  final List<String>? conceptosClave;
  final VoidCallback? onNuevaPregunta;
  final VoidCallback? onCopiar;

  const ExplicacionCard({
    super.key,
    required this.titulo,
    required this.contenido,
    this.conceptosClave,
    this.onNuevaPregunta,
    this.onCopiar,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Card(
      elevation: isDark ? 0 : 2,
      color: isDark ? Colors.grey[850] : Colors.white,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: isDark
            ? BorderSide(color: Colors.grey[700]!, width: 1)
            : BorderSide.none,
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Row(
              children: [
                Container(
                  width: 32,
                  height: 32,
                  decoration: BoxDecoration(
                    color: isDark ? Colors.grey[800] : Colors.grey[200],
                    shape: BoxShape.circle,
                  ),
                  child: const Center(
                    child: Text('🤖', style: TextStyle(fontSize: 16)),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    titulo,
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: isDark ? Colors.white : Colors.black87,
                    ),
                  ),
                ),
                IconButton(
                  icon: Icon(
                    Icons.copy,
                    size: 20,
                    color: isDark ? Colors.grey[400] : Colors.grey[600],
                  ),
                  tooltip: 'Copiar',
                  onPressed: () {
                    Clipboard.setData(ClipboardData(text: contenido));
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Copiado al portapapeles'),
                        duration: Duration(seconds: 2),
                      ),
                    );
                    onCopiar?.call();
                  },
                ),
              ],
            ),

            Divider(
              height: 24,
              color: isDark ? Colors.grey[700] : Colors.grey[300],
            ),

            // Contenido
            SelectableText(
              contenido,
              style: TextStyle(
                fontSize: 15,
                height: 1.6,
                color: isDark ? Colors.grey[300] : Colors.grey[800],
              ),
            ),

            // Conceptos clave
            if (conceptosClave != null && conceptosClave!.isNotEmpty) ...[
              const SizedBox(height: 16),
              Text(
                'Conceptos clave:',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: isDark ? Colors.white : Colors.black87,
                ),
              ),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: conceptosClave!.map((concepto) {
                  return Chip(
                    label: Text(
                      concepto,
                      style: TextStyle(
                        fontSize: 12,
                        color: isDark ? Colors.white70 : null,
                      ),
                    ),
                    backgroundColor: Theme.of(context)
                        .primaryColor
                        .withOpacity(isDark ? 0.2 : 0.1),
                    side: isDark
                        ? BorderSide(
                            color: Theme.of(context).primaryColor.withOpacity(0.3))
                        : null,
                  );
                }).toList(),
              ),
            ],

            // Boton nueva pregunta
            if (onNuevaPregunta != null) ...[
              const SizedBox(height: 16),
              Center(
                child: TextButton.icon(
                  onPressed: onNuevaPregunta,
                  icon: const Icon(Icons.refresh),
                  label: const Text('Nueva pregunta'),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
