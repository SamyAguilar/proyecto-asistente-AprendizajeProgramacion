import { initializeDatabase } from "../src/config/database";
import { progresoService } from "../src/services/progreso.service";
import { EstadoProgreso } from "../src/models/Progreso";
(async () => {
  try {
    console.log("🔹 Inicializando base de datos...");
    await initializeDatabase();
    console.log("✅ Base de datos inicializada correctamente");

    // Actualizar o crear progreso
    console.log("🔹 Probando actualizarProgreso...");
    const resultado = await progresoService.actualizarProgreso({
      usuarioId: 1,
      temaId: 1,
      subtemaId: 1,
      nuevoEstado: EstadoProgreso.EN_PROGRESO,
    });
    console.log("✅ Resultado actualización:", resultado);

    // Obtener progreso del usuario
    console.log("🔹 Probando obtenerProgresoUsuario...");
    const progreso = await progresoService.obtenerProgresoUsuario(1, 1);
    console.log("✅ Progreso del usuario:", progreso);

  } catch (error) {
    console.error("❌ Ocurrió un error durante el test:", error);
  } finally {
    console.log("🔹 Test finalizado");
    process.exit(0); // Termina la ejecución explícitamente
  }
})();