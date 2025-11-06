import { Request, Response } from 'express';
import { TemaService } from '../services/tema.service';
import { logError } from '../utils/logger';

export class TemaController {
  private temaService: TemaService;

  constructor() {
    this.temaService = new TemaService();
  }

  /**
   * GET /api/v1/materias/:materiaId/temas
   * Listar todos los temas de una materia
   */
  listarTemasPorMateria = async (req: Request, res: Response): Promise<void> => {
    try {
      const materiaId = parseInt(req.params.materiaId);

      if (isNaN(materiaId)) {
        res.status(400).json({
          error: 'ID de materia invalido'
        });
        return;
      }

      const temas = await this.temaService.listarTemasPorMateria(materiaId);

      res.status(200).json({
        success: true,
        data: temas,
        total: temas.length,
        materiaId
      });
    } catch (error: any) {
      logError('Error al listar temas:', error);
      res.status(500).json({
        error: 'Error interno al listar temas',
        mensaje: error.message
      });
    }
  };

  /**
   * GET /api/v1/materias/:materiaId/temas-con-progreso
   * Listar temas con progreso del estudiante
   */
  listarTemasConProgreso = async (req: Request, res: Response): Promise<void> => {
    try {
      const materiaId = parseInt(req.params.materiaId);
      const usuarioId = (req as any).userId;

      if (isNaN(materiaId)) {
        res.status(400).json({
          error: 'ID de materia invalido'
        });
        return;
      }

      if (!usuarioId) {
        res.status(401).json({
          error: 'Usuario no autenticado'
        });
        return;
      }

      const temas = await this.temaService.listarTemasConProgreso(materiaId, usuarioId);

      res.status(200).json({
        success: true,
        data: temas,
        total: temas.length,
        materiaId
      });
    } catch (error: any) {
      logError('Error al listar temas con progreso:', error);
      res.status(500).json({
        error: 'Error interno al listar temas',
        mensaje: error.message
      });
    }
  };

  /**
   * GET /api/v1/temas/:id
   * Obtener detalle de un tema especifico
   */
  obtenerTemaPorId = async (req: Request, res: Response): Promise<void> => {
    try {
      const temaId = parseInt(req.params.id);

      if (isNaN(temaId)) {
        res.status(400).json({
          error: 'ID de tema invalido'
        });
        return;
      }

      const tema = await this.temaService.obtenerTemaPorId(temaId);

      res.status(200).json({
        success: true,
        data: tema
      });
    } catch (error: any) {
      logError('Error al obtener tema:', error);

      if (error.message === 'Tema no encontrado') {
        res.status(404).json({
          error: 'Tema no encontrado'
        });
        return;
      }

      res.status(500).json({
        error: 'Error interno al obtener tema',
        mensaje: error.message
      });
    }
  };

  /**
   * GET /api/v1/temas/:temaId/subtemas
   * Listar subtemas de un tema
   */
  listarSubtemasPorTema = async (req: Request, res: Response): Promise<void> => {
    try {
      const temaId = parseInt(req.params.temaId);

      if (isNaN(temaId)) {
        res.status(400).json({
          error: 'ID de tema invalido'
        });
        return;
      }

      const subtemas = await this.temaService.listarSubtemasPorTema(temaId);

      res.status(200).json({
        success: true,
        data: subtemas,
        total: subtemas.length,
        temaId
      });
    } catch (error: any) {
      logError('Error al listar subtemas:', error);
      res.status(500).json({
        error: 'Error interno al listar subtemas',
        mensaje: error.message
      });
    }
  };

  /**
   * GET /api/v1/subtemas/:id
   * Obtener detalle de un subtema especifico
   */
  obtenerSubtemaPorId = async (req: Request, res: Response): Promise<void> => {
    try {
      const subtemaId = parseInt(req.params.id);

      if (isNaN(subtemaId)) {
        res.status(400).json({
          error: 'ID de subtema invalido'
        });
        return;
      }

      const subtema = await this.temaService.obtenerSubtemaPorId(subtemaId);

      res.status(200).json({
        success: true,
        data: subtema
      });
    } catch (error: any) {
      logError('Error al obtener subtema:', error);

      if (error.message === 'Subtema no encontrado') {
        res.status(404).json({
          error: 'Subtema no encontrado'
        });
        return;
      }

      res.status(500).json({
        error: 'Error interno al obtener subtema',
        mensaje: error.message
      });
    }
  };
}