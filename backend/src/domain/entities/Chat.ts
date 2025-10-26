export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatRequest {
  mensaje: string;
  historial?: ChatMessage[];
  contexto?: {
    tema_actual?: string;
    subtema_actual?: string;
    ejercicio_actual?: number;
  };
}

export interface ChatResponse {
  respuesta: string;
  contexto_usado: boolean;
  sugerencias?: string[];
}
