import * as dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  database : {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || '5432',
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'posgres123',
    name: process.env.DB_NAME || 'asistente_programacion',
},
jwt: {
    secret: process.env.JWT_SECRET || 'pruebaproyecto',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'pruebaproyecto1',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',   
},
rateLimit: {
    windows: parseInt(process.env.RATE_LIMIT_WINDOW || '900000'), // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
}
};


