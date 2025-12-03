import { RolUsuario } from '../models';

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

export {};