import { AppDataSource } from "../config/database";
import { Progreso, EstadoProgreso } from "../models/Progreso";

export class ProgresoService {
  private progresoRepo = AppDataSource.getRepository(Progreso);

  /**
   * Actualiza o crea un registro de progreso para un usuario en un tema/subtema.
   */
  async actualizarProgreso(payload: {
    usuarioId: number;
    temaId?: number;
    subtemaId?: number;
    nuevoEstado: EstadoProgreso;
  }) {
    const { usuarioId, temaId, subtemaId, nuevoEstado } = payload;

    // Buscar progreso existente usando undefined en lugar de null
    let progreso = await this.progresoRepo.findOne({
      where: {
        usuarioId,
        temaId: temaId ?? undefined,
        subtemaId: subtemaId ?? undefined,
      },
    });

    if (!progreso) {
      // Crear registro nuevo
      progreso = this.progresoRepo.create({
        usuarioId,
        temaId: temaId ?? undefined,
        subtemaId: subtemaId ?? undefined,
        estado: nuevoEstado,
        porcentajeCompletado: 0,
        fechaUltimoAcceso: new Date(),
      });
    } else {
      // Actualizar registro existente
      progreso.estado = nuevoEstado;
      progreso.fechaUltimoAcceso = new Date();
    }

    await this.progresoRepo.save(progreso);

    return { ok: true, message: "Progreso actualizado correctamente" };
  }

  /**
   * Obtiene el progreso de un usuario en una materia.
   * Devuelve un JSON con porcentaje general y detalle por tema y subtema.
   */
  async obtenerProgresoUsuario(usuarioId: number, materiaId: number) {
    const sql = `
      SELECT json_build_object(
        'usuario_id', $1,
        'materia_id', $2,
        'porcentaje_general', COALESCE(ROUND(AVG(p.porcentaje_completado)::numeric, 2), 0),
        'ultimo_acceso', MAX(p.fecha_ultimo_acceso),
        'detalle', json_agg(
          json_build_object(
            'tema_id', t.id,
            'tema_nombre', t.nombre,
            'subtemas', (
              SELECT json_agg(
                json_build_object(
                  'subtema_id', s.id,
                  'subtema_nombre', s.nombre,
                  'estado', COALESCE(p2.estado, 'no_iniciado'),
                  'porcentaje_completado', COALESCE(p2.porcentaje_completado, 0)
                )
              )
              FROM subtemas s
              LEFT JOIN progreso p2
                ON p2.subtemaId = s.id AND p2.usuarioId = $1
              WHERE s.temaId = t.id
            )
          )
        )
      ) AS result
      FROM temas t
      LEFT JOIN progreso p ON p.temaId = t.id AND p.usuarioId = $1
      WHERE t.materiaId = $2
      GROUP BY t.id
    `;

    const rows = await AppDataSource.query(sql, [usuarioId, materiaId]);
    if (!rows || rows.length === 0) return null;
    return rows[0].result;
  }
}

// Exportamos la instancia lista para usar
export const progresoService = new ProgresoService();
