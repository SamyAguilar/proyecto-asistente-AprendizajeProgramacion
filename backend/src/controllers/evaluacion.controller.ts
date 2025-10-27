// backend/src/controllers/evaluacion.controller.ts

import { Request, Response } from 'express';
import { ejercicioService } from '../services/ejercicio.service';
import { quizService } from '../services/quiz.service'; 

// NOTA: Se ha eliminado la interfaz CustomRequest para evitar el conflicto TS2430.
// Usaremos Request y aserción de tipo 'as any'.

export class EvaluacionController {

    // ----------------------------------------
    // CONTROLADORES DE EJERCICIOS (BLOQUE 1)
    // ----------------------------------------

    // 1. GET /api/v1/ejercicios/subtema/:subtema_id
    public async getEjerciciosPorSubtema(req: Request, res: Response): Promise<Response> {
        try {
            const subtemaId = parseInt(req.params.subtemaId);
            // Usamos aserción 'as any' para acceder a 'id'
            const userId = (req.user as any).id; 

            const ejercicios = await ejercicioService.listarEjerciciosPorSubtema(subtemaId, userId);
            return res.status(200).json(ejercicios);
        } catch (error: any) {
            return res.status(500).json({ message: error.message });
        }
    }

    // 2. GET /api/v1/ejercicios/:id (NO NECESITA AUTH, solo se necesita el ID del ejercicio)
    public async getDetallesEjercicio(req: Request, res: Response): Promise<Response> {
        try {
            const ejercicioId = parseInt(req.params.id);
            const ejercicio = await ejercicioService.obtenerDetallesEjercicio(ejercicioId);
            return res.status(200).json(ejercicio);
        } catch (error: any) {
            return res.status(404).json({ message: 'Ejercicio no encontrado.' });
        }
    }

    // 3. POST /api/v1/ejercicios/:id/enviar
    public async postEnviarCodigo(req: Request, res: Response): Promise<Response> {
        try {
            const ejercicioId = parseInt(req.params.id);
            const { codigo_enviado } = req.body;
            // Usamos aserción 'as any' para acceder a 'id'
            const userId = (req.user as any).id; 

            if (!codigo_enviado) {
                return res.status(400).json({ message: 'El campo codigo_enviado es requerido.' });
            }
            
            const resultado = await ejercicioService.enviarCodigo(userId, ejercicioId, codigo_enviado);
            return res.status(200).json(resultado);
        } catch (error: any) {
            return res.status(500).json({ message: 'Error al procesar la solicitud: ' + error.message });
        }
    }

    // 4. GET /api/v1/ejercicios/:id/intentos
    public async getHistorialIntentos(req: Request, res: Response): Promise<Response> {
        try {
            const ejercicioId = parseInt(req.params.id);
            // Usamos aserción 'as any' para acceder a 'id'
            const userId = (req.user as any).id; 

            const historial = await ejercicioService.verHistorialIntentos(ejercicioId, userId);
            return res.status(200).json(historial);
        } catch (error: any) {
            return res.status(500).json({ message: error.message });
        }
    }
    
    // ----------------------------------------
    // CONTROLADORES DE QUIZZES (BLOQUE 2)
    // ----------------------------------------

    // 1. GET /api/v1/quiz/subtema/:subtema_id/preguntas
    public async getPreguntasQuiz(req: Request, res: Response): Promise<Response> {
        try {
            const subtemaId = parseInt(req.params.subtemaId);
            const preguntas = await quizService.obtenerPreguntasQuiz(subtemaId);
            return res.status(200).json(preguntas);
        } catch (error: any) {
            return res.status(500).json({ message: error.message });
        }
    }

    // 2. POST /api/v1/quiz/responder
    public async postResponderQuiz(req: Request, res: Response): Promise<Response> {
        try {
            const { pregunta_id, opcion_seleccionada_id } = req.body;
            // Usamos aserción 'as any' para acceder a 'id'
            const userId = (req.user as any).id; 

            if (!pregunta_id || !opcion_seleccionada_id) {
                return res.status(400).json({ message: 'pregunta_id y opcion_seleccionada_id son requeridos.' });
            }

            const resultado = await quizService.responderQuiz(userId, pregunta_id, opcion_seleccionada_id);
            return res.status(200).json(resultado);
        } catch (error: any) {
            return res.status(500).json({ message: 'Error al procesar la respuesta: ' + error.message });
        }
    }

    // 3. GET /api/v1/quiz/resultados/:usuario_id
    public async getResultadosQuiz(req: Request, res: Response): Promise<Response> {
        try {
            const requestedUserId = parseInt(req.params.usuarioId);
            const currentUser = req.user as any; // Aserción de todo el objeto
            
            const currentUserId = currentUser.id;
            // Asume que la propiedad 'isAdmin' viene en el objeto inyectado por Sam
            const isAdmin = currentUser.isAdmin || false; 

            const resultados = await quizService.obtenerResultadosQuiz(currentUserId, isAdmin, requestedUserId);
            return res.status(200).json(resultados);
        } catch (error: any) {
            // Usa 403 Forbidden para errores de permisos
            return res.status(403).json({ message: error.message }); 
        }
    }

    // 4. POST /api/v1/quiz/generar-preguntas (interno o admin)
    public async postGenerarPreguntas(req: Request, res: Response): Promise<Response> {
        try {
            // Este endpoint NO requiere req.user
            const { subtema_id, cantidad, dificultad = 'intermedia' } = req.body; 

            if (!subtema_id || !cantidad) {
                return res.status(400).json({ message: 'subtema_id y cantidad son requeridos.' });
            }

            const resultado = await quizService.generarPreguntas(subtema_id, cantidad, dificultad);
            return res.status(201).json(resultado);
        } catch (error: any) {
            return res.status(500).json({ message: 'Error al generar preguntas: ' + error.message });
        }
    }
}