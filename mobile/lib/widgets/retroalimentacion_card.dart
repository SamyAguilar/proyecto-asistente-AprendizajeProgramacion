// lib/widgets/retroalimentacion_card.dart

import 'package:flutter/material.dart';

class RetroalimentacionCard extends StatelessWidget {
  final String resultado; // 'correcto', 'incorrecto', 'error'
  final String? retroalimentacion;
  final int? puntosObtenidos;

  const RetroalimentacionCard({
    super.key,
    required this.resultado,
    this.retroalimentacion,
    this.puntosObtenidos,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final config = _getConfig();

    return Card(
      color: isDark ? Colors.grey[850] : null,
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header con resultado
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            color: config.color.withOpacity(isDark ? 0.3 : 0.1),
            child: Row(
              children: [
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color: config.color.withOpacity(0.2),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    config.icon,
                    color: config.color,
                    size: 28,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        config.titulo,
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: config.color,
                        ),
                      ),
                      if (puntosObtenidos != null)
                        Text(
                          '$puntosObtenidos puntos obtenidos',
                          style: TextStyle(
                            fontSize: 14,
                            color: isDark ? Colors.grey[400] : Colors.grey[600],
                          ),
                        ),
                    ],
                  ),
                ),
                if (puntosObtenidos != null)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    decoration: BoxDecoration(
                      color: config.color,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(
                          Icons.star,
                          color: Colors.white,
                          size: 18,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          '$puntosObtenidos',
                          style: const TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                            fontSize: 16,
                          ),
                        ),
                      ],
                    ),
                  ),
              ],
            ),
          ),
          
          // Retroalimentación
          if (retroalimentacion != null && retroalimentacion!.isNotEmpty)
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(
                        Icons.lightbulb_outline,
                        size: 20,
                        color: isDark ? Colors.amber[300] : Colors.amber[700],
                      ),
                      const SizedBox(width: 8),
                      Text(
                        'Retroalimentación',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          color: isDark ? Colors.white : Colors.black87,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: isDark ? Colors.grey[800] : Colors.grey[100],
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      retroalimentacion!,
                      style: TextStyle(
                        fontSize: 14,
                        height: 1.5,
                        color: isDark ? Colors.grey[300] : Colors.grey[800],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          
          // Mensaje de sugerencia según resultado
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
            child: Row(
              children: [
                Icon(
                  config.sugerenciaIcon,
                  size: 16,
                  color: isDark ? Colors.grey[500] : Colors.grey[600],
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    config.sugerencia,
                    style: TextStyle(
                      fontSize: 12,
                      fontStyle: FontStyle.italic,
                      color: isDark ? Colors.grey[500] : Colors.grey[600],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  _ResultadoConfig _getConfig() {
    switch (resultado.toLowerCase()) {
      case 'correcto':
        return _ResultadoConfig(
          titulo: '¡Correcto!',
          color: Colors.green,
          icon: Icons.check_circle,
          sugerencia: '¡Excelente trabajo! Continúa con el siguiente ejercicio.',
          sugerenciaIcon: Icons.celebration,
        );
      case 'incorrecto':
        return _ResultadoConfig(
          titulo: 'Incorrecto',
          color: Colors.red,
          icon: Icons.cancel,
          sugerencia: 'Revisa la retroalimentación e intenta de nuevo.',
          sugerenciaIcon: Icons.tips_and_updates,
        );
      case 'error':
      default:
        return _ResultadoConfig(
          titulo: 'Error de Ejecución',
          color: Colors.orange,
          icon: Icons.warning,
          sugerencia: 'Verifica la sintaxis de tu código.',
          sugerenciaIcon: Icons.bug_report,
        );
    }
  }
}

class _ResultadoConfig {
  final String titulo;
  final Color color;
  final IconData icon;
  final String sugerencia;
  final IconData sugerenciaIcon;

  _ResultadoConfig({
    required this.titulo,
    required this.color,
    required this.icon,
    required this.sugerencia,
    required this.sugerenciaIcon,
  });
}
