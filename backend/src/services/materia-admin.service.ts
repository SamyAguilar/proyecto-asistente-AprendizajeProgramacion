// backend/src/services/materia-admin.service.ts

import { AppDataSource } from '../config/database';
import { Materia } from '../models/Materia';
import { Matricula } from '../models/Matricula';
import { Repository } from 'typeorm';
import { logError } from '../utils/logger';

export interface CrearMateriaDto {
  nombre: string;
  codigo: string;
  descripcion?: string;
  semestre?: number;
  prerequisitos?: string;
  creditos?: number;
}

export interface ActualizarMateriaDto {
  nombre?: string;
  codigo?: string;
  descripcion?: string;
  semestre?: number;
  prerequisitos?: string;
  creditos?: number;
}

export class MateriaAdminService {
  private materiaRepository: Repository<Materia>;
  private matriculaRepository: Repository<Matricula>;

  constructor() {
    this.materiaRepository = AppDataSource.getRepository(Materia);
    this.matriculaRepository = AppDataSource.getRepository(Matricula);
  }

  /**
   * Crear una nueva materia
   * Solo admin o profesor
   */
  async crearMateria(datos: CrearMateriaDto): Promise<Materia> {
    try {
      // Verificar que el código no exista
      const existe = await this.materiaRepository.findOne({
        where: { codigo: datos.codigo }
      });

      if (existe) {
        throw new Error('El código de materia ya existe');
      }

      // Crear la materia
      const nuevaMateria = this.materiaRepository.create({
        nombre: datos.nombre,
        codigo: datos.codigo,
        descripcion: datos.descripcion || '',
        semestre: datos.semestre || 1,
        prerequisitos: datos.prerequisitos || '',
        creditos: datos.creditos || 0
      });

      return await this.materiaRepository.save(nuevaMateria);
    } catch (error: any) {
      logError('Error al crear materia:', error);
      throw error;
    }
  }

  /**
   * Actualizar una materia existente
   * Solo admin o profesor
   */
  async actualizarMateria(
    materiaId: number,
    datos: ActualizarMateriaDto
  ): Promise<Materia> {
    try {
      const materia = await this.materiaRepository.findOne({
        where: { id: materiaId }
      });

      if (!materia) {
        throw new Error('Materia no encontrada');
      }

      // Si se está actualizando el código, verificar que no esté duplicado
      if (datos.codigo && datos.codigo !== materia.codigo) {
        const existe = await this.materiaRepository.findOne({
          where: { codigo: datos.codigo }
        });

        if (existe) {
          throw new Error('El código de materia ya existe');
        }
      }

      // Actualizar solo los campos proporcionados
      if (datos.nombre !== undefined) materia.nombre = datos.nombre;
      if (datos.codigo !== undefined) materia.codigo = datos.codigo;
      if (datos.descripcion !== undefined) materia.descripcion = datos.descripcion;
      if (datos.semestre !== undefined) materia.semestre = datos.semestre;
      if (datos.prerequisitos !== undefined) materia.prerequisitos = datos.prerequisitos;
      if (datos.creditos !== undefined) materia.creditos = datos.creditos;

      return await this.materiaRepository.save(materia);
    } catch (error: any) {
      logError('Error al actualizar materia:', error);
      throw error;
    }
  }

  /**
   * Eliminar una materia
   * Solo admin
   * Verifica que no haya estudiantes matriculados
   */
  async eliminarMateria(materiaId: number): Promise<void> {
    try {
      const materia = await this.materiaRepository.findOne({
        where: { id: materiaId }
      });

      if (!materia) {
        throw new Error('Materia no encontrada');
      }

      // Verificar que no haya estudiantes matriculados
      const estudiantesMatriculados = await this.matriculaRepository.count({
        where: { materiaId: materiaId }
      });

      if (estudiantesMatriculados > 0) {
        throw new Error(
          `No se puede eliminar la materia porque tiene ${estudiantesMatriculados} estudiante(s) matriculado(s)`
        );
      }

      await this.materiaRepository.remove(materia);
    } catch (error: any) {
      logError('Error al eliminar materia:', error);
      throw error;
    }
  }
}