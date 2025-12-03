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
  lenguajeProgramacion?: string;
  codigoBase?: string;
  opcionesRespuesta?: any[];
  textoConEspacios?: string;
  totalIntentos?: number;
  resuelto?: boolean;
}

export interface EnviarEjercicioDto {
  codigoEnviado?: string; // Para codificación
  opcionSeleccionadaId?: string; // Para múltiple
  respuestasCompletadas?: string[]; // Para completar
}

export interface ResultadoEnvioDto {
  resultado: 'correcto' | 'incorrecto' | 'error';
  puntosObtenidos: number;
  retroalimentacionLlm: string;
  intentoId: number;
  progresoActualizado: boolean;
  detalles?: any;
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
   * INCLUYE campo resuelto calculado por usuario
   */
  async listarEjerciciosPorSubtema(subtemaId: number, usuarioId: number): Promise<EjercicioDto[]> {
    // Obtener ejercicios
    const ejercicios = await this.ejercicioRepository.find({
      where: { subtemaId },
      order: { id: 'ASC' }
    });

    // Calcular estado de resolución para cada ejercicio
    const ejerciciosConEstado = await Promise.all(
      ejercicios.map(async (ejercicio) => {
        // Obtener intentos del usuario para este ejercicio
        const intentos = await this.intentoRepository.find({
          where: {
            ejercicioId: ejercicio.id,
            usuarioId
          },
          order: { timestamp: 'DESC' }
        });

        const totalIntentos = intentos.length;
        
        // ⚠️ FIX CLAVE: Un ejercicio está resuelto si tiene al menos un intento con puntaje máximo
        const resuelto = intentos.some(i => i.puntosObtenidos === ejercicio.puntosMaximos);

        return {
          id: ejercicio.id,
          subtemaId: ejercicio.subtemaId,
          enunciado: ejercicio.enunciado,
          dificultad: ejercicio.dificultad || 'basica',
          tipoEjercicio: ejercicio.tipoEjercicio || 'codificacion',
          puntosMaximos: ejercicio.puntosMaximos || 10,
          lenguajeProgramacion: ejercicio.lenguajeProgramacion,
          codigoBase: ejercicio.codigoBase || '',
          // Para ejercicios múltiple, filtrar las respuestas correctas
          opcionesRespuesta: ejercicio.opcionesRespuesta 
            ? ejercicio.opcionesRespuesta.map((op: any) => ({
                id: op.id,
                texto: op.texto
                // NO enviamos esCorrecta
              }))
            : undefined,
          textoConEspacios: ejercicio.textoConEspacios,
          totalIntentos,
          resuelto // ⬅️ INCLUIR resuelto en el listado
        };
      })
    );

    return ejerciciosConEstado;
  }

  /**
   * Obtener detalle de un ejercicio específico
   * Incluye estado de resolución para el usuario actual
   */
  async obtenerEjercicioPorId(ejercicioId: number, usuarioId: number): Promise<EjercicioDto> {
    const ejercicio = await this.ejercicioRepository
      .createQueryBuilder('ejercicio')
      .leftJoinAndSelect('ejercicio.subtema', 'subtema')
      .leftJoinAndSelect('subtema.tema', 'tema')
      .where('ejercicio.id = :ejercicioId', { ejercicioId })
      .getOne();

    if (!ejercicio) {
      throw new Error('Ejercicio no encontrado');
    }
    
    // ⚠️ FIX CLAVE: Obtener intentos del usuario para calcular el estado de resolución
    const intentos = await this.intentoRepository.find({
      where: { ejercicioId, usuarioId },
      order: { timestamp: 'DESC' },
    });

    const totalIntentos = intentos.length;
    // Un ejercicio está resuelto si hay al menos un intento con puntaje máximo.
    const resuelto = intentos.some(i => i.puntosObtenidos === ejercicio.puntosMaximos);

    return {
      id: ejercicio.id,
      subtemaId: ejercicio.subtemaId,
      enunciado: ejercicio.enunciado,
      dificultad: ejercicio.dificultad || 'basica',
      tipoEjercicio: ejercicio.tipoEjercicio || 'codificacion',
      puntosMaximos: ejercicio.puntosMaximos || 10,
      lenguajeProgramacion: ejercicio.lenguajeProgramacion,
      codigoBase: ejercicio.codigoBase || '',
      opcionesRespuesta: ejercicio.opcionesRespuesta 
        ? ejercicio.opcionesRespuesta.map(op => ({
            id: op.id,
            texto: op.texto
          }))
        : undefined,
      textoConEspacios: ejercicio.textoConEspacios,
      totalIntentos,
      resuelto, // ⬅️ Incluir resuelto en la respuesta
    };
  }

