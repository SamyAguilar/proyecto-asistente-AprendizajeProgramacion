// backend/src/services/ejercicio.service.ts

import { llmService, IValidacionResponse } from './llm.service';
import { progresoService } from './progreso.service';

// NOTA: Reemplaza 'any' por los tipos reales de los modelos de Sam
// const EjercicioRepository = AppDataSource.getRepository(Ejercicio); 
// const IntentoEjercicioRepository = AppDataSource.getRepository(IntentoEjercicio); 

class EjercicioService {
    
    // 1. GET /api/v1/ejercicios/subtema/:subtema_id
    public async listarEjerciciosPorSubtema(subtemaId: number, userId: number): Promise<any[]> {
        // **PENDIENTE:** Validar que el usuario tenga acceso (matriculación)
        
        // Simulación de la consulta a la BD (TypeORM de Sam)
        const ejercicios = [
            { id: 101, enunciado: 'Escribe un ciclo for simple.', dificultad: 'básica', tipo_ejercicio: 'código', puntos_maximos: 50, codigo_base: '// Tu código aquí' },
            { id: 102, enunciado: 'Pregunta: ¿Qué es una variable?', dificultad: 'fácil', tipo_ejercicio: 'quiz', puntos_maximos: 20 },
        ];
        
        return ejercicios;
    }

    // 2. GET /api/v1/ejercicios/:id
    public async obtenerDetallesEjercicio(ejercicioId: number): Promise<any> {
        // Simulación de la consulta a la BD (Excluye codigo_solucion)
        const ejercicio = {
            id: ejercicioId,
            enunciado: 'Implementa la función ' + '`factorial(n)`',
            dificultad: 'intermedia',
            codigo_base: 'function factorial(n) {\n  //...\n}',
            tipo_ejercicio: 'codigo',
            // Casos de prueba sin los resultados esperados (para el estudiante)
            casos_prueba: [{ input: 5 }, { input: 0 }] 
        };
        
        // **PENDIENTE:** Agregar lógica de error si el ejercicio no se encuentra.
        return ejercicio;
    }

    // 3. POST /api/v1/ejercicios/:id/enviar (ENDPOINT MÁS IMPORTANTE)
    public async enviarCodigo(userId: number, ejercicioId: number, codigo_enviado: string): Promise<IValidacionResponse> {
        
        // **PENDIENTE 1:** Validar matriculación
        
        // Obtener datos clave del ejercicio, incluyendo casos de prueba SECRETOS
        const ejercicioCompleto = { 
            id: ejercicioId, 
            puntos_maximos: 100, 
            lenguaje: 'JavaScript',
            // ESTO ES SECRETO, solo para Lulu
            casos_prueba_secretos: [{ input: 5, expected: 120 }, { input: 1, expected: 1 }] 
        };

        // **PENDIENTE 2:** Guardar intento en tabla intentos_ejercicios (estado: "procesando")
        /*
        const intento = IntentoEjercicioRepository.create({ 
            usuario_id: userId, ejercicio_id: ejercicioId, codigo_enviado, estado: 'procesando' 
        });
        await IntentoEjercicioRepository.save(intento);
        */
        
        // Llamada a Lulu (Paso 4 y 5 del proceso)
        const resultadoLulu = await llmService.validarCodigo({
            codigo_enviado,
            ejercicio_id: ejercicioId,
            usuario_id: userId,
            casos_prueba: ejercicioCompleto.casos_prueba_secretos,
            lenguaje: ejercicioCompleto.lenguaje,
        });

        // **PENDIENTE 3:** Actualizar intento con resultado y puntos (Paso 6)
        /*
        intento.estado = resultadoLulu.resultado;
        intento.puntos_obtenidos = resultadoLulu.puntos_obtenidos;
        intento.retroalimentacion = resultadoLulu.retroalimentacion_llm;
        await IntentoEjercicioRepository.save(intento);
        */
        
        // Llamada a Toño para actualizar progreso (Paso 7)
        if (resultadoLulu.puntos_obtenidos > 0) {
            await progresoService.actualizarProgresoEjercicio(userId, ejercicioId, resultadoLulu.puntos_obtenidos);
        }

        // Retornar resultado al estudiante (Paso 8)
        return resultadoLulu;
    }

    // 4. GET /api/v1/ejercicios/:id/intentos
    public async verHistorialIntentos(ejercicioId: number, userId: number): Promise<any[]> {
        // Simulación de la consulta a la BD (TypeORM de Sam)
        // const historial = await IntentoEjercicioRepository.find({
        //     where: { ejercicio_id: ejercicioId, usuario_id: userId },
        //     order: { timestamp: 'DESC' }, // Ordenar por más reciente primero
        //     select: ['codigo_enviado', 'resultado', 'puntos_obtenidos', 'retroalimentacion_llm', 'timestamp']
        // });

        const historial = [
            { codigo_enviado: 'function fact()...', resultado: 'correcto', puntos_obtenidos: 100, retroalimentacion_llm: '¡Perfecto!', timestamp: new Date(Date.now() - 1000) },
            { codigo_enviado: 'function fact..', resultado: 'incorrecto', puntos_obtenidos: 0, retroalimentacion_llm: 'Error de sintaxis.', timestamp: new Date(Date.now() - 5000) }
        ];

        return historial;
    }
}

export const ejercicioService = new EjercicioService();