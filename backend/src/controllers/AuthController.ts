import { Request, Response } from 'express';
import authService from '../services/AuthService';
import { logError } from '../utils/logger';

/**
 * Controlador de Autenticación
 * Maneja las peticiones HTTP relacionadas con autenticación
 */
export class AuthController {
  /**
   * POST /api/v1/auth/registro
   * Registrar nuevo usuario
   */
  async registro(req: Request, res: Response): Promise<void> {
    try {
      const { email, contraseña, nombre, apellido, rol, matricula } = req.body;

      // Validaciones básicas
      if (!email || !contraseña || !nombre) {
        res.status(400).json({
          error: 'Datos incompletos',
          message: 'Email, contraseña y nombre son requeridos'
        });
        return;
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        res.status(400).json({
          error: 'Email inválido',
          message: 'El formato del email no es válido'
        });
        return;
      }

      // Validar longitud de contraseña
      if (contraseña.length < 6) {
        res.status(400).json({
          error: 'Contraseña débil',
          message: 'La contraseña debe tener al menos 6 caracteres'
        });
        return;
      }

      const resultado = await authService.registro({
        email,
        contraseña,
        nombre,
        apellido,
        rol,
        matricula
      });

      res.status(201).json(resultado);
    } catch (error: any) {
      logError('Error en controlador de registro', error);
      
      if (error.message.includes('email ya está registrado')) {
        res.status(409).json({
          error: 'Email duplicado',
          message: error.message
        });
        return;
      }

      if (error.message.includes('matrícula ya está registrada')) {
        res.status(409).json({
          error: 'Matrícula duplicada',
          message: error.message
        });
        return;
      }

      res.status(500).json({
        error: 'Error en el servidor',
        message: 'No se pudo registrar el usuario'
      });
    }
  }

  /**
   * POST /api/v1/auth/login
   * Iniciar sesión
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, contraseña } = req.body;

      // Validaciones básicas
      if (!email || !contraseña) {
        res.status(400).json({
          error: 'Datos incompletos',
          message: 'Email y contraseña son requeridos'
        });
        return;
      }

      const ip = req.ip || req.socket.remoteAddress;
      const resultado = await authService.login({ email, contraseña }, ip);

      res.status(200).json(resultado);
    } catch (error: any) {
      logError('Error en controlador de login', error);

      if (error.message.includes('Credenciales inválidas')) {
        res.status(401).json({
          error: 'Autenticación fallida',
          message: 'Email o contraseña incorrectos'
        });
        return;
      }

      if (error.message.includes('inactiva o suspendida')) {
        res.status(403).json({
          error: 'Cuenta inactiva',
          message: error.message
        });
        return;
      }

      res.status(500).json({
        error: 'Error en el servidor',
        message: 'No se pudo iniciar sesión'
      });
    }
  }

  /**
   * POST /api/v1/auth/refresh-token
   * Renovar access token
   */
  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({
          error: 'Datos incompletos',
          message: 'Refresh token es requerido'
        });
        return;
      }

      const resultado = await authService.refreshToken(refreshToken);

      res.status(200).json(resultado);
    } catch (error: any) {
      logError('Error en refresh token', error);

      res.status(401).json({
        error: 'Refresh token inválido',
        message: 'El refresh token es inválido o ha expirado'
      });
    }
  }

  /**
   * POST /api/v1/auth/logout
   * Cerrar sesión
   */
  async logout(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({
          error: 'Datos incompletos',
          message: 'Refresh token es requerido'
        });
        return;
      }

      const resultado = await authService.logout(refreshToken);

      res.status(200).json(resultado);
    } catch (error: any) {
      logError('Error en logout', error);

      res.status(500).json({
        error: 'Error en el servidor',
        message: 'No se pudo cerrar la sesión'
      });
    }
  }
}

export default new AuthController();