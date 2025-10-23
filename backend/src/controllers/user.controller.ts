// src/controllers/user.controller.ts

import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import logger from '../utils/logger';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  /**
   * GET /api/v1/usuarios/perfil
   * Obtener perfil del usuario autenticado
   */
  async obtenerPerfil(req: Request, res: Response): Promise<void> {
    try {
      // El usuario ya está autenticado por el middleware
      // @ts-ignore - req.usuario se agrega en el authMiddleware
      const usuarioId = req.usuario.id;

      const perfil = await this.userService.obtenerPerfil(usuarioId);

      res.status(200).json(perfil);
    } catch (error: any) {
      logger.error('Error al obtener perfil:', error);
      
      if (error.message === 'Usuario no encontrado') {
        res.status(404).json({
          error: 'Usuario no encontrado'
        });
        return;
      }

      res.status(500).json({
        error: 'Error interno del servidor al obtener perfil'
      });
    }
  }

  /**
   * PUT /api/v1/usuarios/perfil
   * Actualizar perfil del usuario autenticado
   * Permite actualizar: nombre, apellido, foto_perfil
   * NO permite cambiar: email, rol, contraseña
   */
  async actualizarPerfil(req: Request, res: Response): Promise<void> {
    try {
      // El usuario ya está autenticado por el middleware
      // @ts-ignore - req.usuario se agrega en el authMiddleware
      const usuarioId = req.usuario.id;

      // Extraer solo los campos permitidos
      const { nombre, apellido, fotoPerfil } = req.body;

      // Validar que al menos un campo se proporcione
      if (nombre === undefined && apellido === undefined && fotoPerfil === undefined) {
        res.status(400).json({
          error: 'Debe proporcionar al menos un campo para actualizar (nombre, apellido, foto_perfil)'
        });
        return;
      }

      // Advertir si se intentan cambiar campos no permitidos
      const camposNoPermitidos = ['email', 'rol', 'contraseña', 'password', 'contraseñaHash', 'matricula'];
      const camposIntentoActualizar = Object.keys(req.body).filter(campo => 
        camposNoPermitidos.includes(campo)
      );

      if (camposIntentoActualizar.length > 0) {
        logger.warn(`Usuario ${usuarioId} intentó actualizar campos no permitidos: ${camposIntentoActualizar.join(', ')}`);
        res.status(400).json({
          error: `No se permite actualizar los siguientes campos: ${camposIntentoActualizar.join(', ')}`,
          mensaje: 'Solo se pueden actualizar: nombre, apellido, foto_perfil'
        });
        return;
      }

      const perfilActualizado = await this.userService.actualizarPerfil(usuarioId, {
        nombre,
        apellido,
        fotoPerfil
      });

      logger.info(`Usuario ${usuarioId} actualizó su perfil`);

      res.status(200).json({
        mensaje: 'Perfil actualizado correctamente',
        usuario: perfilActualizado
      });
    } catch (error: any) {
      logger.error('Error al actualizar perfil:', error);

      if (error.message === 'Usuario no encontrado') {
        res.status(404).json({
          error: 'Usuario no encontrado'
        });
        return;
      }

      if (error.message.includes('debe tener al menos') || 
          error.message.includes('debe ser una URL válida')) {
        res.status(400).json({
          error: error.message
        });
        return;
      }

      res.status(500).json({
        error: 'Error interno del servidor al actualizar perfil'
      });
    }
  }

  /**
   * GET /api/v1/usuarios/progreso
   * Obtener progreso general del usuario en todas sus materias
   * Calcula estadísticas agregadas
   */
  async obtenerProgresoGeneral(req: Request, res: Response): Promise<void> {
    try {
      // El usuario ya está autenticado por el middleware
      // @ts-ignore - req.usuario se agrega en el authMiddleware
      const usuarioId = req.usuario.id;

      const progreso = await this.userService.obtenerProgresoGeneral(usuarioId);

      res.status(200).json(progreso);
    } catch (error: any) {
      logger.error('Error al obtener progreso general:', error);

      if (error.message === 'Usuario no encontrado') {
        res.status(404).json({
          error: 'Usuario no encontrado'
        });
        return;
      }

      res.status(500).json({
        error: 'Error interno del servidor al obtener progreso'
      });
    }
  }
}