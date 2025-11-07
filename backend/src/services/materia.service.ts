// backend/src/services/materia.service.ts

import { AppDataSource } from '../config/database';
import { Materia } from '../models/Materia';
import { Matricula, EstadoMatricula } from '../models/Matricula';
import { Usuario } from '../models/Usuario';
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
  materiaId: number;
  estado: 'activa' | 'completada' | 'abandonada';
}

export class MateriaService {
  private materiaRepository: Repository<Materia>;
  private matriculaRepository: Repository<Matricula>;
  private usuarioRepository: Repository<Usuario>;

  constructor() {
    this.materiaRepository = AppDataSource.getRepository(Materia);
    this.matriculaRepository = AppDataSource.getRepository(Matricula);
    this.usuarioRepository = AppDataSource.getRepository(Usuario);
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
   * Buscar materias por nombre o codigo
   * Endpoint: GET /api/v1/materias/buscar?q=texto
   */
  async buscarMaterias(query: string): Promise<MateriaDto[]> {
    if (!query || query.trim().length === 0) {
      return [];
    }

    const searchTerm = `%${query.toLowerCase()}%`;

    const materias = await this.materiaRepository
      .createQueryBuilder('materia')
      .leftJoinAndSelect('materia.temas', 'tema')
      .where('LOWER(materia.nombre) LIKE :searchTerm', { searchTerm })
      .orWhere('LOWER(materia.codigo) LIKE :searchTerm', { searchTerm })
      .orWhere('LOWER(materia.descripcion) LIKE :searchTerm', { searchTerm })
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

  /**
   * Listar materias en las que un estudiante esta matriculado
   * Endpoint: GET /api/v1/materias/mis-materias
   */
  async listarMateriasDelEstudiante(usuarioId: number): Promise<any[]> {
    const matriculas = await this.matriculaRepository
      .createQueryBuilder('matricula')
      .leftJoinAndSelect('matricula.materia', 'materia')
      .leftJoinAndSelect('materia.temas', 'tema')
      .where('matricula.usuarioId = :usuarioId', { usuarioId })
      .andWhere('matricula.estado = :estado', { estado: EstadoMatricula.ACTIVA })
      .orderBy('matricula.fechaInicio', 'DESC')
      .getMany();

    return matriculas.map(matricula => ({
      id: matricula.materia.id,
      nombre: matricula.materia.nombre,
      codigo: matricula.materia.codigo,
      descripcion: matricula.materia.descripcion || '',
      semestre: matricula.materia.semestre || 0,
      creditos: matricula.materia.creditos || 0,
      totalTemas: matricula.materia.temas?.length || 0,
      estadoMatricula: matricula.estado,
      fechaInicio: matricula.fechaInicio,
      calificacionFinal: matricula.calificacionFinal
    }));
  }

  /**
   * Verificar prerequisitos de una materia
   * Retorna true si el estudiante cumple los prerequisitos
   */
  async verificarPrerequisitos(usuarioId: number, materiaId: number): Promise<boolean> {
    const materia = await this.materiaRepository.findOne({
      where: { id: materiaId }
    });

    if (!materia) {
      throw new Error('Materia no encontrada');
    }

    if (!materia.prerequisitos || materia.prerequisitos.trim() === '') {
      return true;
    }

    const prerequisitosArray = materia.prerequisitos
      .split(',')
      .map(p => p.trim())
      .filter(p => p.length > 0);

    if (prerequisitosArray.length === 0) {
      return true;
    }

    const esNumerico = /^\d+$/.test(prerequisitosArray[0]);
    let materiasPrerequisito: Materia[];

    if (esNumerico) {
      const ids = prerequisitosArray.map(p => parseInt(p));
      materiasPrerequisito = await this.materiaRepository
        .createQueryBuilder('materia')
        .whereInIds(ids)
        .getMany();
    } else {
      materiasPrerequisito = await this.materiaRepository
        .createQueryBuilder('materia')
        .where('materia.codigo IN (:...codigos)', { codigos: prerequisitosArray })
        .getMany();
    }

    for (const materiaPrereq of materiasPrerequisito) {
      const matriculaPrereq = await this.matriculaRepository.findOne({
        where: {
          usuarioId: usuarioId,
          materiaId: materiaPrereq.id,
          estado: EstadoMatricula.COMPLETADA
        }
      });

      if (!matriculaPrereq) {
        return false;
      }
    }

    return true;
  }

  /**
   * Matricular un estudiante en una materia
   * Endpoint: POST /api/v1/materias/:id/matricular
   */
  async matricularEnMateria(usuarioId: number, materiaId: number): Promise<any> {
    const materia = await this.materiaRepository.findOne({
      where: { id: materiaId }
    });

    if (!materia) {
      throw new Error('Materia no encontrada');
    }

    const usuario = await this.usuarioRepository.findOne({
      where: { id: usuarioId }
    });

    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }

    const matriculaExistente = await this.matriculaRepository.findOne({
      where: {
        usuarioId: usuarioId,
        materiaId: materiaId,
        estado: EstadoMatricula.ACTIVA
      }
    });

    if (matriculaExistente) {
      throw new Error('Ya estas matriculado en esta materia');
    }

    const cumplePrerequisitos = await this.verificarPrerequisitos(usuarioId, materiaId);

    if (!cumplePrerequisitos) {
      throw new Error('No cumples con los prerequisitos para esta materia');
    }

    const nuevaMatricula = this.matriculaRepository.create({
      usuarioId: usuarioId,
      materiaId: materiaId,
      estado: EstadoMatricula.ACTIVA,
      fechaInicio: new Date()
    });

    await this.matriculaRepository.save(nuevaMatricula);

    return {
      id: nuevaMatricula.id,
      usuarioId: nuevaMatricula.usuarioId,
      materiaId: nuevaMatricula.materiaId,
      materiaNombre: materia.nombre,
      estado: nuevaMatricula.estado,
      fechaInicio: nuevaMatricula.fechaInicio,
      mensaje: 'Matricula exitosa'
    };
  }

  /**
   * Obtener detalle de materia con temas
   * Incluye todos los temas organizados por orden
   */
  async obtenerMateriaConTemas(materiaId: number): Promise<any> {
    const materia = await this.materiaRepository
      .createQueryBuilder('materia')
      .leftJoinAndSelect('materia.temas', 'tema')
      .where('materia.id = :materiaId', { materiaId })
      .orderBy('tema.orden', 'ASC')
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
      fechaCreacion: materia.fechaCreacion,
      temas: materia.temas.map(tema => ({
        id: tema.id,
        nombre: tema.nombre,
        descripcion: tema.descripcion || '',
        orden: tema.orden || 0
      }))
    };
  }
}