import { Request, Response } from "express";
import { reportesService } from "../services/reportes.service";

export class ReportesController {
  async desempeño(req: Request, res: Response) {
    const requester = (req as any).user;
    const { usuario_id } = req.params;
    try {
      const r = await reportesService.reporteDesempeno(usuario_id, requester);
      res.json(r);
    } catch (err:any) {
      res.status(err.status || 500).json({ message: err.message || "Error" });
    }
  }

  async progresoMateria(req: Request, res: Response) {
    const { materia_id } = req.params;
    const r = await reportesService.progresoPorMateria(materia_id);
    res.json(r);
  }

  async clase(req: Request, res: Response) {
    // requiere role middleware
    const r = await reportesService.reporteClase();
    res.json(r);
  }
}
export const reportesController = new ReportesController();
