// backend/src/services/reporte.service.ts

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

export interface ReporteComparativoDto {
  usuarioId: number;
  promedioUsuario: number;
  promedioGeneral: number;
  posicionRanking: number;
  totalEstudiantes: number;
  percentil: number;
  materiaMejor: string;
  materiaPeor: string;
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
    const inicio = fechaInicio || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const fin = fechaFin || new Date();

    const statsEjercicios = await AppDataSource.query(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN resultado = 'correcto' THEN 1 ELSE 0 END) as correctos
       FROM intentos_ejercicios
       WHERE usuario_id = $1
       AND timestamp BETWEEN $2 AND $3`,
      [usuarioId, inicio, fin]
    );

    const statsQuizzes = await AppDataSource.query(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN es_correcta = true THEN 1 ELSE 0 END) as correctos
       FROM intentos_quiz
       WHERE usuario_id = $1
       AND timestamp BETWEEN $2 AND $3`,
      [usuarioId, inicio, fin]
    );

    const statsProgreso = await AppDataSource.query(
      `SELECT 
        COUNT(DISTINCT m.id) as materias_activas,
        COUNT(DISTINCT CASE WHEN p.estado = 'completado' THEN p.tema_id END) as temas_completados
       FROM matriculas mat
       INNER JOIN materias m ON m.id = mat.materia_id
       LEFT JOIN temas t ON t.materia_id = m.id
       LEFT JOIN progreso p ON p.tema_id = t.id AND p.usuario_id = $1
       WHERE mat.usuario_id = $1
       AND mat.estado = 'activa'`,
      [usuarioId]
    );

    const totalEjercicios = parseInt(statsEjercicios[0]?.total || '0');
    const ejerciciosCorrectos = parseInt(statsEjercicios[0]?.correctos || '0');
    const ejerciciosIncorrectos = totalEjercicios - ejerciciosCorrectos;

    const totalQuizzes = parseInt(statsQuizzes[0]?.total || '0');
    const quizzesCorrectos = parseInt(statsQuizzes[0]?.correctos || '0');

    const tasaExito = totalEjercicios > 0 
      ? Math.round((ejerciciosCorrectos / totalEjercicios) * 100) 
      : 0;

    const tasaExitoQuizzes = totalQuizzes > 0 
      ? Math.round((quizzesCorrectos / totalQuizzes) * 100) 
      : 0;

    const promedioGeneral = (tasaExito + tasaExitoQuizzes) / 2;

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
    const materia = await AppDataSource.query(
      'SELECT nombre FROM materias WHERE id = $1',
      [materiaId]
    );

    if (materia.length === 0) {
      throw new Error('Materia no encontrada');
    }

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

    const statsTemas = await AppDataSource.query(
      `SELECT 
        COUNT(DISTINCT t.id) as total_temas,
        COUNT(DISTINCT CASE WHEN p.estado = 'completado' THEN t.id END) as temas_completados
       FROM temas t
       LEFT JOIN progreso p ON p.tema_id = t.id AND p.usuario_id = $1
       WHERE t.materia_id = $2`,
      [usuarioId, materiaId]
    );

    const ultimaActividad = await AppDataSource.query(
      `SELECT MAX(ie.timestamp) as ultima_actividad
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
        DATE(timestamp) as fecha,
        COUNT(DISTINCT id) as ejercicios,
        0 as quizzes,
        0 as temas
       FROM intentos_ejercicios
       WHERE usuario_id = $1
       AND timestamp >= $2
       GROUP BY DATE(timestamp)
       
       UNION ALL
       
       SELECT 
        DATE(timestamp) as fecha,
        0 as ejercicios,
        COUNT(DISTINCT id) as quizzes,
        0 as temas
       FROM intentos_quiz
       WHERE usuario_id = $1
       AND timestamp >= $2
       GROUP BY DATE(timestamp)
       
       UNION ALL
       
       SELECT 
        DATE(fecha_ultimo_acceso) as fecha,
        0 as ejercicios,
        0 as quizzes,
        COUNT(DISTINCT tema_id) as temas
       FROM progreso
       WHERE usuario_id = $1
       AND fecha_ultimo_acceso >= $2
       GROUP BY DATE(fecha_ultimo_acceso)
       
       ORDER BY fecha DESC`,
      [usuarioId, fechaInicio]
    );

    const actividadAgrupada = new Map<string, ReporteActividadDto>();

    actividad.forEach((a: any) => {
      const fechaStr = new Date(a.fecha).toISOString().split('T')[0];
      
      if (!actividadAgrupada.has(fechaStr)) {
        actividadAgrupada.set(fechaStr, {
          fecha: fechaStr,
          ejerciciosRealizados: 0,
          quizzesRealizados: 0,
          temasAccedidos: 0
        });
      }

      const registro = actividadAgrupada.get(fechaStr)!;
      registro.ejerciciosRealizados += parseInt(a.ejercicios) || 0;
      registro.quizzesRealizados += parseInt(a.quizzes) || 0;
      registro.temasAccedidos += parseInt(a.temas) || 0;
    });

    return Array.from(actividadAgrupada.values()).sort((a, b) => 
      b.fecha.localeCompare(a.fecha)
    );
  }

  /**
   * Generar reporte comparativo con otros estudiantes
   * Endpoint: GET /api/v1/reportes/comparativo
   */
  async generarReporteComparativo(usuarioId: number): Promise<ReporteComparativoDto> {
    const statsUsuario = await AppDataSource.query(
      `SELECT 
        COUNT(DISTINCT ie.id) as total_intentos,
        SUM(CASE WHEN ie.resultado = 'correcto' THEN 1 ELSE 0 END) as correctos
       FROM intentos_ejercicios ie
       WHERE ie.usuario_id = $1`,
      [usuarioId]
    );

    const totalIntentos = parseInt(statsUsuario[0]?.total_intentos || '0');
    const correctos = parseInt(statsUsuario[0]?.correctos || '0');
    const promedioUsuario = totalIntentos > 0 
      ? Math.round((correctos / totalIntentos) * 100) 
      : 0;

    const statsGeneral = await AppDataSource.query(
      `SELECT 
        AVG(CASE 
          WHEN total_intentos > 0 
          THEN (correctos::float / total_intentos::float) * 100 
          ELSE 0 
        END) as promedio_general,
        COUNT(DISTINCT usuario_id) as total_estudiantes
       FROM (
         SELECT 
           usuario_id,
           COUNT(*) as total_intentos,
           SUM(CASE WHEN resultado = 'correcto' THEN 1 ELSE 0 END) as correctos
         FROM intentos_ejercicios
         GROUP BY usuario_id
       ) sub`
    );

    const promedioGeneral = Math.round(parseFloat(statsGeneral[0]?.promedio_general || '0'));
    const totalEstudiantes = parseInt(statsGeneral[0]?.total_estudiantes || '0');

    const ranking = await AppDataSource.query(
      `SELECT 
        usuario_id,
        RANK() OVER (ORDER BY (correctos::float / NULLIF(total_intentos, 0)::float) DESC) as posicion
       FROM (
         SELECT 
           usuario_id,
           COUNT(*) as total_intentos,
           SUM(CASE WHEN resultado = 'correcto' THEN 1 ELSE 0 END) as correctos
         FROM intentos_ejercicios
         GROUP BY usuario_id
       ) sub`
    );

    const miPosicion = ranking.find((r: any) => r.usuario_id === usuarioId);
    const posicionRanking = miPosicion ? parseInt(miPosicion.posicion) : totalEstudiantes;

    const percentil = totalEstudiantes > 0 
      ? Math.round((1 - (posicionRanking / totalEstudiantes)) * 100) 
      : 0;

    const mejorMateria = await AppDataSource.query(
      `SELECT 
        m.nombre,
        (SUM(CASE WHEN ie.resultado = 'correcto' THEN 1 ELSE 0 END)::float / COUNT(*)::float) * 100 as tasa
       FROM intentos_ejercicios ie
       INNER JOIN ejercicios e ON e.id = ie.ejercicio_id
       INNER JOIN subtemas s ON s.id = e.subtema_id
       INNER JOIN temas t ON t.id = s.tema_id
       INNER JOIN materias m ON m.id = t.materia_id
       WHERE ie.usuario_id = $1
       GROUP BY m.id, m.nombre
       HAVING COUNT(*) >= 3
       ORDER BY tasa DESC
       LIMIT 1`,
      [usuarioId]
    );

    const peorMateria = await AppDataSource.query(
      `SELECT 
        m.nombre,
        (SUM(CASE WHEN ie.resultado = 'correcto' THEN 1 ELSE 0 END)::float / COUNT(*)::float) * 100 as tasa
       FROM intentos_ejercicios ie
       INNER JOIN ejercicios e ON e.id = ie.ejercicio_id
       INNER JOIN subtemas s ON s.id = e.subtema_id
       INNER JOIN temas t ON t.id = s.tema_id
       INNER JOIN materias m ON m.id = t.materia_id
       WHERE ie.usuario_id = $1
       GROUP BY m.id, m.nombre
       HAVING COUNT(*) >= 3
       ORDER BY tasa ASC
       LIMIT 1`,
      [usuarioId]
    );

    return {
      usuarioId,
      promedioUsuario,
      promedioGeneral,
      posicionRanking,
      totalEstudiantes,
      percentil,
      materiaMejor: mejorMateria[0]?.nombre || 'N/A',
      materiaPeor: peorMateria[0]?.nombre || 'N/A'
    };
  }
}