import { GoogleGenerativeAI } from '@google/generative-ai';
import { IGeminiClient, GenerateOptions } from '../../domain/interfaces/IGeminiClient';
import dotenv from 'dotenv';

dotenv.config();

export class GeminiClient implements IGeminiClient {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY no está configurada');
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash-002';
    this.model = this.genAI.getGenerativeModel({ 
      model: modelName
    });
    console.log(`✓ GeminiClient inicializado con modelo: ${modelName}`);
  }

  async generate(prompt: string, options?: GenerateOptions): Promise<string> {
    const maxIntentos = 3;
    let intentos = 0;

    while (intentos < maxIntentos) {
      try {
        intentos++;

        const generationConfig = {
          temperature: options?.temperature || 0.7,
          maxOutputTokens: options?.maxTokens || 1500,  // Reducido de 2048 a 1500 por defecto para evitar respuestas muy largas
        };

        console.log(`🤖 [Gemini] Llamando a Gemini (intento ${intentos})...`);
        
        const result = await this.model.generateContent({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig
        });

        const response = result.response;
        const text = response.text();

        console.log(`✓ [Gemini] Respuesta recibida`);
        return text;

      } catch (error: any) {
        console.error(`❌ [Gemini] Error (intento ${intentos}):`, error.message);

        if (intentos < maxIntentos && this.esErrorTemporal(error)) {
          const tiempoEspera = Math.pow(2, intentos) * 1000;
          console.log(`⏳ [Gemini] Reintentando en ${tiempoEspera}ms...`);
          await this.esperar(tiempoEspera);
          continue;
        }

        throw new Error(`Error al llamar a Gemini: ${error.message}`);
      }
    }

    throw new Error('Máximo de intentos alcanzado');
  }

  private esErrorTemporal(error: any): boolean {
    const erroresTemporales = ['RATE_LIMIT', 'RESOURCE_EXHAUSTED', 'UNAVAILABLE', '429', '503'];
    const mensajeError = error.message?.toUpperCase() || '';
    return erroresTemporales.some(e => mensajeError.includes(e));
  }

  private esperar(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
