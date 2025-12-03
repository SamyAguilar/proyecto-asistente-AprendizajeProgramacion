import { Request, Response } from 'express';
import { ProgresoService } from '../services/progreso.service';
import { logError } from '../utils/logger';

export class ProgresoController {
  private progresoService: ProgresoService;

  constructor() {
    this.progresoService = new ProgresoService();
  }

  /**
   * GET /api/v1/progreso/tema/:temaId
   * Obtener progreso del estudiante en un tema especifico
   */
  obtenerProgresoEnTema = async (req: Request, res: Response): Promise<void> => {
    try {
      const usuarioId = (req as any).userId;
      const temaId = parseInt(req.params.temaId);

      if (!usuarioId) {
        res.status(401).json({
          error: 'Usuario no autenticado'
        });
        return;
      }

      if (isNaN(temaId)) {
        res.status(400).json({
          error: 'ID de tema invalido'
        });
        return;
      }

      const progreso = await this.progresoService.obtenerProgresoEnTema(usuarioId, temaId);

      if (!progreso) {
        res.status(404).json({
          success: false,
          mensaje: 'No se encontro progreso para este tema',
          temaId
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: progreso
      });
    } catch (error: any) {
      logError('Error al obtener progreso en tema:', error);
      res.status(500).json({
        error: 'Error interno al obtener progreso',
        mensaje: error.message
      });
    }
  };

  /**
   * PUT /api/v1/progreso/actualizar
   * Actualizar progreso de un estudiante
   * IMPORTANTE: Pancho usara este endpoint
   */
  actualizarProgreso = async (req: Request, res: Response): Promise<void> => {
    try {
      const usuarioId = (req as any).userId;
      const { temaId, subtemaId, estado, porcentajeCompletado } = req.body;

      if (!usuarioId) {
        res.status(401).json({
          error: 'Usuario no autenticado'
        });
        return;
      }

      // Validaciones
      if (!temaId) {
        res.status(400).json({
          error: 'Campo requerido: temaId'
        });
        return;
      }

      if (!estado) {
        res.status(400).json({
          error: 'Campo requerido: estado'
        });
        return;
      }

      const estadosValidos = ['no_iniciado', 'en_progreso', 'completado'];
      if (!estadosValidos.includes(estado)) {
        res.status(400).json({
          error: 'Estado invalido. Valores permitidos: no_iniciado, en_progreso, completado'
        });
        return;
      }

      const progreso = await this.progresoService.actualizarProgreso(usuarioId, {
        temaId,
        subtemaId,
        estado,
        porcentajeCompletado
      });

      res.status(200).json({
        success: true,
        mensaje: 'Progreso actualizado correctamente',
        data: progreso
      });
    } catch (error: any) {
      logError('Error al actualizar progreso:', error);
      res.status(500).json({
        error: 'Error interno al actualizar progreso',
        mensaje: error.message
      });
    }
  };

  /**
   * GET /api/v1/progreso/mi-progreso
   * Listar todo el progreso del estudiante autenticado
   */
  listarMiProgreso = async (req: Request, res: Response): Promise<void> => {
    try {
      const usuarioId = (req as any).userId;

      if (!usuarioId) {
        res.status(401).json({
          error: 'Usuario no autenticado'
        });
        return;
      }

      const progresos = await this.progresoService.listarProgresoEstudiante(usuarioId);

      res.status(200).json({
        success: true,
        data: progresos,
        total: progresos.length
      });
    } catch (error: any) {
      logError('Error al listar progreso:', error);
      res.status(500).json({
        error: 'Error interno al listar progreso',
        mensaje: error.message
      });
    }
  };

  /**
   * GET /api/v1/progreso/materia/:materiaId
   * Obtener resumen de progreso en una materia
   */
  obtenerProgresoEnMateria = async (req: Request, res: Response): Promise<void> => {
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

      const progreso = await this.progresoService.obtenerProgresoEnMateria(usuarioId, materiaId);

      res.status(200).json({
        success: true,
        data: progreso
      });
    } catch (error: any) {
      logError('Error al obtener progreso en materia:', error);

      if (error.message === 'Materia no encontrada') {
        res.status(404).json({
          error: 'Materia no encontrada'
        });
        return;
      }

      res.status(500).json({
        error: 'Error interno al obtener progreso',
        mensaje: error.message
      });
    }
  };

  /**
   * POST /api/v1/progreso/calcular/:temaId
   * Calcular automaticamente el progreso basado en ejercicios/quizzes completados
   * IMPORTANTE: Pancho puede usar este endpoint
   */
  calcularProgresoTema = async (req: Request, res: Response): Promise<void> => {
    try {
      const usuarioId = (req as any).userId;
      const temaId = parseInt(req.params.temaId);

      if (!usuarioId) {
        res.status(401).json({
          error: 'Usuario no autenticado'
        });
        return;
      }

      if (isNaN(temaId)) {
        res.status(400).json({
          error: 'ID de tema invalido'
        });
        return;
      }

      await this.progresoService.calcularYActualizarProgresoTema(usuarioId, temaId);

      // Obtener progreso actualizado
      const progreso = await this.progresoService.obtenerProgresoEnTema(usuarioId, temaId);

      res.status(200).json({
        success: true,
        mensaje: 'Progreso calculado y actualizado',
        data: progreso
      });
    } catch (error: any) {
      logError('Error al calcular progreso:', error);
      res.status(500).json({
        error: 'Error interno al calcular progreso',
        mensaje: error.message
      });
    }
  };

  /**
   * GET /api/v1/progreso/general
   * Obtener progreso general del estudiante
   */
  obtenerProgresoGeneral = async (req: Request, res: Response): Promise<void> => {
    try {
      const usuarioId = (req as any).userId;

      if (!usuarioId) {
        res.status(401).json({
          error: 'Usuario no autenticado'
        });
        return;
      }

      const progresoGeneral = await this.progresoService.calcularProgresoGeneral(usuarioId);

      res.status(200).json({
        success: true,
        data: progresoGeneral
      });
    } catch (error: any) {
      logError('Error al obtener progreso general:', error);
      res.status(500).json({
        error: 'Error interno al obtener progreso general',
        mensaje: error.message
      });
    }
  };
}