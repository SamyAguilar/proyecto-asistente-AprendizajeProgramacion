// backend/src/services/ejercicio.service.ts

import { AppDataSource } from '../config/database';
import { Ejercicio, DificultadEjercicio, TipoEjercicio } from '../models/Ejercicio';
import { IntentoEjercicio, ResultadoEjercicio } from '../models/IntentoEjercicio';
import { Subtema } from '../models/Subtema';
import { Usuario } from '../models/Usuario';
import { Matricula, EstadoMatricula } from '../models/Matricula';
import { Repository } from 'typeorm';
import { ValidateCodeUseCase } from '../application/use-cases/ValidateCodeUseCase';
import { ProgresoService } from './progreso.service';

export interface EjercicioDto {
  id: number;
  subtemaId: number;
  enunciado: string;
  dificultad: string;
  tipoEjercicio: string;
  puntosMaximos: number;
  lenguajeProgramacion: string;
  codigoBase?: string;
  totalIntentos?: number;
}

export interface EnviarEjercicioDto {
  codigoEnviado: string;
}

export interface ResultadoEnvioDto {
  resultado: 'correcto' | 'incorrecto' | 'error';
  puntosObtenidos: number;
  retroalimentacionLlm: string;
  intentoId: number;
  progresoActualizado: boolean;
}

export interface IntentoDto {
  id: number;
  ejercicioId: number;
  codigoEnviado: string;
  resultado: string;
  puntosObtenidos: number;
  retroalimentacion: string;
  retroalimentacionLlm: string;
  timestamp: Date;
}

export class EjercicioService {
  private ejercicioRepository: Repository<Ejercicio>;
  private intentoRepository: Repository<IntentoEjercicio>;
  private subtemaRepository: Repository<Subtema>;
  private usuarioRepository: Repository<Usuario>;
  private matriculaRepository: Repository<Matricula>;
  private validateCodeUseCase: ValidateCodeUseCase;
  private progresoService: ProgresoService;

  constructor(validateCodeUseCase: ValidateCodeUseCase) {
    this.ejercicioRepository = AppDataSource.getRepository(Ejercicio);
    this.intentoRepository = AppDataSource.getRepository(IntentoEjercicio);
    this.subtemaRepository = AppDataSource.getRepository(Subtema);
    this.usuarioRepository = AppDataSource.getRepository(Usuario);
    this.matriculaRepository = AppDataSource.getRepository(Matricula);
    this.validateCodeUseCase = validateCodeUseCase;
    this.progresoService = new ProgresoService();
  }

  /**
   * Listar todos los ejercicios de un subtema
   * Endpoint: GET /api/v1/ejercicios/subtema/:subtemaId
   */
  async listarEjerciciosPorSubtema(subtemaId: number): Promise<EjercicioDto[]> {
    const ejercicios = await this.ejercicioRepository
      .createQueryBuilder('ejercicio')
      .leftJoin('ejercicio.intentos', 'intento')
      .where('ejercicio.subtemaId = :subtemaId', { subtemaId })
      .select([
        'ejercicio.id',
        'ejercicio.subtemaId',
        'ejercicio.enunciado',
        'ejercicio.dificultad',
        'ejercicio.tipoEjercicio',
        'ejercicio.puntosMaximos',
        'ejercicio.lenguajeProgramacion',
        'ejercicio.codigoBase'
      ])
      .addSelect('COUNT(intento.id)', 'totalIntentos')
      .groupBy('ejercicio.id')
      .getRawMany();

      return ejercicios.map(ej => ({
      id: ej.ejercicio_id,
      subtemaId: ej.ejercicio_subtema_id,
      enunciado: ej.ejercicio_enunciado,
      dificultad: ej.ejercicio_dificultad || 'basica',
      tipoEjercicio: ej.ejercicio_tipo_ejercicio || 'codificacion',
      puntosMaximos: ej.ejercicio_puntos_maximos || 10,
      lenguajeProgramacion: ej.ejercicio_lenguaje_programacion || 'javascript',
      codigoBase: ej.ejercicio_codigo_base || '',
      totalIntentos: parseInt(ej.totalIntentos) || 0
    }));
  }

  /**
   * Obtener detalle de un ejercicio especifico
   * Endpoint: GET /api/v1/ejercicios/:id
   */
  async obtenerEjercicioPorId(ejercicioId: number): Promise<EjercicioDto> {
    const ejercicio = await this.ejercicioRepository
      .createQueryBuilder('ejercicio')
      .leftJoinAndSelect('ejercicio.subtema', 'subtema')
      .leftJoinAndSelect('subtema.tema', 'tema')
      .where('ejercicio.id = :ejercicioId', { ejercicioId })
      .getOne();

    if (!ejercicio) {
      throw new Error('Ejercicio no encontrado');
    }

    return {
      id: ejercicio.id,
      subtemaId: ejercicio.subtemaId,
      enunciado: ejercicio.enunciado,
      dificultad: ejercicio.dificultad || 'basica',
      tipoEjercicio: ejercicio.tipoEjercicio || 'codificacion',
      puntosMaximos: ejercicio.puntosMaximos || 10,
      lenguajeProgramacion: ejercicio.lenguajeProgramacion || 'javascript',
      codigoBase: ejercicio.codigoBase || ''
    };
  }

