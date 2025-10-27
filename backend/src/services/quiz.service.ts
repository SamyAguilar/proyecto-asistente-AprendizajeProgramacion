// backend/src/services/quiz.service.ts

import { llmService } from './llm.service'; // Usamos la simulación que creaste ayer
import { progresoService } from './progreso.service'; // Usamos la simulación que creaste ayer

// Interfaces de comunicación con Lulu (Bloque 2)
interface IGeneracionPreguntasResponse {
preguntas: Array<any>; 
}

class QuizService {

    // Método interno para generar y almacenar preguntas
    public async generarPreguntasInterno(subtemaId: number, cantidad: number, dificultad: 'básica' | 'intermedia' | 'avanzada'): Promise<number> {
        
        const payloadLulu = { subtema_id: subtemaId, cantidad, dificultad, contexto_estudiante: {} };
        const respuestaLulu: IGeneracionPreguntasResponse = await llmService.generarPreguntas(payloadLulu);
        
        let preguntasGuardadas = 0;
        for (const pregunta of respuestaLulu.preguntas) {
            // **PENDIENTE:** Aquí va la lógica de Sam para guardar la pregunta en preguntas_quiz
            // y las opciones en opciones_respuesta (marcando la correcta)
            console.log(`[QUIZ SERVICE] Pregunta generada y guardada: ${pregunta.texto}`);
            preguntasGuardadas++;
        }

        return preguntasGuardadas;
    }
    
    // 1. GET /api/v1/quiz/subtema/:subtema_id/preguntas
    public async obtenerPreguntasQuiz(subtemaId: number): Promise<any[]> {
        
        // **Lógica de negocio:**
        // 1. Buscar preguntas existentes en la BD de Sam.
        const preguntasExistentes = [
            { id: 201, texto: '¿Qué es una promesa en JS?', opciones: [{ id: 1, texto: 'A. Valor inmediato' }, { id: 2, texto: 'B. Objeto para manejo asíncrono' }] }
        ];

        // 2. Si no hay suficientes (ej. menos de 5), generar más
        if (preguntasExistentes.length < 5) {
             // Llama a tu método interno (POST /quiz/generar-preguntas)
            await this.generarPreguntasInterno(subtemaId, 5 - preguntasExistentes.length, 'intermedia');
        }
        
        // 3. Retornar las preguntas disponibles (asegúrate de NO revelar la respuesta correcta)
        return preguntasExistentes;
    }

    // 2. POST /api/v1/quiz/responder
    public async responderQuiz(userId: number, preguntaId: number, opcionSeleccionadaId: number): Promise<any> {
        
        // Simulación: Buscar la opción correcta en la BD de Sam
        // const opcionReal = await OpcionesRespuestaRepository.findOne({ where: { id: opcionSeleccionadaId } });
        const opcionReal = { id: 10, es_correcta: (opcionSeleccionadaId % 2 === 0), puntos: 25, retroalimentacion: 'Esto fue correcto/incorrecto.' };

        const esCorrecta = opcionReal.es_correcta;
        const puntosObtenidos = esCorrecta ? opcionReal.puntos : 0;

        // **PENDIENTE 1:** Registrar intento en tabla intentos_quiz (modelo de Sam)
        /*
        await IntentosQuizRepository.save({ 
            userId, preguntaId, opcionSeleccionadaId, es_correcta: esCorrecta, puntos_obtenidos: puntosObtenidos 
        });
        */
        
        // **PENDIENTE 2:** Actualizar progreso (llamar a Toño)
        await progresoService.actualizarProgresoQuiz(userId, preguntaId, puntosObtenidos);

        // 3. Retornar resultado
        return {
            es_correcta: esCorrecta,
            explicacion: esCorrecta ? '¡Correcto! ' + opcionReal.retroalimentacion : 'Incorrecto. Revisa el concepto de closures.',
            puntos_obtenidos: puntosObtenidos
        };
    }
    
    // 3. GET /api/v1/quiz/resultados/:usuario_id
    public async obtenerResultadosQuiz(userId: number, isAdmin: boolean, requestedUserId: number): Promise<any> {
        
        // 1. Validar permisos: Solo el admin o el propio usuario pueden ver sus resultados
        if (!isAdmin && userId !== requestedUserId) {
            throw new Error('Acceso denegado. No tienes permisos para ver estos resultados.');
        }

        // Simulación de la consulta a la BD
        const totalIntentos = 50;
        const respuestasCorrectas = 40;
        
        // 2. Calcular estadísticas
        return {
            usuario_id: requestedUserId,
            total_intentos: totalIntentos,
            respuestas_correctas: respuestasCorrectas,
            respuestas_incorrectas: totalIntentos - respuestasCorrectas,
            porcentaje_acierto: (respuestasCorrectas / totalIntentos) * 100,
            promedio_puntos: 85.5,
            // **PENDIENTE:** Incluir historial reciente de IntentosQuiz
        };
    }
    
    // 4. POST /api/v1/quiz/generar-preguntas (Endpoint interno/admin)
    // Este método es llamado por la ruta POST y usa el método interno de arriba.
    public async generarPreguntas(subtemaId: number, cantidad: number, dificultad: 'básica' | 'intermedia' | 'avanzada' = 'intermedia'): Promise<{ message: string, cantidad: number }> {
        
        if (cantidad < 1 || cantidad > 10) {
            throw new Error('La cantidad debe estar entre 1 y 10.');
        }

        const preguntasGuardadas = await this.generarPreguntasInterno(subtemaId, cantidad, dificultad);

        return {
            message: `Se han generado y almacenado ${preguntasGuardadas} nuevas preguntas para el subtema ${subtemaId}.`,
            cantidad: preguntasGuardadas
        };
    }
}

export const quizService = new QuizService();