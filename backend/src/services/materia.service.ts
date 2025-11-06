import { AppDataSource } from '../config/database';
import { Materia } from '../models/Materia';
import { Repository } from 'typeorm';

export interface MateriaDto {
  id: number;
  nombre: string;
  codigo: string;
  descripcion: string;
  semestre: number;
  creditos: number;
  prerequisitos: string;
  totalTemas: number;
  fechaCreacion: Date;
}

export interface MatriculaDto {
  materia_id: number;
  estado: 'activa' | 'completada' | 'abandonada';
}

export class MateriaService {
  private materiaRepository: Repository<Materia>;

  constructor() {
    this.materiaRepository = AppDataSource.getRepository(Materia);
  }

  /**
   * Listar todas las materias disponibles
   * Endpoint: GET /api/v1/materias
   */
  async listarMaterias(): Promise<MateriaDto[]> {
    const materias = await this.materiaRepository
      .createQueryBuilder('materia')
      .leftJoinAndSelect('materia.temas', 'tema')
      .orderBy('materia.semestre', 'ASC')
      .addOrderBy('materia.nombre', 'ASC')
      .getMany();

    return materias.map(materia => ({
      id: materia.id,
      nombre: materia.nombre,
      codigo: materia.codigo,
      descripcion: materia.descripcion || '',
      semestre: materia.semestre || 0,
      creditos: materia.creditos || 0,
      prerequisitos: materia.prerequisitos || '',
      totalTemas: materia.temas?.length || 0,
      fechaCreacion: materia.fechaCreacion
    }));
  }

  /**
   * Obtener detalle de una materia especifica
   * Endpoint: GET /api/v1/materias/:id
   */
  async obtenerMateriaPorId(materiaId: number): Promise<MateriaDto> {
    const materia = await this.materiaRepository
      .createQueryBuilder('materia')
      .leftJoinAndSelect('materia.temas', 'tema')
      .where('materia.id = :materiaId', { materiaId })
      .getOne();

    if (!materia) {
      throw new Error('Materia no encontrada');
    }

    return {
      id: materia.id,
      nombre: materia.nombre,
      codigo: materia.codigo,
      descripcion: materia.descripcion || '',
      semestre: materia.semestre || 0,
      creditos: materia.creditos || 0,
      prerequisitos: materia.prerequisitos || '',
      totalTemas: materia.temas?.length || 0,
      fechaCreacion: materia.fechaCreacion
    };
  }

  /**
   * Listar materias en las que un estudiante esta matriculado
   * Endpoint: GET /api/v1/materias/mis-materias
   */
  async listarMateriasDelEstudiante(usuarioId: number): Promise<any[]> {
    const query = `
      SELECT 
        m.id,
        m.nombre,
        m.codigo,
        m.descripcion,
        m.semestre,
        m.creditos,
        mat.estado as estado_matricula,
        mat.fecha_inicio as fecha_inscripcion,
        COUNT(DISTINCT t.id) as total_temas,
        COUNT(DISTINCT CASE WHEN p.estado = 'completado' THEN p.tema_id END) as temas_completados
      FROM materias m
      INNER JOIN matriculas mat ON mat.materia_id = m.id
      LEFT JOIN temas t ON t.materia_id = m.id
      LEFT JOIN progreso p ON p.tema_id = t.id AND p.usuario_id = $1
      WHERE mat.usuario_id = $1
      GROUP BY m.id, m.nombre, m.codigo, m.descripcion, m.semestre, m.creditos, mat.estado, mat.fecha_inicio
      ORDER BY m.semestre ASC, m.nombre ASC
    `;

    const materias = await AppDataSource.query(query, [usuarioId]);

    return materias.map((m: any) => ({
      id: m.id,
      nombre: m.nombre,
      codigo: m.codigo,
      descripcion: m.descripcion || '',
      semestre: m.semestre || 0,
      creditos: m.creditos || 0,
      estadoMatricula: m.estado_matricula,
      fechaInscripcion: m.fecha_inscripcion,
      totalTemas: parseInt(m.total_temas) || 0,
      temasCompletados: parseInt(m.temas_completados) || 0,
      progreso: m.total_temas > 0 
        ? Math.round((parseInt(m.temas_completados) / parseInt(m.total_temas)) * 100)
        : 0
    }));
  }

  /**
   * Matricular a un estudiante en una materia
   * Endpoint: POST /api/v1/materias/:id/matricular
   */
  async matricularEstudiante(usuarioId: number, materiaId: number): Promise<any> {
    // Verificar que la materia existe
    const materia = await this.materiaRepository.findOne({
      where: { id: materiaId }
    });

    if (!materia) {
      throw new Error('Materia no encontrada');
    }

    // Verificar que no este ya matriculado
    const matriculaExistente = await AppDataSource.query(
      'SELECT * FROM matriculas WHERE usuario_id = $1 AND materia_id = $2',
      [usuarioId, materiaId]
    );

    if (matriculaExistente.length > 0) {
      throw new Error('Ya estas matriculado en esta materia');
    }

    // Crear la matricula
    await AppDataSource.query(
      `INSERT INTO matriculas (usuario_id, materia_id, estado, fecha_inicio)
       VALUES ($1, $2, 'activa', NOW())`,
      [usuarioId, materiaId]
    );

    return {
      mensaje: 'Matriculacion exitosa',
      materia: {
        id: materia.id,
        nombre: materia.nombre,
        codigo: materia.codigo
      }
    };
  }

  /**
   * Buscar materias por nombre o codigo
   * Endpoint: GET /api/v1/materias/buscar?q=texto
   */
  async buscarMaterias(query: string): Promise<MateriaDto[]> {
    const materias = await this.materiaRepository
      .createQueryBuilder('materia')
      .leftJoinAndSelect('materia.temas', 'tema')
      .where('LOWER(materia.nombre) LIKE LOWER(:query)', { query: `%${query}%` })
      .orWhere('LOWER(materia.codigo) LIKE LOWER(:query)', { query: `%${query}%` })
      .orderBy('materia.nombre', 'ASC')
      .getMany();

    return materias.map(materia => ({
      id: materia.id,
      nombre: materia.nombre,
      codigo: materia.codigo,
      descripcion: materia.descripcion || '',
      semestre: materia.semestre || 0,
      creditos: materia.creditos || 0,
      prerequisitos: materia.prerequisitos || '',
      totalTemas: materia.temas?.length || 0,
      fechaCreacion: materia.fechaCreacion
    }));
  }
}