  /**
   * ENDPOINT MÁS IMPORTANTE: Enviar solución de ejercicio
   * Maneja los 3 tipos: codificación, múltiple, completar
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

    // 2. Validar que el usuario esté matriculado en la materia
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

    // 3. Procesar según el tipo de ejercicio
    let resultado: ResultadoEnvioDto;

    switch (ejercicio.tipoEjercicio) {
      case TipoEjercicio.CODIFICACION:
        resultado = await this.procesarEjercicioCodificacion(ejercicio, usuarioId, datos);
        break;
      
      case TipoEjercicio.MULTIPLE:
        resultado = await this.procesarEjercicioMultiple(ejercicio, usuarioId, datos);
        break;
      
      case TipoEjercicio.COMPLETAR:
        resultado = await this.procesarEjercicioCompletar(ejercicio, usuarioId, datos);
        break;
      
      default:
        throw new Error('Tipo de ejercicio no soportado');
    }

    // 4. ⚠️ FIX CLAVE: Actualizar progreso usando el método inteligente
    // que calcula el porcentaje basado en TODOS los ejercicios del tema
    if (resultado.resultado === 'correcto') {
      try {
        await this.progresoService.calcularYActualizarProgresoTema(
          usuarioId,
          ejercicio.subtema.tema.id
        );
        resultado.progresoActualizado = true;
      } catch (error) {
        console.error('Error al actualizar progreso:', error);
        resultado.progresoActualizado = false;
      }
    }

    return resultado;
  }

  /**
   * Procesar ejercicio de codificación
   */
  private async procesarEjercicioCodificacion(
    ejercicio: Ejercicio,
    usuarioId: number,
    datos: EnviarEjercicioDto
  ): Promise<ResultadoEnvioDto> {
    if (!datos.codigoEnviado) {
      throw new Error('Se requiere código para ejercicios de codificación');
    }

    // Crear intento inicial
    let intento = this.intentoRepository.create({
      usuarioId,
      ejercicioId: ejercicio.id,
      codigoEnviado: datos.codigoEnviado,
      resultado: ResultadoEjercicio.ERROR,
      puntosObtenidos: 0
    });

    intento = await this.intentoRepository.save(intento);

    try {
      // Validar con IA (Gemini)
      const validationRequest = {
        codigo_enviado: datos.codigoEnviado,
        ejercicio_id: ejercicio.id,
        usuario_id: usuarioId,
        enunciado: ejercicio.enunciado,
        codigo_solucion: ejercicio.codigoSolucion || '',
        casos_prueba: ejercicio.casosPrueba || [],
        lenguaje: ejercicio.lenguajeProgramacion || 'javascript'
      };

      const respuestaLulu = await this.validateCodeUseCase.execute(validationRequest);

      // Actualizar intento con resultado
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

      return {
        resultado: respuestaLulu.resultado as 'correcto' | 'incorrecto' | 'error',
        puntosObtenidos: respuestaLulu.puntos_obtenidos || 0,
        retroalimentacionLlm: respuestaLulu.retroalimentacion_llm || '',
        intentoId: intento.id,
        progresoActualizado: false
      };

    } catch (error: any) {
      intento.resultado = ResultadoEjercicio.ERROR;
      intento.retroalimentacion = `Error al procesar: ${error.message}`;
      await this.intentoRepository.save(intento);

      throw new Error(`Error al validar código: ${error.message}`);
    }
  }

