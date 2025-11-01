import { AppDataSource } from "../config/database"; // <-- Asegúrate de que tu archivo se llame así
//import { ReportesService } from "../entities/ReportesService"; // <-- Si no existe esta entidad, puedes eliminar esta línea
// Si tienes servicios relacionados con progreso o usuarios, impórtalos aquí:
import { progresoService } from "./progreso.service"; 
import { Usuario } from "../models/Usuario";
import { Materia } from "../models/Materia";
import { Matricula } from "../models/Matricula";

export class ReportesService {
  /**
   * Reporte de desempeño de un usuario.
   * Si el requester es estudiante, solo puede ver su propio progreso.
   */
  async reporteDesempeno(usuarioId: string, requester: { id: string; role: string }) {
    // Verificar permisos
    if (requester.role === "estudiante" && requester.id !== usuarioId) {
      throw { status: 403, message: "No autorizado" };
    }

    // Consulta de materias cursadas
    const materias = await AppDataSource.query(
      `
      SELECT m.id, m.nombre,
        (SELECT COUNT(*) 
         FROM matriculas ma 
         WHERE ma."usuarioId" = $1 AND ma."materiaId" = m.id) AS inscrito
      FROM materias m
      WHERE EXISTS (
        SELECT 1 
        FROM matriculas ma 
        WHERE ma."usuarioId" = $1 AND ma."materiaId" = m.id
      )
      `,
      [usuarioId]
    );

    // Para cada materia, obtener el progreso
    const resultados = [];
    for (const mat of materias) {
      const progreso = await progresoService.calcularProgresoUsuarioEnMateria(usuarioId, mat.id);
      resultados.push({
        materia: mat.nombre,
        inscrito: mat.inscrito,
        progreso
      });
    }

    return { usuarioId, materias: resultados };
  }

  /**
   * Devuelve el progreso de todos los estudiantes en una materia específica.
   */
  async progresoPorMateria(materiaId: string) {
    const rows = await AppDataSource.query(
      `
      SELECT u.id AS usuario_id, u.email, COALESCE(p.porcentaje_completado, 0) AS porcentaje_completado
      FROM usuarios u
      LEFT JOIN progreso p ON p."usuarioId" = u.id AND p."materiaId" = $1
      `,
      [materiaId]
    );

    return rows;
  }

  /**
   * Reporte general de clase (placeholder para agregar estadísticas agregadas)
   */
  async reporteClase() {
    // Aquí podrías incluir: promedio general, número de alumnos, temas más difíciles, etc.
    return { ok: true, mensaje: "Reporte de clase en desarrollo" };
  }
}

export const reportesService = new ReportesService();
