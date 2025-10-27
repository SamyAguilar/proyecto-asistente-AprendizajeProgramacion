// backend/src/services/llm.service.ts

// ===========================================
// INTERFACES DEL BLOQUE 1: VALIDACIÓN DE CÓDIGO
// ===========================================

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

// ===========================================
// INTERFACES DEL BLOQUE 2: GENERACIÓN DE QUIZZES
// ===========================================

interface IGeneracionPreguntasRequest {
  subtema_id: number;
  cantidad: number;
  dificultad: 'básica' | 'intermedia' | 'avanzada';
  contexto_estudiante: any;
}

export interface IGeneracionPreguntasResponse {
  preguntas: Array<any>; // Contiene las preguntas generadas
}


class LLMService {
    
    // MÉTODO DEL BLOQUE 1: EJERCICIOS
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

    // MÉTODO DEL BLOQUE 2: QUIZZES (EL QUE FALTABA)
    public async generarPreguntas(payload: IGeneracionPreguntasRequest): Promise<IGeneracionPreguntasResponse> {
        console.log(`[LLM MOCK] Generando ${payload.cantidad} preguntas para Subtema ${payload.subtema_id} con dificultad ${payload.dificultad}.`);
        
        // --- SIMULACIÓN DE RESPUESTA ---
        const preguntasSimuladas = [];
        for (let i = 0; i < payload.cantidad; i++) {
            preguntasSimuladas.push({ 
                texto: `Pregunta generada ${i + 1} sobre ${payload.subtema_id}`, 
                opciones: [{ id: 1, texto: 'Opción A' }, { id: 2, texto: 'Opción B (Correcta)' }], 
                dificultad: payload.dificultad, 
                retroalimentacion_correcta: 'Esta es la explicación de la respuesta correcta.'
            });
        }

        return {
            preguntas: preguntasSimuladas
        };
    }
}

export const llmService = new LLMService();