// src/services/user.service.ts

import { AppDataSource } from '../config/database';
import { Usuario } from '../models';
import { Repository } from 'typeorm';

export interface ActualizarPerfilDto {
  nombre?: string;
  apellido?: string;
  fotoPerfil?: string;
}

export interface ProgresoGeneralDto {
  usuario: {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
    matricula: string;
  };
  estadisticas: {
    materiasInscritas: number;
    temasCompletados: number;
    temasEnProgreso: number;
    temasNoIniciados: number;
    promedioGeneral: number;
    totalEjerciciosCompletados: number;
    totalQuizzesCompletados: number;
  };
  materiasDetalle: Array<{
    materia_id: number;
    nombreMateria: string;
    progreso: number;
    calificacion: number;
    temasCompletados: number;
    totalTemas: number;
    ultimoAcceso: Date;
  }>;
}

export class UserService {
  private usuarioRepository: Repository<Usuario>;

  constructor() {
    this.usuarioRepository = AppDataSource.getRepository(Usuario);
  }

  /**
   * Obtener perfil del usuario autenticado
   * @param Usuario_id - ID del usuario autenticado
   * @returns Información del perfil del usuario
   */
  async obtenerPerfil(Usuario_id: number) {
    const usuario = await this.usuarioRepository.findOne({
      where: { id: Usuario_id },
      select: [
        'id',
        'email',
        'nombre',
        'apellido',
        'rol',
        'matricula',
        'fotoPerfil',
        'estado'
      ]
    });

    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }

