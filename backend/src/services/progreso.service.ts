import { AppDataSource } from '../config/database';
import { Progreso, EstadoProgreso } from '../models/Progreso';
import { Repository } from 'typeorm';

export interface ActualizarProgresoDto {
  temaId: number;
  subtemaId?: number;
  estado: 'no_iniciado' | 'en_progreso' | 'completado';
  porcentajeCompletado?: number;
}

export interface ProgresoDto {
  id: number;
  usuarioId: number;
  temaId: number;
  subtemaId: number | null;
  estado: string;
  porcentajeCompletado: number;
  intentos: number;
  fechaUltimoAcceso: Date;
  temaNombre: string;
  subtemaNombre: string | null;
}

export class ProgresoService {
  private progresoRepository: Repository<Progreso>;

  constructor() {
    this.progresoRepository = AppDataSource.getRepository(Progreso);
  }

  /**
   * Obtener progreso de un estudiante en un tema especifico
   * Endpoint: GET /api/v1/progreso/tema/:temaId
   * Si no existe registro en tabla progreso, calcula basado en ejercicios
   */
  async obtenerProgresoEnTema(usuarioId: number, temaId: number): Promise<ProgresoDto | null> {
    console.log(`🔍 Buscando progreso: usuarioId=${usuarioId}, temaId=${temaId}`);
    
    // Primero intentar obtener de la tabla progreso
    const query = `
      SELECT 
        p.*,
        t.nombre as tema_nombre,
        s.nombre as subtema_nombre
      FROM progreso p
      INNER JOIN temas t ON t.id = p.tema_id
      LEFT JOIN subtemas s ON s.id = p.subtema_id
      WHERE p.usuario_id = $1 AND p.tema_id = $2
    `;

    const resultado = await AppDataSource.query(query, [usuarioId, temaId]);
    console.log(`📊 Registros en tabla progreso: ${resultado.length}`);

    // Si existe en la tabla, devolverlo
    if (resultado.length > 0) {
      const p = resultado[0];
      console.log(`✅ Progreso encontrado en BD: ${p.porcentaje_completado}%`);
      return {
        id: p.id,
        usuarioId: p.usuario_id,
        temaId: p.tema_id,
        subtemaId: p.subtema_id,
        estado: p.estado,
        porcentajeCompletado: parseFloat(p.porcentaje_completado) || 0,
        intentos: p.intentos || 0,
        fechaUltimoAcceso: p.fecha_ultimo_acceso,
        temaNombre: p.tema_nombre,
        subtemaNombre: p.subtema_nombre
      };
    }

    console.log(`🔢 No hay registro en BD, calculando basado en ejercicios...`);
    
    // Si NO existe, calcular progreso basado en ejercicios
    const queryCalcular = `
      SELECT 
        t.id as tema_id,
        t.nombre as tema_nombre,
        COUNT(DISTINCT e.id) as total_ejercicios,
        COUNT(DISTINCT CASE WHEN ie.resultado = 'correcto' THEN ie.ejercicio_id END) as ejercicios_correctos
      FROM temas t
      LEFT JOIN subtemas s ON s.tema_id = t.id
      LEFT JOIN ejercicios e ON e.subtema_id = s.id
      LEFT JOIN intentos_ejercicios ie ON ie.ejercicio_id = e.id 
        AND ie.usuario_id = $1
        AND ie.id IN (
          SELECT MAX(id) 
          FROM intentos_ejercicios 
          WHERE usuario_id = $1 
          GROUP BY ejercicio_id
        )
      WHERE t.id = $2
      GROUP BY t.id, t.nombre
    `;

    const resultadoCalculo = await AppDataSource.query(queryCalcular, [usuarioId, temaId]);

    if (resultadoCalculo.length === 0) {
      console.log(`❌ Tema ${temaId} no encontrado`);
      return null;
    }

    const calc = resultadoCalculo[0];
    const totalEjercicios = parseInt(calc.total_ejercicios) || 0;
    const ejerciciosCorrectos = parseInt(calc.ejercicios_correctos) || 0;
    const porcentajeCompletado = totalEjercicios > 0 
      ? Math.round((ejerciciosCorrectos / totalEjercicios) * 100)
      : 0;

    console.log(`📊 Cálculo: ${ejerciciosCorrectos}/${totalEjercicios} ejercicios = ${porcentajeCompletado}%`);

    // Determinar estado
    let estado: EstadoProgreso;
    if (porcentajeCompletado === 0) {
      estado = EstadoProgreso.NO_INICIADO;
    } else if (porcentajeCompletado === 100) {
      estado = EstadoProgreso.COMPLETADO;
    } else {
      estado = EstadoProgreso.EN_PROGRESO;
    }

    // Devolver progreso calculado (sin guardarlo en BD)
    return {
      id: 0, // ID temporal
      usuarioId: usuarioId,
      temaId: calc.tema_id,
      subtemaId: null,
      estado: estado,
      porcentajeCompletado: porcentajeCompletado,
      intentos: ejerciciosCorrectos,
      fechaUltimoAcceso: new Date(),
      temaNombre: calc.tema_nombre,
      subtemaNombre: null
    };
  }

