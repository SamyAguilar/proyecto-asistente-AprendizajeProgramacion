// src/types/materia.types.ts

// ============================================
// MATERIAS
// ============================================
export interface Materia {
  id: number;
  nombre: string;
  codigo: string;
  descripcion?: string;
  semestre?: number;
  creditos?: number;
  prerequisitos?: string;
  fechaCreacion: string;
}

export interface CrearMateriaDto {
  nombre: string;
  codigo: string;
  descripcion?: string;
  semestre?: number;
  creditos?: number;
  prerequisitos?: string;
}

export interface ActualizarMateriaDto {
  nombre?: string;
  codigo?: string;
  descripcion?: string;
  semestre?: number;
  creditos?: number;
  prerequisitos?: string;
}

// ============================================
// TEMAS
// ============================================
export interface Tema {
  id: number;
  materiaId: number;
  nombre: string;
  descripcion?: string;
  contenido?: string;
  orden?: number;
  totalSubtemas?: number;
  fechaCreacion: string;
}

export interface CrearTemaDto {
  materiaId: number;
  nombre: string;
  descripcion?: string;
  contenido?: string;
  orden?: number;
}

export interface ActualizarTemaDto {
  nombre?: string;
  descripcion?: string;
  contenido?: string;
  orden?: number;
}

// ============================================
// SUBTEMAS
// ============================================
export interface Subtema {
  id: number;
  temaId: number;
  nombre: string;
  descripcion?: string;
  contenidoDetalle?: string;
  orden?: number;
  totalEjercicios?: number;
  totalPreguntas?: number;
  fechaCreacion: string;
}

export interface CrearSubtemaDto {
  temaId: number;
  nombre: string;
  descripcion?: string;
  contenidoDetalle?: string;
  orden?: number;
}

export interface ActualizarSubtemaDto {
  nombre?: string;
  descripcion?: string;
  contenidoDetalle?: string;
  orden?: number;
}

// ============================================
// EJERCICIOS
// ============================================
export type DificultadEjercicio = 'basica' | 'intermedia' | 'avanzada';
export type TipoEjercicio = 'codificacion' | 'multiple' | 'completar';

export interface Ejercicio {
  id: number;
  subtemaId: number;
  enunciado: string;
  dificultad: DificultadEjercicio;
  tipoEjercicio: TipoEjercicio;
  puntosMaximos: number;
  lenguajeProgramacion?: string;
  codigoBase?: string;
  codigoSolucion?: string;
  casosPrueba?: any;
  fechaCreacion: string;
}

export interface CrearEjercicioDto {
  subtemaId: number;
  enunciado: string;
  dificultad: DificultadEjercicio;
  tipoEjercicio: TipoEjercicio;
  puntosMaximos: number;
  lenguajeProgramacion?: string;
  codigoBase?: string;
  codigoSolucion?: string;
  casosPrueba?: any;
}

export interface ActualizarEjercicioDto {
  enunciado?: string;
  dificultad?: DificultadEjercicio;
  tipoEjercicio?: TipoEjercicio;
  puntosMaximos?: number;
  lenguajeProgramacion?: string;
  codigoBase?: string;
  codigoSolucion?: string;
  casosPrueba?: any;
}

// ============================================
// API RESPONSES
// ============================================
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  mensaje?: string;
  error?: string;
}

export interface ApiListResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  mensaje?: string;
}

// ============================================
// AUTH
// ============================================
export interface LoginCredentials {
  email: string;
  contraseña: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  usuario: {
    id: number;
    email: string;
    nombre: string;
    apellido: string;
    rol: 'admin' | 'profesor' | 'estudiante';
  };
}