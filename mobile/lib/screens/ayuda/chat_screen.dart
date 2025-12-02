// lib/screens/ayuda/chat_screen.dart
// [LUZIA] Pantalla de chat con el asistente IA

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/gemini_provider.dart';
import '../../models/mensaje_chat_model.dart';

class ChatScreen extends StatefulWidget {
  final String? preguntaInicial;
  final String? codigoContexto;

  const ChatScreen({
    super.key,
    this.preguntaInicial,
    this.codigoContexto,
  });

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final TextEditingController _mensajeController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  final FocusNode _focusNode = FocusNode();

  @override
  void initState() {
    super.initState();

    // Si hay pregunta inicial, enviarla automaticamente
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (widget.preguntaInicial != null && widget.preguntaInicial!.isNotEmpty) {
        _enviarMensaje(widget.preguntaInicial!);
      }
    });
  }

  @override
  void dispose() {
    _mensajeController.dispose();
    _scrollController.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('🤖', style: TextStyle(fontSize: 24)),
            SizedBox(width: 8),
            Text('LUZIA'),
          ],
        ),
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.delete_outline),
            tooltip: 'Limpiar chat',
            onPressed: _limpiarChat,
          ),
        ],
      ),
      body: Column(
        children: [
          // Lista de mensajes
          Expanded(
            child: Consumer<GeminiProvider>(
              builder: (context, gemini, _) {
                if (gemini.historialChat.isEmpty) {
                  return _buildEmptyState(isDark);
                }

                return ListView.builder(
                  controller: _scrollController,
                  padding: const EdgeInsets.all(16),
                  itemCount: gemini.historialChat.length + (gemini.isLoading ? 1 : 0),
                  itemBuilder: (context, index) {
                    if (index == gemini.historialChat.length && gemini.isLoading) {
                      return _buildTypingIndicator(isDark);
                    }

                    final mensaje = gemini.historialChat[index];
                    return _buildMensajeBubble(mensaje, isDark);
                  },
                );
              },
            ),
          ),

          // Sugerencias (si las hay)
          Consumer<GeminiProvider>(
            builder: (context, gemini, _) {
              final ultimoMensaje = gemini.historialChat.isNotEmpty
                  ? gemini.historialChat.last
                  : null;

              if (ultimoMensaje != null &&
                  ultimoMensaje.esAsistente &&
                  ultimoMensaje.tieneSugerencias) {
                return _buildSugerencias(ultimoMensaje.sugerencias!, isDark);
              }

              return const SizedBox.shrink();
            },
          ),

          // Input de mensaje
          _buildInputArea(isDark),
        ],
      ),
    );
  }

  Widget _buildEmptyState(bool isDark) {
    return Center(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 100,
              height: 100,
              decoration: BoxDecoration(
                color: Theme.of(context).primaryColor.withOpacity(isDark ? 0.2 : 0.1),
                shape: BoxShape.circle,
              ),
              child: const Center(
                child: Text('🤖', style: TextStyle(fontSize: 50)),
              ),
            ),
            const SizedBox(height: 24),
            Text(
              'Hola! Soy LUZIA',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: isDark ? Colors.white : Colors.black87,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Preguntame lo que necesites sobre programacion',
              style: TextStyle(
                fontSize: 16,
                color: isDark ? Colors.grey[400] : Colors.grey[600],
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 32),

            // Sugerencias iniciales
            Wrap(
              spacing: 8,
              runSpacing: 8,
              alignment: WrapAlignment.center,
              children: [
                _buildSugerenciaChip('¿Que es una variable?', isDark),
                _buildSugerenciaChip('¿Como funciona un bucle?', isDark),
                _buildSugerenciaChip('Ayuda con mi codigo', isDark),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSugerenciaChip(String texto, bool isDark) {
    return ActionChip(
      label: Text(
        texto,
        style: TextStyle(
          color: isDark ? Colors.white70 : null,
        ),
      ),
      backgroundColor: isDark ? Colors.grey[800] : null,
      side: isDark ? BorderSide(color: Colors.grey[700]!) : null,
      onPressed: () => _enviarMensaje(texto),
      avatar: Icon(
        Icons.lightbulb_outline,
        size: 18,
        color: isDark ? Colors.amber[300] : null,
      ),
    );
  }

  Widget _buildMensajeBubble(MensajeChatModel mensaje, bool isDark) {
    final esUsuario = mensaje.esUsuario;

    // Colores para modo oscuro
    Color bubbleColor;
    Color textColor;

    if (esUsuario) {
      bubbleColor = Theme.of(context).primaryColor;
      textColor = Colors.white;
    } else {
      bubbleColor = isDark ? Colors.grey[800]! : Colors.grey[200]!;
      textColor = isDark ? Colors.white : Colors.black87;
    }

    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        mainAxisAlignment: esUsuario
            ? MainAxisAlignment.end
            : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (!esUsuario) ...[
            CircleAvatar(
              radius: 16,
              backgroundColor: isDark ? Colors.grey[700] : Colors.grey[300],
              child: const Text('🤖', style: TextStyle(fontSize: 16)),
            ),
            const SizedBox(width: 8),
          ],

          Flexible(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                color: bubbleColor,
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
            ),
          ),

          if (esUsuario) ...[
            const SizedBox(width: 8),
            CircleAvatar(
              radius: 16,
              backgroundColor: Theme.of(context).primaryColor.withOpacity(isDark ? 0.3 : 0.2),
              child: Icon(
                Icons.person,
                size: 18,
                color: Theme.of(context).primaryColor,
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildTypingIndicator(bool isDark) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          CircleAvatar(
            radius: 16,
            backgroundColor: isDark ? Colors.grey[700] : Colors.grey[300],
            child: const Text('🤖', style: TextStyle(fontSize: 16)),
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
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                _buildDot(0, isDark),
                const SizedBox(width: 4),
                _buildDot(1, isDark),
                const SizedBox(width: 4),
                _buildDot(2, isDark),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDot(int index, bool isDark) {
    return TweenAnimationBuilder<double>(
      tween: Tween(begin: 0, end: 1),
      duration: Duration(milliseconds: 600 + (index * 200)),
      builder: (context, value, child) {
        return Container(
          width: 8,
          height: 8,
          decoration: BoxDecoration(
            color: isDark ? Colors.grey[500] : Colors.grey[400],
            shape: BoxShape.circle,
          ),
        );
      },
    );
  }

  Widget _buildSugerencias(List<String> sugerencias, bool isDark) {
    return Container(
      height: 50,
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: sugerencias.length,
        separatorBuilder: (_, __) => const SizedBox(width: 8),
        itemBuilder: (context, index) {
          return ActionChip(
            label: Text(
              sugerencias[index],
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                color: isDark ? Colors.white70 : null,
              ),
            ),
            backgroundColor: isDark ? Colors.grey[800] : null,
            side: isDark ? BorderSide(color: Colors.grey[700]!) : null,
            onPressed: () => _enviarMensaje(sugerencias[index]),
          );
        },
      ),
    );
  }

  Widget _buildInputArea(bool isDark) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? Colors.grey[900] : Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(isDark ? 0.3 : 0.05),
            blurRadius: 10,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: SafeArea(
        child: Row(
          children: [
            Expanded(
              child: TextField(
                controller: _mensajeController,
                focusNode: _focusNode,
                textCapitalization: TextCapitalization.sentences,
                maxLines: null,
                keyboardType: TextInputType.multiline,
                style: TextStyle(
                  color: isDark ? Colors.white : Colors.black87,
                ),
                decoration: InputDecoration(
                  hintText: 'Escribe tu pregunta...',
                  hintStyle: TextStyle(
                    color: isDark ? Colors.grey[500] : Colors.grey[400],
                  ),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(24),
                    borderSide: BorderSide.none,
                  ),
                  filled: true,
                  fillColor: isDark ? Colors.grey[800] : Colors.grey[100],
                  contentPadding: const EdgeInsets.symmetric(
                    horizontal: 20,
                    vertical: 12,
                  ),
                ),
                onSubmitted: (value) {
                  if (value.trim().isNotEmpty) {
                    _enviarMensaje(value);
                  }
                },
              ),
            ),
            const SizedBox(width: 8),
            Consumer<GeminiProvider>(
              builder: (context, gemini, _) {
                return FloatingActionButton(
                  onPressed: gemini.isLoading
                      ? null
                      : () {
                    final texto = _mensajeController.text.trim();
                    if (texto.isNotEmpty) {
                      _enviarMensaje(texto);
                    }
                  },
                  mini: true,
                  child: gemini.isLoading
                      ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: Colors.white,
                    ),
                  )
                      : const Icon(Icons.send),
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _enviarMensaje(String mensaje) async {
    _mensajeController.clear();
    _focusNode.unfocus();

    final gemini = context.read<GeminiProvider>();

    // Agregar contexto de codigo si existe
    Map<String, dynamic>? contexto;
    if (widget.codigoContexto != null && widget.codigoContexto!.isNotEmpty) {
      contexto = {'codigo_actual': widget.codigoContexto};
    }

    await gemini.enviarMensajeChat(mensaje, contexto: contexto);

    // Scroll al final
    _scrollToBottom();
  }

  void _scrollToBottom() {
    if (_scrollController.hasClients) {
      Future.delayed(const Duration(milliseconds: 100), () {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      });
    }
  }

  void _limpiarChat() {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: isDark ? Colors.grey[850] : null,
        title: Text(
          'Limpiar chat',
          style: TextStyle(color: isDark ? Colors.white : null),
        ),
        content: Text(
          '¿Estas seguro de que quieres limpiar todo el chat?',
          style: TextStyle(color: isDark ? Colors.grey[300] : null),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancelar'),
          ),
          TextButton(
            onPressed: () {
              context.read<GeminiProvider>().limpiarChat();
              Navigator.pop(context);
            },
            child: const Text('Limpiar'),
          ),
        ],
      ),
    );
  }
}