import { RolUsuario } from '../models/Usuario';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        rol: RolUsuario;
      };
      userId?: number;
    }
  }
}