  /**
   * Actualizar progreso de un estudiante en un tema
   * Funcion principal que Pancho usara
   * Endpoint: PUT /api/v1/progreso/actualizar
   */
  async actualizarProgreso(
    usuarioId: number,
    datos: ActualizarProgresoDto
  ): Promise<ProgresoDto> {
    const { temaId, subtemaId, estado, porcentajeCompletado } = datos;

    // Convertir string a enum (misma forma que en GenerateQuestionsUseCase.ts)
    let estadoEnum: EstadoProgreso;
    if (estado === 'completado') {
      estadoEnum = EstadoProgreso.COMPLETADO;
    } else if (estado === 'en_progreso') {
      estadoEnum = EstadoProgreso.EN_PROGRESO;
    } else {
      estadoEnum = EstadoProgreso.NO_INICIADO;
    }

    // Verificar si ya existe un registro de progreso
    const progresoExistente = await this.progresoRepository.findOne({
      where: {
        usuarioId: usuarioId,
        temaId: temaId
      }
    });

    if (progresoExistente) {
      // Actualizar progreso existente
      progresoExistente.estado = estadoEnum;
      progresoExistente.fechaUltimoAcceso = new Date();

      if (subtemaId) {
        progresoExistente.subtemaId = subtemaId;
      }

      if (porcentajeCompletado !== undefined) {
        progresoExistente.porcentajeCompletado = Math.min(100, Math.max(0, porcentajeCompletado));
      }

      // Si se marca como completado, asegurar 100%
      if (estadoEnum === EstadoProgreso.COMPLETADO) {
        progresoExistente.porcentajeCompletado = 100;
      }

      await this.progresoRepository.save(progresoExistente);
      
    } else {
      // Crear nuevo registro
      const nuevoProgreso = this.progresoRepository.create({
        usuarioId: usuarioId,
        temaId: temaId,
        subtemaId: subtemaId,
        estado: estadoEnum,
        porcentajeCompletado: estadoEnum === EstadoProgreso.COMPLETADO ? 100 : (porcentajeCompletado || 0),
        intentos: 0,
        fechaUltimoAcceso: new Date()
      });

      await this.progresoRepository.save(nuevoProgreso);
    }

    // Obtener datos completos para retornar
    const progresoCompleto = await this.obtenerProgresoEnTema(usuarioId, temaId);
    
    if (!progresoCompleto) {
      throw new Error('Error al obtener progreso actualizado');
    }

    return progresoCompleto;
  }

