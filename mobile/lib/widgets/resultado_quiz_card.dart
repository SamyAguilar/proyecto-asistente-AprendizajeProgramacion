// lib/widgets/resultado_quiz_card.dart

import 'package:flutter/material.dart';
import '../models/pregunta_quiz_model.dart';
import '../models/intento_quiz_model.dart';

class ResultadoQuizCard extends StatefulWidget {
  final int numero;
  final PreguntaQuizModel pregunta;
  final IntentoQuizModel resultado;
  final int? respuestaSeleccionada;

  const ResultadoQuizCard({
    super.key,
    required this.numero,
    required this.pregunta,
    required this.resultado,
    this.respuestaSeleccionada,
  });

  @override
  State<ResultadoQuizCard> createState() => _ResultadoQuizCardState();
}

class _ResultadoQuizCardState extends State<ResultadoQuizCard> {
  bool _expandido = false;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final esCorrecta = widget.resultado.esCorrecta;

    return Column(
      children: [
        // Header del resultado
        InkWell(
          onTap: () {
            setState(() {
              _expandido = !_expandido;
            });
          },
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 12),
            child: Row(
              children: [
                // Número de pregunta con indicador
                Container(
                  width: 32,
                  height: 32,
                  decoration: BoxDecoration(
                    color: esCorrecta 
                        ? Colors.green.withOpacity(0.2)
                        : Colors.red.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Center(
                    child: Icon(
                      esCorrecta ? Icons.check : Icons.close,
                      color: esCorrecta ? Colors.green : Colors.red,
                      size: 18,
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                
                // Texto de la pregunta (resumido)
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Pregunta ${widget.numero}',
                        style: TextStyle(
                          fontSize: 12,
                          color: isDark ? Colors.grey[500] : Colors.grey[600],
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        _resumirTexto(widget.pregunta.preguntaTexto, 50),
                        style: TextStyle(
                          fontSize: 14,
                          color: isDark ? Colors.grey[300] : Colors.black87,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
                
                // Puntos
                if (widget.resultado.puntosObtenidos > 0)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.amber.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(
                          Icons.star,
                          color: Colors.amber,
                          size: 14,
                        ),
                        const SizedBox(width: 2),
                        Text(
                          '${widget.resultado.puntosObtenidos}',
                          style: const TextStyle(
                            color: Colors.amber,
                            fontWeight: FontWeight.bold,
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                  ),
                const SizedBox(width: 8),
                
                // Icono expandir
                Icon(
                  _expandido ? Icons.expand_less : Icons.expand_more,
                  color: isDark ? Colors.grey[500] : Colors.grey[400],
                ),
              ],
            ),
          ),
        ),
        
        // Contenido expandido
        if (_expandido)
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(12),
            margin: const EdgeInsets.only(bottom: 8),
            decoration: BoxDecoration(
              color: isDark ? Colors.grey[800] : Colors.grey[100],
              borderRadius: BorderRadius.circular(8),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Pregunta completa
                Text(
                  widget.pregunta.preguntaTexto,
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                    color: isDark ? Colors.white : Colors.black87,
                  ),
                ),
                const SizedBox(height: 12),
                
                // Opciones con indicadores
                ...widget.pregunta.opciones.map((opcion) {
                  final fueSeleccionada = opcion.id == widget.respuestaSeleccionada;
                  // Nota: No sabemos cuál es la correcta desde el frontend
                  // solo sabemos si la respuesta del usuario fue correcta
                  final esLaRespuestaCorrecta = fueSeleccionada && esCorrecta;
                  final esLaRespuestaIncorrecta = fueSeleccionada && !esCorrecta;

                  return Padding(
                    padding: const EdgeInsets.symmetric(vertical: 4),
                    child: Row(
                      children: [
                        // Letra
                        Container(
                          width: 24,
                          height: 24,
                          decoration: BoxDecoration(
                            color: esLaRespuestaCorrecta
                                ? Colors.green.withOpacity(0.2)
                                : esLaRespuestaIncorrecta
                                    ? Colors.red.withOpacity(0.2)
                                    : (isDark ? Colors.grey[700] : Colors.grey[200]),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Center(
                            child: esLaRespuestaCorrecta
                                ? const Icon(Icons.check, color: Colors.green, size: 14)
                                : esLaRespuestaIncorrecta
                                    ? const Icon(Icons.close, color: Colors.red, size: 14)
                                    : Text(
                                        opcion.letra,
                                        style: TextStyle(
                                          fontSize: 12,
                                          fontWeight: FontWeight.bold,
                                          color: isDark ? Colors.grey[400] : Colors.grey[600],
                                        ),
                                      ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        
                        // Texto de la opción
                        Expanded(
                          child: Text(
                            opcion.textoOpcion,
                            style: TextStyle(
                              fontSize: 13,
                              color: fueSeleccionada
                                  ? (esCorrecta ? Colors.green : Colors.red)
                                  : (isDark ? Colors.grey[400] : Colors.grey[700]),
                              fontWeight: fueSeleccionada ? FontWeight.w600 : FontWeight.normal,
                            ),
                          ),
                        ),
                        
                        // Indicador de tu respuesta
                        if (fueSeleccionada)
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: (esCorrecta ? Colors.green : Colors.red).withOpacity(0.2),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Text(
                              'Tu respuesta',
                              style: TextStyle(
                                fontSize: 10,
                                color: esCorrecta ? Colors.green : Colors.red,
                              ),
                            ),
                          ),
                      ],
                    ),
                  );
                }),
                
                // Retroalimentación
                if (widget.resultado.retroalimentacion != null && 
                    widget.resultado.retroalimentacion!.isNotEmpty) ...[
                  const SizedBox(height: 12),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: isDark ? Colors.grey[850] : Colors.white,
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(
                        color: esCorrecta 
                            ? Colors.green.withOpacity(0.5)
                            : Colors.orange.withOpacity(0.5),
                      ),
                    ),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Icon(
                          Icons.lightbulb_outline,
                          size: 16,
                          color: Colors.amber[700],
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            widget.resultado.retroalimentacion!,
                            style: TextStyle(
                              fontSize: 12,
                              color: isDark ? Colors.grey[300] : Colors.grey[700],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ],
            ),
          ),
        
        const Divider(height: 1),
      ],
    );
  }

  String _resumirTexto(String texto, int maxLength) {
    if (texto.length <= maxLength) return texto;
    return '${texto.substring(0, maxLength)}...';
  }
}