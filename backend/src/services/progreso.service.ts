// backend/src/services/progreso.service.ts

class ProgresoService {
    /**
     * Simula la llamada al servicio de Toño para actualizar el progreso del ejercicio.
     */
    public async actualizarProgresoEjercicio(userId: number, ejercicioId: number, puntos: number): Promise<void> {
        console.log(`[PROGRESO MOCK] Notificando a Toño: Usuario ${userId} completó Ejercicio ${ejercicioId} con ${puntos} puntos.`);
        await new Promise(resolve => setTimeout(resolve, 50)); 
    }

    /**
     * ¡NUEVO! Simula la llamada al servicio de Toño para actualizar el progreso del QUIZ.
     */
    public async actualizarProgresoQuiz(userId: number, preguntaId: number, puntos: number): Promise<void> {
        console.log(`[PROGRESO MOCK] Notificando a Toño: Usuario ${userId} respondió Quiz ${preguntaId} correctamente con ${puntos} puntos.`);
        await new Promise(resolve => setTimeout(resolve, 50));
    }
}

export const progresoService = new ProgresoService();