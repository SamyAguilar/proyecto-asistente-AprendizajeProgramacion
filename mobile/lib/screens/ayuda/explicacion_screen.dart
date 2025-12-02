// lib/screens/ayuda/explicacion_screen.dart
// [LUZIA] Pantalla para explicar conceptos de programacion

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/gemini_provider.dart';
import '../../widgets/loading_widget.dart';
import '../../widgets/error_widget.dart';

class ExplicacionScreen extends StatefulWidget {
  final String? conceptoInicial;
  final String? tema;
  final String? subtema;

  const ExplicacionScreen({
    super.key,
    this.conceptoInicial,
    this.tema,
    this.subtema,
  });

  @override
  State<ExplicacionScreen> createState() => _ExplicacionScreenState();
}

class _ExplicacionScreenState extends State<ExplicacionScreen> {
  final TextEditingController _conceptoController = TextEditingController();
  String? _explicacion;
  bool _mostrarResultado = false;

  // Conceptos sugeridos
  final List<String> _conceptosSugeridos = [
    'Variables',
    'Funciones',
    'Bucles for',
    'Bucles while',
    'Condicionales if/else',
    'Arrays',
    'Objetos',
    'Clases',
    'Herencia',
    'Recursion',
    'Callbacks',
    'Promesas',
    'Async/Await',
  ];

  @override
  void initState() {
    super.initState();
    if (widget.conceptoInicial != null) {
      _conceptoController.text = widget.conceptoInicial!;
    }
  }

  @override
  void dispose() {
    _conceptoController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Explicar Concepto'),
        centerTitle: true,
      ),
      body: Consumer<GeminiProvider>(
        builder: (context, gemini, _) {
          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header
                _buildHeader(),
                
                const SizedBox(height: 24),
                
                // Campo de texto para el concepto
                _buildInputConcepto(),
                
                const SizedBox(height: 16),
                
                // Conceptos sugeridos
                if (!_mostrarResultado) ...[
                  _buildConceptosSugeridos(),
                  const SizedBox(height: 24),
                ],
                
                // Boton de explicar
                _buildBotonExplicar(gemini),
                
                const SizedBox(height: 24),
                
                // Resultado
                if (gemini.isLoading)
                  const Center(
                    child: Column(
                      children: [
                        CircularProgressIndicator(),
                        SizedBox(height: 16),
                        Text('LUZIA esta pensando...'),
                      ],
                    ),
                  )
                else if (gemini.error != null)
                  ErrorDisplayWidget(
                    mensaje: gemini.error!,
                    onRetry: () => _explicarConcepto(gemini),
                  )
                else if (_mostrarResultado && _explicacion != null)
                  _buildResultado(),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.amber.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.amber.withOpacity(0.3)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.amber.withOpacity(0.2),
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.lightbulb,
              color: Colors.amber,
              size: 28,
            ),
          ),
          const SizedBox(width: 16),
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Aprende conceptos',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                SizedBox(height: 4),
                Text(
                  'Escribe un concepto y te lo explicare de forma clara y con ejemplos',
                  style: TextStyle(
                    fontSize: 13,
                    color: Colors.grey,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInputConcepto() {
    return TextField(
      controller: _conceptoController,
      textCapitalization: TextCapitalization.sentences,
      decoration: InputDecoration(
        labelText: 'Concepto a explicar',
        hintText: 'Ej: ¿Que es una funcion?',
        prefixIcon: const Icon(Icons.search),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        suffixIcon: _conceptoController.text.isNotEmpty
            ? IconButton(
                icon: const Icon(Icons.clear),
                onPressed: () {
                  _conceptoController.clear();
                  setState(() {
                    _mostrarResultado = false;
                  });
                },
              )
            : null,
      ),
      onChanged: (_) => setState(() {}),
      onSubmitted: (_) => _explicarConcepto(context.read<GeminiProvider>()),
    );
  }

  Widget _buildConceptosSugeridos() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Conceptos populares',
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w500,
            color: Colors.grey,
          ),
        ),
        const SizedBox(height: 12),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: _conceptosSugeridos.map((concepto) {
            return ActionChip(
              label: Text(concepto),
              onPressed: () {
                _conceptoController.text = concepto;
                setState(() {});
                _explicarConcepto(context.read<GeminiProvider>());
              },
            );
          }).toList(),
        ),
      ],
    );
  }

  Widget _buildBotonExplicar(GeminiProvider gemini) {
    return SizedBox(
      width: double.infinity,
      child: ElevatedButton.icon(
        onPressed: gemini.isLoading || _conceptoController.text.trim().isEmpty
            ? null
            : () => _explicarConcepto(gemini),
        icon: const Icon(Icons.lightbulb_outline),
        label: const Text('Explicar'),
        style: ElevatedButton.styleFrom(
          padding: const EdgeInsets.symmetric(vertical: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
      ),
    );
  }

  Widget _buildResultado() {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const CircleAvatar(
                  radius: 16,
                  child: Text('🤖', style: TextStyle(fontSize: 16)),
                ),
                const SizedBox(width: 12),
                const Expanded(
                  child: Text(
                    'Explicacion de LUZIA',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.copy),
                  tooltip: 'Copiar',
                  onPressed: () {
                    // Copiar al portapapeles
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Copiado al portapapeles')),
                    );
                  },
                ),
              ],
            ),
            const Divider(height: 24),
            SelectableText(
              _explicacion!,
              style: const TextStyle(
                fontSize: 15,
                height: 1.5,
              ),
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                TextButton.icon(
                  onPressed: () {
                    setState(() {
                      _mostrarResultado = false;
                      _explicacion = null;
                    });
                    _conceptoController.clear();
                  },
                  icon: const Icon(Icons.refresh),
                  label: const Text('Nueva pregunta'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _explicarConcepto(GeminiProvider gemini) async {
    final concepto = _conceptoController.text.trim();
    if (concepto.isEmpty) return;

    FocusScope.of(context).unfocus();

    final resultado = await gemini.explicarConcepto(
      concepto,
      tema: widget.tema,
      subtema: widget.subtema,
    );

    if (resultado != null) {
      setState(() {
        _explicacion = resultado;
        _mostrarResultado = true;
      });
    }
  }
}
