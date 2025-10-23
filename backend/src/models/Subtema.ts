import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { IsNotEmpty, Length, IsInt, Min, IsOptional } from 'class-validator';
import { Tema } from './Tema';
import { Ejercicio } from './Ejercicio';
import { PreguntaQuiz } from './PreguntaQuiz';
import { Progreso } from './Progreso';

@Entity('subtemas')
export class Subtema {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'tema_id' })
  temaId: number;

  @Column({ type: 'varchar', length: 255 })
  @IsNotEmpty({ message: 'El nombre del subtema es requerido' })
  @Length(3, 255, { message: 'El nombre debe tener entre 3 y 255 caracteres' })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  descripcion: string;

  @Column({ type: 'text', nullable: true, name: 'contenido_detalle' })
  @IsOptional()
  contenidoDetalle: string;

  @Column({ type: 'int', nullable: true })
  @IsOptional()
  @IsInt({ message: 'El orden debe ser un número entero' })
  @Min(1, { message: 'El orden debe ser mayor a 0' })
  orden: number;

  @CreateDateColumn({ type: 'timestamp', name: 'fecha_creacion' })
  fechaCreacion: Date;

  // Relaciones
  @ManyToOne(() => Tema, (tema) => tema.subtemas, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tema_id' })
  tema: Tema;

  @OneToMany(() => Ejercicio, (ejercicio) => ejercicio.subtema)
  ejercicios: Ejercicio[];

  @OneToMany(() => PreguntaQuiz, (pregunta) => pregunta.subtema)
  preguntasQuiz: PreguntaQuiz[];

  @OneToMany(() => Progreso, (progreso) => progreso.subtema)
  progresos: Progreso[];
}