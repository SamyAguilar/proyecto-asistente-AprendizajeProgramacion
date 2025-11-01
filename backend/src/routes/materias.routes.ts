import { Router } from "express";
import { materiasController } from "../controllers/materias.controller";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.get("/", authMiddleware, (req, res) => materiasController.listar(req, res));
router.get("/:id", authMiddleware, (req, res) => materiasController.obtener(req, res));
router.post("/:id/matricular", authMiddleware, (req, res) => materiasController.matricular(req, res));

export default router;