  /**
   * ENDPOINT MAS IMPORTANTE: Enviar solucion de ejercicio
   * Endpoint: POST /api/v1/ejercicios/:id/enviar
   */
  async enviarEjercicio(
    ejercicioId: number,
    usuarioId: number,
    datos: EnviarEjercicioDto
  ): Promise<ResultadoEnvioDto> {
    // 1. Validar que el ejercicio exista
    const ejercicio = await this.ejercicioRepository.findOne({
      where: { id: ejercicioId },
      relations: ['subtema', 'subtema.tema']
    });

    if (!ejercicio) {
      throw new Error('Ejercicio no encontrado');
    }

    // 2. Validar que el usuario este matriculado en la materia
    const materiaId = ejercicio.subtema.tema.materiaId;
    const matricula = await this.matriculaRepository.findOne({
      where: {
        usuarioId,
        materiaId,
        estado: EstadoMatricula.ACTIVA
      }
    });

    if (!matricula) {
      throw new Error('Debes estar matriculado en la materia para enviar ejercicios');
    }

    // 3. Crear intento inicial con estado "procesando"
    let intento = this.intentoRepository.create({
      usuarioId,
      ejercicioId,
      codigoEnviado: datos.codigoEnviado,
      resultado: ResultadoEjercicio.ERROR,
      puntosObtenidos: 0
    });

    intento = await this.intentoRepository.save(intento);

    try {
      // 4. Llamar a Lulu para validar codigo
      const validationRequest = {
        codigo_enviado: datos.codigoEnviado,
        ejercicio_id: ejercicioId,
        usuario_id: usuarioId,
        enunciado: ejercicio.enunciado,
        codigo_solucion: ejercicio.codigoSolucion || '',
        casos_prueba: ejercicio.casosPrueba || [],
        lenguaje: ejercicio.lenguajeProgramacion || 'javascript'
      };

      const respuestaLulu = await this.validateCodeUseCase.execute(validationRequest);

      // 5. Actualizar intento con resultado de Lulu
      let resultadoEnum: ResultadoEjercicio;
      if (respuestaLulu.resultado === 'correcto') {
        resultadoEnum = ResultadoEjercicio.CORRECTO;
      } else if (respuestaLulu.resultado === 'incorrecto') {
        resultadoEnum = ResultadoEjercicio.INCORRECTO;
      } else {
        resultadoEnum = ResultadoEjercicio.ERROR;
      }

      intento.resultado = resultadoEnum;
      intento.puntosObtenidos = respuestaLulu.puntos_obtenidos || 0;
      intento.retroalimentacionLlm = respuestaLulu.retroalimentacion_llm || '';
      intento.retroalimentacion = respuestaLulu.errores_encontrados?.join('\n') || '';

      await this.intentoRepository.save(intento);

      // 6. Actualizar progreso (llamar a Tono)
      let progresoActualizado = false;
      try {
        await this.progresoService.actualizarProgreso(usuarioId, {
          temaId: ejercicio.subtema.tema.id,
          subtemaId: ejercicio.subtemaId,
          estado: resultadoEnum === ResultadoEjercicio.CORRECTO ? 'completado' : 'en_progreso',
          porcentajeCompletado: resultadoEnum === ResultadoEjercicio.CORRECTO ? 100 : 50
        });
        progresoActualizado = true;
      } catch (error) {
        console.error('Error al actualizar progreso:', error);
      }

      // 7. Retornar resultado al estudiante
      return {
        resultado: respuestaLulu.resultado as 'correcto' | 'incorrecto' | 'error',
        puntosObtenidos: respuestaLulu.puntos_obtenidos || 0,
        retroalimentacionLlm: respuestaLulu.retroalimentacion_llm || '',
        intentoId: intento.id,
        progresoActualizado
      };

    } catch (error: any) {
      // Si falla la validacion con Lulu, actualizar intento con error
      intento.resultado = ResultadoEjercicio.ERROR;
      intento.retroalimentacion = `Error al procesar: ${error.message}`;
      await this.intentoRepository.save(intento);

      throw new Error(`Error al validar codigo: ${error.message}`);
    }
  }

  /**
   * Obtener historial de intentos de un usuario en un ejercicio
   * Endpoint: GET /api/v1/ejercicios/:id/intentos
   */
  async obtenerIntentosEjercicio(
    ejercicioId: number,
    usuarioId: number
  ): Promise<IntentoDto[]> {
    const intentos = await this.intentoRepository.find({
      where: {
        ejercicioId,
        usuarioId
      },
      order: {
        timestamp: 'DESC'
      }
    });

    return intentos.map(intento => ({
      id: intento.id,
      ejercicioId: intento.ejercicioId,
      codigoEnviado: intento.codigoEnviado || '',
      resultado: intento.resultado || 'error',
      puntosObtenidos: intento.puntosObtenidos || 0,
      retroalimentacion: intento.retroalimentacion || '',
      retroalimentacionLlm: intento.retroalimentacionLlm || '',
      timestamp: intento.timestamp
    }));
  }
}