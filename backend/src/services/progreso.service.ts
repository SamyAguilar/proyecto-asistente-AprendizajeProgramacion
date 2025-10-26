// backend/src/services/progreso.service.ts

class ProgresoService {
    /**
     * Simula la llamada al servicio de Toño para actualizar el progreso.
     */
    public async actualizarProgresoEjercicio(userId: number, ejercicioId: number, puntos: number): Promise<void> {
        // Lógica real: Toño implementará la llamada HTTP real a su servicio
        console.log(`[PROGRESO MOCK] Notificando a Toño: Usuario ${userId} completó Ejercicio ${ejercicioId} con ${puntos} puntos.`);
        await new Promise(resolve => setTimeout(resolve, 50)); // Simula un pequeño delay de red
    }
}
export const progresoService = new ProgresoService();