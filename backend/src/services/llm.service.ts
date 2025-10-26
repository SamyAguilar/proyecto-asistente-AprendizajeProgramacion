// backend/src/services/llm.service.ts

// Interfaz para la respuesta que Lulu debe dar (según tus requisitos)
export interface IValidacionResponse {
  resultado: 'correcto' | 'incorrecto' | 'error';
  puntos_obtenidos: number;
  retroalimentacion_llm: string;
  errores_encontrados: string[];
  casos_prueba_pasados: number;
  casos_prueba_totales: number;
}

interface IValidacionRequest {
  codigo_enviado: string;
  ejercicio_id: number;
  usuario_id: number;
  casos_prueba: any; 
  lenguaje: string;
}

class LLMService {
    /**
     * Simula la llamada al servicio de Lulu para validar código.
     */
    public async validarCodigo(payload: IValidacionRequest): Promise<IValidacionResponse> {
        console.log(`[LLM MOCK] Validando código para Ejercicio ${payload.ejercicio_id}.`);
        
        // **SIMULACIÓN:** Devuelve una respuesta correcta o incorrecta
        const esCorrecto = Math.random() < 0.7; // 70% de chance de ser correcto
        const puntos = esCorrecto ? 100 : 0;
        
        return {
            resultado: esCorrecto ? 'correcto' : 'incorrecto',
            puntos_obtenidos: puntos,
            retroalimentacion_llm: esCorrecto ? 
                'Tu solución es correcta. ¡Excelente trabajo!' : 
                'Tu código falló en el caso de prueba 3. Revisa la recursión.',
            errores_encontrados: esCorrecto ? [] : ['Lógica incorrecta'],
            casos_prueba_pasados: esCorrecto ? 5 : 3,
            casos_prueba_totales: 5,
        };
    }
}
export const llmService = new LLMService();