  /**
   * Procesar ejercicio de opción múltiple
   */
  private async procesarEjercicioMultiple(
    ejercicio: Ejercicio,
    usuarioId: number,
    datos: EnviarEjercicioDto
  ): Promise<ResultadoEnvioDto> {
    if (!datos.opcionSeleccionadaId) {
      throw new Error('Se requiere seleccionar una opción');
    }

    if (!ejercicio.opcionesRespuesta || ejercicio.opcionesRespuesta.length === 0) {
      throw new Error('Este ejercicio no tiene opciones de respuesta configuradas');
    }

    // Buscar la opción seleccionada
    const opcionSeleccionada = ejercicio.opcionesRespuesta.find(
      op => op.id === datos.opcionSeleccionadaId
    );

    if (!opcionSeleccionada) {
      throw new Error('Opción seleccionada no válida');
    }

    const esCorrecta = opcionSeleccionada.esCorrecta === true;
    const resultado = esCorrecta ? ResultadoEjercicio.CORRECTO : ResultadoEjercicio.INCORRECTO;
    const puntosObtenidos = esCorrecta ? ejercicio.puntosMaximos : 0;

    // Crear intento
    let intento = this.intentoRepository.create({
      usuarioId,
      ejercicioId: ejercicio.id,
      codigoEnviado: JSON.stringify({ opcionSeleccionada: datos.opcionSeleccionadaId }),
      resultado,
      puntosObtenidos,
      retroalimentacion: esCorrecta ? 'Respuesta correcta' : 'Respuesta incorrecta',
      retroalimentacionLlm: esCorrecta 
        ? '¡Excelente! Has seleccionado la respuesta correcta.' 
        : 'Respuesta incorrecta. Te recomiendo revisar el tema nuevamente.'
    });

    intento = await this.intentoRepository.save(intento);

    // Encontrar la respuesta correcta para retroalimentación
    const opcionCorrecta = ejercicio.opcionesRespuesta.find(op => op.esCorrecta === true);

    return {
      resultado: esCorrecta ? 'correcto' : 'incorrecto',
      puntosObtenidos,
      retroalimentacionLlm: esCorrecta 
        ? '¡Correcto! Has demostrado comprensión del tema.' 
        : `Incorrecto. La respuesta correcta es: "${opcionCorrecta?.texto}". Te sugiero repasar este concepto.`,
      intentoId: intento.id,
      progresoActualizado: false,
      detalles: {
        opcionSeleccionada: opcionSeleccionada.texto,
        opcionCorrecta: opcionCorrecta?.texto
      }
    };
  }

  /**
   * Procesar ejercicio de completar
   */
  private async procesarEjercicioCompletar(
    ejercicio: Ejercicio,
    usuarioId: number,
    datos: EnviarEjercicioDto
  ): Promise<ResultadoEnvioDto> {
    if (!datos.respuestasCompletadas || datos.respuestasCompletadas.length === 0) {
      throw new Error('Se requieren respuestas para completar');
    }

    if (!ejercicio.respuestasCorrectas || ejercicio.respuestasCorrectas.length === 0) {
      throw new Error('Este ejercicio no tiene respuestas correctas configuradas');
    }

    if (datos.respuestasCompletadas.length !== ejercicio.respuestasCorrectas.length) {
      throw new Error(`Se esperaban ${ejercicio.respuestasCorrectas.length} respuestas`);
    }

    // Comparar respuestas (case-insensitive y sin espacios extras)
    let correctas = 0;
    const comparaciones = datos.respuestasCompletadas.map((respuesta, index) => {
      const respuestaLimpia = respuesta.trim().toLowerCase();
      const correctaLimpia = ejercicio.respuestasCorrectas![index].trim().toLowerCase();
      const esCorrecta = respuestaLimpia === correctaLimpia;
      
      if (esCorrecta) correctas++;
      
      return {
        posicion: index + 1,
        tuRespuesta: respuesta,
        respuestaCorrecta: ejercicio.respuestasCorrectas![index],
        esCorrecta
      };
    });

    const todasCorrectas = correctas === ejercicio.respuestasCorrectas.length;
    const porcentajeCorrectas = (correctas / ejercicio.respuestasCorrectas.length) * 100;
    const puntosObtenidos = Math.round((porcentajeCorrectas / 100) * ejercicio.puntosMaximos);
    
    const resultado = todasCorrectas ? ResultadoEjercicio.CORRECTO : ResultadoEjercicio.INCORRECTO;

    // Crear intento
    let intento = this.intentoRepository.create({
      usuarioId,
      ejercicioId: ejercicio.id,
      codigoEnviado: JSON.stringify({ respuestas: datos.respuestasCompletadas }),
      resultado,
      puntosObtenidos,
      retroalimentacion: `${correctas} de ${ejercicio.respuestasCorrectas.length} respuestas correctas`,
      retroalimentacionLlm: todasCorrectas
        ? '¡Perfecto! Todas las respuestas son correctas.'
        : `Tienes ${correctas} respuesta(s) correcta(s) de ${ejercicio.respuestasCorrectas.length}. Revisa las respuestas incorrectas.`
    });

    intento = await this.intentoRepository.save(intento);

    return {
      resultado: todasCorrectas ? 'correcto' : 'incorrecto',
      puntosObtenidos,
      retroalimentacionLlm: todasCorrectas
        ? '¡Excelente trabajo! Has completado correctamente todos los espacios.'
        : `Obtuviste ${correctas} de ${ejercicio.respuestasCorrectas.length} correctas (${porcentajeCorrectas.toFixed(0)}%). Revisa las respuestas marcadas en rojo.`,
      intentoId: intento.id,
      progresoActualizado: false,
      detalles: {
        comparaciones,
        correctas,
        total: ejercicio.respuestasCorrectas.length,
        porcentaje: porcentajeCorrectas
      }
    };
  }

  /**
   * Obtener historial de intentos de un usuario en un ejercicio
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