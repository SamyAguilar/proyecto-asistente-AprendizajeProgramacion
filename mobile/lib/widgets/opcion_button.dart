// lib/widgets/opcion_button.dart

import 'package:flutter/material.dart';
import '../models/opcion_respuesta_model.dart';

enum OpcionEstado {
  normal,
  seleccionada,
  correcta,
  incorrecta,
}

class OpcionButton extends StatelessWidget {
  final OpcionRespuestaModel opcion;
  final bool seleccionada;
  final OpcionEstado? estado; // Para mostrar resultado después de responder
  final VoidCallback? onTap;
  final bool enabled;

  const OpcionButton({
    super.key,
    required this.opcion,
    this.seleccionada = false,
    this.estado,
    this.onTap,
    this.enabled = true,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final config = _getConfig(isDark);

    return AnimatedContainer(
      duration: const Duration(milliseconds: 200),
      decoration: BoxDecoration(
        color: config.backgroundColor,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: config.borderColor,
          width: seleccionada || estado != null ? 2 : 1,
        ),
        boxShadow: seleccionada
            ? [
                BoxShadow(
                  color: config.borderColor.withOpacity(0.3),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ]
            : null,
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: enabled ? onTap : null,
          borderRadius: BorderRadius.circular(12),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                // Letra de la opción
                Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(
                    color: config.letraBackgroundColor,
                    borderRadius: BorderRadius.circular(18),
                    border: Border.all(
                      color: config.borderColor,
                      width: 1.5,
                    ),
                  ),
                  child: Center(
                    child: estado == OpcionEstado.correcta
                        ? Icon(
                            Icons.check,
                            color: config.letraColor,
                            size: 20,
                          )
                        : estado == OpcionEstado.incorrecta
                            ? Icon(
                                Icons.close,
                                color: config.letraColor,
                                size: 20,
                              )
                            : Text(
                                opcion.letra,
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 16,
                                  color: config.letraColor,
                                ),
                              ),
                  ),
                ),
                const SizedBox(width: 16),
                
                // Texto de la opción
                Expanded(
                  child: Text(
                    opcion.textoOpcion,
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: seleccionada ? FontWeight.w600 : FontWeight.normal,
                      color: config.textColor,
                    ),
                  ),
                ),
                
                // Indicador de selección
                if (seleccionada && estado == null)
                  Icon(
                    Icons.check_circle,
                    color: config.borderColor,
                    size: 24,
                  ),
                
                // Indicador de resultado
                if (estado == OpcionEstado.correcta)
                  const Icon(
                    Icons.check_circle,
                    color: Colors.green,
                    size: 24,
                  ),
                if (estado == OpcionEstado.incorrecta)
                  const Icon(
                    Icons.cancel,
                    color: Colors.red,
                    size: 24,
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  _OpcionConfig _getConfig(bool isDark) {
    // Si hay un estado específico (después de responder)
    if (estado != null) {
      switch (estado!) {
        case OpcionEstado.correcta:
          return _OpcionConfig(
            backgroundColor: Colors.green.withOpacity(isDark ? 0.2 : 0.1),
            borderColor: Colors.green,
            textColor: isDark ? Colors.white : Colors.black87,
            letraBackgroundColor: Colors.green.withOpacity(0.2),
            letraColor: Colors.green,
          );
        case OpcionEstado.incorrecta:
          return _OpcionConfig(
            backgroundColor: Colors.red.withOpacity(isDark ? 0.2 : 0.1),
            borderColor: Colors.red,
            textColor: isDark ? Colors.white : Colors.black87,
            letraBackgroundColor: Colors.red.withOpacity(0.2),
            letraColor: Colors.red,
          );
        default:
          break;
      }
    }

    // Estado normal o seleccionado
    if (seleccionada) {
      return _OpcionConfig(
        backgroundColor: Colors.blue.withOpacity(isDark ? 0.2 : 0.1),
        borderColor: Colors.blue,
        textColor: isDark ? Colors.white : Colors.black87,
        letraBackgroundColor: Colors.blue,
        letraColor: Colors.white,
      );
    }

    // Estado normal (no seleccionado)
    return _OpcionConfig(
      backgroundColor: isDark ? Colors.grey[800]! : Colors.white,
      borderColor: isDark ? Colors.grey[600]! : Colors.grey[300]!,
      textColor: isDark ? Colors.grey[300]! : Colors.black87,
      letraBackgroundColor: isDark ? Colors.grey[700]! : Colors.grey[100]!,
      letraColor: isDark ? Colors.grey[400]! : Colors.grey[600]!,
    );
  }
}

class _OpcionConfig {
  final Color backgroundColor;
  final Color borderColor;
  final Color textColor;
  final Color letraBackgroundColor;
  final Color letraColor;

  _OpcionConfig({
    required this.backgroundColor,
    required this.borderColor,
    required this.textColor,
    required this.letraBackgroundColor,
    required this.letraColor,
  });
}