    return {
      id: usuario.id,
      email: usuario.email,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      rol: usuario.rol,
      matricula: usuario.matricula,
      fotoPerfil: usuario.fotoPerfil,
      estado: usuario.estado
    };
  }

  /**
   * Actualizar perfil del usuario
   * Solo permite actualizar: nombre, apellido, foto_perfil
   * NO permite cambiar: email, rol, contraseña
   * @param usuarioId - ID del usuario autenticado
   * @param datos - Datos a actualizar
   * @returns Perfil actualizado
   */
  async actualizarPerfil(usuarioId: number, datos: ActualizarPerfilDto) {
    const usuario = await this.usuarioRepository.findOne({
      where: { id: usuarioId }
    });

    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }

    // Validar que los datos sean válidos
    if (datos.nombre !== undefined) {
      if (!datos.nombre || datos.nombre.trim().length < 2) {
        throw new Error('El nombre debe tener al menos 2 caracteres');
      }
      usuario.nombre = datos.nombre.trim();
    }

    if (datos.apellido !== undefined) {
      if (!datos.apellido || datos.apellido.trim().length < 2) {
        throw new Error('El apellido debe tener al menos 2 caracteres');
      }
      usuario.apellido = datos.apellido.trim();
    }

    if (datos.fotoPerfil !== undefined) {
      // Validar URL si se proporciona
      if (datos.fotoPerfil && datos.fotoPerfil.trim().length > 0) {
        const urlPattern = /^https?:\/\/.+/;
        if (!urlPattern.test(datos.fotoPerfil)) {
          throw new Error('La foto de perfil debe ser una URL válida (http:// o https://)');
        }
        usuario.fotoPerfil = datos.fotoPerfil.trim();
      } else {
        usuario.fotoPerfil = "";
      }
    }

    // Guardar cambios
    await this.usuarioRepository.save(usuario);

    // Retornar perfil actualizado
    return {
      id: usuario.id,
      email: usuario.email,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      rol: usuario.rol,
      matricula: usuario.matricula,
      foto_perfil: usuario.fotoPerfil,
      estado: usuario.estado
    };
  }

  /**
   * Obtener progreso general del usuario en todas sus materias
   * Calcula estadísticas agregadas del progreso
   * @param usuarioId - ID del usuario autenticado
   * @returns Progreso general y por materia
   */
  async obtenerProgresoGeneral(usuarioId: number): Promise<ProgresoGeneralDto> {
    const usuario = await this.usuarioRepository.findOne({
      where: { id: usuarioId },
      relations: ['matriculas', 'matriculas.materia', 'progreso', 'progreso.tema']
    });

    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }

    // Obtener materias inscritas
    const materiasInscritas = usuario.matriculas?.filter(
      m => m.estado === 'activa'
    ) || [];

    // Obtener todos los intentos de ejercicios del usuario
    const intentosEjercicios = await AppDataSource.query(
      `SELECT COUNT(*) as total, 
              SUM(CASE WHEN resultado = 'correcto' THEN 1 ELSE 0 END) as correctos
       FROM intentos_ejercicios 
       WHERE usuario_id = $1`,
      [usuarioId]
    );

    // Obtener todos los intentos de quizzes del usuario
    const intentosQuizzes = await AppDataSource.query(
      `SELECT COUNT(*) as total,
              SUM(CASE WHEN es_correcta = true THEN 1 ELSE 0 END) as correctos
       FROM intentos_quiz
       WHERE usuario_id = $1`,
      [usuarioId]
    );

    // Calcular progreso por tema
    const progresosPorTema = usuario.progresos || [];
    const temasCompletados = progresosPorTema.filter(
      p => p.estado === 'completado'
    ).length;
    const temasEnProgreso = progresosPorTema.filter(
      p => p.estado === 'en_progreso'
    ).length;

    // Calcular progreso por materia
    const materiasDetalle = await Promise.all(
      materiasInscritas.map(async (matricula) => {
        // Obtener temas de la materia
        const temasMateria = await AppDataSource.query(
          `SELECT t.id, t.nombre
           FROM temas t
           WHERE t.materia_id = $1`,
          [matricula.materia.id]
        );

        const totalTemas = temasMateria.length;

        // Obtener progreso en los temas de esta materia
        const temasCompletadosMateria = progresosPorTema.filter(
          p => p.tema.materiaId === matricula.materia.id && p.estado === 'completado'
        ).length;

        // Calcular porcentaje de progreso
        const progresoMateria = totalTemas > 0 
          ? Math.round((temasCompletadosMateria / totalTemas) * 100) 
          : 0;

        // Obtener calificación promedio en esta materia
        const calificacionMateria = await AppDataSource.query(
          `SELECT AVG(ie.puntos_obtenidos) as promedio
           FROM intentos_ejercicios ie
           JOIN ejercicios e ON e.id = ie.ejercicio_id
           JOIN subtemas s ON s.id = e.subtema_id
           JOIN temas t ON t.id = s.tema_id
           WHERE t.materia_id = $1 AND ie.usuario_id = $2`,
          [matricula.materia.id, usuarioId]
        );

        // Obtener último acceso
        const ultimoAcceso = await AppDataSource.query(
          `SELECT MAX(p.fecha_ultimo_acceso) as ultimo_acceso
           FROM progreso p
           JOIN temas t ON t.id = p.tema_id
           WHERE t.materia_id = $1 AND p.usuario_id = $2`,
          [matricula.materia.id, usuarioId]
        );

        return {
          materia_id: matricula.materia.id,
          nombreMateria: matricula.materia.nombre,
          progreso: progresoMateria,
          calificacion: parseFloat(calificacionMateria[0]?.promedio || '0'),
          temasCompletados: temasCompletadosMateria,
          totalTemas: totalTemas,
          ultimoAcceso: ultimoAcceso[0]?.ultimo_acceso || null
        };
      })
    );

    // Calcular promedio general
    const promedioGeneral = materiasDetalle.length > 0
      ? materiasDetalle.reduce((sum, m) => sum + m.calificacion, 0) / materiasDetalle.length
      : 0;

    // Contar temas totales
    const totalTemasQuery = await AppDataSource.query(
      `SELECT COUNT(DISTINCT t.id) as total
       FROM temas t
       JOIN materias m ON m.id = t.materia_id
       JOIN matriculas mat ON mat.materia_id = m.id
       WHERE mat.usuario_id = $1 AND mat.estado = 'activa'`,
      [usuarioId]
    );
    const totalTemas = parseInt(totalTemasQuery[0]?.total || '0');
    const temasNoIniciados = totalTemas - temasCompletados - temasEnProgreso;

    return {
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        matricula: usuario.matricula || ''
      },
      estadisticas: {
        materiasInscritas: materiasInscritas.length,
        temasCompletados: temasCompletados,
        temasEnProgreso: temasEnProgreso,
        temasNoIniciados: Math.max(0, temasNoIniciados),
        promedioGeneral: Math.round(promedioGeneral * 100) / 100,
        totalEjerciciosCompletados: parseInt(intentosEjercicios[0]?.correctos || '0'),
        totalQuizzesCompletados: parseInt(intentosQuizzes[0]?.correctos || '0')
      },
      materiasDetalle: materiasDetalle
    };
  }
}