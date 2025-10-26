import { ChatRequest, ChatResponse, ChatMessage } from '../../domain/entities/Chat';
import { IGeminiClient } from '../../domain/interfaces/IGeminiClient';

export class ChatAssistantUseCase {
  constructor(private geminiClient: IGeminiClient) {}

  async execute(request: ChatRequest): Promise<ChatResponse> {
    console.log('💬 [UseCase] Procesando mensaje de chat...');

    try {
      // Construir prompt con contexto y historial
      const prompt = this.buildPrompt(request);

      // Llamar a Gemini
      const respuesta = await this.geminiClient.generate(prompt, {
        temperature: 0.8, // Más creativo para conversación
        maxTokens: 1024,
        tipo: 'chat'
      });

      const sugerencias = this.extractSuggestions(respuesta);

      return {
        respuesta: respuesta.trim(),
        contexto_usado: !!request.contexto,
        sugerencias
      };

    } catch (error: any) {
      console.error('❌ [UseCase] Error en chat:', error.message);
      return {
        respuesta: 'Lo siento, no pude procesar tu pregunta en este momento. ¿Podrías reformularla?',
        contexto_usado: false
      };
    }
  }

  private buildPrompt(request: ChatRequest): string {
    let prompt = `Eres LULU, un asistente educativo amigable y experto en programación.

**TU PERSONALIDAD:**
- Paciente y motivador
- Explicas con ejemplos claros
- Usas analogías cuando ayuda
- Preguntas para guiar el aprendizaje (método socrático)
- Celebras los logros del estudiante

**REGLAS:**
1. Si el estudiante pregunta algo fuera de programación, redirige amablemente al tema
2. No des soluciones completas, guía al estudiante a descubrirlas
3. Usa emojis ocasionalmente para ser amigable 😊
4. Si detectas frustración, sé extra paciente y motivador

`;

    // Agregar contexto si existe
    if (request.contexto) {
      prompt += `\n**CONTEXTO ACTUAL DEL ESTUDIANTE:**\n`;
      if (request.contexto.tema_actual) {
        prompt += `- Tema: ${request.contexto.tema_actual}\n`;
      }
      if (request.contexto.subtema_actual) {
        prompt += `- Subtema: ${request.contexto.subtema_actual}\n`;
      }
      if (request.contexto.ejercicio_actual) {
        prompt += `- Trabajando en ejercicio #${request.contexto.ejercicio_actual}\n`;
      }
    }

    // Agregar historial de conversación
    if (request.historial && request.historial.length > 0) {
      prompt += `\n**HISTORIAL DE CONVERSACIÓN:**\n`;
      const recentHistory = request.historial.slice(-5); // Últimos 5 mensajes
      
      for (const msg of recentHistory) {
        const role = msg.role === 'user' ? 'Estudiante' : 'LULU';
        prompt += `${role}: ${msg.content}\n`;
      }
    }

    // Mensaje actual del estudiante
    prompt += `\n**MENSAJE ACTUAL DEL ESTUDIANTE:**\n${request.mensaje}\n`;

    prompt += `\n**TU RESPUESTA (clara, pedagógica, motivadora):**\n`;

    return prompt;
  }

  private extractSuggestions(respuesta: string): string[] | undefined {
    // Intentar extraer sugerencias del texto
    const sugerencias: string[] = [];
    
    // Buscar patrones como "Puedes...", "Intenta...", "Te sugiero..."
    const patterns = [
      /(?:puedes|podrías|intenta|prueba|te sugiero|considera)\s+([^.!?]+[.!?])/gi
    ];

    for (const pattern of patterns) {
      const matches = respuesta.matchAll(pattern);
      for (const match of matches) {
        if (match[1] && sugerencias.length < 3) {
          sugerencias.push(match[1].trim());
        }
      }
    }

    return sugerencias.length > 0 ? sugerencias : undefined;
  }
}
