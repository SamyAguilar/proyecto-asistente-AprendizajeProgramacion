import { Request, Response } from 'express';
import { ReporteService } from '../services/reporte.service';
import { logError } from '../utils/logger';

export class ReporteController {
  private reporteService: ReporteService;

  constructor() {
    this.reporteService = new ReporteService();
  }

  /**
   * GET /api/v1/reportes/rendimiento
   * Generar reporte de rendimiento general
   */
  generarReporteRendimiento = async (req: Request, res: Response): Promise<void> => {
    try {
      const usuarioId = (req as any).userId;

      if (!usuarioId) {
        res.status(401).json({
          error: 'Usuario no autenticado'
        });
        return;
      }

      let fechaInicio: Date | undefined;
      let fechaFin: Date | undefined;

      if (req.query.fechaInicio) {
        fechaInicio = new Date(req.query.fechaInicio as string);
        if (isNaN(fechaInicio.getTime())) {
          res.status(400).json({
            error: 'Fecha de inicio invalida'
          });
          return;
        }
      }

      if (req.query.fechaFin) {
        fechaFin = new Date(req.query.fechaFin as string);
        if (isNaN(fechaFin.getTime())) {
          res.status(400).json({
            error: 'Fecha de fin invalida'
          });
          return;
        }
      }

      const reporte = await this.reporteService.generarReporteRendimiento(
        usuarioId,
        fechaInicio,
        fechaFin
      );

      res.status(200).json({
        success: true,
        data: reporte
      });
    } catch (error: any) {
      logError('Error al generar reporte de rendimiento:', error);
      res.status(500).json({
        error: 'Error interno al generar reporte',
        mensaje: error.message
      });
    }
  };

  /**
   * GET /api/v1/reportes/por-materia/:materiaId
   * Generar reporte por materia especifica
   */
  generarReportePorMateria = async (req: Request, res: Response): Promise<void> => {
    try {
      const usuarioId = (req as any).userId;
      const materiaId = parseInt(req.params.materiaId);

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

      const reporte = await this.reporteService.generarReportePorMateria(usuarioId, materiaId);

      res.status(200).json({
        success: true,
        data: reporte
      });
    } catch (error: any) {
      logError('Error al generar reporte por materia:', error);

      if (error.message === 'Materia no encontrada') {
        res.status(404).json({
          error: 'Materia no encontrada'
        });
        return;
      }

      res.status(500).json({
        error: 'Error interno al generar reporte',
        mensaje: error.message
      });
    }
  };

  /**
   * GET /api/v1/reportes/actividad
   * Generar reporte de actividad diaria
   */
  generarReporteActividad = async (req: Request, res: Response): Promise<void> => {
    try {
      const usuarioId = (req as any).userId;

      if (!usuarioId) {
        res.status(401).json({
          error: 'Usuario no autenticado'
        });
        return;
      }

      const dias = req.query.dias ? parseInt(req.query.dias as string) : 7;

      if (isNaN(dias) || dias < 1 || dias > 90) {
        res.status(400).json({
          error: 'El parametro dias debe ser un numero entre 1 y 90'
        });
        return;
      }

      const reporte = await this.reporteService.generarReporteActividad(usuarioId, dias);

      res.status(200).json({
        success: true,
        data: reporte,
        periodo: `Ultimos ${dias} dias`
      });
    } catch (error: any) {
      logError('Error al generar reporte de actividad:', error);
      res.status(500).json({
        error: 'Error interno al generar reporte',
        mensaje: error.message
      });
    }
  };

  /**
   * GET /api/v1/reportes/comparativo
   * Generar reporte comparativo con otros estudiantes
   */
  generarReporteComparativo = async (req: Request, res: Response): Promise<void> => {
    try {
      const usuarioId = (req as any).userId;

      if (!usuarioId) {
        res.status(401).json({
          error: 'Usuario no autenticado'
        });
        return;
      }

      const reporte = await this.reporteService.generarReporteComparativo(usuarioId);

      res.status(200).json({
        success: true,
        data: reporte
      });
    } catch (error: any) {
      logError('Error al generar reporte comparativo:', error);
      res.status(500).json({
        error: 'Error interno al generar reporte',
        mensaje: error.message
      });
    }
  };
}