  /**
   * Calcular y actualizar progreso automaticamente basado en ejercicios completados
   * Esta funcion la llamara Pancho despues de completar ejercicios
   */
  async calcularYActualizarProgresoTema(
    usuarioId: number,
    temaId: number
  ): Promise<void> {
    const statsQuery = `
      SELECT 
        COUNT(DISTINCT e.id) as total_ejercicios,
        COUNT(DISTINCT CASE 
          WHEN ie.resultado = 'correcto' 
          THEN ie.ejercicio_id 
        END) as ejercicios_correctos
      FROM temas t
      LEFT JOIN subtemas s ON s.tema_id = t.id
      LEFT JOIN ejercicios e ON e.subtema_id = s.id
      LEFT JOIN intentos_ejercicios ie ON ie.ejercicio_id = e.id 
        AND ie.usuario_id = $1
        AND ie.id IN (
          SELECT MAX(id) 
          FROM intentos_ejercicios 
          WHERE usuario_id = $1 
          GROUP BY ejercicio_id
        )
      WHERE t.id = $2
    `;

    const stats = await AppDataSource.query(statsQuery, [usuarioId, temaId]);
    
    if (stats.length === 0) {
      return;
    }

    const totalEjercicios = parseInt(stats[0].total_ejercicios) || 0;
    const ejerciciosCorrectos = parseInt(stats[0].ejercicios_correctos) || 0;

    if (totalEjercicios === 0) {
      return;
    }

    const porcentaje = Math.round((ejerciciosCorrectos / totalEjercicios) * 100);
    
    let estado: 'no_iniciado' | 'en_progreso' | 'completado';
    if (porcentaje === 0) {
      estado = 'no_iniciado';
    } else if (porcentaje === 100) {
      estado = 'completado';
    } else {
      estado = 'en_progreso';
    }

    await this.actualizarProgreso(usuarioId, {
      temaId: temaId,
      estado: estado,
      porcentajeCompletado: porcentaje
    });
  }

  /**
   * Listar todo el progreso de un estudiante
   * Endpoint: GET /api/v1/progreso/mi-progreso
   */
  async listarProgresoEstudiante(usuarioId: number): Promise<ProgresoDto[]> {
    const query = `
      SELECT 
        p.*,
        t.nombre as tema_nombre,
        s.nombre as subtema_nombre,
        m.nombre as materia_nombre
      FROM progreso p
      INNER JOIN temas t ON t.id = p.tema_id
      INNER JOIN materias m ON m.id = t.materia_id
      LEFT JOIN subtemas s ON s.id = p.subtema_id
      WHERE p.usuario_id = $1
      ORDER BY p.fecha_ultimo_acceso DESC
    `;

    const resultados = await AppDataSource.query(query, [usuarioId]);

    return resultados.map((p: any) => ({
      id: p.id,
      usuarioId: p.usuario_id,
      temaId: p.tema_id,
      subtemaId: p.subtema_id,
      estado: p.estado,
      porcentajeCompletado: parseFloat(p.porcentaje_completado) || 0,
      intentos: p.intentos || 0,
      fechaUltimoAcceso: p.fecha_ultimo_acceso,
      temaNombre: p.tema_nombre,
      subtemaNombre: p.subtema_nombre
    }));
  }

