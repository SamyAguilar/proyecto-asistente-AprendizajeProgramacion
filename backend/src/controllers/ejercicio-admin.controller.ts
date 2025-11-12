// backend/src/controllers/ejercicio-admin.controller.ts

import { Request, Response } from 'express';
import { EjercicioAdminService } from '../services/ejercicio-admin.service';
import { DificultadEjercicio, TipoEjercicio } from '../models/Ejercicio';
import { logError } from '../utils/logger';

export class EjercicioAdminController {
  private ejercicioAdminService: EjercicioAdminService;

  constructor() {
    this.ejercicioAdminService = new EjercicioAdminService();
  }

  /**
   * POST /api/v1/admin/ejercicios
   * Crear un nuevo ejercicio
   */
  crearEjercicio = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        subtemaId,
        enunciado,
        dificultad,
        tipoEjercicio,
        puntosMaximos,
        lenguajeProgramacion,
        codigoBase,
        codigoSolucion,
        casosPrueba
      } = req.body;

      // Validar campos requeridos
      if (!subtemaId || !enunciado) {
        res.status(400).json({
          error: 'Campos requeridos faltantes',
          mensaje: 'subtemaId y enunciado son obligatorios'
        });
        return;
      }

      if (typeof subtemaId !== 'number' || subtemaId < 1) {
        res.status(400).json({
          error: 'subtemaId inválido'
        });
        return;
      }

      // Validar dificultad si se proporciona
      if (dificultad && !Object.values(DificultadEjercicio).includes(dificultad)) {
        res.status(400).json({
          error: 'Dificultad inválida',
          mensaje: `La dificultad debe ser: ${Object.values(DificultadEjercicio).join(', ')}`
        });
        return;
      }

      // Validar tipo de ejercicio si se proporciona
      if (tipoEjercicio && !Object.values(TipoEjercicio).includes(tipoEjercicio)) {
        res.status(400).json({
          error: 'Tipo de ejercicio inválido',
          mensaje: `El tipo debe ser: ${Object.values(TipoEjercicio).join(', ')}`
        });
        return;
      }

      // Validar puntos si se proporcionan
      if (puntosMaximos && (typeof puntosMaximos !== 'number' || puntosMaximos < 0 || puntosMaximos > 100)) {
        res.status(400).json({
          error: 'puntosMaximos inválidos',
          mensaje: 'Los puntos deben estar entre 0 y 100'
        });
        return;
      }

      const nuevoEjercicio = await this.ejercicioAdminService.crearEjercicio({
        subtemaId,
        enunciado,
        dificultad,
        tipoEjercicio,
        puntosMaximos,
        lenguajeProgramacion,
        codigoBase,
        codigoSolucion,
        casosPrueba
      });

      res.status(201).json({
        success: true,
        mensaje: 'Ejercicio creado exitosamente',
        data: {
          id: nuevoEjercicio.id,
          subtemaId: nuevoEjercicio.subtemaId,
          enunciado: nuevoEjercicio.enunciado,
          dificultad: nuevoEjercicio.dificultad,
          tipoEjercicio: nuevoEjercicio.tipoEjercicio,
          puntosMaximos: nuevoEjercicio.puntosMaximos,
          lenguajeProgramacion: nuevoEjercicio.lenguajeProgramacion,
          codigoBase: nuevoEjercicio.codigoBase
        }
      });
    } catch (error: any) {
      logError('Error al crear ejercicio:', error);

      if (error.message === 'El subtema especificado no existe') {
        res.status(404).json({
          error: 'Subtema no encontrado',
          mensaje: error.message
        });
        return;
      }

      res.status(500).json({
        error: 'Error interno al crear ejercicio',
        mensaje: error.message
      });
    }
  };

  /**
   * PUT /api/v1/admin/ejercicios/:id
   * Actualizar un ejercicio existente
   */
  actualizarEjercicio = async (req: Request, res: Response): Promise<void> => {
    try {
      const ejercicioId = parseInt(req.params.id);
      const datosActualizacion = req.body;

      if (isNaN(ejercicioId)) {
        res.status(400).json({
          error: 'ID de ejercicio inválido'
        });
        return;
      }

      if (Object.keys(datosActualizacion).length === 0) {
        res.status(400).json({
          error: 'No se proporcionaron datos para actualizar'
        });
        return;
      }

      // Validar dificultad si se proporciona
      if (datosActualizacion.dificultad && 
          !Object.values(DificultadEjercicio).includes(datosActualizacion.dificultad)) {
        res.status(400).json({
          error: 'Dificultad inválida',
          mensaje: `La dificultad debe ser: ${Object.values(DificultadEjercicio).join(', ')}`
        });
        return;
      }

      // Validar tipo de ejercicio si se proporciona
      if (datosActualizacion.tipoEjercicio && 
          !Object.values(TipoEjercicio).includes(datosActualizacion.tipoEjercicio)) {
        res.status(400).json({
          error: 'Tipo de ejercicio inválido',
          mensaje: `El tipo debe ser: ${Object.values(TipoEjercicio).join(', ')}`
        });
        return;
      }

      // Validar puntos si se proporcionan
      if (datosActualizacion.puntosMaximos && 
          (typeof datosActualizacion.puntosMaximos !== 'number' || 
           datosActualizacion.puntosMaximos < 0 || 
           datosActualizacion.puntosMaximos > 100)) {
        res.status(400).json({
          error: 'puntosMaximos inválidos',
          mensaje: 'Los puntos deben estar entre 0 y 100'
        });
        return;
      }

      const ejercicioActualizado = await this.ejercicioAdminService.actualizarEjercicio(
        ejercicioId,
        datosActualizacion
      );

      res.status(200).json({
        success: true,
        mensaje: 'Ejercicio actualizado exitosamente',
        data: {
          id: ejercicioActualizado.id,
          subtemaId: ejercicioActualizado.subtemaId,
          enunciado: ejercicioActualizado.enunciado,
          dificultad: ejercicioActualizado.dificultad,
          tipoEjercicio: ejercicioActualizado.tipoEjercicio,
          puntosMaximos: ejercicioActualizado.puntosMaximos,
          lenguajeProgramacion: ejercicioActualizado.lenguajeProgramacion,
          codigoBase: ejercicioActualizado.codigoBase
        }
      });
    } catch (error: any) {
      logError('Error al actualizar ejercicio:', error);

      if (error.message === 'Ejercicio no encontrado') {
        res.status(404).json({
          error: 'Ejercicio no encontrado'
        });
        return;
      }

      res.status(500).json({
        error: 'Error interno al actualizar ejercicio',
        mensaje: error.message
      });
    }
  };

  /**
   * DELETE /api/v1/admin/ejercicios/:id
   * Eliminar un ejercicio
   */
  eliminarEjercicio = async (req: Request, res: Response): Promise<void> => {
    try {
      const ejercicioId = parseInt(req.params.id);

      if (isNaN(ejercicioId)) {
        res.status(400).json({
          error: 'ID de ejercicio inválido'
        });
        return;
      }

      await this.ejercicioAdminService.eliminarEjercicio(ejercicioId);

      res.status(200).json({
        success: true,
        mensaje: 'Ejercicio eliminado exitosamente'
      });
    } catch (error: any) {
      logError('Error al eliminar ejercicio:', error);

      if (error.message === 'Ejercicio no encontrado') {
        res.status(404).json({
          error: 'Ejercicio no encontrado'
        });
        return;
      }

      if (error.message.includes('tiene') && error.message.includes('intento')) {
        res.status(409).json({
          error: 'Conflicto',
          mensaje: error.message
        });
        return;
      }

      res.status(500).json({
        error: 'Error interno al eliminar ejercicio',
        mensaje: error.message
      });
    }
  };
}