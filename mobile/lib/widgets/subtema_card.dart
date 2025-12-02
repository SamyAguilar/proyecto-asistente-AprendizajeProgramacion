import 'package:flutter/material.dart';
import '../models/subtema_model.dart';

class SubtemaCard extends StatelessWidget {
  final SubtemaModel subtema;
  final VoidCallback onTap;
  final bool isCompletado;

  const SubtemaCard({
    Key? key,
    required this.subtema,
    required this.onTap,
    this.isCompletado = false,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 1,
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Row(
            children: [
              // Checkbox o ícono de estado
              Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  color: isCompletado
                      ? Colors.green.withOpacity(0.1)
                      : Colors.grey.withOpacity(0.1),
                  shape: BoxShape.circle,
                ),
                child: Center(
                  child: Icon(
                    isCompletado
                        ? Icons.check_circle
                        : Icons.radio_button_unchecked,
                    color: isCompletado ? Colors.green : Colors.grey,
                    size: 20,
                  ),
                ),
              ),
              const SizedBox(width: 16),

              // Contenido del subtema
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Text(
                          '${subtema.orden}.',
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                            color: Colors.grey[600],
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            subtema.nombre,
                            style: TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.bold,
                              decoration: isCompletado
                                  ? TextDecoration.lineThrough
                                  : null,
                            ),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      subtema.descripcion,
                      style: TextStyle(
                        fontSize: 13,
                        color: Colors.grey[600],
                        decoration: isCompletado
                            ? TextDecoration.lineThrough
                            : null,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),

              // Ícono de flecha
              Icon(
                Icons.arrow_forward_ios,
                size: 16,
                color: Colors.grey[400],
              ),
            ],
          ),
        ),
      ),
    );
  }
}