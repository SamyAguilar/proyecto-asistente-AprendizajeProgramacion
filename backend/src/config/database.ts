import { DataSource } from "typeorm";
import * as dotenv from "dotenv";

dotenv.config();

// Detectar si estamos en producción (Render pone NODE_ENV=production)
const isProduction = process.env.NODE_ENV === 'production';

export const AppDataSource = new DataSource({
    type: "postgres",
    
    // 1. IMPORTANTE: Usar la URL de conexión si existe (Render la provee)
    url: process.env.DATABASE_URL, 
    
    // 2. Fallback a variables individuales (para tu desarrollo local)
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || "posgres123",
    database: process.env.DB_NAME || "asistente_programacion",
    
    // 3. Configuración de TypeORM
    // En producción no uses synchronize true, mejor usa migraciones, 
    // pero para este despliegue inicial lo dejaremos así para que cree las tablas.
    synchronize: true, 
    logging: !isProduction, // Menos logs en producción
    
    // 4. IMPORTANTE: Rutas dinámicas para archivos TS (local) o JS (producción/dist)
    entities: isProduction ? ["dist/models/**/*.js"] : ["src/models/**/*.ts"],
    migrations: isProduction ? ["dist/migration/**/*.js"] : ["src/migration/**/*.ts"],
    
    subscribers: [],
    
    // 5. CRÍTICO PARA RENDER: SSL es obligatorio para conectar a la DB externa
    ssl: isProduction ? { rejectUnauthorized: false } : false,
});

export const initializeDatabase = async () => {
    try {
        await AppDataSource.initialize();
        console.log(isProduction ? "Base de datos (Nube) conectada" : "Base de datos (Local) conectada");
        return AppDataSource;
    } catch (error) {
        console.error("Error al iniciar la base de datos:", error);
        throw error;
    }
};