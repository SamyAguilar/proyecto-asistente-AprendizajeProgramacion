// lib/widgets/code_editor.dart

import 'package:flutter/material.dart';

class CodeEditor extends StatelessWidget {
  final TextEditingController controller;
  final String? lenguaje;
  final String? placeholder;
  final int minLines;
  final int maxLines;
  final bool readOnly;
  final ValueChanged<String>? onChanged;

  const CodeEditor({
    super.key,
    required this.controller,
    this.lenguaje,
    this.placeholder,
    this.minLines = 10,
    this.maxLines = 20,
    this.readOnly = false,
    this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E1E1E) : const Color(0xFFF5F5F5),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: isDark ? Colors.grey[700]! : Colors.grey[300]!,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header con lenguaje
          if (lenguaje != null)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: isDark ? Colors.grey[850] : Colors.grey[200],
                borderRadius: const BorderRadius.vertical(top: Radius.circular(7)),
              ),
              child: Row(
                children: [
                  Icon(
                    Icons.code,
                    size: 16,
                    color: isDark ? Colors.grey[400] : Colors.grey[600],
                  ),
                  const SizedBox(width: 8),
                  Text(
                    lenguaje!,
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                      color: isDark ? Colors.grey[400] : Colors.grey[600],
                    ),
                  ),
                  const Spacer(),
                  if (!readOnly)
                    IconButton(
                      icon: Icon(
                        Icons.content_paste,
                        size: 18,
                        color: isDark ? Colors.grey[400] : Colors.grey[600],
                      ),
                      tooltip: 'Pegar',
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(),
                      onPressed: () async {
                        // TODO: Implementar pegar desde clipboard
                      },
                    ),
                ],
              ),
            ),
          
          // Editor de texto
          Padding(
            padding: const EdgeInsets.all(12),
            child: TextField(
              controller: controller,
              readOnly: readOnly,
              maxLines: maxLines,
              minLines: minLines,
              style: TextStyle(
                fontFamily: 'monospace',
                fontSize: 14,
                height: 1.5,
                color: isDark ? Colors.grey[300] : Colors.grey[800],
              ),
              decoration: InputDecoration(
                hintText: placeholder ?? 'Escribe tu código aquí...',
                hintStyle: TextStyle(
                  fontFamily: 'monospace',
                  color: isDark ? Colors.grey[600] : Colors.grey[400],
                ),
                border: InputBorder.none,
                contentPadding: EdgeInsets.zero,
                isDense: true,
              ),
              keyboardType: TextInputType.multiline,
              textInputAction: TextInputAction.newline,
              onChanged: onChanged,
            ),
          ),
          
          // Footer con contador de líneas
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: isDark ? Colors.grey[850] : Colors.grey[200],
              borderRadius: const BorderRadius.vertical(bottom: Radius.circular(7)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                ValueListenableBuilder<TextEditingValue>(
                  valueListenable: controller,
                  builder: (context, value, _) {
                    final lineas = value.text.split('\n').length;
                    final caracteres = value.text.length;
                    return Text(
                      '$lineas líneas · $caracteres caracteres',
                      style: TextStyle(
                        fontSize: 11,
                        color: isDark ? Colors.grey[500] : Colors.grey[600],
                      ),
                    );
                  },
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
