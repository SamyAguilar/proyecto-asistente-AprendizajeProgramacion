import { AppDataSource } from '../config/database';
import { Tema } from '../models/Tema';
import { Subtema } from '../models/Subtema';
import { Repository } from 'typeorm';

export interface TemaDto {
  id: number;
  materiaId: number;
  nombre: string;
  descripcion: string;
  contenido: string;
  orden: number;
  totalSubtemas: number;
  fechaCreacion: Date;
}

export interface SubtemaDto {
  id: number;
  temaId: number;
  nombre: string;
  descripcion: string;
  contenidoDetalle: string;
  orden: number;
  totalEjercicios: number;
  totalPreguntas: number;
  fechaCreacion: Date;
}

export interface TemaConProgresoDto extends TemaDto {
  estadoProgreso: 'no_iniciado' | 'en_progreso' | 'completado';
  porcentajeCompletado: number;
}

export class TemaService {
  private temaRepository: Repository<Tema>;
  private subtemaRepository: Repository<Subtema>;

  constructor() {
    this.temaRepository = AppDataSource.getRepository(Tema);
    this.subtemaRepository = AppDataSource.getRepository(Subtema);
  }

  /**
   * Listar todos los temas de una materia
   * Endpoint: GET /api/v1/materias/:materiaId/temas
   */
  async listarTemasPorMateria(materiaId: number): Promise<TemaDto[]> {
    const temas = await this.temaRepository
      .createQueryBuilder('tema')
      .leftJoinAndSelect('tema.subtemas', 'subtema')
      .where('tema.materiaId = :materiaId', { materiaId })
      .orderBy('tema.orden', 'ASC')
      .addOrderBy('tema.nombre', 'ASC')
      .getMany();

    return temas.map(tema => ({
      id: tema.id,
      materiaId: tema.materiaId,
      nombre: tema.nombre,
      descripcion: tema.descripcion || '',
      contenido: tema.contenido || '',
      orden: tema.orden || 0,
      totalSubtemas: tema.subtemas?.length || 0,
      fechaCreacion: tema.fechaCreacion
    }));
  }

  /**
   * Listar temas de una materia con progreso del estudiante
   * Endpoint: GET /api/v1/materias/:materiaId/temas-con-progreso
   */
  async listarTemasConProgreso(materiaId: number, usuarioId: number): Promise<TemaConProgresoDto[]> {
    const query = `
      SELECT 
        t.id,
        t.materia_id,
        t.nombre,
        t.descripcion,
        t.contenido,
        t.orden,
        t.fecha_creacion,
        COUNT(DISTINCT s.id) as total_subtemas,
        COALESCE(p.estado, 'no_iniciado') as estado_progreso,
        COALESCE(p.porcentaje_completado, 0) as porcentaje_completado
      FROM temas t
      LEFT JOIN subtemas s ON s.tema_id = t.id
      LEFT JOIN progreso p ON p.tema_id = t.id AND p.usuario_id = $2
      WHERE t.materia_id = $1
      GROUP BY t.id, t.materia_id, t.nombre, t.descripcion, t.contenido, t.orden, t.fecha_creacion, p.estado, p.porcentaje_completado
      ORDER BY t.orden ASC, t.nombre ASC
    `;

    const temas = await AppDataSource.query(query, [materiaId, usuarioId]);

    return temas.map((t: any) => ({
      id: t.id,
      materiaId: t.materia_id,
      nombre: t.nombre,
      descripcion: t.descripcion || '',
      contenido: t.contenido || '',
      orden: t.orden || 0,
      totalSubtemas: parseInt(t.total_subtemas) || 0,
      fechaCreacion: t.fecha_creacion,
      estadoProgreso: t.estado_progreso,
      porcentajeCompletado: parseInt(t.porcentaje_completado) || 0
    }));
  }

  /**
   * Obtener detalle de un tema especifico
   * Endpoint: GET /api/v1/temas/:id
   */
  async obtenerTemaPorId(temaId: number): Promise<TemaDto> {
    const tema = await this.temaRepository
      .createQueryBuilder('tema')
      .leftJoinAndSelect('tema.subtemas', 'subtema')
      .where('tema.id = :temaId', { temaId })
      .getOne();

    if (!tema) {
      throw new Error('Tema no encontrado');
    }

    return {
      id: tema.id,
      materiaId: tema.materiaId,
      nombre: tema.nombre,
      descripcion: tema.descripcion || '',
      contenido: tema.contenido || '',
      orden: tema.orden || 0,
      totalSubtemas: tema.subtemas?.length || 0,
      fechaCreacion: tema.fechaCreacion
    };
  }

  /**
   * Listar subtemas de un tema
   * Endpoint: GET /api/v1/temas/:temaId/subtemas
   */
  async listarSubtemasPorTema(temaId: number): Promise<SubtemaDto[]> {
    const subtemas = await this.subtemaRepository
      .createQueryBuilder('subtema')
      .leftJoinAndSelect('subtema.ejercicios', 'ejercicio')
      .leftJoinAndSelect('subtema.preguntasQuiz', 'pregunta')
      .where('subtema.temaId = :temaId', { temaId })
      .orderBy('subtema.orden', 'ASC')
      .addOrderBy('subtema.nombre', 'ASC')
      .getMany();

    return subtemas.map(subtema => ({
      id: subtema.id,
      temaId: subtema.temaId,
      nombre: subtema.nombre,
      descripcion: subtema.descripcion || '',
      contenidoDetalle: subtema.contenidoDetalle || '',
      orden: subtema.orden || 0,
      totalEjercicios: subtema.ejercicios?.length || 0,
      totalPreguntas: subtema.preguntasQuiz?.length || 0,
      fechaCreacion: subtema.fechaCreacion
    }));
  }

  /**
   * Obtener detalle de un subtema especifico
   * Endpoint: GET /api/v1/subtemas/:id
   */
  async obtenerSubtemaPorId(subtemaId: number): Promise<SubtemaDto> {
    const subtema = await this.subtemaRepository
      .createQueryBuilder('subtema')
      .leftJoinAndSelect('subtema.ejercicios', 'ejercicio')
      .leftJoinAndSelect('subtema.preguntasQuiz', 'pregunta')
      .where('subtema.id = :subtemaId', { subtemaId })
      .getOne();

    if (!subtema) {
      throw new Error('Subtema no encontrado');
    }

    return {
      id: subtema.id,
      temaId: subtema.temaId,
      nombre: subtema.nombre,
      descripcion: subtema.descripcion || '',
      contenidoDetalle: subtema.contenidoDetalle || '',
      orden: subtema.orden || 0,
      totalEjercicios: subtema.ejercicios?.length || 0,
      totalPreguntas: subtema.preguntasQuiz?.length || 0,
      fechaCreacion: subtema.fechaCreacion
    };
  }
}
