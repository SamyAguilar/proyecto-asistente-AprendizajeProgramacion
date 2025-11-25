// src/api/ejercicios.api.ts
import axiosInstance from './axios.config';
import type { Ejercicio, CrearEjercicioDto, ActualizarEjercicioDto } from '../types/materia.types';

export const ejerciciosApi = {
  // Listar todos los ejercicios de un subtema
  getBySubtema: async (subtemaId: number): Promise<Ejercicio[]> => {
    const { data } = await axiosInstance.get(`/ejercicios/subtema/${subtemaId}`);
    return data.data;
  },

  // Obtener un ejercicio por ID
  getById: async (id: number): Promise<Ejercicio> => {
    const { data } = await axiosInstance.get(`/ejercicios/${id}`);
    return data.data;
  },

  // Crear ejercicio (ADMIN/PROFESOR)
  create: async (ejercicio: CrearEjercicioDto): Promise<Ejercicio> => {
    const { data } = await axiosInstance.post('/admin/ejercicios', ejercicio);
    return data.data;
  },

  // Actualizar ejercicio (ADMIN/PROFESOR)
  update: async (id: number, ejercicio: ActualizarEjercicioDto): Promise<Ejercicio> => {
    const { data } = await axiosInstance.put(`/admin/ejercicios/${id}`, ejercicio);
    return data.data;
  },

  // Eliminar ejercicio (ADMIN)
  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/admin/ejercicios/${id}`);
  },
};