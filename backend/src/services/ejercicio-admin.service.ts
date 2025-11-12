// backend/src/services/ejercicio-admin.service.ts

import { AppDataSource } from '../config/database';
import { Ejercicio, DificultadEjercicio, TipoEjercicio } from '../models/Ejercicio';
import { Subtema } from '../models/Subtema';
import { IntentoEjercicio } from '../models/IntentoEjercicio';
import { Repository } from 'typeorm';
import { logError } from '../utils/logger';

export interface CrearEjercicioDto {
  subtemaId: number;
  enunciado: string;
  dificultad?: DificultadEjercicio;
  tipoEjercicio?: TipoEjercicio;
  puntosMaximos?: number;
  lenguajeProgramacion?: string;
  codigoBase?: string;
  codigoSolucion?: string;
  casosPrueba?: any;
}

export interface ActualizarEjercicioDto {
  enunciado?: string;
  dificultad?: DificultadEjercicio;
  tipoEjercicio?: TipoEjercicio;
  puntosMaximos?: number;
  lenguajeProgramacion?: string;
  codigoBase?: string;
  codigoSolucion?: string;
  casosPrueba?: any;
}

export class EjercicioAdminService {
  private ejercicioRepository: Repository<Ejercicio>;
  private subtemaRepository: Repository<Subtema>;
  private intentoRepository: Repository<IntentoEjercicio>;

  constructor() {
    this.ejercicioRepository = AppDataSource.getRepository(Ejercicio);
    this.subtemaRepository = AppDataSource.getRepository(Subtema);
    this.intentoRepository = AppDataSource.getRepository(IntentoEjercicio);
  }

  /**
   * Crear un nuevo ejercicio
   * Solo admin o profesor
   */
  async crearEjercicio(datos: CrearEjercicioDto): Promise<Ejercicio> {
    try {
      // Verificar que el subtema exista
      const subtema = await this.subtemaRepository.findOne({
        where: { id: datos.subtemaId }
      });

      if (!subtema) {
        throw new Error('El subtema especificado no existe');
      }

      // Crear el ejercicio
      const nuevoEjercicio = this.ejercicioRepository.create({
        subtemaId: datos.subtemaId,
        enunciado: datos.enunciado,
        dificultad: datos.dificultad || DificultadEjercicio.BASICA,
        tipoEjercicio: datos.tipoEjercicio || TipoEjercicio.CODIFICACION,
        puntosMaximos: datos.puntosMaximos || 10,
        lenguajeProgramacion: datos.lenguajeProgramacion || 'javascript',
        codigoBase: datos.codigoBase || '',
        codigoSolucion: datos.codigoSolucion || '',
        casosPrueba: datos.casosPrueba || []
      });

      return await this.ejercicioRepository.save(nuevoEjercicio);
    } catch (error: any) {
      logError('Error al crear ejercicio:', error);
      throw error;
    }
  }

  /**
   * Actualizar un ejercicio existente
   * Solo admin o profesor
   */
  async actualizarEjercicio(
    ejercicioId: number,
    datos: ActualizarEjercicioDto
  ): Promise<Ejercicio> {
    try {
      const ejercicio = await this.ejercicioRepository.findOne({
        where: { id: ejercicioId }
      });

      if (!ejercicio) {
        throw new Error('Ejercicio no encontrado');
      }

      // Actualizar solo los campos proporcionados
      if (datos.enunciado !== undefined) ejercicio.enunciado = datos.enunciado;
      if (datos.dificultad !== undefined) ejercicio.dificultad = datos.dificultad;
      if (datos.tipoEjercicio !== undefined) ejercicio.tipoEjercicio = datos.tipoEjercicio;
      if (datos.puntosMaximos !== undefined) ejercicio.puntosMaximos = datos.puntosMaximos;
      if (datos.lenguajeProgramacion !== undefined) ejercicio.lenguajeProgramacion = datos.lenguajeProgramacion;
      if (datos.codigoBase !== undefined) ejercicio.codigoBase = datos.codigoBase;
      if (datos.codigoSolucion !== undefined) ejercicio.codigoSolucion = datos.codigoSolucion;
      if (datos.casosPrueba !== undefined) ejercicio.casosPrueba = datos.casosPrueba;

      return await this.ejercicioRepository.save(ejercicio);
    } catch (error: any) {
      logError('Error al actualizar ejercicio:', error);
      throw error;
    }
  }

  /**
   * Eliminar un ejercicio
   * Solo admin
   * Verifica que no tenga intentos asociados
   */
  async eliminarEjercicio(ejercicioId: number): Promise<void> {
    try {
      const ejercicio = await this.ejercicioRepository.findOne({
        where: { id: ejercicioId }
      });

      if (!ejercicio) {
        throw new Error('Ejercicio no encontrado');
      }

      // Verificar que no tenga intentos asociados
      const intentos = await this.intentoRepository.count({
        where: { ejercicioId: ejercicioId }
      });

      if (intentos > 0) {
        throw new Error(
          `No se puede eliminar el ejercicio porque tiene ${intentos} intento(s) asociado(s)`
        );
      }

      await this.ejercicioRepository.remove(ejercicio);
    } catch (error: any) {
      logError('Error al eliminar ejercicio:', error);
      throw error;
    }
  }
}