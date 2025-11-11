// backend/src/controllers/ejercicio.controller.ts

import { Request, Response } from 'express';
import { EjercicioService } from '../services/ejercicio.service';
import { ValidateCodeUseCase } from '../application/use-cases/ValidateCodeUseCase';
import { GeminiClient } from '../infrastructure/gemini/GeminiClient';
import { InMemoryCacheService } from '../infrastructure/cache/InMemoryCacheService';
import { logError } from '../utils/logger';

export class EjercicioController {
  private ejercicioService: EjercicioService;

  constructor() {
    // Dependency Injection igual que en GeminiController
    const geminiClient = new GeminiClient();
    const cacheService = new InMemoryCacheService();
    const validateCodeUseCase = new ValidateCodeUseCase(geminiClient, cacheService);
    
    this.ejercicioService = new EjercicioService(validateCodeUseCase);
  }

  /**
   * GET /api/v1/ejercicios/subtema/:subtemaId
   * Listar todos los ejercicios de un subtema
   */
  listarEjerciciosPorSubtema = async (req: Request, res: Response): Promise<void> => {
    try {
      const subtemaId = parseInt(req.params.subtemaId);

      if (isNaN(subtemaId)) {
        res.status(400).json({
          error: 'ID de subtema invalido'
        });
        return;
      }

      const ejercicios = await this.ejercicioService.listarEjerciciosPorSubtema(subtemaId);

      res.status(200).json({
        success: true,
        data: ejercicios,
        total: ejercicios.length
      });
    } catch (error: any) {
      logError('Error al listar ejercicios:', error);
      res.status(500).json({
        error: 'Error interno al listar ejercicios',
        mensaje: error.message
      });
    }
  };

  /**
   * GET /api/v1/ejercicios/:id
   * Obtener detalle de un ejercicio especifico
   */
  obtenerEjercicioPorId = async (req: Request, res: Response): Promise<void> => {
    try {
      const ejercicioId = parseInt(req.params.id);

      if (isNaN(ejercicioId)) {
        res.status(400).json({
          error: 'ID de ejercicio invalido'
        });
        return;
      }

      const ejercicio = await this.ejercicioService.obtenerEjercicioPorId(ejercicioId);

      res.status(200).json({
        success: true,
        data: ejercicio
      });
    } catch (error: any) {
      logError('Error al obtener ejercicio:', error);

      if (error.message === 'Ejercicio no encontrado') {
        res.status(404).json({
          error: 'Ejercicio no encontrado'
        });
        return;
      }

      res.status(500).json({
        error: 'Error interno al obtener ejercicio',
        mensaje: error.message
      });
    }
  };

  /**
   * POST /api/v1/ejercicios/:id/enviar
   * ENDPOINT MAS IMPORTANTE: Enviar solucion de ejercicio
   */
  enviarEjercicio = async (req: Request, res: Response): Promise<void> => {
    try {
      const usuarioId = (req as any).userId;
      const ejercicioId = parseInt(req.params.id);
      const { codigoEnviado } = req.body;

      if (!usuarioId) {
        res.status(401).json({
          error: 'Usuario no autenticado'
        });
        return;
      }

      if (isNaN(ejercicioId)) {
        res.status(400).json({
          error: 'ID de ejercicio invalido'
        });
        return;
      }

      if (!codigoEnviado) {
        res.status(400).json({
          error: 'Campo requerido: codigoEnviado'
        });
        return;
      }

      const resultado = await this.ejercicioService.enviarEjercicio(
        ejercicioId,
        usuarioId,
        { codigoEnviado }
      );

      res.status(200).json({
        success: true,
        data: resultado,
        mensaje: resultado.resultado === 'correcto' 
          ? 'Ejercicio completado correctamente' 
          : 'Ejercicio enviado, revisa la retroalimentacion'
      });
    } catch (error: any) {
      logError('Error al enviar ejercicio:', error);

      if (error.message.includes('matriculado')) {
        res.status(403).json({
          error: error.message
        });
        return;
      }

      if (error.message === 'Ejercicio no encontrado') {
        res.status(404).json({
          error: 'Ejercicio no encontrado'
        });
        return;
      }

      res.status(500).json({
        error: 'Error interno al enviar ejercicio',
        mensaje: error.message
      });
    }
  };

  /**
   * GET /api/v1/ejercicios/:id/intentos
   * Obtener historial de intentos de un usuario en un ejercicio
   */
  obtenerIntentosEjercicio = async (req: Request, res: Response): Promise<void> => {
    try {
      const usuarioId = (req as any).userId;
      const ejercicioId = parseInt(req.params.id);

      if (!usuarioId) {
        res.status(401).json({
          error: 'Usuario no autenticado'
        });
        return;
      }

      if (isNaN(ejercicioId)) {
        res.status(400).json({
          error: 'ID de ejercicio invalido'
        });
        return;
      }

      const intentos = await this.ejercicioService.obtenerIntentosEjercicio(
        ejercicioId,
        usuarioId
      );

      res.status(200).json({
        success: true,
        data: intentos,
        total: intentos.length
      });
    } catch (error: any) {
      logError('Error al obtener intentos:', error);
      res.status(500).json({
        error: 'Error interno al obtener intentos',
        mensaje: error.message
      });
    }
  };
}