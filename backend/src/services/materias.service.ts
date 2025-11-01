import { AppDataSource } from "../config/database";
import { Materia } from "../models/Materia";
import { Matricula } from "../models/Matricula";
import { Usuario } from "../models/Usuario";

export class MateriasService {
  private materiaRepo = AppDataSource.getRepository(Materia);
  private matriculaRepo = AppDataSource.getRepository(Matricula);
  private usuarioRepo = AppDataSource.getRepository(Usuario);

  async listar(pagina = 1, limit = 50, semestre?: number) {
    const qb = this.materiaRepo.createQueryBuilder("m");
    if (semestre) qb.where("m.semestre = :semestre", { semestre });
    qb.orderBy("m.nombre", "ASC").skip((pagina - 1) * limit).take(limit);
    const [items, total] = await qb.getManyAndCount();
    return { items, total };
  }

async obtenerPorId(id: string) {
  const materia = await this.materiaRepo.findOne({
    where: { id: Number(id) }, // <-- convertir string a number
    relations: ["temas", "prerequisitos"] // ajustar nombres si tu entidad se llama distinto
  });
  return materia;
}

  async matricular(usuarioId: string, materiaId: string) {
    // lógica aquí (ya la tienes)
  }
}

export const materiasService = new MateriasService();
