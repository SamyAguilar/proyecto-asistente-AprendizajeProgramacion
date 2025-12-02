// lib/widgets/error_widget.dart

import 'package:flutter/material.dart' hide ErrorWidget;
import '../config/theme.dart';
import 'custom_button.dart';

// ============================================
// WIDGET DE ERROR
// ============================================

class ErrorDisplayWidget extends StatelessWidget {
  final String mensaje;  // ← CAMBIADO: message → mensaje
  final String? detalles;  // ← CAMBIADO: details → detalles
  final VoidCallback? onRetry;
  final IconData icon;

  const ErrorDisplayWidget({
    super.key,
    required this.mensaje,  // ← CAMBIADO
    this.detalles,  // ← CAMBIADO
    this.onRetry,
    this.icon = Icons.error_outline,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon,
              size: 64,
              color: AppTheme.errorColor,
            ),
            const SizedBox(height: 16),
            Text(
              mensaje,  // ← CAMBIADO
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w600,
                color: AppTheme.textPrimaryColor,
              ),
              textAlign: TextAlign.center,
            ),
            if (detalles != null) ...[  // ← CAMBIADO
              const SizedBox(height: 8),
              Text(
                detalles!,  // ← CAMBIADO
                style: const TextStyle(
                  fontSize: 14,
                  color: AppTheme.textSecondaryColor,
                ),
                textAlign: TextAlign.center,
              ),
            ],
            if (onRetry != null) ...[
              const SizedBox(height: 24),
              CustomButton(
                text: 'Reintentar',
                onPressed: onRetry,
                icon: Icons.refresh,
                width: 160,
              ),
            ],
          ],
        ),
      ),
    );
  }
}

// ============================================
// ALIAS PARA COMPATIBILIDAD
// ============================================
// Permite usar ErrorWidget en lugar de ErrorDisplayWidget
typedef ErrorWidget = ErrorDisplayWidget;

// ============================================
// WIDGET DE ESTADO VACIO
// ============================================

class EmptyStateWidget extends StatelessWidget {
  final String title;
  final String? subtitle;
  final IconData icon;
  final String? buttonText;
  final VoidCallback? onButtonPressed;

  const EmptyStateWidget({
    super.key,
    required this.title,
    this.subtitle,
    this.icon = Icons.inbox_outlined,
    this.buttonText,
    this.onButtonPressed,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon,
              size: 80,
              color: AppTheme.textSecondaryColor.withOpacity(0.5),
            ),
            const SizedBox(height: 16),
            Text(
              title,
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w600,
                color: AppTheme.textPrimaryColor,
              ),
              textAlign: TextAlign.center,
            ),
            if (subtitle != null) ...[
              const SizedBox(height: 8),
              Text(
                subtitle!,
                style: const TextStyle(
                  fontSize: 14,
                  color: AppTheme.textSecondaryColor,
                ),
                textAlign: TextAlign.center,
              ),
            ],
            if (buttonText != null && onButtonPressed != null) ...[
              const SizedBox(height: 24),
              CustomButton(
                text: buttonText!,
                onPressed: onButtonPressed,
                width: 200,
              ),
            ],
          ],
        ),
      ),
    );
  }
}

// ============================================
// WIDGET DE CONEXION PERDIDA
// ============================================

class NoConnectionWidget extends StatelessWidget {
  final VoidCallback? onRetry;

  const NoConnectionWidget({
    super.key,
    this.onRetry,
  });

  @override
  Widget build(BuildContext context) {
    return ErrorDisplayWidget(
      mensaje: 'Sin conexion a internet',  // ← CAMBIADO
      detalles: 'Verifica tu conexion e intenta de nuevo',  // ← CAMBIADO
      icon: Icons.wifi_off,
      onRetry: onRetry,
    );
  }
}