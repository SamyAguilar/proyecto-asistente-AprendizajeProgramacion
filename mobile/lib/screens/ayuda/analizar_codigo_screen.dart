// lib/screens/ayuda/analizar_codigo_screen.dart
// [LUZIA] Pantalla para analizar codigo con IA

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/gemini_provider.dart';
import '../../models/retroalimentacion_model.dart';
import '../../widgets/loading_widget.dart';
import '../../widgets/error_widget.dart';

class AnalizarCodigoScreen extends StatefulWidget {
  final String? codigoInicial;
  final String? lenguaje;
  final String? enunciado;

  const AnalizarCodigoScreen({
    super.key,
    this.codigoInicial,
    this.lenguaje,
    this.enunciado,
  });

  @override
  State<AnalizarCodigoScreen> createState() => _AnalizarCodigoScreenState();
}

class _AnalizarCodigoScreenState extends State<AnalizarCodigoScreen> {
  final TextEditingController _codigoController = TextEditingController();
  String _lenguajeSeleccionado = 'javascript';
  bool _mostrarResultado = false;

  final List<Map<String, String>> _lenguajes = [
    {'value': 'javascript', 'label': 'JavaScript'},
    {'value': 'python', 'label': 'Python'},
    {'value': 'java', 'label': 'Java'},
    {'value': 'c', 'label': 'C'},
    {'value': 'cpp', 'label': 'C++'},
    {'value': 'csharp', 'label': 'C#'},
    {'value': 'php', 'label': 'PHP'},
    {'value': 'typescript', 'label': 'TypeScript'},
    {'value': 'dart', 'label': 'Dart'},
  ];

  @override
  void initState() {
    super.initState();
    if (widget.codigoInicial != null) {
      _codigoController.text = widget.codigoInicial!;
    }
    if (widget.lenguaje != null) {
      _lenguajeSeleccionado = widget.lenguaje!;
    }
  }

