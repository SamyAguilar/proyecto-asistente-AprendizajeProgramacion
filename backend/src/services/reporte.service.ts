import { AppDataSource } from '../config/database';

export interface ReporteRendimientoDto {
  usuarioId: number;
  periodo: string;
  totalEjercicios: number;
  ejerciciosCorrectos: number;
  ejerciciosIncorrectos: number;
  tasaExito: number;
  totalQuizzes: number;
  quizzesCorrectos: number;
  tasaExitoQuizzes: number;
  promedioGeneral: number;
  materiasActivas: number;
  temasCompletados: number;
  horasEstudio: number;
}

export interface ReportePorMateriaDto {
  materiaId: number;
  materiaNombre: string;
  totalEjercicios: number;
  ejerciciosCorrectos: number;
  tasaExito: number;
  totalTemas: number;
  temasCompletados: number;
  progresoGeneral: number;
  ultimaActividad: Date;
}

export interface ReporteActividadDto {
  fecha: string;
  ejerciciosRealizados: number;
  quizzesRealizados: number;
  temasAccedidos: number;
}

export class ReporteService {
  
  /**
   * Generar reporte de rendimiento general del estudiante
   * Endpoint: GET /api/v1/reportes/rendimiento
   */
  async generarReporteRendimiento(
    usuarioId: number,
    fechaInicio?: Date,
    fechaFin?: Date
  ): Promise<ReporteRendimientoDto> {
    const inicio = fechaInicio || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default: ultimos 30 dias
    const fin = fechaFin || new Date();

    // Estadisticas de ejercicios
    const statsEjercicios = await AppDataSource.query(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN resultado = 'correcto' THEN 1 ELSE 0 END) as correctos,
        SUM(CASE WHEN resultado = 'incorrecto' THEN 1 ELSE 0 END) as incorrectos
       FROM intentos_ejercicios
       WHERE usuario_id = $1
       AND fecha_intento BETWEEN $2 AND $3`,
      [usuarioId, inicio, fin]
    );

    // Estadisticas de quizzes
    const statsQuizzes = await AppDataSource.query(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN es_correcta = true THEN 1 ELSE 0 END) as correctos
       FROM intentos_quiz
       WHERE usuario_id = $1
       AND fecha_intento BETWEEN $2 AND $3`,
      [usuarioId, inicio, fin]
    );

    // Materias activas y temas completados
    const statsProgreso = await AppDataSource.query(
      `SELECT 
        COUNT(DISTINCT mat.materia_id) as materias_activas,
        COUNT(DISTINCT CASE WHEN p.estado = 'completado' THEN p.tema_id END) as temas_completados
       FROM matriculas mat
       LEFT JOIN temas t ON t.materia_id = mat.materia_id
       LEFT JOIN progreso p ON p.tema_id = t.id AND p.usuario_id = mat.usuario_id
       WHERE mat.usuario_id = $1
       AND mat.estado = 'activa'`,
      [usuarioId]
    );

    // Calcular horas de estudio estimadas
    const statsActividad = await AppDataSource.query(
      `SELECT 
        COUNT(DISTINCT DATE(ie.fecha_intento)) as dias_activos
       FROM intentos_ejercicios ie
       WHERE ie.usuario_id = $1
       AND ie.fecha_intento BETWEEN $2 AND $3`,
      [usuarioId, inicio, fin]
    );

    const totalEjercicios = parseInt(statsEjercicios[0]?.total || '0');
    const ejerciciosCorrectos = parseInt(statsEjercicios[0]?.correctos || '0');
    const ejerciciosIncorrectos = parseInt(statsEjercicios[0]?.incorrectos || '0');
    const totalQuizzes = parseInt(statsQuizzes[0]?.total || '0');
    const quizzesCorrectos = parseInt(statsQuizzes[0]?.correctos || '0');

    const tasaExito = totalEjercicios > 0 
      ? Math.round((ejerciciosCorrectos / totalEjercicios) * 100) 
      : 0;

    const tasaExitoQuizzes = totalQuizzes > 0 
      ? Math.round((quizzesCorrectos / totalQuizzes) * 100) 
      : 0;

