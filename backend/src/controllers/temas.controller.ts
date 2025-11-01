import { Request, Response } from "express";
import { temasService } from "../services/temas.service";

export class TemasController {
  async listarTemas(req: Request, res: Response) {
    const { materia_id } = req.params;
    const temas = await temasService.listarTemasPorMateria(materia_id);
    res.json(temas);
  }

  async obtenerTema(req: Request, res: Response) {
    const { tema_id } = req.params;
    const tema = await temasService.obtenerTema(tema_id);
    if (!tema) return res.status(404).json({ message: "Tema no encontrado" });
    res.json(tema);
  }

  async listarSubtemas(req: Request, res: Response) {
    const { tema_id } = req.params;
    const subtemas = await temasService.listarSubtemas(tema_id);
    res.json(subtemas);
  }

  async obtenerSubtema(req: Request, res: Response) {
    const { subtema_id } = req.params;
    const subtema = await temasService.obtenerSubtema(subtema_id);
    if (!subtema) return res.status(404).json({ message: "Subtema no encontrado" });
    res.json(subtema);
  }
}
export const temasController = new TemasController();
