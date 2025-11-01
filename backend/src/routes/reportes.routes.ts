import { Router } from "express";
import { reportesController } from "../controllers/reportes.controller";
import { authMiddleware } from "../middleware/authMiddleware";
import { roleMiddleware } from "../middleware/roleMiddleware";
import { RolUsuario } from "../models"; // importa el enum de roles

const router = Router();

router.get(
  "/reportes/desempeno/:usuario_id",
  authMiddleware,
  (req, res) => reportesController.desempeño(req, res)
);

router.get(
  "/reportes/progreso/:materia_id",
  authMiddleware,
  roleMiddleware(RolUsuario.PROFESOR, RolUsuario.ADMIN),
  (req, res) => reportesController.progresoMateria(req, res)
);

router.get(
  "/admin/reportes/clase",
  authMiddleware,
  roleMiddleware(RolUsuario.PROFESOR, RolUsuario.ADMIN),
  (req, res) => reportesController.clase(req, res)
);

export default router;
