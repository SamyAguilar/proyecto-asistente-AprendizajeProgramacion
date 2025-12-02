// backend/src/services/quiz.service.ts

import { AppDataSource } from '../config/database';
import { PreguntaQuiz, DificultadPregunta } from '../models/PreguntaQuiz';
import { OpcionRespuesta } from '../models/OpcionRespuesta';
import { IntentoQuiz } from '../models/IntentoQuiz';
import { Subtema } from '../models/Subtema';
import { Repository } from 'typeorm';
import { GenerateQuestionsUseCase } from '../application/use-cases/GenerateQuestionsUseCase';
import { ProgresoService } from './progreso.service';

export interface PreguntaDto {
  id: number;
  subtemaId: number;
  preguntaTexto: string;
  tipoPregunta: string;
  dificultad: string;
  opciones: OpcionDto[];
}

export interface OpcionDto {
  id: number;
  textoOpcion: string;
  orden: number;
}

export interface ResponderQuizDto {
  preguntaId: number;
  opcionSeleccionadaId: number;
}

export interface ResultadoQuizDto {
  esCorrecta: boolean;
  explicacion: string;
  puntosObtenidos: number;
  intentoId: number;
  progresoActualizado: boolean;
}

export interface EstadisticasQuizDto {
  totalIntentos: number;
  intentosCorrectos: number;
  intentosIncorrectos: number;
  promedio: number;
  ultimoIntento: Date;
}

export class QuizService {
  private preguntaRepository: Repository<PreguntaQuiz>;
  private opcionRepository: Repository<OpcionRespuesta>;
  private intentoRepository: Repository<IntentoQuiz>;
  private subtemaRepository: Repository<Subtema>;
  private generateQuestionsUseCase: GenerateQuestionsUseCase;
  private progresoService: ProgresoService;

  constructor(generateQuestionsUseCase: GenerateQuestionsUseCase) {
    this.preguntaRepository = AppDataSource.getRepository(PreguntaQuiz);
    this.opcionRepository = AppDataSource.getRepository(OpcionRespuesta);
    this.intentoRepository = AppDataSource.getRepository(IntentoQuiz);
    this.subtemaRepository = AppDataSource.getRepository(Subtema);
    this.generateQuestionsUseCase = generateQuestionsUseCase;
    this.progresoService = new ProgresoService();
  }

  /**
   * Obtener preguntas de quiz para un subtema
   * Endpoint: GET /api/v1/quiz/subtema/:subtemaId/preguntas
   */
  async obtenerPreguntasQuiz(
    subtemaId: number,
    cantidad: number = 5
  ): Promise<PreguntaDto[]> {
    // 1. Buscar preguntas existentes en BD
    let preguntas = await this.preguntaRepository
      .createQueryBuilder('pregunta')
      .leftJoinAndSelect('pregunta.opciones', 'opcion')
      .where('pregunta.subtemaId = :subtemaId', { subtemaId })
      .orderBy('pregunta.id', 'ASC')
      .addOrderBy('opcion.orden', 'ASC')
      .take(cantidad)
      .getMany();

    // 2. Si no hay suficientes, solicitar a Lulu que genere nuevas
    if (preguntas.length < cantidad) {
      try {
        const cantidadFaltante = cantidad - preguntas.length;
        
        const respuestaLulu = await this.generateQuestionsUseCase.execute({
          subtema_id: subtemaId,
          cantidad: cantidadFaltante,
          dificultad: 'intermedia'
        });

        // Las preguntas ya estan guardadas en BD por GenerateQuestionsUseCase
        // Buscar nuevamente para obtener las recien generadas
        preguntas = await this.preguntaRepository
          .createQueryBuilder('pregunta')
          .leftJoinAndSelect('pregunta.opciones', 'opcion')
          .where('pregunta.subtemaId = :subtemaId', { subtemaId })
          .orderBy('pregunta.id', 'ASC')
          .addOrderBy('opcion.orden', 'ASC')
          .take(cantidad)
          .getMany();

      } catch (error) {
        console.error('Error al generar preguntas con Lulu:', error);
        // Continuar con las preguntas que tenemos
      }
    }

    // 3. Formatear preguntas para NO revelar cual es la respuesta correcta
    return preguntas.map(pregunta => ({
      id: pregunta.id,
      subtemaId: pregunta.subtemaId,
      preguntaTexto: pregunta.preguntaTexto,
      tipoPregunta: pregunta.tipoPregunta || 'opcion_multiple',
      dificultad: pregunta.dificultad || 'intermedia',
      opciones: pregunta.opciones
        .sort((a, b) => (a.orden || 0) - (b.orden || 0))
        .map(opcion => ({
          id: opcion.id,
          textoOpcion: opcion.textoOpcion,
          orden: opcion.orden || 0
        }))
    }));
  }

