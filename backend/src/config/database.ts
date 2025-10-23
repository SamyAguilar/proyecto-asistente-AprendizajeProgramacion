import { DataSource } from "typeorm";
import * as dotenv from "dotenv";
import e from "express";

dotenv.config();
export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || "posgres123",
    database: process.env.DB_NAME || "asistente_programacion",
    synchronize: process.env.NODE_ENV === "development",
    logging: process.env.NODE_ENV === "development",
    entities: ["src/models/**/*.ts"],
    migrations: ["src/migration/**/*.ts"],
    subscribers: [],
});

export const initializeDatabase = async () => {
    try {
        await AppDataSource.initialize();
        console.log("base de datos iniciada correctamente");
        return AppDataSource;
    } catch (error) {
        console.error("Error al iniciar la base de datos", error);
        throw error;
    }
};