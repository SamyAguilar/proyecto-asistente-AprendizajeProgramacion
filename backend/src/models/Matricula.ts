import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { IsEnum, IsNumber, Min, Max, IsOptional } from 'class-validator';
import { Usuario } from './Usuario';
import { Materia } from './Materia';

export enum EstadoMatricula {
  ACTIVA = 'activa',
  COMPLETADA = 'completada',
  ABANDONADA = 'abandonada'
}

@Entity('matriculas')
@Unique(['usuarioId', 'materiaId'])
export class Matricula {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'usuario_id' })
  usuarioId: number;

  @Column({ type: 'int', name: 'materia_id' })
  materiaId: number;

  @CreateDateColumn({ type: 'timestamp', name: 'fecha_inicio' })
  fechaInicio: Date;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true, name: 'calificacion_final' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'La calificación debe tener máximo 2 decimales' })
  @Min(0, { message: 'La calificación debe ser mayor o igual a 0' })
  @Max(100, { message: 'La calificación debe ser menor o igual a 100' })
  calificacionFinal: number;

  @Column({
    type: 'varchar',
    length: 50,
    default: EstadoMatricula.ACTIVA
  })
  @IsEnum(EstadoMatricula, { message: 'El estado debe ser activa, completada o abandonada' })
  estado: EstadoMatricula;

  @Column({ type: 'timestamp', nullable: true, name: 'fecha_fin' })
  @IsOptional()
  fechaFin: Date;

  // Relaciones
  @ManyToOne(() => Usuario, (usuario) => usuario.matriculas, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @ManyToOne(() => Materia, (materia) => materia.matriculas)
  @JoinColumn({ name: 'materia_id' })
  materia: Materia;
}