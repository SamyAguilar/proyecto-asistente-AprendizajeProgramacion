import { Request, Response } from "express";
import { materiasService } from "../services/materias.service";

export class MateriasController {
  async listar(req: Request, res: Response) {
    const { semestre, page, limit } = req.query;
    const data = await materiasService.listar(Number(page) || 1, Number(limit) || 50, semestre ? Number(semestre) : undefined);
    res.json(data);
  }

  async obtener(req: Request, res: Response) {
    const { id } = req.params;
    const m = await materiasService.obtenerPorId(id);
    if (!m) return res.status(404).json({ message: "Materia no encontrada" });
    res.json(m);
  }

  async matricular(req: Request, res: Response) {
    const usuarioId = (req as any).user?.id;
    const { id } = req.params;
    if (!usuarioId) return res.status(401).json({ message: "No autenticado" });
    try {
      const matricula = await materiasService.matricular(usuarioId, id);
      res.json({ message: "Matriculado", matricula });
    } catch (err: any) {
      res.status(err.status || 500).json({ message: err.message || "Error" });
    }
  }
}

export const materiasController = new MateriasController();
