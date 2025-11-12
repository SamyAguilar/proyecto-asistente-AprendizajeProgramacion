// backend/src/services/tema-admin.service.ts

import { AppDataSource } from '../config/database';
import { Tema } from '../models/Tema';
import { Materia } from '../models/Materia';
import { Subtema } from '../models/Subtema';
import { Repository } from 'typeorm';
import { logError } from '../utils/logger';

export interface CrearTemaDto {
  materiaId: number;
  nombre: string;
  descripcion?: string;
  contenido?: string;
  orden?: number;
}

export interface ActualizarTemaDto {
  nombre?: string;
  descripcion?: string;
  contenido?: string;
  orden?: number;
}

export class TemaAdminService {
  private temaRepository: Repository<Tema>;
  private materiaRepository: Repository<Materia>;
  private subtemaRepository: Repository<Subtema>;

  constructor() {
    this.temaRepository = AppDataSource.getRepository(Tema);
    this.materiaRepository = AppDataSource.getRepository(Materia);
    this.subtemaRepository = AppDataSource.getRepository(Subtema);
  }

  /**
   * Crear un nuevo tema
   * Solo admin o profesor
   */
  async crearTema(datos: CrearTemaDto): Promise<Tema> {
    try {
      // Verificar que la materia exista
      const materia = await this.materiaRepository.findOne({
        where: { id: datos.materiaId }
      });

      if (!materia) {
        throw new Error('La materia especificada no existe');
      }

      // Si no se proporciona orden, asignar el siguiente disponible
      let orden = datos.orden;
      if (!orden) {
        const ultimoTema = await this.temaRepository
          .createQueryBuilder('tema')
          .where('tema.materiaId = :materiaId', { materiaId: datos.materiaId })
          .orderBy('tema.orden', 'DESC')
          .getOne();

        orden = ultimoTema ? (ultimoTema.orden || 0) + 1 : 1;
      }

      // Crear el tema
      const nuevoTema = this.temaRepository.create({
        materiaId: datos.materiaId,
        nombre: datos.nombre,
        descripcion: datos.descripcion || '',
        contenido: datos.contenido || '',
        orden: orden
      });

      return await this.temaRepository.save(nuevoTema);
    } catch (error: any) {
      logError('Error al crear tema:', error);
      throw error;
    }
  }

  /**
   * Actualizar un tema existente
   * Solo admin o profesor
   */
  async actualizarTema(temaId: number, datos: ActualizarTemaDto): Promise<Tema> {
    try {
      const tema = await this.temaRepository.findOne({
        where: { id: temaId }
      });

      if (!tema) {
        throw new Error('Tema no encontrado');
      }

      // Actualizar solo los campos proporcionados
      if (datos.nombre !== undefined) tema.nombre = datos.nombre;
      if (datos.descripcion !== undefined) tema.descripcion = datos.descripcion;
      if (datos.contenido !== undefined) tema.contenido = datos.contenido;
      if (datos.orden !== undefined) tema.orden = datos.orden;

      return await this.temaRepository.save(tema);
    } catch (error: any) {
      logError('Error al actualizar tema:', error);
      throw error;
    }
  }

  /**
   * Eliminar un tema
   * Solo admin
   * Verifica que no tenga subtemas asociados
   */
  async eliminarTema(temaId: number): Promise<void> {
    try {
      const tema = await this.temaRepository.findOne({
        where: { id: temaId }
      });

      if (!tema) {
        throw new Error('Tema no encontrado');
      }

      // Verificar que no tenga subtemas asociados
      const subtemas = await this.subtemaRepository.count({
        where: { temaId: temaId }
      });

      if (subtemas > 0) {
        throw new Error(
          `No se puede eliminar el tema porque tiene ${subtemas} subtema(s) asociado(s)`
        );
      }

      await this.temaRepository.remove(tema);
    } catch (error: any) {
      logError('Error al eliminar tema:', error);
      throw error;
    }
  }
}