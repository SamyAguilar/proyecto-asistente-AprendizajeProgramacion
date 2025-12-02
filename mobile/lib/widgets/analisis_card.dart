// lib/widgets/analisis_card.dart
// [LULU] Widget para mostrar analisis de codigo

import 'package:flutter/material.dart';
import '../models/retroalimentacion_model.dart';

class AnalisisCard extends StatelessWidget {
  final AnalisisCodigoModel analisis;
  final VoidCallback? onNuevoAnalisis;

  const AnalisisCard({
    super.key,
    required this.analisis,
    this.onNuevoAnalisis,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Card(
      elevation: isDark ? 0 : 2,
      color: isDark ? Colors.grey[850] : Colors.white,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: isDark
            ? BorderSide(color: Colors.grey[700]!, width: 1)
            : BorderSide.none,
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header con estado
            _buildHeader(context, isDark),

            Divider(
              height: 24,
              color: isDark ? Colors.grey[700] : Colors.grey[300],
            ),

            // Error (si existe)
            if (analisis.error != null && analisis.error!.isNotEmpty) ...[
              _buildErrorSection(context, isDark),
              const SizedBox(height: 16),
            ],

            // Retroalimentacion
            _buildRetroalimentacionSection(context, isDark),

            // Sugerencias
            if (analisis.sugerencias.isNotEmpty) ...[
              const SizedBox(height: 16),
              _buildSugerenciasSection(context, isDark),
            ],

            // Boton nuevo analisis
            if (onNuevoAnalisis != null) ...[
              const SizedBox(height: 16),
              Center(
                child: TextButton.icon(
                  onPressed: onNuevoAnalisis,
                  icon: const Icon(Icons.refresh),
                  label: const Text('Analizar otro codigo'),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context, bool isDark) {
    final color = analisis.esValido ? Colors.green : Colors.orange;
    
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: color.withOpacity(isDark ? 0.2 : 0.1),
            shape: BoxShape.circle,
          ),
          child: Icon(
            analisis.esValido ? Icons.check_circle : Icons.warning,
            color: isDark ? color.withOpacity(0.9) : color,
            size: 24,
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                analisis.esValido
                    ? 'Codigo correcto'
                    : 'Se encontraron observaciones',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: isDark ? Colors.white : Colors.black87,
                ),
              ),
              if (analisis.puntuacion != null)
                Row(
                  children: [
                    Icon(
                      Icons.star,
                      size: 14,
                      color: Colors.amber[isDark ? 300 : 600],
                    ),
                    const SizedBox(width: 4),
                    Text(
                      'Puntuacion: ${analisis.puntuacion}/100',
                      style: TextStyle(
                        fontSize: 13,
                        color: isDark ? Colors.grey[400] : Colors.grey[600],
                      ),
                    ),
                  ],
                ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildErrorSection(BuildContext context, bool isDark) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.red.withOpacity(isDark ? 0.2 : 0.1),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: Colors.red.withOpacity(isDark ? 0.3 : 0.2),
        ),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(
            Icons.error_outline,
            color: isDark ? Colors.red[300] : Colors.red,
            size: 20,
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              analisis.error!,
              style: TextStyle(
                fontSize: 14,
                color: isDark ? Colors.red[200] : Colors.red[700],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRetroalimentacionSection(BuildContext context, bool isDark) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Retroalimentacion:',
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: isDark ? Colors.white : Colors.black87,
          ),
        ),
        const SizedBox(height: 8),
        SelectableText(
          analisis.retroalimentacion,
          style: TextStyle(
            fontSize: 14,
            height: 1.5,
            color: isDark ? Colors.grey[300] : Colors.grey[700],
          ),
        ),
      ],
    );
  }

  Widget _buildSugerenciasSection(BuildContext context, bool isDark) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Sugerencias:',
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: isDark ? Colors.white : Colors.black87,
          ),
        ),
        const SizedBox(height: 8),
        ...analisis.sugerencias.map((sugerencia) => Padding(
          padding: const EdgeInsets.only(bottom: 8),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(
                Icons.lightbulb_outline,
                size: 18,
                color: Colors.amber[isDark ? 300 : 600],
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  sugerencia,
                  style: TextStyle(
                    fontSize: 14,
                    color: isDark ? Colors.grey[300] : Colors.grey[700],
                  ),
                ),
              ),
            ],
          ),
        )),
      ],
    );
  }
}

