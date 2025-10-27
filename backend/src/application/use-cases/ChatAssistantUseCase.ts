import { ChatRequest, ChatResponse, ChatMessage } from '../../domain/entities/Chat';
import { IGeminiClient } from '../../domain/interfaces/IGeminiClient';

export class ChatAssistantUseCase {
  constructor(private geminiClient: IGeminiClient) {}

  async execute(request: ChatRequest): Promise<ChatResponse> {
    console.log('[UseCase] Procesando mensaje de chat...');

    try {
      // Construir prompt con contexto y historial
      const prompt = this.buildPrompt(request);

      // Llamar a Gemini
      const respuesta = await this.geminiClient.generate(prompt, {
        temperature: 0.8,
        maxTokens: 2524,
        tipo: 'chat'
      });

      // Intentar parsear respuesta estructurada
      const parsed = this.parseStructuredResponse(respuesta);

      return {
        respuesta: parsed.respuesta.trim(),
        contexto_usado: !!request.contexto,
        sugerencias: parsed.sugerencias
      };

    } catch (error: any) {
      console.error('ERROR [UseCase] Error en chat:', error.message);
      return {
        respuesta: 'Lo siento, no pude procesar tu pregunta en este momento. ¿Podrías reformularla?',
        contexto_usado: false
      };
    }
  }

  private buildPrompt(request: ChatRequest): string {
    let prompt = `Eres un docente con bastantes conocimientos en programacion amigable y experto en programación.

TU PERSONALIDAD:
- Paciente y motivador
- Explicas con ejemplos claros para que el estudiante entienda
- Brindas explicaciones paso a paso
- Fomentas la curiosidad y el pensamiento crítico
- Adaptas explicaciones al nivel del estudiante
- Brindas la informacion que te solicitan sin agregar informacion irrelevante
- Usas analogías cuando ayuda
- Preguntas para guiar el aprendizaje (método socrático)
- Celebras los logros del estudiante
- Animas a seguir practicando y aprendiendo

REGLAS:
1. Si el estudiante pregunta algo fuera de programación, redirige amablemente al tema
2. No des soluciones completas, guía al estudiante a descubrirlas
3. Usa emojis ocasionalmente para ser amigable
4. Si detectas frustración, sé extra paciente y motivador

`;

    // Agregar contexto si existe
    if (request.contexto) {
      prompt += `\nCONTEXTO ACTUAL DEL ESTUDIANTE:\n`;
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
      prompt += `\nHISTORIAL DE CONVERSACIÓN:\n`;
      const recentHistory = request.historial.slice(-5);
      
      for (const msg of recentHistory) {
        const role = msg.role === 'user' ? 'Estudiante' : 'LULU';
        prompt += `${role}: ${msg.content}\n`;
      }
    }

    // Mensaje actual del estudiante
    prompt += `\nMENSAJE ACTUAL DEL ESTUDIANTE:\n${request.mensaje}\n`;

    // Instrucciones para formato de respuesta
    prompt += `\nIMPORTANTE: 
Al final de tu respuesta, SIEMPRE incluye 2-3 sugerencias prácticas de ejercicios o temas relacionados que el estudiante pueda explorar.

Formato de tu respuesta:
1. Primero: Tu explicación educativa y motivadora (usa el tono descrito arriba)
2. Al final: Agrega una sección así:

---SUGERENCIAS---
- [Sugerencia 1: ejercicio o tema relacionado]
- [Sugerencia 2: ejercicio o tema relacionado]
- [Sugerencia 3: ejercicio o tema relacionado]

este es un Ejemplo no lo tomes en cuenta para entregarlo como respuesta a mos que sea una pregunta exacta sobre este tema:
"...tu explicación pedagógica aquí...

---SUGERENCIAS---
- Intenta crear una función que calcule factoriales
- Puedes practicar con la secuencia de Fibonacci
- Explora el concepto de recursión con más ejemplos"

TU RESPUESTA (clara, pedagógica, motivadora):
`;

    return prompt;
  }

