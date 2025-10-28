/**
 * Puerto para el servicio de caché
 */
export interface ICacheService {
  buscarCodigoEnCache(codigo: string, ejercicio_id: number): Promise<CacheSearchResult>;
  guardarCodigoEnCache(codigo: string, ejercicio_id: number, usuario_id: number, resultado: any): Promise<void>;
  buscarPreguntasEnCache(subtema_id: number, cantidad: number, dificultad: string): Promise<CacheSearchResult>;
  guardarPreguntasEnCache(subtema_id: number, preguntas: any[]): Promise<void>;
}

export interface CacheSearchResult {
  encontrado: boolean;
  data?: any;
  edad_dias?: number;
}
