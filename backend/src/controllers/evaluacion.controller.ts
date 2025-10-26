// backend/src/controllers/evaluacion.controller.ts

import { Request, Response } from 'express';
import { ejercicioService } from '../services/ejercicio.service';

// Interfaz para que TS reconozca req.user (inyectado por el middleware de Sam)
// Nota: '!' se usa para decirle a TS que confíe en que el middleware la puso.
export class EvaluacionController {

    public async getEjerciciosPorSubtema(req: Request, res: Response): Promise<Response> {
        // ... (Este ya estaba bien)
        try {
            const subtemaId = parseInt(req.params.subtemaId);
            const userId = req.user!.id; 

            const ejercicios = await ejercicioService.listarEjerciciosPorSubtema(subtemaId, userId);
            return res.status(200).json(ejercicios);
        } catch (error: any) {
            return res.status(500).json({ message: error.message });
        }
    }

    // CORREGIDO: Usamos Request porque este endpoint NO necesita req.user
    public async getDetallesEjercicio(req: Request, res: Response): Promise<Response> {
        try {
            const ejercicioId = parseInt(req.params.id);
            const ejercicio = await ejercicioService.obtenerDetallesEjercicio(ejercicioId);
            return res.status(200).json(ejercicio);
        } catch (error: any) {
            return res.status(404).json({ message: 'Ejercicio no encontrado.' });
        }
    }

    // CORREGIDO: Usamos CustomRequest para acceder a req.user
    public async postEnviarCodigo(req: Request, res: Response): Promise<Response> {
        try {
            const ejercicioId = parseInt(req.params.id);
            const { codigo_enviado } = req.body;
            const userId = req.user!.id; // El ! le dice a TS que confíe en que existe.

            if (!codigo_enviado) {
                return res.status(400).json({ message: 'El campo codigo_enviado es requerido.' });
            }
            
            const resultado = await ejercicioService.enviarCodigo(userId, ejercicioId, codigo_enviado);
            return res.status(200).json(resultado);
        } catch (error: any) {
            return res.status(500).json({ message: 'Error al procesar la solicitud: ' + error.message });
        }
    }

    // CORREGIDO: Usamos CustomRequest para acceder a req.user
    public async getHistorialIntentos(req: Request, res: Response): Promise<Response> {
        try {
            const ejercicioId = parseInt(req.params.id);
            const userId = req.user!.id; 

            const historial = await ejercicioService.verHistorialIntentos(ejercicioId, userId);
            return res.status(200).json(historial);
        } catch (error: any) {
            return res.status(500).json({ message: error.message });
        }
    }
}