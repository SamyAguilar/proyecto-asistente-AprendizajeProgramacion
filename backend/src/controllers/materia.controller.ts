// backend/src/controllers/materia.controller.ts

import { Request, Response } from 'express';
import { MateriaService } from '../services/materia.service';
import { logError } from '../utils/logger';

export class MateriaController {
  private materiaService: MateriaService;

  constructor() {
    this.materiaService = new MateriaService();
  }

  /**
   * GET /api/v1/materias
   * Listar todas las materias disponibles
   */
  listarMaterias = async (req: Request, res: Response): Promise<void> => {
    try {
      const materias = await this.materiaService.listarMaterias();

      res.status(200).json({
        success: true,
        data: materias,
        total: materias.length
      });
    } catch (error: any) {
      logError('Error al listar materias:', error);
      res.status(500).json({
        error: 'Error interno al listar materias',
        mensaje: error.message
      });
    }
  };

  /**
   * GET /api/v1/materias/:id
   * Obtener detalle de una materia especifica
   */
  obtenerMateriaPorId = async (req: Request, res: Response): Promise<void> => {
    try {
      const materiaId = parseInt(req.params.id);

      if (isNaN(materiaId)) {
        res.status(400).json({
          error: 'ID de materia invalido'
        });
        return;
      }

      const materia = await this.materiaService.obtenerMateriaPorId(materiaId);

      res.status(200).json({
        success: true,
        data: materia
      });
    } catch (error: any) {
      logError('Error al obtener materia:', error);

      if (error.message === 'Materia no encontrada') {
        res.status(404).json({
          error: 'Materia no encontrada'
        });
        return;
      }

      res.status(500).json({
        error: 'Error interno al obtener materia',
        mensaje: error.message
      });
    }
  };

  /**
   * GET /api/v1/materias/buscar?q=texto
   * Buscar materias por nombre o codigo
   */
  buscarMaterias = async (req: Request, res: Response): Promise<void> => {
    try {
      const query = req.query.q as string;

      if (!query) {
        res.status(400).json({
          error: 'Parametro de busqueda requerido: q'
        });
        return;
      }

      const materias = await this.materiaService.buscarMaterias(query);

      res.status(200).json({
        success: true,
        data: materias,
        total: materias.length,
        query: query
      });
    } catch (error: any) {
      logError('Error al buscar materias:', error);
      res.status(500).json({
        error: 'Error interno al buscar materias',
        mensaje: error.message
      });
    }
  };

  /**
   * GET /api/v1/materias/mis-materias
   * Listar materias del estudiante autenticado
   */
  listarMisMaterias = async (req: Request, res: Response): Promise<void> => {
    try {
      const usuarioId = (req as any).userId;

      if (!usuarioId) {
        res.status(401).json({
          error: 'Usuario no autenticado'
        });
        return;
      }

      const materias = await this.materiaService.listarMateriasDelEstudiante(usuarioId);

      res.status(200).json({
        success: true,
        data: materias,
        total: materias.length
      });
    } catch (error: any) {
      logError('Error al listar mis materias:', error);
      res.status(500).json({
        error: 'Error interno al listar mis materias',
        mensaje: error.message
      });
    }
  };

  /**
   * POST /api/v1/materias/:id/matricular
   * Matricular al estudiante en una materia
   */
  matricularEnMateria = async (req: Request, res: Response): Promise<void> => {
    try {
      const usuarioId = (req as any).userId;
      const materiaId = parseInt(req.params.id);

      if (!usuarioId) {
        res.status(401).json({
          error: 'Usuario no autenticado'
        });
        return;
      }

      if (isNaN(materiaId)) {
        res.status(400).json({
          error: 'ID de materia invalido'
        });
        return;
      }

      const resultado = await this.materiaService.matricularEnMateria(usuarioId, materiaId);

      res.status(201).json({
        success: true,
        data: resultado
      });
    } catch (error: any) {
      logError('Error al matricular en materia:', error);

      if (error.message === 'Materia no encontrada') {
        res.status(404).json({
          error: 'Materia no encontrada'
        });
        return;
      }

      if (error.message === 'Ya estas matriculado en esta materia') {
        res.status(409).json({
          error: 'Ya estas matriculado en esta materia'
        });
        return;
      }

      if (error.message === 'No cumples con los prerequisitos para esta materia') {
        res.status(403).json({
          error: 'No cumples con los prerequisitos para esta materia'
        });
        return;
      }

      res.status(500).json({
        error: 'Error interno al matricular',
        mensaje: error.message
      });
    }
  };
}