    const promedioGeneral = (tasaExito + tasaExitoQuizzes) / 2;

    // Estimar horas: ~5 minutos por ejercicio/quiz
    const horasEstudio = Math.round(((totalEjercicios + totalQuizzes) * 5) / 60 * 10) / 10;

    return {
      usuarioId,
      periodo: `${inicio.toISOString().split('T')[0]} a ${fin.toISOString().split('T')[0]}`,
      totalEjercicios,
      ejerciciosCorrectos,
      ejerciciosIncorrectos,
      tasaExito,
      totalQuizzes,
      quizzesCorrectos,
      tasaExitoQuizzes,
      promedioGeneral: Math.round(promedioGeneral * 100) / 100,
      materiasActivas: parseInt(statsProgreso[0]?.materias_activas || '0'),
      temasCompletados: parseInt(statsProgreso[0]?.temas_completados || '0'),
      horasEstudio
    };
  }

  /**
   * Generar reporte por materia
   * Endpoint: GET /api/v1/reportes/por-materia/:materiaId
   */
  async generarReportePorMateria(
    usuarioId: number,
    materiaId: number
  ): Promise<ReportePorMateriaDto> {
    // Obtener nombre de la materia
    const materia = await AppDataSource.query(
      'SELECT nombre FROM materias WHERE id = $1',
      [materiaId]
    );

    if (materia.length === 0) {
      throw new Error('Materia no encontrada');
    }

    // Estadisticas de ejercicios en esta materia
    const statsEjercicios = await AppDataSource.query(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN ie.resultado = 'correcto' THEN 1 ELSE 0 END) as correctos
       FROM intentos_ejercicios ie
       INNER JOIN ejercicios e ON e.id = ie.ejercicio_id
       INNER JOIN subtemas s ON s.id = e.subtema_id
       INNER JOIN temas t ON t.id = s.tema_id
       WHERE ie.usuario_id = $1
       AND t.materia_id = $2`,
      [usuarioId, materiaId]
    );

    // Estadisticas de temas
    const statsTemas = await AppDataSource.query(
      `SELECT 
        COUNT(DISTINCT t.id) as total_temas,
        COUNT(DISTINCT CASE WHEN p.estado = 'completado' THEN t.id END) as temas_completados
       FROM temas t
       LEFT JOIN progreso p ON p.tema_id = t.id AND p.usuario_id = $1
       WHERE t.materia_id = $2`,
      [usuarioId, materiaId]
    );

    // Ultima actividad
    const ultimaActividad = await AppDataSource.query(
      `SELECT MAX(ie.fecha_intento) as ultima_actividad
       FROM intentos_ejercicios ie
       INNER JOIN ejercicios e ON e.id = ie.ejercicio_id
       INNER JOIN subtemas s ON s.id = e.subtema_id
       INNER JOIN temas t ON t.id = s.tema_id
       WHERE ie.usuario_id = $1
       AND t.materia_id = $2`,
      [usuarioId, materiaId]
    );

    const totalEjercicios = parseInt(statsEjercicios[0]?.total || '0');
    const ejerciciosCorrectos = parseInt(statsEjercicios[0]?.correctos || '0');
    const totalTemas = parseInt(statsTemas[0]?.total_temas || '0');
    const temasCompletados = parseInt(statsTemas[0]?.temas_completados || '0');

    const tasaExito = totalEjercicios > 0 
      ? Math.round((ejerciciosCorrectos / totalEjercicios) * 100) 
      : 0;

    const progresoGeneral = totalTemas > 0 
      ? Math.round((temasCompletados / totalTemas) * 100) 
      : 0;

    return {
      materiaId,
      materiaNombre: materia[0].nombre,
      totalEjercicios,
      ejerciciosCorrectos,
      tasaExito,
      totalTemas,
      temasCompletados,
      progresoGeneral,
      ultimaActividad: ultimaActividad[0]?.ultima_actividad || null
    };
  }

  /**
   * Generar reporte de actividad diaria
   * Endpoint: GET /api/v1/reportes/actividad
   */
  async generarReporteActividad(
    usuarioId: number,
    dias: number = 7
  ): Promise<ReporteActividadDto[]> {
    const fechaInicio = new Date(Date.now() - dias * 24 * 60 * 60 * 1000);

    const actividad = await AppDataSource.query(
      `SELECT 
        DATE(ie.fecha_intento) as fecha,
        COUNT(DISTINCT ie.id) as ejercicios,
        0 as quizzes,
        COUNT(DISTINCT t.id) as temas
       FROM intentos_ejercicios ie
       INNER JOIN ejercicios e ON e.id = ie.ejercicio_id
       INNER JOIN subtemas s ON s.id = e.subtema_id
       INNER JOIN temas t ON t.id = s.tema_id
       WHERE ie.usuario_id = $1
       AND ie.fecha_intento >= $2
       GROUP BY DATE(ie.fecha_intento)
       
       UNION ALL
       
       SELECT 
        DATE(iq.fecha_intento) as fecha,
        0 as ejercicios,
        COUNT(DISTINCT iq.id) as quizzes,
        0 as temas
       FROM intentos_quiz iq
       WHERE iq.usuario_id = $1
       AND iq.fecha_intento >= $2
       GROUP BY DATE(iq.fecha_intento)
       
       ORDER BY fecha DESC`,
      [usuarioId, fechaInicio]
    );

    // Agrupar por fecha
    const actividadAgrupada = new Map<string, ReporteActividadDto>();

    actividad.forEach((a: any) => {
      const fechaStr = a.fecha.toISOString().split('T')[0];
      
      if (!actividadAgrupada.has(fechaStr)) {
        actividadAgrupada.set(fechaStr, {
          fecha: fechaStr,
          ejerciciosRealizados: 0,
          quizzesRealizados: 0,
          temasAccedidos: 0
        });
      }

      const registro = actividadAgrupada.get(fechaStr)!;
      registro.ejerciciosRealizados += parseInt(a.ejercicios || '0');
      registro.quizzesRealizados += parseInt(a.quizzes || '0');
      registro.temasAccedidos += parseInt(a.temas || '0');
    });

    return Array.from(actividadAgrupada.values());
  }

  /**
   * Generar reporte comparativo con otros estudiantes
   * Endpoint: GET /api/v1/reportes/comparativo
   */
  async generarReporteComparativo(usuarioId: number): Promise<any> {
    // Rendimiento del estudiante
    const miRendimiento = await AppDataSource.query(
      `SELECT 
        COUNT(*) as total_intentos,
        SUM(CASE WHEN resultado = 'correcto' THEN 1 ELSE 0 END) as correctos
       FROM intentos_ejercicios
       WHERE usuario_id = $1`,
      [usuarioId]
    );

    // Promedio general de todos los estudiantes
    const promedioGeneral = await AppDataSource.query(
      `SELECT 
        AVG(tasa_exito) as promedio
       FROM (
         SELECT 
           usuario_id,
           CASE 
             WHEN COUNT(*) > 0 THEN (SUM(CASE WHEN resultado = 'correcto' THEN 1 ELSE 0 END)::float / COUNT(*)) * 100
             ELSE 0
           END as tasa_exito
         FROM intentos_ejercicios
         GROUP BY usuario_id
       ) as tasas`
    );

    const miTotal = parseInt(miRendimiento[0]?.total_intentos || '0');
    const miCorrectos = parseInt(miRendimiento[0]?.correctos || '0');
    const miTasa = miTotal > 0 ? Math.round((miCorrectos / miTotal) * 100) : 0;
    const tasaPromedio = parseFloat(promedioGeneral[0]?.promedio || '0');

    return {
      miRendimiento: {
        totalIntentos: miTotal,
        intentosCorrectos: miCorrectos,
        tasaExito: miTasa
      },
      promedioGeneral: Math.round(tasaPromedio * 100) / 100,
      diferencia: Math.round((miTasa - tasaPromedio) * 100) / 100,
      posicion: miTasa > tasaPromedio ? 'Por encima del promedio' : 
                miTasa < tasaPromedio ? 'Por debajo del promedio' : 
                'En el promedio'
    };
  }
}