  @override
  void dispose() {
    _codigoController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Analizar Codigo'),
        centerTitle: true,
        actions: [
          if (_codigoController.text.isNotEmpty)
            IconButton(
              icon: const Icon(Icons.clear),
              tooltip: 'Limpiar',
              onPressed: _limpiar,
            ),
        ],
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
                
                const SizedBox(height: 20),
                
                // Selector de lenguaje
                _buildSelectorLenguaje(),
                
                const SizedBox(height: 16),
                
                // Editor de codigo
                _buildEditorCodigo(),
                
                const SizedBox(height: 20),
                
                // Botones de accion
                _buildBotonesAccion(gemini),
                
                const SizedBox(height: 24),
                
                // Resultado
                if (gemini.isLoading)
                  const Center(
                    child: Column(
                      children: [
                        CircularProgressIndicator(),
                        SizedBox(height: 16),
                        Text('LUZIA esta analizando tu codigo...'),
                      ],
                    ),
                  )
                else if (gemini.error != null)
                  ErrorDisplayWidget(
                    message: gemini.error!,
                    onRetry: () => _analizarCodigo(gemini),
                  )
                else if (_mostrarResultado && gemini.ultimoAnalisis != null)
                  _buildResultadoAnalisis(gemini.ultimoAnalisis!)
                else if (_mostrarResultado && gemini.ultimaExplicacion != null)
                  _buildResultadoExplicacion(gemini.ultimaExplicacion!),
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
        color: Colors.green.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.green.withOpacity(0.3)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.green.withOpacity(0.2),
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.code,
              color: Colors.green,
              size: 28,
            ),
          ),
          const SizedBox(width: 16),
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Analisis de codigo',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                SizedBox(height: 4),
                Text(
                  'Pega tu codigo y LUZIA te ayudara a mejorarlo o entenderlo',
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

  Widget _buildSelectorLenguaje() {
    return Row(
      children: [
        const Text(
          'Lenguaje:',
          style: TextStyle(fontWeight: FontWeight.w500),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: DropdownButtonFormField<String>(
            value: _lenguajeSeleccionado,
            decoration: InputDecoration(
              contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
            items: _lenguajes.map((lang) {
              return DropdownMenuItem(
                value: lang['value'],
                child: Text(lang['label']!),
              );
            }).toList(),
            onChanged: (value) {
              if (value != null) {
                setState(() {
                  _lenguajeSeleccionado = value;
                });
              }
            },
          ),
        ),
      ],
    );
  }

  Widget _buildEditorCodigo() {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF1E1E1E),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Barra de titulo
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: const BoxDecoration(
              color: Color(0xFF2D2D2D),
              borderRadius: BorderRadius.only(
                topLeft: Radius.circular(12),
                topRight: Radius.circular(12),
              ),
            ),
            child: Row(
              children: [
                const Icon(Icons.code, color: Colors.grey, size: 16),
                const SizedBox(width: 8),
                Text(
                  'Codigo $_lenguajeSeleccionado',
                  style: const TextStyle(
                    color: Colors.grey,
                    fontSize: 12,
                  ),
                ),
                const Spacer(),
                Text(
                  '${_codigoController.text.split('\n').length} lineas',
                  style: const TextStyle(
                    color: Colors.grey,
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),
          // Editor
          TextField(
            controller: _codigoController,
            maxLines: 12,
            style: const TextStyle(
              fontFamily: 'monospace',
              fontSize: 14,
              color: Colors.white,
            ),
            decoration: const InputDecoration(
              hintText: '// Pega tu codigo aqui...',
              hintStyle: TextStyle(color: Colors.grey),
              border: InputBorder.none,
              contentPadding: EdgeInsets.all(12),
            ),
            onChanged: (_) => setState(() {}),
          ),
        ],
      ),
    );
  }

  Widget _buildBotonesAccion(GeminiProvider gemini) {
    return Row(
      children: [
        Expanded(
          child: ElevatedButton.icon(
            onPressed: gemini.isLoading || _codigoController.text.trim().isEmpty
                ? null
                : () => _analizarCodigo(gemini),
            icon: const Icon(Icons.search),
            label: const Text('Analizar'),
            style: ElevatedButton.styleFrom(
              padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: OutlinedButton.icon(
            onPressed: gemini.isLoading || _codigoController.text.trim().isEmpty
                ? null
                : () => _explicarCodigo(gemini),
            icon: const Icon(Icons.description),
            label: const Text('Explicar'),
            style: OutlinedButton.styleFrom(
              padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildResultadoAnalisis(AnalisisCodigoModel analisis) {
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
            // Header
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: analisis.esValido 
                        ? Colors.green.withOpacity(0.1)
                        : Colors.orange.withOpacity(0.1),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    analisis.esValido ? Icons.check_circle : Icons.warning,
                    color: analisis.esValido ? Colors.green : Colors.orange,
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
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      if (analisis.puntuacion != null)
                        Text(
                          'Puntuacion: ${analisis.puntuacion}/100',
                          style: TextStyle(
                            fontSize: 13,
                            color: Colors.grey[600],
                          ),
                        ),
                    ],
                  ),
                ),
              ],
            ),
            
            const Divider(height: 24),
            
            // Retroalimentacion
            const Text(
              'Retroalimentacion:',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 8),
            SelectableText(
              analisis.retroalimentacion,
              style: const TextStyle(
                fontSize: 14,
                height: 1.5,
              ),
            ),
            
            // Sugerencias
            if (analisis.sugerencias.isNotEmpty) ...[
              const SizedBox(height: 16),
              const Text(
                'Sugerencias:',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 8),
              ...analisis.sugerencias.map((sugerencia) => Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Icon(Icons.lightbulb_outline, size: 18, color: Colors.amber),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        sugerencia,
                        style: const TextStyle(fontSize: 14),
                      ),
                    ),
                  ],
                ),
              )),
            ],
            
            const SizedBox(height: 16),
            
            // Boton nueva consulta
            Center(
              child: TextButton.icon(
                onPressed: _limpiar,
                icon: const Icon(Icons.refresh),
                label: const Text('Analizar otro codigo'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildResultadoExplicacion(ExplicacionCodigoModel explicacion) {
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
            // Header
            const Row(
              children: [
                CircleAvatar(
                  radius: 16,
                  child: Text('🤖', style: TextStyle(fontSize: 16)),
                ),
                SizedBox(width: 12),
                Text(
                  'Explicacion de LUZIA',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            
            const Divider(height: 24),
            
            // Explicacion general
            const Text(
              'Descripcion general:',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              explicacion.explicacionGeneral,
              style: const TextStyle(fontSize: 14, height: 1.5),
            ),
            
            // Explicacion linea por linea
            if (explicacion.lineas.isNotEmpty) ...[
              const SizedBox(height: 16),
              const Text(
                'Linea por linea:',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 8),
              ...explicacion.lineas.map((linea) => Container(
                margin: const EdgeInsets.only(bottom: 8),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.grey[100],
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
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            linea.codigo,
                            style: const TextStyle(
                              fontFamily: 'monospace',
                              fontSize: 12,
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
                      style: const TextStyle(fontSize: 13),
                    ),
                  ],
                ),
              )),
            ],
            
            // Conceptos clave
            if (explicacion.conceptosClave.isNotEmpty) ...[
              const SizedBox(height: 16),
              const Text(
                'Conceptos clave:',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: explicacion.conceptosClave.map((concepto) {
                  return Chip(
                    label: Text(concepto),
                    backgroundColor: Theme.of(context).primaryColor.withOpacity(0.1),
                  );
                }).toList(),
              ),
            ],
            
            const SizedBox(height: 16),
            
            Center(
              child: TextButton.icon(
                onPressed: _limpiar,
                icon: const Icon(Icons.refresh),
                label: const Text('Analizar otro codigo'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _analizarCodigo(GeminiProvider gemini) async {
    final codigo = _codigoController.text.trim();
    if (codigo.isEmpty) return;

    FocusScope.of(context).unfocus();

    await gemini.analizarCodigo(
      codigo,
      lenguaje: _lenguajeSeleccionado,
      enunciado: widget.enunciado,
    );

    setState(() {
      _mostrarResultado = true;
    });
  }

  Future<void> _explicarCodigo(GeminiProvider gemini) async {
    final codigo = _codigoController.text.trim();
    if (codigo.isEmpty) return;

    FocusScope.of(context).unfocus();

    await gemini.generarExplicacionCodigo(
      codigo,
      lenguaje: _lenguajeSeleccionado,
    );

    setState(() {
      _mostrarResultado = true;
    });
  }

  void _limpiar() {
    setState(() {
      _codigoController.clear();
      _mostrarResultado = false;
    });
    context.read<GeminiProvider>().limpiarRespuesta();
  }
}
