// backend/src/controllers/tema-admin.controller.ts

import { Request, Response } from 'express';
import { TemaAdminService } from '../services/tema-admin.service';
import { logError } from '../utils/logger';

export class TemaAdminController {
  private temaAdminService: TemaAdminService;

  constructor() {
    this.temaAdminService = new TemaAdminService();
  }

  /**
   * POST /api/v1/admin/temas
   * Crear un nuevo tema
   * Requiere: auth + rol profesor/admin
   */
  crearTema = async (req: Request, res: Response): Promise<void> => {
    try {
      const { materiaId, nombre, descripcion, contenido, orden } = req.body;

      // Validar campos requeridos
      if (!materiaId || !nombre) {
        res.status(400).json({
          error: 'Campos requeridos faltantes',
          mensaje: 'materiaId y nombre son obligatorios'
        });
        return;
      }

      // Validar tipos
      if (typeof materiaId !== 'number' || materiaId < 1) {
        res.status(400).json({
          error: 'materiaId inválido',
          mensaje: 'materiaId debe ser un número positivo'
        });
        return;
      }

      if (orden && (typeof orden !== 'number' || orden < 1)) {
        res.status(400).json({
          error: 'Orden inválido',
          mensaje: 'El orden debe ser un número positivo'
        });
        return;
      }

      const nuevoTema = await this.temaAdminService.crearTema({
        materiaId,
        nombre,
        descripcion,
        contenido,
        orden
      });

      res.status(201).json({
        success: true,
        mensaje: 'Tema creado exitosamente',
        data: {
          id: nuevoTema.id,
          materiaId: nuevoTema.materiaId,
          nombre: nuevoTema.nombre,
          descripcion: nuevoTema.descripcion,
          contenido: nuevoTema.contenido,
          orden: nuevoTema.orden,
          fechaCreacion: nuevoTema.fechaCreacion
        }
      });
    } catch (error: any) {
      logError('Error al crear tema:', error);

      if (error.message === 'La materia especificada no existe') {
        res.status(404).json({
          error: 'Materia no encontrada',
          mensaje: error.message
        });
        return;
      }

      res.status(500).json({
        error: 'Error interno al crear tema',
        mensaje: error.message
      });
    }
  };

  /**
   * PUT /api/v1/admin/temas/:id
   * Actualizar un tema existente
   * Requiere: auth + rol profesor/admin
   */
  actualizarTema = async (req: Request, res: Response): Promise<void> => {
    try {
      const temaId = parseInt(req.params.id);
      const datosActualizacion = req.body;

      if (isNaN(temaId)) {
        res.status(400).json({
          error: 'ID de tema inválido'
        });
        return;
      }

      if (Object.keys(datosActualizacion).length === 0) {
        res.status(400).json({
          error: 'No se proporcionaron datos para actualizar'
        });
        return;
      }

      // Validar orden si se proporciona
      if (datosActualizacion.orden && 
          (typeof datosActualizacion.orden !== 'number' || 
           datosActualizacion.orden < 1)) {
        res.status(400).json({
          error: 'Orden inválido',
          mensaje: 'El orden debe ser un número positivo'
        });
        return;
      }

      const temaActualizado = await this.temaAdminService.actualizarTema(
        temaId,
        datosActualizacion
      );

      res.status(200).json({
        success: true,
        mensaje: 'Tema actualizado exitosamente',
        data: {
          id: temaActualizado.id,
          materiaId: temaActualizado.materiaId,
          nombre: temaActualizado.nombre,
          descripcion: temaActualizado.descripcion,
          contenido: temaActualizado.contenido,
          orden: temaActualizado.orden
        }
      });
    } catch (error: any) {
      logError('Error al actualizar tema:', error);

      if (error.message === 'Tema no encontrado') {
        res.status(404).json({
          error: 'Tema no encontrado'
        });
        return;
      }

      res.status(500).json({
        error: 'Error interno al actualizar tema',
        mensaje: error.message
      });
    }
  };

  /**
   * DELETE /api/v1/admin/temas/:id
   * Eliminar un tema
   * Requiere: auth + rol admin
   */
  eliminarTema = async (req: Request, res: Response): Promise<void> => {
    try {
      const temaId = parseInt(req.params.id);

      if (isNaN(temaId)) {
        res.status(400).json({
          error: 'ID de tema inválido'
        });
        return;
      }

      await this.temaAdminService.eliminarTema(temaId);

      res.status(200).json({
        success: true,
        mensaje: 'Tema eliminado exitosamente'
      });
    } catch (error: any) {
      logError('Error al eliminar tema:', error);

      if (error.message === 'Tema no encontrado') {
        res.status(404).json({
          error: 'Tema no encontrado'
        });
        return;
      }

      if (error.message.includes('tiene') && error.message.includes('subtema')) {
        res.status(409).json({
          error: 'Conflicto',
          mensaje: error.message
        });
        return;
      }

      res.status(500).json({
        error: 'Error interno al eliminar tema',
        mensaje: error.message
      });
    }
  };
}