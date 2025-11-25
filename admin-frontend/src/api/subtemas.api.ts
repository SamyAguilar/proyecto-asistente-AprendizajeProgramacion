// src/api/subtemas.api.ts
import axiosInstance from './axios.config';
import type { Subtema, CrearSubtemaDto, ActualizarSubtemaDto } from '../types/materia.types';

export const subtemasApi = {
  // Listar todos los subtemas de un tema
  getByTema: async (temaId: number): Promise<Subtema[]> => {
    const { data } = await axiosInstance.get(`/temas/${temaId}/subtemas`);
    return data.data;
  },

  // Obtener un subtema por ID
  getById: async (id: number): Promise<Subtema> => {
    const { data } = await axiosInstance.get(`/subtemas/${id}`);
    return data.data;
  },

  // Crear subtema (ADMIN/PROFESOR)
  create: async (subtema: CrearSubtemaDto): Promise<Subtema> => {
    const { data } = await axiosInstance.post('/admin/subtemas', subtema);
    return data.data;
  },

  // Actualizar subtema (ADMIN/PROFESOR)
  update: async (id: number, subtema: ActualizarSubtemaDto): Promise<Subtema> => {
    const { data } = await axiosInstance.put(`/admin/subtemas/${id}`, subtema);
    return data.data;
  },

  // Eliminar subtema (ADMIN)
  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/admin/subtemas/${id}`);
  },
};