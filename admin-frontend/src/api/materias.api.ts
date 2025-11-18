// src/api/materias.api.ts
import axiosInstance from './axios.config';
import type { Materia, CrearMateriaDto, ActualizarMateriaDto } from '../types/materia.types';

export const materiasApi = {
  // Listar todas las materias
  getAll: async (): Promise<Materia[]> => {
    const { data } = await axiosInstance.get('/materias');
    return data.data;
  },

  // Obtener una materia por ID
  getById: async (id: number): Promise<Materia> => {
    const { data } = await axiosInstance.get(`/materias/${id}`);
    return data.data;
  },

  // Buscar materias
  search: async (query: string): Promise<Materia[]> => {
    const { data } = await axiosInstance.get(`/materias/buscar?q=${query}`);
    return data.data;
  },

  // Crear materia (ADMIN)
  create: async (materia: CrearMateriaDto): Promise<Materia> => {
    const { data } = await axiosInstance.post('/admin/materias', materia);
    return data.data;
  },

  // Actualizar materia (ADMIN)
  update: async (id: number, materia: ActualizarMateriaDto): Promise<Materia> => {
    const { data } = await axiosInstance.put(`/admin/materias/${id}`, materia);
    return data.data;
  },

  // Eliminar materia (ADMIN)
  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/admin/materias/${id}`);
  },
};