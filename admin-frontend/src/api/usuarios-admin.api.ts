// src/api/usuarios-admin.api.ts
import axiosInstance from './axios.config';

export interface Usuario {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  rol: string;
  estado: string;
  fechaRegistro: string;
  ultimaConexion: string | null;
  totalMaterias: number;
  materiasCompletadas: number;
  progresoGeneral: number;
}

export interface EstudianteMateria {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  progresoMateria: number;
  fechaMatricula: string;
}

export interface Estadisticas {
  total_estudiantes: number;
  estudiantes_activos: number;
  estudiantes_suspendidos: number;
  total_materias: number;
  total_temas: number;
  total_ejercicios: number;
  total_matriculas: number;
  total_intentos: number;
}

// Listar todos los usuarios con progreso
export const listarUsuarios = async (): Promise<Usuario[]> => {
  const response = await axiosInstance.get('/admin/usuarios');
  return response.data.data;
};

// Cambiar estado de usuario
export const cambiarEstadoUsuario = async (
  usuarioId: number,
  estado: 'activo' | 'suspendido' | 'inactivo'
): Promise<void> => {
  await axiosInstance.put(`/admin/usuarios/${usuarioId}/estado`, { estado });
};

// Crear administrador
export const crearAdmin = async (data: {
  email: string;
  contraseña: string;
  nombre: string;
  apellido: string;
}): Promise<any> => {
  const response = await axiosInstance.post('/admin/usuarios/crear-admin', data);
  return response.data;
};

// Listar estudiantes por materia
export const listarEstudiantesPorMateria = async (materiaId: number): Promise<{
  materiaId: number;
  materiaNombre: string;
  totalEstudiantes: number;
  estudiantes: EstudianteMateria[];
}> => {
  const response = await axiosInstance.get(`/admin/materias/${materiaId}/estudiantes`);
  return response.data.data;
};

// Obtener estadísticas generales
export const obtenerEstadisticas = async (): Promise<Estadisticas> => {
  const response = await axiosInstance.get('/admin/estadisticas');
  return response.data.data;
};