  /**
   * Parsea la respuesta estructurada de Gemini
   * Extrae la respuesta principal y las sugerencias
   */
  private parseStructuredResponse(respuesta: string): { respuesta: string; sugerencias: string[] } {
    try {
      console.log('DEBUG [Parse] Parseando respuesta estructurada...');
      
      // Buscar el separador de sugerencias
      const separador = '---SUGERENCIAS---';
      const separadorIndex = respuesta.indexOf(separador);
      
      if (separadorIndex !== -1) {
        // Hay sección de sugerencias
        const respuestaPrincipal = respuesta.substring(0, separadorIndex).trim();
        const seccionSugerencias = respuesta.substring(separadorIndex + separador.length).trim();
        
        // Extraer sugerencias (líneas que empiezan con - o *)
        const sugerencias: string[] = [];
        const lineas = seccionSugerencias.split('\n');
        
        for (const linea of lineas) {
          const lineaTrimmed = linea.trim();
          // Buscar líneas que empiezan con -, *, o número seguido de punto
          if (lineaTrimmed.match(/^[-*•]\s+(.+)$/)) {
            const sugerencia = lineaTrimmed.replace(/^[-*•]\s+/, '').trim();
            if (sugerencia.length > 10) { // Filtrar sugerencias muy cortas
              sugerencias.push(sugerencia);
            }
          } else if (lineaTrimmed.match(/^\d+\.\s+(.+)$/)) {
            const sugerencia = lineaTrimmed.replace(/^\d+\.\s+/, '').trim();
            if (sugerencia.length > 10) {
              sugerencias.push(sugerencia);
            }
          }
        }
        
        console.log(`OK [Parse] Encontradas ${sugerencias.length} sugerencias estructuradas`);
        
        return {
          respuesta: respuestaPrincipal,
          sugerencias: sugerencias.length > 0 ? sugerencias.slice(0, 3) : this.generateFallbackSuggestions(respuesta)
        };
      }
      
      // No hay separador, intentar extraer con patrones
      console.log('WARNING [Parse] No se encontró separador, usando extracción por patrones...');
      const sugerencias = this.extractSuggestions(respuesta);
      
      return {
        respuesta: respuesta,
        sugerencias: sugerencias.length > 0 ? sugerencias : this.generateFallbackSuggestions(respuesta)
      };
      
    } catch (error: any) {
      console.error('ERROR [Parse] Error parseando respuesta:', error.message);
      return {
        respuesta: respuesta,
        sugerencias: this.generateFallbackSuggestions(respuesta)
      };
    }
  }

  /**
   * Extrae sugerencias usando patrones de texto
   * (Método de respaldo)
   */
  private extractSuggestions(respuesta: string): string[] {
    const sugerencias: string[] = [];
    
    // Patrones mejorados para detectar sugerencias
    const patterns = [
      /(?:puedes?|podrías?|intenta|prueba|te sugiero|considera|explora|practica)\s+([^.!?\n]{15,100}[.!?])/gi,
      /(?:Otra opción|También puedes?|Adicionalmente)\s+([^.!?\n]{15,100}[.!?])/gi
    ];

    for (const pattern of patterns) {
      const matches = respuesta.matchAll(pattern);
      for (const match of matches) {
        if (match[1] && sugerencias.length < 3) {
          const sugerencia = match[1].trim();
          // Evitar duplicados
          if (!sugerencias.includes(sugerencia)) {
            sugerencias.push(sugerencia);
          }
        }
      }
    }

    return sugerencias;
  }

  /**
   * Genera sugerencias genéricas basadas en el contexto de la respuesta
   * (Último recurso si no se pueden extraer sugerencias)
   */
  private generateFallbackSuggestions(respuesta: string): string[] {
    console.log('WARNING [Parse] Generando sugerencias de respaldo genéricas');
    
    const respuestaLower = respuesta.toLowerCase();
    const sugerencias: string[] = [];
    
    // Sugerencias basadas en palabras clave detectadas
    if (respuestaLower.includes('función') || respuestaLower.includes('funcion')) {
      sugerencias.push('Intenta crear tus propias funciones con diferentes parámetros');
    }
    
    if (respuestaLower.includes('recursiv')) {
      sugerencias.push('Practica con ejemplos de recursión como factorial o Fibonacci');
    }
    
    if (respuestaLower.includes('variable')) {
      sugerencias.push('Experimenta declarando variables de diferentes tipos');
    }
    
    if (respuestaLower.includes('bucle') || respuestaLower.includes('loop') || respuestaLower.includes('for') || respuestaLower.includes('while')) {
      sugerencias.push('Practica con diferentes tipos de bucles (for, while, do-while)');
    }
    
    if (respuestaLower.includes('array') || respuestaLower.includes('lista') || respuestaLower.includes('arreglo')) {
      sugerencias.push('Explora métodos de arrays como map, filter y reduce');
    }
    
    // Si no se encontró nada específico, dar sugerencias genéricas
    if (sugerencias.length === 0) {
      sugerencias.push('Intenta resolver ejercicios prácticos sobre este tema');
      sugerencias.push('Revisa la documentación oficial para profundizar');
      sugerencias.push('Practica escribiendo código simple relacionado con lo aprendido');
    }
    
    return sugerencias.slice(0, 3);
  }
}