import 'package:flutter/material.dart';

class ProgresoCircular extends StatelessWidget {
  final double progreso; // 0 a 100
  final double size;
  final double strokeWidth;
  final Color? color;
  final bool showPercentage;
  final String? label;

  const ProgresoCircular({
    Key? key,
    required this.progreso,
    this.size = 80,
    this.strokeWidth = 8,
    this.color,
    this.showPercentage = true,
    this.label,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final porcentaje = progreso.clamp(0.0, 100.0);
    final colorBarra = color ?? _getColorByProgress(porcentaje);

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        SizedBox(
          width: size,
          height: size,
          child: Stack(
            fit: StackFit.expand,
            children: [
              CircularProgressIndicator(
                value: porcentaje / 100,
                strokeWidth: strokeWidth,
                backgroundColor: Colors.grey[200],
                valueColor: AlwaysStoppedAnimation<Color>(colorBarra),
              ),
              if (showPercentage)
                Center(
                  child: Text(
                    '${porcentaje.toStringAsFixed(0)}%',
                    style: TextStyle(
                      fontSize: size * 0.2,
                      fontWeight: FontWeight.bold,
                      color: colorBarra,
                    ),
                  ),
                ),
            ],
          ),
        ),
        if (label != null) ...[
          const SizedBox(height: 8),
          Text(
            label!,
            style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w500,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ],
    );
  }

  Color _getColorByProgress(double progress) {
    if (progress >= 100) return Colors.green;
    if (progress >= 75) return Colors.lightGreen;
    if (progress >= 50) return Colors.orange;
    if (progress >= 25) return Colors.amber;
    return Colors.blue;
  }
}