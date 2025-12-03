import 'package:flutter/material.dart';

class ProgresoBar extends StatelessWidget {
  final double? progreso;
  final double height;
  final Color? color;
  final Color? backgroundColor;
  final bool showLabel;
  final String? label;
  final bool useDynamicColors; // NUEVO: usar colores dinámicos según progreso

  const ProgresoBar({
    Key? key,
    this.progreso,
    this.height = 8,
    this.color,
    this.backgroundColor,
    this.showLabel = true,
    this.label,
    this.useDynamicColors = false, // Por defecto desactivado
  }) : super(key: key);

  // Función para obtener color según progreso
  Color _getColorProgreso(double progreso) {
    if (progreso == 0) {
      return Colors.grey;
    } else if (progreso < 30) {
      return Colors.amber;
    } else if (progreso < 60) {
      return Colors.orange;
    } else if (progreso < 100) {
      return Colors.blue;
    } else {
      return Colors.green;
    }
  }

  @override
  Widget build(BuildContext context) {
    final porcentaje = progreso ?? 0.0;

    // Si useDynamicColors está activado, usar función de colores dinámicos
    final progressColor = useDynamicColors
        ? _getColorProgreso(porcentaje)
        : (color ?? Theme.of(context).primaryColor);

    final bgColor = backgroundColor ?? Colors.grey[200];

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