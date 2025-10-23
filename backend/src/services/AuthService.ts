import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/database';
import { Usuario, RolUsuario, EstadoUsuario } from '../models';
import { 
  logUserRegistration, 
  logLoginSuccess, 
  logLoginFailure,
  logError 
} from '../utils/logger';

/**
 * Interfaz para el registro de usuarios
 */
export interface RegistroDto {
  email: string;
  contraseña: string;
  nombre: string;
  apellido?: string;
  rol?: RolUsuario;
  matricula?: string;
}

/**
 * Interfaz para el login
 */
export interface LoginDto {
  email: string;
  contraseña: string;
}

/**
 * Interfaz para la respuesta de autenticación
 */
export interface AuthResponse {
  usuario: {
    id: number;
    email: string;
    nombre: string;
    apellido: string;
    rol: RolUsuario;
    matricula?: string;
  };
  accessToken: string;
  refreshToken: string;
}

/**
 * Servicio de Autenticación
 * Maneja registro, login, refresh tokens y logout
 */
export class AuthService {
  private usuarioRepository = AppDataSource.getRepository(Usuario);

  /**
   * Registrar nuevo usuario
   */
  async registro(data: RegistroDto): Promise<{ message: string; usuario: any }> {
    try {
      // 1. Verificar que el email no exista
      const usuarioExistente = await this.usuarioRepository.findOne({
        where: { email: data.email }
      });

      if (usuarioExistente) {
        throw new Error('El email ya está registrado');
      }

      // 2. Verificar que la matrícula no exista (si se proporciona)
      if (data.matricula) {
        const matriculaExistente = await this.usuarioRepository.findOne({
          where: { matricula: data.matricula }
        });

        if (matriculaExistente) {
          throw new Error('La matrícula ya está registrada');
        }
      }

      // 3. Hashear la contraseña
      const salt = await bcrypt.genSalt(10);
      const contraseñaHash = await bcrypt.hash(data.contraseña, salt);

      // 4. Crear el usuario
      const nuevoUsuario = this.usuarioRepository.create({
        email: data.email,
        contraseñaHash: contraseñaHash,
        nombre: data.nombre,
        apellido: data.apellido || '',
        rol: data.rol || RolUsuario.ESTUDIANTE,
        matricula: data.matricula,
        estado: EstadoUsuario.ACTIVO
      });

      // 5. Guardar en la base de datos
      const usuarioGuardado = await this.usuarioRepository.save(nuevoUsuario) as unknown as Usuario;

      // 6. Loguear el registro
      logUserRegistration(usuarioGuardado.id, usuarioGuardado.email, usuarioGuardado.rol);

      // 7. Retornar respuesta (sin contraseña)
      return {
        message: 'Usuario registrado exitosamente',
        usuario: {
          id: usuarioGuardado.id,
          email: usuarioGuardado.email,
          nombre: usuarioGuardado.nombre,
          apellido: usuarioGuardado.apellido,
          rol: usuarioGuardado.rol,
          matricula: usuarioGuardado.matricula
        }
      };
    } catch (error: any) {
      logError('Error en registro de usuario', error);
      throw error;
    }
  }

  /**
   * Login de usuario
   */
  async login(data: LoginDto, ip?: string): Promise<AuthResponse> {
    try {
      // 1. Buscar usuario por email
      const usuario = await this.usuarioRepository.findOne({
        where: { email: data.email }
      });

      if (!usuario) {
        logLoginFailure(data.email, ip, 'Usuario no encontrado');
        throw new Error('Credenciales inválidas');
      }

      // 2. Verificar que el usuario esté activo
      if (usuario.estado !== 'activo') {
        logLoginFailure(data.email, ip, 'Usuario inactivo o suspendido');
        throw new Error('La cuenta está inactiva o suspendida');
      }

      // 3. Verificar contraseña
      const contraseñaValida = await bcrypt.compare(
        data.contraseña,
        usuario.contraseñaHash
      );

      if (!contraseñaValida) {
        logLoginFailure(data.email, ip, 'Contraseña incorrecta');
        throw new Error('Credenciales inválidas');
      }

      // 4. Generar tokens
      const accessToken = this.generarAccessToken(usuario);
      const refreshToken = this.generarRefreshToken(usuario);

      // 5. Guardar refresh token en la base de datos
      // Nota: Aquí podrías crear una tabla separada para refresh tokens
      // Por ahora, lo simulamos actualizando el usuario
      // En producción, crea una tabla 'refresh_tokens' con expiración

      // 6. Loguear login exitoso
      logLoginSuccess(usuario.id, usuario.email, ip);

      // 7. Retornar respuesta
      return {
        usuario: {
          id: usuario.id,
          email: usuario.email,
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          rol: usuario.rol,
          matricula: usuario.matricula
        },
        accessToken,
        refreshToken
      };
    } catch (error: any) {
      logError('Error en login', error);
      throw error;
    }
  }

  /**
   * Refresh token - Generar nuevo access token
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

      if (!JWT_REFRESH_SECRET) {
        throw new Error('JWT_REFRESH_SECRET no configurado');
      }

      // 1. Verificar el refresh token
      const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as any;

      // 2. Buscar el usuario
      const usuario = await this.usuarioRepository.findOne({
        where: { id: decoded.userId }
      });

      if (!usuario) {
        throw new Error('Usuario no encontrado');
      }

      if (usuario.estado !== 'activo') {
        throw new Error('Usuario inactivo');
      }

      // 3. Generar nuevo access token
      const nuevoAccessToken = this.generarAccessToken(usuario);

      return {
        accessToken: nuevoAccessToken
      };
    } catch (error: any) {
      logError('Error al refrescar token', error);
      throw new Error('Refresh token inválido o expirado');
    }
  }

  /**
   * Logout - Invalidar refresh token
   */
  async logout(refreshToken: string): Promise<{ message: string }> {
    try {
      // En una implementación completa, aquí eliminarías el refresh token de la BD
      // Por ahora, solo retornamos un mensaje de éxito
      
      // TODO: Implementar tabla refresh_tokens y eliminar token específico
      
      return {
        message: 'Sesión cerrada exitosamente'
      };
    } catch (error: any) {
      logError('Error en logout', error);
      throw error;
    }
  }
  /**
   * Generar Access Token (JWT de corta duración)
   */
  private generarAccessToken(usuario: Usuario): string {
    const JWT_SECRET = process.env.JWT_SECRET;

    if (!JWT_SECRET) {
      throw new Error('JWT_SECRET no está configurado');
    }

    const payload = {
      userId: usuario.id,
      email: usuario.email,
      rol: usuario.rol
    };

    return jwt.sign(payload, JWT_SECRET, { 
      expiresIn: process.env.JWT_EXPIRATION || '1h' 
    } as any);
  }

  /**
   * Generar Refresh Token (JWT de larga duración)
   */
  private generarRefreshToken(usuario: Usuario): string {
    const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

    if (!JWT_REFRESH_SECRET) {
      throw new Error('JWT_REFRESH_SECRET no esta configurado');
    }

    const payload = {
      userId: usuario.id,
      email: usuario.email
    };

    return jwt.sign(payload, JWT_REFRESH_SECRET, { 
      expiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d' 
    } as any);
  }
}

export default new AuthService();