export interface GenerarPreguntasRequest {
  subtema_id: number;
  cantidad: number;
  dificultad: 'basica' | 'intermedia' | 'avanzada';
  contexto_estudiante?: {
    nivel?: string;
    temas_previos?: string[];
  };
}

export interface OpcionPregunta {
  texto: string;
  es_correcta: boolean;
  explicacion?: string;
}

export interface PreguntaGenerada {
  texto: string;
  opciones: OpcionPregunta[];
  dificultad: string;
  retroalimentacion_correcta: string;
  retroalimentacion_incorrecta: string;
  explicacion_detallada?: string;
  puntos?: number;
}

export interface GenerarPreguntasResponse {
  preguntas: PreguntaGenerada[];
  subtema_id: number;
  cantidad_generada: number;
}
