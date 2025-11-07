import { AppDataSource } from '../config/database';
import { Progreso, EstadoProgreso } from '../models/Progreso';
import { Repository } from 'typeorm';

export interface ActualizarProgresoDto {
  temaId: number;
  subtemaId?: number;
  estado: 'no_iniciado' | 'en_progreso' | 'completado';
  porcentajeCompletado?: number;
}

export interface ProgresoDto {
  id: number;
  usuarioId: number;
  temaId: number;
  subtemaId: number | null;
  estado: string;
  porcentajeCompletado: number;
  intentos: number;
  fechaUltimoAcceso: Date;
  temaNombre: string;
  subtemaNombre: string | null;
}

export class ProgresoService {
  private progresoRepository: Repository<Progreso>;

  constructor() {
    this.progresoRepository = AppDataSource.getRepository(Progreso);
  }

  /**
   * Obtener progreso de un estudiante en un tema especifico
   * Endpoint: GET /api/v1/progreso/tema/:temaId
   */
  async obtenerProgresoEnTema(usuarioId: number, temaId: number): Promise<ProgresoDto | null> {
    const query = `
      SELECT 
        p.*,
        t.nombre as tema_nombre,
        s.nombre as subtema_nombre
      FROM progreso p
      INNER JOIN temas t ON t.id = p.tema_id
      LEFT JOIN subtemas s ON s.id = p.subtema_id
      WHERE p.usuario_id = $1 AND p.tema_id = $2
    `;

    const resultado = await AppDataSource.query(query, [usuarioId, temaId]);

    if (resultado.length === 0) {
      return null;
    }

    const p = resultado[0];
    return {
      id: p.id,
      usuarioId: p.usuario_id,
      temaId: p.tema_id,
      subtemaId: p.subtema_id,
      estado: p.estado,
      porcentajeCompletado: p.porcentaje_completado || 0,
      intentos: p.intentos || 0,
      fechaUltimoAcceso: p.fecha_ultimo_acceso,
      temaNombre: p.tema_nombre,
      subtemaNombre: p.subtema_nombre
    };
  }

  /**
   * Actualizar progreso de un estudiante en un tema
   * Funcion principal que Pancho usara
   * Endpoint: PUT /api/v1/progreso/actualizar
   */
  async actualizarProgreso(
    usuarioId: number,
    datos: ActualizarProgresoDto
  ): Promise<ProgresoDto> {
    const { temaId, subtemaId, estado, porcentajeCompletado } = datos;

    // Convertir string a enum (misma forma que en GenerateQuestionsUseCase.ts)
    let estadoEnum: EstadoProgreso;
    if (estado === 'completado') {
      estadoEnum = EstadoProgreso.COMPLETADO;
    } else if (estado === 'en_progreso') {
      estadoEnum = EstadoProgreso.EN_PROGRESO;
    } else {
      estadoEnum = EstadoProgreso.NO_INICIADO;
    }

    // Verificar si ya existe un registro de progreso
    const progresoExistente = await this.progresoRepository.findOne({
      where: {
        usuarioId: usuarioId,
        temaId: temaId
      }
    });

    if (progresoExistente) {
      // Actualizar progreso existente
      progresoExistente.estado = estadoEnum;
      progresoExistente.fechaUltimoAcceso = new Date();

      if (subtemaId) {
        progresoExistente.subtemaId = subtemaId;
      }

      if (porcentajeCompletado !== undefined) {
        progresoExistente.porcentajeCompletado = Math.min(100, Math.max(0, porcentajeCompletado));
      }

      // Si se marca como completado, asegurar 100%
      if (estadoEnum === EstadoProgreso.COMPLETADO) {
        progresoExistente.porcentajeCompletado = 100;
      }

      await this.progresoRepository.save(progresoExistente);
      
    } else {
      // Crear nuevo registro
      const nuevoProgreso = this.progresoRepository.create({
        usuarioId: usuarioId,
        temaId: temaId,
        subtemaId: subtemaId,
        estado: estadoEnum,
        porcentajeCompletado: estadoEnum === EstadoProgreso.COMPLETADO ? 100 : (porcentajeCompletado || 0),
        intentos: 0,
        fechaUltimoAcceso: new Date()
      });

      await this.progresoRepository.save(nuevoProgreso);
    }

    // Obtener datos completos para retornar
    const progresoCompleto = await this.obtenerProgresoEnTema(usuarioId, temaId);
    
    if (!progresoCompleto) {
      throw new Error('Error al obtener progreso actualizado');
    }

    return progresoCompleto;
  }

