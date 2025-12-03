// lib/widgets/ejercicio_card.dart

import 'package:flutter/material.dart';
import '../models/ejercicio_model.dart';
import '../config/theme.dart';
import 'dificultad_badge.dart';

class EjercicioCard extends StatelessWidget {
  final EjercicioModel ejercicio;
  final VoidCallback? onTap;

  const EjercicioCard({
    super.key,
    required this.ejercicio,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Card(
      color: isDark ? Colors.grey[850] : null,
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header con dificultad y estado
              Row(
                children: [
                  DificultadBadge(dificultad: ejercicio.dificultad),
                  const Spacer(),
                  if (ejercicio.resuelto == true)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.green.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: const [
                          Icon(
                            Icons.check_circle,
                            color: Colors.green,
                            size: 16,
                          ),
                          SizedBox(width: 4),
                          Text(
                            'Resuelto',
                            style: TextStyle(
                              color: Colors.green,
                              fontSize: 12,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 12),

              // Enunciado resumido
              Text(
                ejercicio.enunciadoResumido,
                style: TextStyle(
                  fontSize: 15,
                  color: isDark ? Colors.grey[300] : Colors.black87,
                  height: 1.4,
                ),
                maxLines: 3,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 12),

              // Footer con tipo y puntos
              Row(
                children: [
                  // Tipo de ejercicio
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppTheme.primaryColor.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          _getIconoTipo(),
                          size: 14,
                          color: AppTheme.primaryColor,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          ejercicio.tipoEjercicioFormateado,
                          style: TextStyle(
                            fontSize: 12,
                            color: AppTheme.primaryColor,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                  ),
                  
                  // Lenguaje (si existe)
                  if (ejercicio.lenguajeProgramacion != null) ...[
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: isDark ? Colors.grey[800] : Colors.grey[200],
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        ejercicio.lenguajeProgramacion!,
                        style: TextStyle(
                          fontSize: 12,
                          color: isDark ? Colors.grey[400] : Colors.grey[600],
                        ),
                      ),
                    ),
                  ],
                  
                  const Spacer(),
                  
                  // Puntos
                  Row(
                    children: [
                      Icon(
                        Icons.star,
                        size: 16,
                        color: Colors.amber,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        '${ejercicio.puntosMaximos} pts',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          color: isDark ? Colors.white : Colors.black87,
                        ),
                      ),
                    ],
                  ),
                  
                  // Intentos (si hay)
                  if (ejercicio.intentos != null && ejercicio.intentos! > 0) ...[
                    const SizedBox(width: 12),
                    Row(
                      children: [
                        Icon(
                          Icons.replay,
                          size: 16,
                          color: isDark ? Colors.grey[500] : Colors.grey[600],
                        ),
                        const SizedBox(width: 4),
                        Text(
                          '${ejercicio.intentos}',
                          style: TextStyle(
                            color: isDark ? Colors.grey[500] : Colors.grey[600],
                          ),
                        ),
                      ],
                    ),
                  ],
                  
                  // Icono de flecha
                  const SizedBox(width: 8),
                  Icon(
                    Icons.chevron_right,
                    color: isDark ? Colors.grey[600] : Colors.grey[400],
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  IconData _getIconoTipo() {
    switch (ejercicio.tipoEjercicio.toLowerCase()) {
      case 'codigo_abierto':
      case 'codificación':
      case 'codificacion':
        return Icons.code;
      case 'opcion_multiple':
      case 'múltiple':
      case 'multiple':
        return Icons.check_box;
      case 'llenar_blancos':
      case 'completar':
        return Icons.text_fields;
      default:
        return Icons.assignment;
    }
  }
}
