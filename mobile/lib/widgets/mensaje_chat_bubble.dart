// lib/widgets/mensaje_chat_bubble.dart
// [LULU] Widget para burbujas de mensajes en el chat

import 'package:flutter/material.dart';
import '../models/mensaje_chat_model.dart';

class MensajeChatBubble extends StatelessWidget {
  final MensajeChatModel mensaje;
  final VoidCallback? onSugerenciaTap;

  const MensajeChatBubble({
    super.key,
    required this.mensaje,
    this.onSugerenciaTap,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final esUsuario = mensaje.esUsuario;

    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        mainAxisAlignment: esUsuario
            ? MainAxisAlignment.end
            : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (!esUsuario) ...[
            _buildAvatar(context, isDark, esUsuario: false),
            const SizedBox(width: 8),
          ],
          
          Flexible(
            child: Column(
              crossAxisAlignment: esUsuario
                  ? CrossAxisAlignment.end
                  : CrossAxisAlignment.start,
              children: [
                _buildBubble(context, isDark, esUsuario),
                
                // Sugerencias (solo para mensajes del asistente)
                if (!esUsuario && mensaje.tieneSugerencias)
                  _buildSugerencias(context, isDark),
              ],
            ),
          ),
          
          if (esUsuario) ...[
            const SizedBox(width: 8),
            _buildAvatar(context, isDark, esUsuario: true),
          ],
        ],
      ),
    );
  }

  Widget _buildAvatar(BuildContext context, bool isDark, {required bool esUsuario}) {
    if (esUsuario) {
      return CircleAvatar(
        radius: 16,
        backgroundColor: Theme.of(context).primaryColor.withOpacity(isDark ? 0.3 : 0.2),
        child: Icon(
          Icons.person,
          size: 18,
          color: Theme.of(context).primaryColor,
        ),
      );
    }
    
    return Container(
      width: 32,
      height: 32,
      decoration: BoxDecoration(
        color: isDark ? Colors.grey[800] : Colors.grey[200],
        shape: BoxShape.circle,
      ),
      child: const Center(
        child: Text('🤖', style: TextStyle(fontSize: 16)),
      ),
    );
  }

  Widget _buildBubble(BuildContext context, bool isDark, bool esUsuario) {
    Color bgColor;
    Color textColor;
    
    if (esUsuario) {
      bgColor = Theme.of(context).primaryColor;
      textColor = Colors.white;
    } else {
      bgColor = isDark ? Colors.grey[800]! : Colors.grey[200]!;
      textColor = isDark ? Colors.white : Colors.black87;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.only(
          topLeft: const Radius.circular(16),
          topRight: const Radius.circular(16),
          bottomLeft: Radius.circular(esUsuario ? 16 : 4),
          bottomRight: Radius.circular(esUsuario ? 4 : 16),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SelectableText(
            mensaje.contenido,
            style: TextStyle(
              color: textColor,
              fontSize: 15,
              height: 1.4,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            mensaje.horaFormateada,
            style: TextStyle(
              color: esUsuario
                  ? Colors.white.withOpacity(0.7)
                  : (isDark ? Colors.grey[500] : Colors.grey[600]),
              fontSize: 11,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSugerencias(BuildContext context, bool isDark) {
    return Padding(
      padding: const EdgeInsets.only(top: 8),
      child: Wrap(
        spacing: 6,
        runSpacing: 6,
        children: mensaje.sugerencias!.take(3).map((sugerencia) {
          return ActionChip(
            label: Text(
              sugerencia,
              style: TextStyle(
                fontSize: 12,
                color: isDark ? Colors.white70 : null,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
            backgroundColor: isDark ? Colors.grey[800] : null,
            side: isDark 
                ? BorderSide(color: Colors.grey[700]!)
                : null,
            onPressed: onSugerenciaTap,
          );
        }).toList(),
      ),
    );
  }
}

/// Widget de indicador de "escribiendo..."
class TypingIndicator extends StatefulWidget {
  const TypingIndicator({super.key});

  @override
  State<TypingIndicator> createState() => _TypingIndicatorState();
}

class _TypingIndicatorState extends State<TypingIndicator>
    with TickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 1000),
      vsync: this,
    )..repeat();
    _animation = Tween<double>(begin: 0, end: 1).animate(_controller);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
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
          const SizedBox(width: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: isDark ? Colors.grey[800] : Colors.grey[200],
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(16),
                topRight: Radius.circular(16),
                bottomLeft: Radius.circular(4),
                bottomRight: Radius.circular(16),
              ),
            ),
            child: AnimatedBuilder(
              animation: _animation,
              builder: (context, child) {
                return Row(
                  mainAxisSize: MainAxisSize.min,
                  children: List.generate(3, (index) {
                    final delay = index * 0.2;
                    final value = (_animation.value - delay).clamp(0.0, 0.5) * 2;
                    return Container(
                      margin: EdgeInsets.only(right: index < 2 ? 4 : 0),
                      width: 8,
                      height: 8,
                      decoration: BoxDecoration(
                        color: Color.lerp(
                          isDark ? Colors.grey[600] : Colors.grey[400],
                          isDark ? Colors.grey[400] : Colors.grey[600],
                          value,
                        ),
                        shape: BoxShape.circle,
                      ),
                    );
                  }),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
