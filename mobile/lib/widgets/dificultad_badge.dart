// lib/widgets/dificultad_badge.dart

import 'package:flutter/material.dart';

class DificultadBadge extends StatelessWidget {
  final String dificultad;
  final bool compact;

  const DificultadBadge({
    super.key,
    required this.dificultad,
    this.compact = false,
  });

  @override
  Widget build(BuildContext context) {
    final config = _getConfig();

    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: compact ? 8 : 12,
        vertical: compact ? 4 : 6,
      ),
      decoration: BoxDecoration(
        color: config.color.withOpacity(0.2),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: config.color.withOpacity(0.5),
          width: 1,
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            config.icon,
            size: compact ? 12 : 14,
            color: config.color,
          ),
          const SizedBox(width: 4),
          Text(
            config.texto,
            style: TextStyle(
              fontSize: compact ? 10 : 12,
              fontWeight: FontWeight.w600,
              color: config.color,
            ),
          ),
        ],
      ),
    );
  }

  _DificultadConfig _getConfig() {
    final d = dificultad.toLowerCase();
    
    if (d == 'facil' || d == 'fácil' || d == 'básica' || d == 'basica') {
      return _DificultadConfig(
        texto: 'Fácil',
        color: Colors.green,
        icon: Icons.sentiment_satisfied_alt,
      );
    }
    
    if (d == 'intermedio' || d == 'intermedia') {
      return _DificultadConfig(
        texto: 'Intermedio',
        color: Colors.orange,
        icon: Icons.sentiment_neutral,
      );
    }
    
    if (d == 'dificil' || d == 'difícil' || d == 'avanzada' || d == 'avanzado') {
      return _DificultadConfig(
        texto: 'Difícil',
        color: Colors.red,
        icon: Icons.sentiment_dissatisfied,
      );
    }

    // Default
    return _DificultadConfig(
      texto: dificultad,
      color: Colors.grey,
      icon: Icons.help_outline,
    );
  }
}

class _DificultadConfig {
  final String texto;
  final Color color;
  final IconData icon;

  _DificultadConfig({
    required this.texto,
    required this.color,
    required this.icon,
  });
}