  /**
   * Obtener resumen de progreso en una materia
   * Endpoint: GET /api/v1/progreso/materia/:materiaId
   */
  async obtenerProgresoEnMateria(usuarioId: number, materiaId: number): Promise<any> {
    // Calcular progreso basado en ejercicios (NO en tabla progreso)
    const query = `
      SELECT 
        m.id as materia_id,
        m.nombre as materia_nombre,
        COUNT(DISTINCT e.id) as total_ejercicios,
        COUNT(DISTINCT CASE WHEN ie.resultado = 'correcto' THEN ie.ejercicio_id END) as ejercicios_correctos
      FROM materias m
      INNER JOIN temas t ON t.materia_id = m.id
      LEFT JOIN subtemas s ON s.tema_id = t.id
      LEFT JOIN ejercicios e ON e.subtema_id = s.id
      LEFT JOIN intentos_ejercicios ie ON ie.ejercicio_id = e.id 
        AND ie.usuario_id = $1
        AND ie.id IN (
          SELECT MAX(id) 
          FROM intentos_ejercicios 
          WHERE usuario_id = $1 
          GROUP BY ejercicio_id
        )
      WHERE m.id = $2
      GROUP BY m.id, m.nombre
    `;

    const resultado = await AppDataSource.query(query, [usuarioId, materiaId]);

    if (resultado.length === 0) {
      throw new Error('Materia no encontrada');
    }

    const stats = resultado[0];
    const totalEjercicios = parseInt(stats.total_ejercicios) || 0;
    const ejerciciosCorrectos = parseInt(stats.ejercicios_correctos) || 0;
    const promedioProgreso = totalEjercicios > 0 
      ? Math.round((ejerciciosCorrectos / totalEjercicios) * 100)
      : 0;

    return {
      materiaId: stats.materia_id,
      materiaNombre: stats.materia_nombre,
      totalEjercicios: totalEjercicios,
      ejerciciosCompletados: ejerciciosCorrectos,
      promedioProgreso: promedioProgreso
    };
  }

  /**
   * Calcular progreso de todas las materias del estudiante
   * Retorna progreso por materia y progreso general
   */
  async calcularProgresoGeneral(usuarioId: number): Promise<any> {
    // Obtener todas las materias en las que está matriculado el estudiante
    const queryMaterias = `
      SELECT DISTINCT m.id as materia_id, m.nombre as materia_nombre
      FROM matriculas mat
      INNER JOIN materias m ON m.id = mat.materia_id
      WHERE mat.usuario_id = $1
    `;

    const materias = await AppDataSource.query(queryMaterias, [usuarioId]);

    // Calcular progreso para cada materia
    const progresosPorMateria = [];
    let totalEjerciciosGeneral = 0;
    let totalCompletadosGeneral = 0;

    for (const materia of materias) {
      // Calcular progreso basado en ejercicios completados
      const queryProgreso = `
        SELECT 
          COUNT(DISTINCT e.id) as total_ejercicios,
          COUNT(DISTINCT CASE 
            WHEN ie.resultado = 'correcto' 
            THEN ie.ejercicio_id 
          END) as ejercicios_completados
        FROM materias m
        INNER JOIN temas t ON t.materia_id = m.id
        LEFT JOIN subtemas s ON s.tema_id = t.id
        LEFT JOIN ejercicios e ON e.subtema_id = s.id
        LEFT JOIN intentos_ejercicios ie ON ie.ejercicio_id = e.id 
          AND ie.usuario_id = $1
        WHERE m.id = $2
      `;

      const resultado = await AppDataSource.query(queryProgreso, [usuarioId, materia.materia_id]);
      
      const totalEjercicios = parseInt(resultado[0].total_ejercicios) || 0;
      const ejerciciosCompletados = parseInt(resultado[0].ejercicios_completados) || 0;
      
      const porcentaje = totalEjercicios > 0 
        ? Math.round((ejerciciosCompletados / totalEjercicios) * 100)
        : 0;

      progresosPorMateria.push({
        materiaId: materia.materia_id,
        materiaNombre: materia.materia_nombre,
        totalEjercicios,
        ejerciciosCompletados,
        porcentajeCompletado: porcentaje
      });

      totalEjerciciosGeneral += totalEjercicios;
      totalCompletadosGeneral += ejerciciosCompletados;
    }

    // Calcular progreso general
    const progresoGeneral = totalEjerciciosGeneral > 0
      ? Math.round((totalCompletadosGeneral / totalEjerciciosGeneral) * 100)
      : 0;

    return {
      progresoGeneral,
      totalEjercicios: totalEjerciciosGeneral,
      ejerciciosCompletados: totalCompletadosGeneral,
      materias: progresosPorMateria
    };
  }
}