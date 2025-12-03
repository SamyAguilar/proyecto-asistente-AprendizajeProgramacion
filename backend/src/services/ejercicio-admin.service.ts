// backend/src/services/ejercicio-admin.service.ts

import { AppDataSource } from '../config/database';
import { Ejercicio, TipoEjercicio } from '../models/Ejercicio';
import { Subtema } from '../models/Subtema';
import { Repository } from 'typeorm';

export class EjercicioAdminService {
  private ejercicioRepository: Repository<Ejercicio>;
  private subtemaRepository: Repository<Subtema>;

  constructor() {
    this.ejercicioRepository = AppDataSource.getRepository(Ejercicio);
    this.subtemaRepository = AppDataSource.getRepository(Subtema);
  }

  /**
   * Crear un nuevo ejercicio
   */
  async crearEjercicio(datos: any): Promise<Ejercicio> {
    // Validar que el subtema exista
    const subtema = await this.subtemaRepository.findOne({
      where: { id: datos.subtemaId }
    });

    if (!subtema) {
      throw new Error('El subtema especificado no existe');
    }

    // Crear ejercicio con los datos apropiados según el tipo
    const ejercicio = this.ejercicioRepository.create({
      subtemaId: datos.subtemaId,
      enunciado: datos.enunciado,
      dificultad: datos.dificultad || 'basica',
      tipoEjercicio: datos.tipoEjercicio,
      puntosMaximos: datos.puntosMaximos || 10,
      
      // Campos para CODIFICACION
      lenguajeProgramacion: datos.tipoEjercicio === TipoEjercicio.CODIFICACION 
        ? datos.lenguajeProgramacion 
        : null,
      codigoBase: datos.tipoEjercicio === TipoEjercicio.CODIFICACION 
        ? datos.codigoBase 
        : null,
      codigoSolucion: datos.tipoEjercicio === TipoEjercicio.CODIFICACION 
        ? datos.codigoSolucion 
        : null,
      casosPrueba: datos.tipoEjercicio === TipoEjercicio.CODIFICACION 
        ? datos.casosPrueba 
        : null,
      
      // Campos para MULTIPLE
      opcionesRespuesta: datos.tipoEjercicio === TipoEjercicio.MULTIPLE 
        ? datos.opcionesRespuesta 
        : null,
      
      // Campos para COMPLETAR
      textoConEspacios: datos.tipoEjercicio === TipoEjercicio.COMPLETAR 
        ? datos.textoConEspacios 
        : null,
      respuestasCorrectas: datos.tipoEjercicio === TipoEjercicio.COMPLETAR 
        ? datos.respuestasCorrectas 
        : null
    });

    return await this.ejercicioRepository.save(ejercicio);
  }

  /**
   * Actualizar un ejercicio existente
   */
  async actualizarEjercicio(ejercicioId: number, datos: any): Promise<Ejercicio> {
    const ejercicio = await this.ejercicioRepository.findOne({
      where: { id: ejercicioId }
    });

    if (!ejercicio) {
      throw new Error('Ejercicio no encontrado');
    }

    // Si se cambia el subtema, validar que exista
    if (datos.subtemaId && datos.subtemaId !== ejercicio.subtemaId) {
      const subtema = await this.subtemaRepository.findOne({
        where: { id: datos.subtemaId }
      });

      if (!subtema) {
        throw new Error('El subtema especificado no existe');
      }
    }

    // Actualizar solo los campos proporcionados
    if (datos.enunciado !== undefined) ejercicio.enunciado = datos.enunciado;
    if (datos.dificultad !== undefined) ejercicio.dificultad = datos.dificultad;
    if (datos.tipoEjercicio !== undefined) ejercicio.tipoEjercicio = datos.tipoEjercicio;
    if (datos.puntosMaximos !== undefined) ejercicio.puntosMaximos = datos.puntosMaximos;
    
    // Campos de codificación
    if (datos.lenguajeProgramacion !== undefined) ejercicio.lenguajeProgramacion = datos.lenguajeProgramacion;
    if (datos.codigoBase !== undefined) ejercicio.codigoBase = datos.codigoBase;
    if (datos.codigoSolucion !== undefined) ejercicio.codigoSolucion = datos.codigoSolucion;
    if (datos.casosPrueba !== undefined) ejercicio.casosPrueba = datos.casosPrueba;
    
    // Campos de opción múltiple
    if (datos.opcionesRespuesta !== undefined) ejercicio.opcionesRespuesta = datos.opcionesRespuesta;
    
    // Campos de completar
    if (datos.textoConEspacios !== undefined) ejercicio.textoConEspacios = datos.textoConEspacios;
    if (datos.respuestasCorrectas !== undefined) ejercicio.respuestasCorrectas = datos.respuestasCorrectas;

    return await this.ejercicioRepository.save(ejercicio);
  }

  /**
   * Obtener un ejercicio por ID (incluye todos los campos para admin)
   */
  async obtenerEjercicioPorId(ejercicioId: number): Promise<Ejercicio> {
    const ejercicio = await this.ejercicioRepository.findOne({
      where: { id: ejercicioId },
      relations: ['subtema', 'subtema.tema']
    });

    if (!ejercicio) {
      throw new Error('Ejercicio no encontrado');
    }

    return ejercicio;
  }

  /**
   * Eliminar un ejercicio
   */
  async eliminarEjercicio(ejercicioId: number): Promise<void> {
    const ejercicio = await this.ejercicioRepository.findOne({
      where: { id: ejercicioId },
      relations: ['intentos']
    });

    if (!ejercicio) {
      throw new Error('Ejercicio no encontrado');
    }

    // Verificar si hay intentos
    if (ejercicio.intentos && ejercicio.intentos.length > 0) {
      throw new Error(
        `No se puede eliminar el ejercicio porque tiene ${ejercicio.intentos.length} intento(s) registrado(s)`
      );
    }

    await this.ejercicioRepository.remove(ejercicio);
  }
}