/// Widget para mostrar explicacion de codigo linea por linea
class ExplicacionCodigoCard extends StatelessWidget {
  final ExplicacionCodigoModel explicacion;
  final VoidCallback? onNuevoAnalisis;

  const ExplicacionCodigoCard({
    super.key,
    required this.explicacion,
    this.onNuevoAnalisis,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Card(
      elevation: isDark ? 0 : 2,
      color: isDark ? Colors.grey[850] : Colors.white,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: isDark
            ? BorderSide(color: Colors.grey[700]!, width: 1)
            : BorderSide.none,
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Row(
              children: [
                Container(
                  width: 32,
                  height: 32,
                  decoration: BoxDecoration(
                    color: isDark ? Colors.grey[800] : Colors.grey[200],
                    shape: BoxShape.circle,
                  ),
                  child: const Center(
                    child: Text('🤖', style: TextStyle(fontSize: 16)),
                  ),
                ),
                const SizedBox(width: 12),
                Text(
                  'Explicacion de LULU',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: isDark ? Colors.white : Colors.black87,
                  ),
                ),
              ],
            ),

            Divider(
              height: 24,
              color: isDark ? Colors.grey[700] : Colors.grey[300],
            ),

            // Explicacion general
            Text(
              'Descripcion general:',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: isDark ? Colors.white : Colors.black87,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              explicacion.explicacionGeneral,
              style: TextStyle(
                fontSize: 14,
                height: 1.5,
                color: isDark ? Colors.grey[300] : Colors.grey[700],
              ),
            ),

            // Lineas explicadas
            if (explicacion.lineas.isNotEmpty) ...[
              const SizedBox(height: 16),
              Text(
                'Linea por linea:',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: isDark ? Colors.white : Colors.black87,
                ),
              ),
              const SizedBox(height: 8),
              ...explicacion.lineas.map((linea) => _buildLineaExplicada(
                context,
                linea,
                isDark,
              )),
            ],

            // Conceptos clave
            if (explicacion.conceptosClave.isNotEmpty) ...[
              const SizedBox(height: 16),
              Text(
                'Conceptos clave:',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: isDark ? Colors.white : Colors.black87,
                ),
              ),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: explicacion.conceptosClave.map((concepto) {
                  return Chip(
                    label: Text(
                      concepto,
                      style: TextStyle(
                        fontSize: 12,
                        color: isDark ? Colors.white70 : null,
                      ),
                    ),
                    backgroundColor: Theme.of(context)
                        .primaryColor
                        .withOpacity(isDark ? 0.2 : 0.1),
                  );
                }).toList(),
              ),
            ],

            // Boton
            if (onNuevoAnalisis != null) ...[
              const SizedBox(height: 16),
              Center(
                child: TextButton.icon(
                  onPressed: onNuevoAnalisis,
                  icon: const Icon(Icons.refresh),
                  label: const Text('Analizar otro codigo'),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildLineaExplicada(
    BuildContext context,
    LineaExplicada linea,
    bool isDark,
  ) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: isDark ? Colors.grey[800] : Colors.grey[100],
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: Theme.of(context).primaryColor,
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  'L${linea.numero}',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  linea.codigo,
                  style: TextStyle(
                    fontFamily: 'monospace',
                    fontSize: 12,
                    color: isDark ? Colors.grey[300] : Colors.grey[800],
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            linea.explicacion,
            style: TextStyle(
              fontSize: 13,
              color: isDark ? Colors.grey[400] : Colors.grey[600],
            ),
          ),
        ],
      ),
    );
  }
}
