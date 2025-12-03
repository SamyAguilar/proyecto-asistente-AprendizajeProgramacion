import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { IsNotEmpty, IsEnum, IsInt, Min, Max, IsOptional, Length } from 'class-validator';
import { Subtema } from './Subtema';
import { IntentoEjercicio } from './IntentoEjercicio';

export enum DificultadEjercicio {
  BASICA = 'basica',
  INTERMEDIA = 'intermedia',
  AVANZADA = 'avanzada'
}

export enum TipoEjercicio {
  CODIFICACION = 'codificacion',
  MULTIPLE = 'multiple',
  COMPLETAR = 'completar'
}

@Entity('ejercicios')
export class Ejercicio {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'subtema_id' })
  subtemaId: number;

  @Column({ type: 'text' })
  @IsNotEmpty({ message: 'El enunciado del ejercicio es requerido' })
  enunciado: string;

  @Column({
    type: 'enum',
    enum: DificultadEjercicio,
    nullable: true
  })
  @IsOptional()
  @IsEnum(DificultadEjercicio, { message: 'La dificultad debe ser basica, intermedia o avanzada' })
  dificultad: DificultadEjercicio;

  @Column({ type: 'text', nullable: true, name: 'codigo_base' })
  @IsOptional()
  codigoBase: string;

  @Column({ type: 'text', nullable: true, name: 'codigo_solucion' })
  @IsOptional()
  codigoSolucion: string;

  @Column({ type: 'jsonb', nullable: true, name: 'casos_prueba' })
  @IsOptional()
  casosPrueba: any;

  @Column({
    type: 'enum',
    enum: TipoEjercicio,
    nullable: true,
    name: 'tipo_ejercicio'
  })
  @IsOptional()
  @IsEnum(TipoEjercicio, { message: 'El tipo debe ser codificacion, multiple o completar' })
  tipoEjercicio: TipoEjercicio;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'lenguaje_programacion' })
  @IsOptional()
  @Length(2, 50, { message: 'El lenguaje debe tener entre 2 y 50 caracteres' })
  lenguajeProgramacion: string;

  @Column({ type: 'int', default: 10, name: 'puntos_maximos' })
  @IsInt({ message: 'Los puntos maximos deben ser un numero entero' })
  @Min(1, { message: 'Los puntos maximos deben ser mayor a 0' })
  @Max(100, { message: 'Los puntos maximos deben ser menor o igual a 100' })
  puntosMaximos: number;

  // NUEVOS CAMPOS PARA EJERCICIOS MÚLTIPLE Y COMPLETAR
  
  // Para ejercicios de opción múltiple
  @Column({ type: 'jsonb', nullable: true, name: 'opciones_respuesta' })
  @IsOptional()
  opcionesRespuesta: {
    id: string;
    texto: string;
    esCorrecta: boolean;
  }[];

  // Para ejercicios de completar
  @Column({ type: 'text', nullable: true, name: 'texto_con_espacios' })
  @IsOptional()
  textoConEspacios: string; // Ej: "Una ____ es una estructura de datos que almacena ____"

  @Column({ type: 'jsonb', nullable: true, name: 'respuestas_correctas' })
  @IsOptional()
  respuestasCorrectas: string[]; // Ej: ["función", "valores"]

  // Relaciones
  @ManyToOne(() => Subtema, (subtema) => subtema.ejercicios, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'subtema_id' })
  subtema: Subtema;

  @OneToMany(() => IntentoEjercicio, (intento) => intento.ejercicio)
  intentos: IntentoEjercicio[];
}