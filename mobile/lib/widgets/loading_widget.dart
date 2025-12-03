// lib/widgets/loading_widget.dart

import 'package:flutter/material.dart';
import '../config/theme.dart';

// ============================================
// WIDGET DE CARGA
// ============================================

class LoadingWidget extends StatelessWidget {
  final String? mensaje;  // ← CAMBIADO: message → mensaje
  final Color? color;
  final double size;

  const LoadingWidget({
    super.key,
    this.mensaje,  // ← CAMBIADO
    this.color,
    this.size = 40,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          SizedBox(
            width: size,
            height: size,
            child: CircularProgressIndicator(
              strokeWidth: 3,
              valueColor: AlwaysStoppedAnimation<Color>(
                color ?? AppTheme.primaryColor,
              ),
            ),
          ),
          if (mensaje != null) ...[  // ← CAMBIADO
            const SizedBox(height: 16),
            Text(
              mensaje!,  // ← CAMBIADO
              style: TextStyle(
                fontSize: 14,
                color: AppTheme.textSecondaryColor,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ],
      ),
    );
  }
}

// ============================================
// PANTALLA DE CARGA COMPLETA
// ============================================

class LoadingScreen extends StatelessWidget {
  final String? mensaje;  // ← CAMBIADO

  const LoadingScreen({
    super.key,
    this.mensaje,  // ← CAMBIADO
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: LoadingWidget(mensaje: mensaje),  // ← CAMBIADO
    );
  }
}

// ============================================
// OVERLAY DE CARGA
// ============================================

class LoadingOverlay extends StatelessWidget {
  final bool isLoading;
  final Widget child;
  final String? mensaje;  // ← CAMBIADO

  const LoadingOverlay({
    super.key,
    required this.isLoading,
    required this.child,
    this.mensaje,  // ← CAMBIADO
  });

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        child,
        if (isLoading)
          Container(
            color: Colors.black.withOpacity(0.3),
            child: LoadingWidget(
              mensaje: mensaje,  // ← CAMBIADO
              color: Colors.white,
            ),
          ),
      ],
    );
  }
}