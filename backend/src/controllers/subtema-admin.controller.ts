// backend/src/controllers/subtema-admin.controller.ts

import { Request, Response } from 'express';
import { SubtemaAdminService } from '../services/subtema-admin.service';
import { logError } from '../utils/logger';

export class SubtemaAdminController {
  private subtemaAdminService: SubtemaAdminService;

  constructor() {
    this.subtemaAdminService = new SubtemaAdminService();
  }

  /**
   * POST /api/v1/admin/subtemas
   * Crear un nuevo subtema
   */
  crearSubtema = async (req: Request, res: Response): Promise<void> => {
    try {
      const { temaId, nombre, descripcion, contenidoDetalle, orden } = req.body;

      if (!temaId || !nombre) {
        res.status(400).json({
          error: 'Campos requeridos faltantes',
          mensaje: 'temaId y nombre son obligatorios'
        });
        return;
      }

      if (typeof temaId !== 'number' || temaId < 1) {
        res.status(400).json({
          error: 'temaId inválido'
        });
        return;
      }

      const nuevoSubtema = await this.subtemaAdminService.crearSubtema({
        temaId,
        nombre,
        descripcion,
        contenidoDetalle,
        orden
      });

      res.status(201).json({
        success: true,
        mensaje: 'Subtema creado exitosamente',
        data: {
          id: nuevoSubtema.id,
          temaId: nuevoSubtema.temaId,
          nombre: nuevoSubtema.nombre,
          descripcion: nuevoSubtema.descripcion,
          contenidoDetalle: nuevoSubtema.contenidoDetalle,
          orden: nuevoSubtema.orden,
          fechaCreacion: nuevoSubtema.fechaCreacion
        }
      });
    } catch (error: any) {
      logError('Error al crear subtema:', error);

      if (error.message === 'El tema especificado no existe') {
        res.status(404).json({
          error: 'Tema no encontrado',
          mensaje: error.message
        });
        return;
      }

      res.status(500).json({
        error: 'Error interno al crear subtema',
        mensaje: error.message
      });
    }
  };

  /**
   * PUT /api/v1/admin/subtemas/:id
   * Actualizar un subtema existente
   */
  actualizarSubtema = async (req: Request, res: Response): Promise<void> => {
    try {
      const subtemaId = parseInt(req.params.id);
      const datosActualizacion = req.body;

      if (isNaN(subtemaId)) {
        res.status(400).json({
          error: 'ID de subtema inválido'
        });
        return;
      }

      if (Object.keys(datosActualizacion).length === 0) {
        res.status(400).json({
          error: 'No se proporcionaron datos para actualizar'
        });
        return;
      }

      const subtemaActualizado = await this.subtemaAdminService.actualizarSubtema(
        subtemaId,
        datosActualizacion
      );

      res.status(200).json({
        success: true,
        mensaje: 'Subtema actualizado exitosamente',
        data: {
          id: subtemaActualizado.id,
          temaId: subtemaActualizado.temaId,
          nombre: subtemaActualizado.nombre,
          descripcion: subtemaActualizado.descripcion,
          contenidoDetalle: subtemaActualizado.contenidoDetalle,
          orden: subtemaActualizado.orden
        }
      });
    } catch (error: any) {
      logError('Error al actualizar subtema:', error);

      if (error.message === 'Subtema no encontrado') {
        res.status(404).json({
          error: 'Subtema no encontrado'
        });
        return;
      }

      res.status(500).json({
        error: 'Error interno al actualizar subtema',
        mensaje: error.message
      });
    }
  };

  /**
   * DELETE /api/v1/admin/subtemas/:id
   * Eliminar un subtema
   */
  eliminarSubtema = async (req: Request, res: Response): Promise<void> => {
    try {
      const subtemaId = parseInt(req.params.id);

      if (isNaN(subtemaId)) {
        res.status(400).json({
          error: 'ID de subtema inválido'
        });
        return;
      }

      await this.subtemaAdminService.eliminarSubtema(subtemaId);

      res.status(200).json({
        success: true,
        mensaje: 'Subtema eliminado exitosamente'
      });
    } catch (error: any) {
      logError('Error al eliminar subtema:', error);

      if (error.message === 'Subtema no encontrado') {
        res.status(404).json({
          error: 'Subtema no encontrado'
        });
        return;
      }

      if (error.message.includes('tiene') && error.message.includes('ejercicio')) {
        res.status(409).json({
          error: 'Conflicto',
          mensaje: error.message
        });
        return;
      }

      res.status(500).json({
        error: 'Error interno al eliminar subtema',
        mensaje: error.message
      });
    }
  };
}