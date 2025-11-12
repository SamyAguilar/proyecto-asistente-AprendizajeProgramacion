// backend/src/controllers/materia-admin.controller.ts

import { Request, Response } from 'express';
import { MateriaAdminService } from '../services/materia-admin.service';
import { logError } from '../utils/logger';

export class MateriaAdminController {
  private materiaAdminService: MateriaAdminService;

  constructor() {
    this.materiaAdminService = new MateriaAdminService();
  }

  /**
   * POST /api/v1/admin/materias
   * Crear una nueva materia
   * Requiere: auth + rol profesor/admin
   */
  crearMateria = async (req: Request, res: Response): Promise<void> => {
    try {
      const { nombre, codigo, descripcion, semestre, prerequisitos, creditos } = req.body;

      // Validar campos requeridos
      if (!nombre || !codigo) {
        res.status(400).json({
          error: 'Campos requeridos faltantes',
          mensaje: 'Nombre y código son obligatorios'
        });
        return;
      }

      // Validar tipos de datos
      if (semestre && (typeof semestre !== 'number' || semestre < 1 || semestre > 12)) {
        res.status(400).json({
          error: 'Semestre inválido',
          mensaje: 'El semestre debe ser un número entre 1 y 12'
        });
        return;
      }

      if (creditos && (typeof creditos !== 'number' || creditos < 0 || creditos > 20)) {
        res.status(400).json({
          error: 'Créditos inválidos',
          mensaje: 'Los créditos deben ser un número entre 0 y 20'
        });
        return;
      }

      const nuevaMateria = await this.materiaAdminService.crearMateria({
        nombre,
        codigo,
        descripcion,
        semestre,
        prerequisitos,
        creditos
      });

      res.status(201).json({
        success: true,
        mensaje: 'Materia creada exitosamente',
        data: {
          id: nuevaMateria.id,
          nombre: nuevaMateria.nombre,
          codigo: nuevaMateria.codigo,
          descripcion: nuevaMateria.descripcion,
          semestre: nuevaMateria.semestre,
          prerequisitos: nuevaMateria.prerequisitos,
          creditos: nuevaMateria.creditos,
          fechaCreacion: nuevaMateria.fechaCreacion
        }
      });
    } catch (error: any) {
      logError('Error al crear materia:', error);

      if (error.message === 'El código de materia ya existe') {
        res.status(409).json({
          error: 'Código duplicado',
          mensaje: error.message
        });
        return;
      }

      res.status(500).json({
        error: 'Error interno al crear materia',
        mensaje: error.message
      });
    }
  };

  /**
   * PUT /api/v1/admin/materias/:id
   * Actualizar una materia existente
   * Requiere: auth + rol profesor/admin
   */
  actualizarMateria = async (req: Request, res: Response): Promise<void> => {
    try {
      const materiaId = parseInt(req.params.id);
      const datosActualizacion = req.body;

      if (isNaN(materiaId)) {
        res.status(400).json({
          error: 'ID de materia inválido'
        });
        return;
      }

      // Validar que se envíe al menos un campo para actualizar
      if (Object.keys(datosActualizacion).length === 0) {
        res.status(400).json({
          error: 'No se proporcionaron datos para actualizar'
        });
        return;
      }

      // Validar tipos de datos si se proporcionan
      if (datosActualizacion.semestre && 
          (typeof datosActualizacion.semestre !== 'number' || 
           datosActualizacion.semestre < 1 || 
           datosActualizacion.semestre > 12)) {
        res.status(400).json({
          error: 'Semestre inválido',
          mensaje: 'El semestre debe ser un número entre 1 y 12'
        });
        return;
      }

      if (datosActualizacion.creditos && 
          (typeof datosActualizacion.creditos !== 'number' || 
           datosActualizacion.creditos < 0 || 
           datosActualizacion.creditos > 20)) {
        res.status(400).json({
          error: 'Créditos inválidos',
          mensaje: 'Los créditos deben ser un número entre 0 y 20'
        });
        return;
      }

      const materiaActualizada = await this.materiaAdminService.actualizarMateria(
        materiaId,
        datosActualizacion
      );

      res.status(200).json({
        success: true,
        mensaje: 'Materia actualizada exitosamente',
        data: {
          id: materiaActualizada.id,
          nombre: materiaActualizada.nombre,
          codigo: materiaActualizada.codigo,
          descripcion: materiaActualizada.descripcion,
          semestre: materiaActualizada.semestre,
          prerequisitos: materiaActualizada.prerequisitos,
          creditos: materiaActualizada.creditos
        }
      });
    } catch (error: any) {
      logError('Error al actualizar materia:', error);

      if (error.message === 'Materia no encontrada') {
        res.status(404).json({
          error: 'Materia no encontrada'
        });
        return;
      }

      if (error.message === 'El código de materia ya existe') {
        res.status(409).json({
          error: 'Código duplicado',
          mensaje: error.message
        });
        return;
      }

      res.status(500).json({
        error: 'Error interno al actualizar materia',
        mensaje: error.message
      });
    }
  };

  /**
   * DELETE /api/v1/admin/materias/:id
   * Eliminar una materia
   * Requiere: auth + rol admin
   */
  eliminarMateria = async (req: Request, res: Response): Promise<void> => {
    try {
      const materiaId = parseInt(req.params.id);

      if (isNaN(materiaId)) {
        res.status(400).json({
          error: 'ID de materia inválido'
        });
        return;
      }

      await this.materiaAdminService.eliminarMateria(materiaId);

      res.status(200).json({
        success: true,
        mensaje: 'Materia eliminada exitosamente'
      });
    } catch (error: any) {
      logError('Error al eliminar materia:', error);

      if (error.message === 'Materia no encontrada') {
        res.status(404).json({
          error: 'Materia no encontrada'
        });
        return;
      }

      if (error.message.includes('tiene') && error.message.includes('estudiante')) {
        res.status(409).json({
          error: 'Conflicto',
          mensaje: error.message
        });
        return;
      }

      res.status(500).json({
        error: 'Error interno al eliminar materia',
        mensaje: error.message
      });
    }
  };
}