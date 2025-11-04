// backend/src/services/progreso.service.ts
import { AppDataSource } from "../config/database";
import { Progreso, EstadoProgreso } from "../models/Progreso";
import { DeepPartial } from "typeorm";

/* Raw SQL para cálculo detallado */
async function calcularProgresoUsuarioEnMateriaRaw(
  usuarioIdParam: number | string,
  materiaIdParam: number | string
) {
  const usuarioId = Number(usuarioIdParam);
  const materiaId = Number(materiaIdParam);

  const sql = `
    WITH latest_intentos AS (
      SELECT DISTINCT ON (ie.ejercicio_id) ie.ejercicio_id, ie.puntos_obtenidos, ie.resultado, ie.timestamp
      FROM intentos_ejercicios ie
      WHERE ie.usuario_id = $1
      ORDER BY ie.ejercicio_id, ie.timestamp DESC
    ),
    subtema_stats AS (
      SELECT
        s.id as subtema_id,
        s.nombre as subtema_nombre,
        s.tema_id as tema_id,
        COUNT(e.id) as total_ejercicios,
        COALESCE(SUM(CASE WHEN li.resultado = 'correcto' THEN 1 ELSE 0 END),0) as correctos,
        ROUND(COALESCE(AVG(li.puntos_obtenidos),0)::numeric,2) as promedio_calificacion
      FROM subtemas s
      LEFT JOIN ejercicios e ON e.subtema_id = s.id
      LEFT JOIN latest_intentos li ON li.ejercicio_id = e.id
      WHERE s.tema_id IN (SELECT id FROM temas WHERE materia_id = $2)
      GROUP BY s.id, s.nombre, s.tema_id
    ),
    tema_agg AS (
      SELECT
        t.id as tema_id,
        t.nombre as tema_nombre,
        COUNT(DISTINCT s.id) FILTER (WHERE s.id IS NOT NULL) as total_subtemas,
        COALESCE(SUM(ss.total_ejercicios),0) as total_ejercicios,
        COALESCE(SUM(ss.correctos),0) as total_correctos,
        CASE WHEN COALESCE(SUM(ss.total_ejercicios),0) > 0
          THEN ROUND( (SUM(ss.correctos)::numeric / SUM(ss.total_ejercicios)::numeric) * 100, 2)
          ELSE 0
        END as porcentaje_completado
      FROM temas t
      LEFT JOIN subtemas s ON s.tema_id = t.id
      LEFT JOIN (
        SELECT subtema_id, total_ejercicios, correctos
        FROM subtema_stats
      ) ss ON ss.subtema_id = s.id
      WHERE t.materia_id = $2
      GROUP BY t.id, t.nombre
      ORDER BY t.nombre
    ),
    temas_con_subtemas AS (
      SELECT
        ta.*,
        COALESCE((SELECT json_agg(json_build_object(
            'subtema_id', st.subtema_id,
            'nombre', st.subtema_nombre,
            'total_ejercicios', st.total_ejercicios,
            'correctos', st.correctos,
            'promedio_calificacion', st.promedio_calificacion,
            'porcentaje_completado_subtema',
              CASE WHEN st.total_ejercicios > 0 THEN ROUND((st.correctos::numeric / st.total_ejercicios::numeric) * 100, 2) ELSE 0 END
          ) ORDER BY st.subtema_nombre) FROM subtema_stats st WHERE st.tema_id = ta.tema_id), '[]'::json) as subtemas
      FROM tema_agg ta
    ),
    overall AS (
      SELECT
        CASE WHEN SUM(total_ejercicios) > 0 THEN ROUND((SUM(total_correctos)::numeric / SUM(total_ejercicios)::numeric) * 100, 2) ELSE 0 END as porcentaje_general
      FROM (SELECT total_ejercicios, total_correctos FROM tema_agg) x
    ),
    ultimo_acceso AS (
      SELECT to_char(MAX(p.fecha_ultimo_acceso), 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as ultimo
      FROM progreso p
      WHERE p.usuario_id = $1 AND p.tema_id IN (SELECT id FROM temas WHERE materia_id = $2)
    )
    SELECT json_build_object(
      'usuario_id', $1,
      'materia_id', $2,
      'porcentaje_general', (SELECT porcentaje_general FROM overall),
      'ultimo_acceso', (SELECT ultimo FROM ultimo_acceso),
      'temas', COALESCE((SELECT json_agg(t) FROM temas_con_subtemas t), '[]'::json)
    ) as result;
  `;

  const rows = await AppDataSource.query(sql, [usuarioId, materiaId]);
  return rows?.[0]?.result ?? null;
}

export class ProgresoService {
  private progresoRepo = AppDataSource.getRepository(Progreso);

  /** Método que usa el controller */
  async calcularProgresoUsuarioEnMateria(usuarioId: number | string, materiaId: number | string) {
    try {
      return await calcularProgresoUsuarioEnMateriaRaw(usuarioId, materiaId);
    } catch (err) {
      console.error("Error calcularProgresoUsuarioEnMateria:", err);
      throw err;
    }
  }

  async actualizarProgreso(payload: {
  usuarioId: number;
  temaId?: number | null;
  subtemaId?: number | null;
  nuevoEstado: EstadoProgreso;
}) {
  const { usuarioId, temaId, subtemaId, nuevoEstado } = payload;

  const qb = this.progresoRepo.createQueryBuilder("p")
    .where('p."usuario_id" = :usuarioId', { usuarioId });

  if (temaId !== undefined && temaId !== null) qb.andWhere('p."tema_id" = :temaId', { temaId });
  else qb.andWhere('p."tema_id" IS NULL');

  if (subtemaId !== undefined && subtemaId !== null) qb.andWhere('p."subtema_id" = :subtemaId', { subtemaId });
  else qb.andWhere('p."subtema_id" IS NULL');

  const existente = await qb.getOne();

  if (!existente) {
    const nuevo: DeepPartial<Progreso> = {
      usuarioId,
      temaId: temaId ?? undefined,
      subtemaId: subtemaId ?? undefined,
      estado: nuevoEstado,
      porcentajeCompletado: 0,
      fechaUltimoAcceso: new Date(),
      intentos: 0
    };

    const creado = this.progresoRepo.create(nuevo);
    await this.progresoRepo.save(creado);
    return { ok: true, created: true, message: "Progreso creado", progreso: creado };
  } else {
    existente.estado = nuevoEstado;
    existente.fechaUltimoAcceso = new Date();
    await this.progresoRepo.save(existente);
    return { ok: true, created: false, message: "Progreso actualizado", progreso: existente };
  }
}

  /** Helper que reutiliza la raw */
  async obtenerProgresoUsuario(usuarioId: number | string, materiaId: number | string) {
    return this.calcularProgresoUsuarioEnMateria(usuarioId, materiaId);
  }
}

// Exporta la instancia
export const progresoService = new ProgresoService();
