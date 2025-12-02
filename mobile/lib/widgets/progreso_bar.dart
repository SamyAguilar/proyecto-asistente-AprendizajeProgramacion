import 'package:flutter/material.dart';

class ProgresoBar extends StatelessWidget {
  final double? progreso;
  final double height;
  final Color? color;
  final Color? backgroundColor;
  final bool showLabel;
  final String? label;

  const ProgresoBar({
    Key? key,
    this.progreso,
    this.height = 8,
    this.color,
    this.backgroundColor,
    this.showLabel = true,
    this.label,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final progressColor = color ?? Theme.of(context).primaryColor;
    final bgColor = backgroundColor ?? Colors.grey[200];
    final porcentaje = progreso ?? 0.0;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (showLabel)
          Padding(
            padding: const EdgeInsets.only(bottom: 6),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  label ?? 'Progreso',
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w500,
                    color: Colors.grey[700],
                  ),
                ),
                Text(
                  '${porcentaje.toStringAsFixed(0)}%',
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.bold,
                    color: progressColor,
                  ),
                ),
              ],
            ),
          ),
        ClipRRect(
          borderRadius: BorderRadius.circular(height / 2),
          child: LinearProgressIndicator(
            value: porcentaje / 100,
            backgroundColor: bgColor,
            valueColor: AlwaysStoppedAnimation<Color>(progressColor),
            minHeight: height,
          ),
        ),
      ],
    );
  }
}