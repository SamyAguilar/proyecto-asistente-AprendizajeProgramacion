import { AppDataSource } from '../config/database';
import { Usuario, EstadoUsuario, RolUsuario } from '../models/Usuario';
import { Repository } from 'typeorm';
import bcrypt from 'bcrypt';

export interface UsuarioConProgresoDto {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  rol: string;
  estado: string;
  fechaRegistro: Date;
  ultimaConexion: Date | null;
  totalMaterias: number;
  materiasCompletadas: number;
  progresoGeneral: number;
}

export interface EstudiantesPorMateriaDto {
  materiaId: number;
  materiaNombre: string;
  totalEstudiantes: number;
  estudiantes: {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
    progresoMateria: number;
    fechaMatricula: Date;
  }[];
}

export class UsuarioAdminService {
  private usuarioRepository: Repository<Usuario>;

  constructor() {
    this.usuarioRepository = AppDataSource.getRepository(Usuario);
  }

  /**
   * Listar todos los usuarios con su progreso
   */
  async listarUsuariosConProgreso(): Promise<UsuarioConProgresoDto[]> {
    const query = `
      SELECT 
        u.id,
        u.email,
        u.nombre,
        u.apellido,
        u.rol,
        u.estado,
        u.fecha_registro,
        MAX(ie.fecha_intento) as ultima_conexion,
        COUNT(DISTINCT mat.materia_id) as total_materias,
        COUNT(DISTINCT CASE WHEN p.estado = 'completado' THEN mat.materia_id END) as materias_completadas,
        COALESCE(
          ROUND(
            AVG(
              CASE 
                WHEN p.porcentaje_completado IS NOT NULL 
                THEN p.porcentaje_completado::numeric 
                ELSE 0 
              END
            ), 2
          ), 0
        ) as progreso_general
      FROM usuarios u
      LEFT JOIN matriculas mat ON mat.usuario_id = u.id
      LEFT JOIN intentos_ejercicios ie ON ie.usuario_id = u.id
      LEFT JOIN progreso p ON p.usuario_id = u.id
      WHERE u.rol = 'estudiante'
      GROUP BY u.id, u.email, u.nombre, u.apellido, u.rol, u.estado, u.fecha_registro
      ORDER BY u.fecha_registro DESC
    `;

    const resultados = await AppDataSource.query(query);

    return resultados.map((r: any) => ({
      id: r.id,
      email: r.email,
      nombre: r.nombre,
      apellido: r.apellido,
      rol: r.rol,
      estado: r.estado,
      fechaRegistro: r.fecha_registro,
      ultimaConexion: r.ultima_conexion,
      totalMaterias: parseInt(r.total_materias) || 0,
      materiasCompletadas: parseInt(r.materias_completadas) || 0,
      progresoGeneral: parseFloat(r.progreso_general) || 0
    }));
  }

  /**
   * Listar estudiantes inscritos en una materia específica
   */
  async listarEstudiantesPorMateria(materiaId: number): Promise<EstudiantesPorMateriaDto> {
    // Obtener info de la materia
    const materiaQuery = `SELECT id, nombre FROM materias WHERE id = $1`;
    const materiaResult = await AppDataSource.query(materiaQuery, [materiaId]);

    if (materiaResult.length === 0) {
      throw new Error('Materia no encontrada');
    }

    const materia = materiaResult[0];

    // Obtener estudiantes y su progreso
    // CORRECCIÓN: Se cambió 'fecha_matricula' por 'fecha_inicio'
    const estudiantesQuery = `
      SELECT 
        u.id,
        u.nombre,
        u.apellido,
        u.email,
        mat.fecha_inicio as fecha_matricula, 
        COALESCE(
          (
            SELECT ROUND(
              (COUNT(DISTINCT CASE WHEN ie.resultado = 'correcto' THEN ie.ejercicio_id END)::numeric / 
               NULLIF(COUNT(DISTINCT e.id), 0)::numeric) * 100, 2
            )
            FROM temas t
            LEFT JOIN subtemas s ON s.tema_id = t.id
            LEFT JOIN ejercicios e ON e.subtema_id = s.id
            LEFT JOIN intentos_ejercicios ie ON ie.ejercicio_id = e.id 
              AND ie.usuario_id = u.id
              AND ie.id IN (
                SELECT MAX(id) 
                FROM intentos_ejercicios 
                WHERE usuario_id = u.id 
                GROUP BY ejercicio_id
              )
            WHERE t.materia_id = $1
          ), 0
        ) as progreso_materia
      FROM usuarios u
      INNER JOIN matriculas mat ON mat.usuario_id = u.id
      WHERE mat.materia_id = $1
      ORDER BY mat.fecha_inicio DESC
    `;

    const estudiantes = await AppDataSource.query(estudiantesQuery, [materiaId]);

    return {
      materiaId: materia.id,
      materiaNombre: materia.nombre,
      totalEstudiantes: estudiantes.length,
      estudiantes: estudiantes.map((e: any) => ({
        id: e.id,
        nombre: e.nombre,
        apellido: e.apellido,
        email: e.email,
        progresoMateria: parseFloat(e.progreso_materia) || 0,
        fechaMatricula: e.fecha_matricula // Ahora coincide con el alias del SELECT
      }))
    };
  }

  /**
   * Cambiar estado de un usuario (suspender, desactivar, activar)
   */
  async cambiarEstadoUsuario(usuarioId: number, nuevoEstado: EstadoUsuario): Promise<Usuario> {
    const usuario = await this.usuarioRepository.findOne({
      where: { id: usuarioId }
    });

    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }

    usuario.estado = nuevoEstado;
    return await this.usuarioRepository.save(usuario);
  }

  /**
   * Crear usuario administrador
   */
  async crearAdmin(datos: {
    email: string;
    contraseña: string;
    nombre: string;
    apellido: string;
  }): Promise<Usuario> {
    // Verificar si ya existe
    const existente = await this.usuarioRepository.findOne({
      where: { email: datos.email }
    });

    if (existente) {
      throw new Error('El email ya está registrado');
    }

    // Hash de contraseña
    const contraseñaHash = await bcrypt.hash(datos.contraseña, 10);

    // Crear usuario admin
    const nuevoAdmin = this.usuarioRepository.create({
      email: datos.email,
      contraseñaHash: contraseñaHash,
      nombre: datos.nombre,
      apellido: datos.apellido,
      rol: RolUsuario.ADMIN,
      estado: EstadoUsuario.ACTIVO
    });

    return await this.usuarioRepository.save(nuevoAdmin);
  }

  /**
   * Obtener estadísticas generales del sistema
   */
  async obtenerEstadisticasGenerales(): Promise<any> {
    const query = `
      SELECT 
        (SELECT COUNT(*) FROM usuarios WHERE rol = 'estudiante') as total_estudiantes,
        (SELECT COUNT(*) FROM usuarios WHERE rol = 'estudiante' AND estado = 'activo') as estudiantes_activos,
        (SELECT COUNT(*) FROM usuarios WHERE rol = 'estudiante' AND estado = 'suspendido') as estudiantes_suspendidos,
        (SELECT COUNT(*) FROM materias) as total_materias,
        (SELECT COUNT(*) FROM temas) as total_temas,
        (SELECT COUNT(*) FROM ejercicios) as total_ejercicios,
        (SELECT COUNT(*) FROM matriculas) as total_matriculas,
        (SELECT COUNT(*) FROM intentos_ejercicios) as total_intentos
    `;

    const resultado = await AppDataSource.query(query);
    return resultado[0];
  }
}