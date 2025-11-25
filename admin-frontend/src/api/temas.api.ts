// src/api/temas.api.ts
import axiosInstance from './axios.config';
import type { Tema, CrearTemaDto, ActualizarTemaDto } from '../types/materia.types';

export const temasApi = {
  // Listar todos los temas de una materia
  getByMateria: async (materiaId: number): Promise<Tema[]> => {
    const { data } = await axiosInstance.get(`/materias/${materiaId}/temas`);
    return data.data;
  },

  // Obtener un tema por ID
  getById: async (id: number): Promise<Tema> => {
    const { data } = await axiosInstance.get(`/temas/${id}`);
    return data.data;
  },

  // Crear tema (ADMIN/PROFESOR)
  create: async (tema: CrearTemaDto): Promise<Tema> => {
    const { data } = await axiosInstance.post('/admin/temas', tema);
    return data.data;
  },

  // Actualizar tema (ADMIN/PROFESOR)
  update: async (id: number, tema: ActualizarTemaDto): Promise<Tema> => {
    const { data } = await axiosInstance.put(`/admin/temas/${id}`, tema);
    return data.data;
  },

  // Eliminar tema (ADMIN)
  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/admin/temas/${id}`);
  },
};