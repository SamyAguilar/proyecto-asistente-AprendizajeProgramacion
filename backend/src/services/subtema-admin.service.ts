// backend/src/services/subtema-admin.service.ts

import { AppDataSource } from '../config/database';
import { Subtema } from '../models/Subtema';
import { Tema } from '../models/Tema';
import { Ejercicio } from '../models/Ejercicio';
import { Repository } from 'typeorm';
import { logError } from '../utils/logger';

export interface CrearSubtemaDto {
  temaId: number;
  nombre: string;
  descripcion?: string;
  contenidoDetalle?: string;
  orden?: number;
}

export interface ActualizarSubtemaDto {
  nombre?: string;
  descripcion?: string;
  contenidoDetalle?: string;
  orden?: number;
}

export class SubtemaAdminService {
  private subtemaRepository: Repository<Subtema>;
  private temaRepository: Repository<Tema>;
  private ejercicioRepository: Repository<Ejercicio>;

  constructor() {
    this.subtemaRepository = AppDataSource.getRepository(Subtema);
    this.temaRepository = AppDataSource.getRepository(Tema);
    this.ejercicioRepository = AppDataSource.getRepository(Ejercicio);
  }

  /**
   * Crear un nuevo subtema
   * Solo admin o profesor
   */
  async crearSubtema(datos: CrearSubtemaDto): Promise<Subtema> {
    try {
      // Verificar que el tema exista
      const tema = await this.temaRepository.findOne({
        where: { id: datos.temaId }
      });

      if (!tema) {
        throw new Error('El tema especificado no existe');
      }

      // Si no se proporciona orden, asignar el siguiente disponible
      let orden = datos.orden;
      if (!orden) {
        const ultimoSubtema = await this.subtemaRepository
          .createQueryBuilder('subtema')
          .where('subtema.temaId = :temaId', { temaId: datos.temaId })
          .orderBy('subtema.orden', 'DESC')
          .getOne();

        orden = ultimoSubtema ? (ultimoSubtema.orden || 0) + 1 : 1;
      }

      // Crear el subtema
      const nuevoSubtema = this.subtemaRepository.create({
        temaId: datos.temaId,
        nombre: datos.nombre,
        descripcion: datos.descripcion || '',
        contenidoDetalle: datos.contenidoDetalle || '',
        orden: orden
      });

      return await this.subtemaRepository.save(nuevoSubtema);
    } catch (error: any) {
      logError('Error al crear subtema:', error);
      throw error;
    }
  }

  /**
   * Actualizar un subtema existente
   * Solo admin o profesor
   */
  async actualizarSubtema(subtemaId: number, datos: ActualizarSubtemaDto): Promise<Subtema> {
    try {
      const subtema = await this.subtemaRepository.findOne({
        where: { id: subtemaId }
      });

      if (!subtema) {
        throw new Error('Subtema no encontrado');
      }

      // Actualizar solo los campos proporcionados
      if (datos.nombre !== undefined) subtema.nombre = datos.nombre;
      if (datos.descripcion !== undefined) subtema.descripcion = datos.descripcion;
      if (datos.contenidoDetalle !== undefined) subtema.contenidoDetalle = datos.contenidoDetalle;
      if (datos.orden !== undefined) subtema.orden = datos.orden;

      return await this.subtemaRepository.save(subtema);
    } catch (error: any) {
      logError('Error al actualizar subtema:', error);
      throw error;
    }
  }

  /**
   * Eliminar un subtema
   * Solo admin
   * Verifica que no tenga ejercicios asociados
   */
  async eliminarSubtema(subtemaId: number): Promise<void> {
    try {
      const subtema = await this.subtemaRepository.findOne({
        where: { id: subtemaId }
      });

      if (!subtema) {
        throw new Error('Subtema no encontrado');
      }

      // Verificar que no tenga ejercicios asociados
      const ejercicios = await this.ejercicioRepository.count({
        where: { subtemaId: subtemaId }
      });

      if (ejercicios > 0) {
        throw new Error(
          `No se puede eliminar el subtema porque tiene ${ejercicios} ejercicio(s) asociado(s)`
        );
      }

      await this.subtemaRepository.remove(subtema);
    } catch (error: any) {
      logError('Error al eliminar subtema:', error);
      throw error;
    }
  }
}