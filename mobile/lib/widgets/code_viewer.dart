// lib/widgets/code_viewer.dart

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class CodeViewer extends StatelessWidget {
  final String codigo;
  final String? lenguaje;
  final double? maxHeight;
  final bool showLineNumbers;
  final bool showCopyButton;

  const CodeViewer({
    super.key,
    required this.codigo,
    this.lenguaje,
    this.maxHeight,
    this.showLineNumbers = true,
    this.showCopyButton = true,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final lineas = codigo.split('\n');

    return Container(
      constraints: maxHeight != null 
          ? BoxConstraints(maxHeight: maxHeight!) 
          : null,
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E1E1E) : const Color(0xFFF8F8F8),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: isDark ? Colors.grey[700]! : Colors.grey[300]!,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          // Header
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: isDark ? Colors.grey[850] : Colors.grey[200],
              borderRadius: const BorderRadius.vertical(top: Radius.circular(7)),
            ),
            child: Row(
              children: [
                // Dots estilo terminal
                Row(
                  children: [
                    _buildDot(Colors.red),
                    const SizedBox(width: 4),
                    _buildDot(Colors.amber),
                    const SizedBox(width: 4),
                    _buildDot(Colors.green),
                  ],
                ),
                const SizedBox(width: 12),
                
                // Lenguaje
                if (lenguaje != null)
                  Text(
                    lenguaje!,
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                      color: isDark ? Colors.grey[400] : Colors.grey[600],
                    ),
                  ),
                
                const Spacer(),
                
                // Botón copiar
                if (showCopyButton)
                  InkWell(
                    onTap: () => _copiarCodigo(context),
                    borderRadius: BorderRadius.circular(4),
                    child: Padding(
                      padding: const EdgeInsets.all(4),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            Icons.copy,
                            size: 14,
                            color: isDark ? Colors.grey[400] : Colors.grey[600],
                          ),
                          const SizedBox(width: 4),
                          Text(
                            'Copiar',
                            style: TextStyle(
                              fontSize: 12,
                              color: isDark ? Colors.grey[400] : Colors.grey[600],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
              ],
            ),
          ),
          
          // Código
          Flexible(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(12),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Números de línea
                  if (showLineNumbers)
                    Padding(
                      padding: const EdgeInsets.only(right: 12),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: List.generate(lineas.length, (index) {
                          return Text(
                            '${index + 1}',
                            style: TextStyle(
                              fontFamily: 'monospace',
                              fontSize: 13,
                              height: 1.5,
                              color: isDark ? Colors.grey[600] : Colors.grey[400],
                            ),
                          );
                        }),
                      ),
                    ),
                  
                  // Separador
                  if (showLineNumbers)
                    Container(
                      width: 1,
                      height: lineas.length * 19.5, // Aproximado según line height
                      color: isDark ? Colors.grey[700] : Colors.grey[300],
                      margin: const EdgeInsets.only(right: 12),
                    ),
                  
                  // Código
                  Expanded(
                    child: SelectableText(
                      codigo,
                      style: TextStyle(
                        fontFamily: 'monospace',
                        fontSize: 13,
                        height: 1.5,
                        color: isDark ? Colors.grey[300] : Colors.grey[800],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDot(Color color) {
    return Container(
      width: 12,
      height: 12,
      decoration: BoxDecoration(
        color: color,
        shape: BoxShape.circle,
      ),
    );
  }

  void _copiarCodigo(BuildContext context) {
    Clipboard.setData(ClipboardData(text: codigo));
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Código copiado al portapapeles'),
        duration: Duration(seconds: 2),
      ),
    );
  }
}
