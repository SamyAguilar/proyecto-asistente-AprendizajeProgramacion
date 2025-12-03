// admin-frontend/src/api/ejercicios.api.ts
import axios from './axios.config';

export interface Ejercicio {
  id: number;
  subtemaId: number;
  enunciado: string;
  dificultad: 'basica' | 'intermedia' | 'avanzada';
  tipoEjercicio: 'codificacion' | 'multiple' | 'completar';
  puntosMaximos: number;
  lenguajeProgramacion?: string;
  codigoBase?: string;
  codigoSolucion?: string;
  opcionesRespuesta?: Array<{
    id: string;
    texto: string;
    esCorrecta: boolean;
  }>;
  textoConEspacios?: string;
  respuestasCorrectas?: string[];
}

export interface CreateEjercicioDto {
  subtemaId: number;
  enunciado: string;
  dificultad: 'basica' | 'intermedia' | 'avanzada';
  tipoEjercicio: 'codificacion' | 'multiple' | 'completar';
  puntosMaximos: number;
  lenguajeProgramacion?: string;
  codigoBase?: string;
  codigoSolucion?: string;
  opcionesRespuesta?: Array<{
    id: string;
    texto: string;
    esCorrecta: boolean;
  }>;
  textoConEspacios?: string;
  respuestasCorrectas?: string[];
}

export const ejerciciosApi = {
  // Obtener todos los ejercicios de un subtema
  getBySubtema: async (subtemaId: number): Promise<Ejercicio[]> => {
    const response = await axios.get(`/ejercicios/subtema/${subtemaId}`);
    return response.data.data || response.data;
  },

  // Obtener un ejercicio por ID (incluye código solución para admin)
  getById: async (id: number): Promise<Ejercicio> => {
    const response = await axios.get(`/admin/ejercicios/${id}`);
    return response.data.data || response.data;
  },

  // Crear un nuevo ejercicio
  create: async (data: CreateEjercicioDto): Promise<Ejercicio> => {
    const response = await axios.post('/admin/ejercicios', data);
    return response.data.data || response.data;
  },

  // Actualizar un ejercicio existente
  update: async (id: number, data: Partial<CreateEjercicioDto>): Promise<Ejercicio> => {
    const response = await axios.put(`/admin/ejercicios/${id}`, data);
    return response.data.data || response.data;
  },

  // Eliminar un ejercicio
  delete: async (id: number): Promise<void> => {
    await axios.delete(`/admin/ejercicios/${id}`);
  },
};