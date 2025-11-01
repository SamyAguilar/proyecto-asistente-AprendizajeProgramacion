import { Router } from "express";
import { temasController } from "../controllers/temas.controller";
import { authMiddleware } from "../middleware/authMiddleware";


const router = Router();

router.get("/materias/:materia_id/temas", authMiddleware, (req, res) => temasController.listarTemas(req, res));
router.get("/temas/:tema_id", authMiddleware, (req, res) => temasController.obtenerTema(req, res));

router.get("/temas/:tema_id/subtemas", authMiddleware, (req, res) => temasController.listarSubtemas(req, res));
router.get("/subtemas/:subtema_id", authMiddleware, (req, res) => temasController.obtenerSubtema(req, res));

export default router;
