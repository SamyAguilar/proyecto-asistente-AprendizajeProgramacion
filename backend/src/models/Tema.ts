import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { IsNotEmpty, Length, IsInt, Min, IsOptional } from 'class-validator';
import { Materia } from './Materia';
import { Subtema } from './Subtema';
import { Progreso } from './Progreso';

@Entity('temas')
export class Tema {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'materia_id' })
  materiaId: number;

  @Column({ type: 'varchar', length: 255 })
  @IsNotEmpty({ message: 'El nombre del tema es requerido' })
  @Length(3, 255, { message: 'El nombre debe tener entre 3 y 255 caracteres' })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  descripcion: string;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  contenido: string;

  @Column({ type: 'int', nullable: true })
  @IsOptional()
  @IsInt({ message: 'El orden debe ser un número entero' })
  @Min(1, { message: 'El orden debe ser mayor a 0' })
  orden: number;

  @CreateDateColumn({ type: 'timestamp', name: 'fecha_creacion' })
  fechaCreacion: Date;

  // Relaciones
  @ManyToOne(() => Materia, (materia) => materia.temas, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'materia_id' })
  materia: Materia;

  @OneToMany(() => Subtema, (subtema) => subtema.tema)
  subtemas: Subtema[];

  @OneToMany(() => Progreso, (progreso) => progreso.tema)
  progresos: Progreso[];
}