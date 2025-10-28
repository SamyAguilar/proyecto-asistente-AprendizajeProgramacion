export interface CodeValidationRequest {
  codigo_enviado: string;
  ejercicio_id: number;
  usuario_id: number;
  casos_prueba: any;
  lenguaje: string;
  enunciado?: string;
  codigo_solucion?: string;
}

export interface CodeValidationResponse {
  resultado: 'correcto' | 'incorrecto' | 'error';
  puntos_obtenidos: number;
  retroalimentacion_llm: string;
  errores_encontrados: string[];
  casos_prueba_pasados: number;
  casos_prueba_totales: number;
}
