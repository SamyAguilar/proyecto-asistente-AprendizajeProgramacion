import { AppDataSource } from "../config/database";
import { Tema } from "../models/Tema";
import { Subtema } from "../models/Subtema";

export class TemasService {
  private temaRepo = AppDataSource.getRepository(Tema);
  private subtemaRepo = AppDataSource.getRepository(Subtema);

  async listarTemasPorMateria(materiaId: string) {
    return this.temaRepo.find({
      where: { materiaId: Number(materiaId) }, // convertir string a number
      order: { orden: "ASC" }
    });
  }

  async obtenerTema(temaId: string) {
    return this.temaRepo.findOne({
      where: { id: Number(temaId) },
      relations: ["subtemas"]
    });
  }

  async listarSubtemas(temaId: string) {
    return this.subtemaRepo.find({
      where: { temaId: Number(temaId) },
      order: { orden: "ASC" }
    });
  }

  async obtenerSubtema(subtemaId: string) {
    return this.subtemaRepo.findOne({
      where: { id: Number(subtemaId) },
      relations: ["ejercicios"]
    });
  }
}

export const temasService = new TemasService();
