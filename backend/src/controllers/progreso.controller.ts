import { Request, Response } from "express";
import { progresoService } from "../services/progreso.service";

export class ProgresoController {
  async obtenerProgresoMateria(req: Request, res: Response) {
    const usuarioId = (req as any).user?.id;
    const { materia_id } = req.params;
    if (!usuarioId) return res.status(401).json({ message: "No autenticado" });
    const progreso = await progresoService.calcularProgresoUsuarioEnMateria(usuarioId, materia_id);
    res.json(progreso);
  }

  async actualizar(req: Request, res: Response) {
    // endpoint interno, protegido o llamado por Pancho
    const payload = req.body;
    const result = await progresoService.actualizarProgreso(payload);
    res.json(result);
  }
}
export const progresoController = new ProgresoController();
