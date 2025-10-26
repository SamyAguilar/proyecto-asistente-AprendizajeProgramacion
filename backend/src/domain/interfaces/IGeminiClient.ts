/**
 * Puerto para el cliente de Gemini
 * Siguiendo Clean Architecture, la capa de dominio define la interfaz
 */
export interface IGeminiClient {
  generate(prompt: string, options?: GenerateOptions): Promise<string>;
}

export interface GenerateOptions {
  temperature?: number;
  maxTokens?: number;
  tipo?: string;
}
