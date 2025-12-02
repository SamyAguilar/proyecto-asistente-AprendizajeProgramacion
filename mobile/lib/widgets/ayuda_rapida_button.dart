// lib/widgets/ayuda_rapida_button.dart
// [LULU] Widget FAB flotante de "¿Necesitas ayuda?"

import 'package:flutter/material.dart';
import '../screens/ayuda/chat_screen.dart';
import '../screens/ayuda/analizar_codigo_screen.dart';

/// Floating Action Button para acceso rapido a la ayuda de LULU
class AyudaRapidaButton extends StatefulWidget {
  final String? codigoContexto;
  final String? preguntaContexto;

  const AyudaRapidaButton({
    super.key,
    this.codigoContexto,
    this.preguntaContexto,
  });

  @override
  State<AyudaRapidaButton> createState() => _AyudaRapidaButtonState();
}

class _AyudaRapidaButtonState extends State<AyudaRapidaButton>
    with SingleTickerProviderStateMixin {
  bool _isExpanded = false;
  late AnimationController _controller;
  late Animation<double> _expandAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 250),
    );
    _expandAnimation = CurvedAnimation(
      parent: _controller,
      curve: Curves.easeInOut,
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _toggle() {
    setState(() {
      _isExpanded = !_isExpanded;
      if (_isExpanded) {
        _controller.forward();
      } else {
        _controller.reverse();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        // Opciones expandibles
        ScaleTransition(
          scale: _expandAnimation,
          alignment: Alignment.bottomRight,
          child: FadeTransition(
            opacity: _expandAnimation,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                // Opcion: Chat con LULU
                _buildMiniButton(
                  context,
                  isDark: isDark,
                  icon: Icons.chat,
                  label: 'Chat con LULU',
                  color: Colors.blue,
                  onTap: () {
                    _toggle();
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => ChatScreen(
                          preguntaInicial: widget.preguntaContexto,
                          codigoContexto: widget.codigoContexto,
                        ),
                      ),
                    );
                  },
                ),
                const SizedBox(height: 8),

                // Opcion: Analizar codigo (si hay codigo en contexto)
                if (widget.codigoContexto != null &&
                    widget.codigoContexto!.isNotEmpty)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 8),
                    child: _buildMiniButton(
                      context,
                      isDark: isDark,
                      icon: Icons.code,
                      label: 'Analizar codigo',
                      color: Colors.green,
                      onTap: () {
                        _toggle();
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => AnalizarCodigoScreen(
                              codigoInicial: widget.codigoContexto,
                            ),
                          ),
                        );
                      },
                    ),
                  ),
              ],
            ),
          ),
        ),

        const SizedBox(height: 8),

        // FAB principal
        FloatingActionButton.extended(
          onPressed: _toggle,
          backgroundColor: Theme.of(context).primaryColor,
          icon: AnimatedRotation(
            turns: _isExpanded ? 0.125 : 0,
            duration: const Duration(milliseconds: 250),
            child: const Text(
              '🤖',
              style: TextStyle(fontSize: 20),
            ),
          ),
          label: Text(
            _isExpanded ? 'Cerrar' : '¿Necesitas ayuda?',
            style: const TextStyle(color: Colors.white),
          ),
        ),
      ],
    );
  }

  Widget _buildMiniButton(
    BuildContext context, {
    required bool isDark,
    required IconData icon,
    required String label,
    required Color color,
    required VoidCallback onTap,
  }) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          decoration: BoxDecoration(
            color: isDark ? Colors.grey[800] : Colors.white,
            borderRadius: BorderRadius.circular(20),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.1),
                blurRadius: 4,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Text(
            label,
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w500,
              color: isDark ? Colors.white : Colors.black87,
            ),
          ),
        ),
        const SizedBox(width: 8),
        FloatingActionButton.small(
          heroTag: 'fab_$label',
          onPressed: onTap,
          backgroundColor: color,
          child: Icon(icon, size: 20, color: Colors.white),
        ),
      ],
    );
  }
}

/// Version simplificada del FAB (solo abre chat)
class AyudaRapidaButtonSimple extends StatelessWidget {
  final String? codigoContexto;
  final String? preguntaContexto;

  const AyudaRapidaButtonSimple({
    super.key,
    this.codigoContexto,
    this.preguntaContexto,
  });

  @override
  Widget build(BuildContext context) {
    return FloatingActionButton(
      onPressed: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => ChatScreen(
              preguntaInicial: preguntaContexto,
              codigoContexto: codigoContexto,
            ),
          ),
        );
      },
      backgroundColor: Theme.of(context).primaryColor,
      tooltip: '¿Necesitas ayuda?',
      child: const Text('🤖', style: TextStyle(fontSize: 24)),
    );
  }
}
