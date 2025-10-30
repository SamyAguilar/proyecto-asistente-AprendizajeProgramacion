// backend/src/services/QuizService.ts

import { AppDataSource } from '../config/database';
// Modelos de Sam
import { PreguntaQuiz } from '../models/PreguntaQuiz';
import { OpcionRespuesta } from '../models/OpcionRespuesta';
import { IntentoQuiz } from '../models/IntentoQuiz';
import { Progreso, EstadoProgreso } from '../models/Progreso'; 
// Use Case y dependencias de Lulu
import { GenerateQuestionsUseCase } from '../application/use-cases/GenerateQuestionsUseCase'; 
import { GeminiClient } from '../infrastructure/gemini/GeminiClient';
import { InMemoryCacheService } from '../infrastructure/cache/InMemoryCacheService';

// Interfaces de tipos (sin cambios)
export interface QuizSubmissionRequest {
  usuarioId: number;
  subtemaId: number;
  respuestas: Array<{
    preguntaId: number;
    opcionElegidaId: number;
  }>;
}

export interface QuizSubmissionResponse {
  calificacion: number; // Porcentaje de 0 a 100
  respuestasCorrectas: number;
  totalPreguntas: number;
  detalles: Array<{
    preguntaId: number;
    esCorrecta: boolean;
    opcionCorrectaId: number;
  }>;
}

export class QuizService {
  private preguntaQuizRepository = AppDataSource.getRepository(PreguntaQuiz);
  private opcionRespuestaRepository = AppDataSource.getRepository(OpcionRespuesta);
  private intentoQuizRepository = AppDataSource.getRepository(IntentoQuiz);
  private progresoRepository = AppDataSource.getRepository(Progreso);

  constructor(
    private generateQuestionsUseCase: GenerateQuestionsUseCase
  ) {}

  /**
   * Obtiene preguntas de quiz para un subtema.
   */
  async getQuestionsBySubtopic(subtemaId: number, limite: number): Promise<PreguntaQuiz[]> {
    let preguntas = await this.preguntaQuizRepository.find({
      where: { subtemaId },
      relations: ['opciones'], 
      take: limite,
      order: { id: 'DESC' } 
    });
    
    const preguntasFaltantes = limite - preguntas.length;

    if (preguntasFaltantes > 0) {
      try {
        await this.generateQuestionsUseCase.execute({
            subtema_id: subtemaId,
            cantidad: preguntasFaltantes,
            dificultad: 'intermedia'
        });
        
        preguntas = await this.preguntaQuizRepository.find({
            where: { subtemaId },
            relations: ['opciones'],
            take: limite,
            order: { id: 'DESC' }
        });
        
      } catch (error: any) {
        console.error('[QuizService] Error al generar preguntas con IA:', error.message);
      }
    }
    
    return preguntas;
  }

  /**
   * Procesa las respuestas del quiz, guardando el intento por pregunta y el progreso general.
   */
  async submitQuizAttempt(request: QuizSubmissionRequest): Promise<QuizSubmissionResponse> {
    const { usuarioId, subtemaId, respuestas } = request;

    const preguntasIds = respuestas.map(r => r.preguntaId);
    
    // 1. Obtener opciones correctas
    const opcionesCorrectas = await this.opcionRespuestaRepository
      .createQueryBuilder('opcion')
      .where('opcion.preguntaId IN (:...preguntasIds)', { preguntasIds })
      .andWhere('opcion.esCorrecta = true')
      .getMany();

    const mapaRespuestasCorrectas = opcionesCorrectas.reduce((mapa, opcion) => {
      mapa[opcion.preguntaId] = opcion.id;
      return mapa;
    }, {} as Record<number, number>);

    let respuestasCorrectas = 0;
    const totalPreguntas = preguntasIds.length;
    const intentosIndividuales = [];

    // 2. Calificar y preparar el guardado de intentos individuales (IntentoQuiz de Sam)
    for (const respuesta of respuestas) {
      const opcionCorrectaId = mapaRespuestasCorrectas[respuesta.preguntaId];
      const esCorrecta = opcionCorrectaId === respuesta.opcionElegidaId;
      
      if (esCorrecta) {
        respuestasCorrectas++;
      }

      intentosIndividuales.push(this.intentoQuizRepository.create({
        usuarioId: usuarioId, 
        preguntaId: respuesta.preguntaId,
        opcionSeleccionadaId: respuesta.opcionElegidaId,
        esCorrecta: esCorrecta,
      }));
    }

    const calificacion = totalPreguntas > 0 
      ? Math.round((respuestasCorrectas / totalPreguntas) * 100) 
      : 0;

    // 3. Guardar intentos y progreso
    await this.intentoQuizRepository.save(intentosIndividuales);
    await this.actualizarProgreso(usuarioId, subtemaId, calificacion);

    return {
      calificacion,
      respuestasCorrectas,
      totalPreguntas,
      detalles: intentosIndividuales.map((intento) => ({
        preguntaId: intento.preguntaId,
        esCorrecta: intento.esCorrecta || false,
        opcionCorrectaId: mapaRespuestasCorrectas[intento.preguntaId],
      })),
    };
  }
  
  /**
   * Lógica para actualizar el progreso (Progreso.ts de Sam)
   */
  private async actualizarProgreso(usuarioId: number, subtemaId: number, calificacion: number): Promise<void> {
      let progreso = await this.progresoRepository.findOne({ 
          where: { usuarioId, subtemaId } 
      });

      if (!progreso) {
          progreso = this.progresoRepository.create({
              usuarioId,
              subtemaId,
              estado: calificacion >= 80 ? EstadoProgreso.COMPLETADO : EstadoProgreso.EN_PROGRESO,
              porcentajeCompletado: calificacion,
              intentos: 1, 
              fechaUltimoAcceso: new Date(),
          });
      } else {
          progreso.porcentajeCompletado = Math.max(progreso.porcentajeCompletado, calificacion);
          progreso.intentos = (progreso.intentos || 0) + 1;
          progreso.fechaUltimoAcceso = new Date();
          
          if (progreso.porcentajeCompletado >= 80) {
              progreso.estado = EstadoProgreso.COMPLETADO;
          } else if (progreso.estado === EstadoProgreso.NO_INICIADO) {
              progreso.estado = EstadoProgreso.EN_PROGRESO;
          }
      }

      await this.progresoRepository.save(progreso);
  }
}

// Exportación con inyección de dependencias de Lulu
export const quizService = new QuizService(
    new GenerateQuestionsUseCase(
        new GeminiClient(), 
        new InMemoryCacheService()
    ) 
);