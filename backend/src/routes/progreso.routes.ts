import { Router } from "express";
import { progresoController } from "../controllers/progreso.controller";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.get("/usuarios/progreso/:materia_id", authMiddleware, (req, res) => progresoController.obtenerProgresoMateria(req, res));
router.post("/progreso/actualizar", authMiddleware, (req, res) => progresoController.actualizar(req, res)); // si interno, luego poner autorización

export default router;