  /**
   * Calcular y actualizar progreso automaticamente basado en ejercicios completados
   * Esta funcion la llamara Pancho despues de completar ejercicios
   */
  async calcularYActualizarProgresoTema(
    usuarioId: number,
    temaId: number
  ): Promise<void> {
    // Obtener total de ejercicios y quizzes del tema
    const statsQuery = `
      SELECT 
        COUNT(DISTINCT e.id) as total_ejercicios,
        COUNT(DISTINCT pq.id) as total_preguntas,
        COUNT(DISTINCT CASE WHEN ie.resultado = 'correcto' THEN ie.ejercicio_id END) as ejercicios_correctos,
        COUNT(DISTINCT CASE WHEN iq.es_correcta = true THEN iq.pregunta_id END) as preguntas_correctas
      FROM temas t
      LEFT JOIN subtemas s ON s.tema_id = t.id
      LEFT JOIN ejercicios e ON e.subtema_id = s.id
      LEFT JOIN preguntas_quiz pq ON pq.subtema_id = s.id
      LEFT JOIN intentos_ejercicios ie ON ie.ejercicio_id = e.id AND ie.usuario_id = $1
      LEFT JOIN intentos_quiz iq ON iq.pregunta_id = pq.id AND iq.usuario_id = $1
      WHERE t.id = $2
    `;

    const stats = await AppDataSource.query(statsQuery, [usuarioId, temaId]);
    
    if (stats.length === 0) {
      return;
    }

    const totalItems = parseInt(stats[0].total_ejercicios) + parseInt(stats[0].total_preguntas);
    const completados = parseInt(stats[0].ejercicios_correctos) + parseInt(stats[0].preguntas_correctas);

    if (totalItems === 0) {
      return;
    }

    const porcentaje = Math.round((completados / totalItems) * 100);
    
    let estado: 'no_iniciado' | 'en_progreso' | 'completado';
    if (porcentaje === 0) {
      estado = 'no_iniciado';
    } else if (porcentaje === 100) {
      estado = 'completado';
    } else {
      estado = 'en_progreso';
    }

    await this.actualizarProgreso(usuarioId, {
      temaId: temaId,
      estado: estado,
      porcentajeCompletado: porcentaje
    });
  }

  /**
   * Listar todo el progreso de un estudiante
   * Endpoint: GET /api/v1/progreso/mi-progreso
   */
  async listarProgresoEstudiante(usuarioId: number): Promise<ProgresoDto[]> {
    const query = `
      SELECT 
        p.*,
        t.nombre as tema_nombre,
        s.nombre as subtema_nombre,
        m.nombre as materia_nombre
      FROM progreso p
      INNER JOIN temas t ON t.id = p.tema_id
      INNER JOIN materias m ON m.id = t.materia_id
      LEFT JOIN subtemas s ON s.id = p.subtema_id
      WHERE p.usuario_id = $1
      ORDER BY p.fecha_ultimo_acceso DESC
    `;

    const resultados = await AppDataSource.query(query, [usuarioId]);

    return resultados.map((p: any) => ({
      id: p.id,
      usuarioId: p.usuario_id,
      temaId: p.tema_id,
      subtemaId: p.subtema_id,
      estado: p.estado,
      porcentajeCompletado: p.porcentaje_completado || 0,
      intentos: p.intentos || 0,
      fechaUltimoAcceso: p.fecha_ultimo_acceso,
      temaNombre: p.tema_nombre,
      subtemaNombre: p.subtema_nombre
    }));
  }

  /**
   * Obtener resumen de progreso en una materia
   * Endpoint: GET /api/v1/progreso/materia/:materiaId
   */
  async obtenerProgresoEnMateria(usuarioId: number, materiaId: number): Promise<any> {
    const query = `
      SELECT 
        m.id as materia_id,
        m.nombre as materia_nombre,
        COUNT(DISTINCT t.id) as total_temas,
        COUNT(DISTINCT CASE WHEN p.estado = 'completado' THEN t.id END) as temas_completados,
        COUNT(DISTINCT CASE WHEN p.estado = 'en_progreso' THEN t.id END) as temas_en_progreso,
        ROUND(AVG(CASE WHEN p.porcentaje_completado IS NOT NULL THEN p.porcentaje_completado ELSE 0 END), 2) as promedio_progreso
      FROM materias m
      INNER JOIN temas t ON t.materia_id = m.id
      LEFT JOIN progreso p ON p.tema_id = t.id AND p.usuario_id = $1
      WHERE m.id = $2
      GROUP BY m.id, m.nombre
    `;

    const resultado = await AppDataSource.query(query, [usuarioId, materiaId]);

    if (resultado.length === 0) {
      throw new Error('Materia no encontrada');
    }

    const stats = resultado[0];
    return {
      materiaId: stats.materia_id,
      materiaNombre: stats.materia_nombre,
      totalTemas: parseInt(stats.total_temas) || 0,
      temasCompletados: parseInt(stats.temas_completados) || 0,
      temasEnProgreso: parseInt(stats.temas_en_progreso) || 0,
      promedioProgreso: parseFloat(stats.promedio_progreso) || 0
    };
  }
}