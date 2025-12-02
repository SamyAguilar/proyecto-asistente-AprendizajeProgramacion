// lib/screens/ayuda/ayuda_screen.dart
// [LUZIA] Pantalla principal de ayuda con IA

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import 'chat_screen.dart';
import 'explicacion_screen.dart';
import 'analizar_codigo_screen.dart';
import 'retroalimentacion_screen.dart';

class AyudaScreen extends StatelessWidget {
  const AyudaScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    return Scaffold(
      appBar: AppBar(
        title: const Text('Ayuda con IA'),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header con LUZIA
            _buildHeader(context, isDark),
            
            const SizedBox(height: 24),
            
            // Opciones principales
            _buildOpcionesPrincipales(context, isDark),
            
            const SizedBox(height: 32),
            
            // Preguntas frecuentes
            _buildPreguntasFrecuentes(context, isDark),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context, bool isDark) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            Theme.of(context).primaryColor,
            Theme.of(context).primaryColor.withOpacity(0.7),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        children: [
          // Avatar de LUZIA
          Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              color: Colors.white,
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.2),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: const Center(
              child: Text(
                '🤖',
                style: TextStyle(fontSize: 40),
              ),
            ),
          ),
          const SizedBox(height: 16),
          const Text(
            'Hola, soy LUZIA',
            style: TextStyle(
              color: Colors.white,
              fontSize: 24,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Tu asistente de aprendizaje con IA',
            style: TextStyle(
              color: Colors.white.withOpacity(0.9),
              fontSize: 16,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            '¿En que puedo ayudarte hoy?',
            style: TextStyle(
              color: Colors.white.withOpacity(0.8),
              fontSize: 14,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildOpcionesPrincipales(BuildContext context, bool isDark) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Que puedo hacer por ti',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: isDark ? Colors.white : Colors.black87,
          ),
        ),
        const SizedBox(height: 16),
        
        // Chat con LUZIA
        _buildOpcionCard(
          context,
          isDark: isDark,
          icon: Icons.chat_bubble_outline,
          iconColor: Colors.blue,
          titulo: 'Chatear con LUZIA',
          descripcion: 'Hazme cualquier pregunta sobre programacion',
          onTap: () => _navegarA(context, const ChatScreen()),
        ),
        
        const SizedBox(height: 12),
        
        // Explicar concepto
        _buildOpcionCard(
          context,
          isDark: isDark,
          icon: Icons.lightbulb_outline,
          iconColor: Colors.amber,
          titulo: 'Explicar un Concepto',
          descripcion: 'Te explico cualquier tema de programacion',
          onTap: () => _navegarA(context, const ExplicacionScreen()),
        ),
        
        const SizedBox(height: 12),
        
        // Analizar codigo
        _buildOpcionCard(
          context,
          isDark: isDark,
          icon: Icons.code,
          iconColor: Colors.green,
          titulo: 'Analizar mi Codigo',
          descripcion: 'Reviso tu codigo y te doy sugerencias',
          onTap: () => _navegarA(context, const AnalizarCodigoScreen()),
        ),
        
        const SizedBox(height: 12),
        
        // Ver retroalimentaciones
        _buildOpcionCard(
          context,
          isDark: isDark,
          icon: Icons.history,
          iconColor: Colors.purple,
          titulo: 'Ver Retroalimentacion',
          descripcion: 'Revisa tus retroalimentaciones anteriores',
          onTap: () => _navegarA(context, const RetroalimentacionScreen()),
        ),
      ],
    );
  }

  Widget _buildOpcionCard(
    BuildContext context, {
    required bool isDark,
    required IconData icon,
    required Color iconColor,
    required String titulo,
    required String descripcion,
    required VoidCallback onTap,
  }) {
    return Card(
      elevation: isDark ? 0 : 2,
      color: isDark ? Colors.grey[850] : Colors.white,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: isDark 
            ? BorderSide(color: Colors.grey[700]!, width: 1)
            : BorderSide.none,
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Container(
                width: 50,
                height: 50,
                decoration: BoxDecoration(
                  color: iconColor.withOpacity(isDark ? 0.2 : 0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(
                  icon,
                  color: isDark ? iconColor.withOpacity(0.9) : iconColor,
                  size: 28,
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      titulo,
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: isDark ? Colors.white : Colors.black87,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      descripcion,
                      style: TextStyle(
                        fontSize: 14,
                        color: isDark ? Colors.grey[400] : Colors.grey[600],
                      ),
                    ),
                  ],
                ),
              ),
              Icon(
                Icons.chevron_right,
                color: isDark ? Colors.grey[500] : Colors.grey[400],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPreguntasFrecuentes(BuildContext context, bool isDark) {
    final preguntas = [
      {
        'pregunta': '¿Que es una variable?',
        'respuesta': 'Una variable es un espacio en memoria donde puedes guardar datos para usarlos despues.',
      },
      {
        'pregunta': '¿Que es un bucle for?',
        'respuesta': 'Un bucle for te permite repetir un bloque de codigo un numero determinado de veces.',
      },
      {
        'pregunta': '¿Que es una funcion?',
        'respuesta': 'Una funcion es un bloque de codigo reutilizable que realiza una tarea especifica.',
      },
      {
        'pregunta': '¿Que es un array?',
        'respuesta': 'Un array es una estructura de datos que almacena multiples valores del mismo tipo.',
      },
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Preguntas Frecuentes',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: isDark ? Colors.white : Colors.black87,
              ),
            ),
            TextButton(
              onPressed: () => _navegarA(context, const ChatScreen()),
              child: const Text('Ver mas'),
            ),
          ],
        ),
        const SizedBox(height: 8),
        
        ...preguntas.map((faq) => _buildFaqItem(
          context,
          isDark: isDark,
          pregunta: faq['pregunta']!,
          respuesta: faq['respuesta']!,
        )),
      ],
    );
  }

  Widget _buildFaqItem(
    BuildContext context, {
    required bool isDark,
    required String pregunta,
    required String respuesta,
  }) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      color: isDark ? Colors.grey[850] : Colors.white,
      child: ExpansionTile(
        tilePadding: const EdgeInsets.symmetric(horizontal: 16),
        childrenPadding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
        leading: Icon(
          Icons.help_outline,
          color: Theme.of(context).primaryColor,
        ),
        title: Text(
          pregunta,
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w500,
            color: isDark ? Colors.white : Colors.black87,
          ),
        ),
        children: [
          Text(
            respuesta,
            style: TextStyle(
              fontSize: 14,
              color: isDark ? Colors.grey[400] : Colors.grey[700],
            ),
          ),
          const SizedBox(height: 8),
          Align(
            alignment: Alignment.centerRight,
            child: TextButton.icon(
              onPressed: () {
                // Navegar al chat con la pregunta precargada
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => ChatScreen(preguntaInicial: pregunta),
                  ),
                );
              },
              icon: const Icon(Icons.chat, size: 18),
              label: const Text('Preguntar mas'),
            ),
          ),
        ],
      ),
    );
  }

  void _navegarA(BuildContext context, Widget screen) {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => screen),
    );
  }
}