  /**
   * Responder una pregunta de quiz
   * Endpoint: POST /api/v1/quiz/responder
   */
  async responderPregunta(
    usuarioId: number,
    datos: ResponderQuizDto
  ): Promise<ResultadoQuizDto> {
    const { preguntaId, opcionSeleccionadaId } = datos;

    // 1. Verificar que la pregunta exista
    const pregunta = await this.preguntaRepository.findOne({
      where: { id: preguntaId },
      relations: ['subtema', 'subtema.tema']
    });

    if (!pregunta) {
      throw new Error('Pregunta no encontrada');
    }

    // 2. Verificar que la opcion seleccionada exista y pertenezca a esta pregunta
    const opcionSeleccionada = await this.opcionRepository.findOne({
      where: {
        id: opcionSeleccionadaId,
        preguntaId
      }
    });

    if (!opcionSeleccionada) {
      throw new Error('Opcion seleccionada invalida');
    }

    // 3. Verificar si la opcion es correcta
    const esCorrecta = opcionSeleccionada.esCorrecta;

    // 4. Calcular puntos (10 puntos por respuesta correcta)
    const puntosObtenidos = esCorrecta ? 10 : 0;

    // 5. Registrar intento en intentos_quiz
    let intento = this.intentoRepository.create({
      usuarioId,
      preguntaId,
      opcionSeleccionadaId,
      esCorrecta,
      tiempoRespuesta: 0
    });

    intento = await this.intentoRepository.save(intento);

    // 6. Actualizar progreso (llamar a Tono)
    let progresoActualizado = false;
    try {
      await this.progresoService.actualizarProgreso(usuarioId, {
        temaId: pregunta.subtema.tema.id,
        subtemaId: pregunta.subtemaId,
        estado: esCorrecta ? 'completado' : 'en_progreso',
        porcentajeCompletado: esCorrecta ? 100 : 50
      });
      progresoActualizado = true;
    } catch (error) {
      console.error('Error al actualizar progreso:', error);
    }

    // 7. Retornar resultado con explicacion
    const explicacion = esCorrecta 
      ? pregunta.retroalimentacionCorrecta || 'Respuesta correcta'
      : pregunta.retroalimentacionIncorrecta || 'Respuesta incorrecta. Revisa el contenido del tema.';

    return {
      esCorrecta,
      explicacion,
      puntosObtenidos,
      intentoId: intento.id,
      progresoActualizado
    };
  }

  /**
   * Obtener resultados de quizzes de un usuario
   * Endpoint: GET /api/v1/quiz/resultados/:usuarioId
   */
  async obtenerResultadosUsuario(
    usuarioId: number,
    usuarioSolicitante: number,
    rolSolicitante: string
  ): Promise<EstadisticasQuizDto> {
    // Validar permisos: solo puede ver sus propios resultados o ser profesor/admin
    if (usuarioId !== usuarioSolicitante && rolSolicitante !== 'profesor' && rolSolicitante !== 'admin') {
      throw new Error('No tienes permiso para ver estos resultados');
    }

    // Obtener todos los intentos del usuario
    const intentos = await this.intentoRepository.find({
      where: { usuarioId },
      order: { timestamp: 'DESC' }
    });

    if (intentos.length === 0) {
      return {
        totalIntentos: 0,
        intentosCorrectos: 0,
        intentosIncorrectos: 0,
        promedio: 0,
        ultimoIntento: new Date()
      };
    }

    const intentosCorrectos = intentos.filter(i => i.esCorrecta).length;
    const intentosIncorrectos = intentos.filter(i => !i.esCorrecta).length;
    const promedio = intentos.length > 0 
      ? Math.round((intentosCorrectos / intentos.length) * 100) 
      : 0;

    return {
      totalIntentos: intentos.length,
      intentosCorrectos,
      intentosIncorrectos,
      promedio,
      ultimoIntento: intentos[0].timestamp
    };
  }

  /**
   * Convertir DificultadPregunta enum a string literal sin tilde
   * para compatibilidad con GenerarPreguntasRequest
   */
  private convertirDificultadAString(dificultad: DificultadPregunta): 'basica' | 'intermedia' | 'avanzada' {
    switch (dificultad) {
      case DificultadPregunta.BASICA:
        return 'basica';
      case DificultadPregunta.INTERMEDIA:
        return 'intermedia';
      case DificultadPregunta.AVANZADA:
        return 'avanzada';
      default:
        return 'intermedia';
    }
  }

  /**
   * Generar preguntas manualmente (endpoint interno/admin)
   * Endpoint: POST /api/v1/quiz/generar-preguntas
   */
  async generarPreguntasManualmente(
    subtemaId: number,
    cantidad: number = 5,
    dificultad: string = 'intermedia'
  ): Promise<number> {
    // Validar que el subtema exista
    const subtema = await this.subtemaRepository.findOne({
      where: { id: subtemaId }
    });

    if (!subtema) {
      throw new Error('Subtema no encontrado');
    }

    // Validar y convertir dificultad a enum
    let dificultadEnum: DificultadPregunta;
    if (dificultad === 'basica') {
      dificultadEnum = DificultadPregunta.BASICA;
    } else if (dificultad === 'intermedia') {
      dificultadEnum = DificultadPregunta.INTERMEDIA;
    } else if (dificultad === 'avanzada') {
      dificultadEnum = DificultadPregunta.AVANZADA;
    } else {
      dificultadEnum = DificultadPregunta.INTERMEDIA;
    }

    // Convertir enum a string literal sin tilde para GenerarPreguntasRequest
    const dificultadString = this.convertirDificultadAString(dificultadEnum);

    // Llamar a Lulu para generar preguntas
    const respuestaLulu = await this.generateQuestionsUseCase.execute({
      subtema_id: subtemaId,
      cantidad,
      dificultad: dificultadString
    });

    return respuestaLulu.cantidad_generada;
  }
}