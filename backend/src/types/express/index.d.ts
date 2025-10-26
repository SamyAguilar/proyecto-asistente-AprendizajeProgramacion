// backend/src/@types/express/index.d.ts

// Primero, declaramos el tipo 'Usuario' con las propiedades mínimas que usamos
// Si Sam ya definió 'Usuario', esta declaración lo fusionará.
declare interface Usuario {
    id: number;
    // Agrega las propiedades que uses en tu lógica aquí si es necesario (ej: email, isAdmin, etc.)
    // Si no las usas, con 'id' es suficiente para eliminar el error de TypeORM/Sam.
}

// Sobrescribe la interfaz Request de Express
declare namespace Express {
    // Esto asegura que la propiedad 'user' en el objeto Request
    // sea del tipo 'Usuario' (que es la que Sam espera),
    // y hacemos que coincida con lo que tu mock de autenticación inyecta.
    export interface Request {
        user?: Usuario; 
    }
}