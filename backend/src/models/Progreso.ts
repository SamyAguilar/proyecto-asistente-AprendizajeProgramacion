import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { IsEnum, IsInt, Min, IsNumber, Max, IsOptional } from 'class-validator';
import { Usuario } from './Usuario';
import { Tema } from './Tema';
import { Subtema } from './Subtema';

export enum EstadoProgreso {
  NO_INICIADO = 'no_iniciado',
  EN_PROGRESO = 'en_progreso',
  COMPLETADO = 'completado'
}

@Entity('progreso')
export class Progreso {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'usuario_id' })
  usuarioId: number;

  @Column({ type: 'int', nullable: true, name: 'tema_id' })
  @IsOptional()
  temaId: number;

  @Column({ type: 'int', nullable: true, name: 'subtema_id' })
  @IsOptional()
  subtemaId: number;

  @Column({
    type: 'enum',
    enum: EstadoProgreso,
    nullable: true
  })
  @IsOptional()
  @IsEnum(EstadoProgreso, { message: 'El estado debe ser no_iniciado, en_progreso o completado' })
  estado: EstadoProgreso;

  @Column({ type: 'int', default: 0 })
  @IsInt({ message: 'Los intentos deben ser un número entero' })
  @Min(0, { message: 'Los intentos deben ser mayor o igual a 0' })
  intentos: number;

  @Column({ type: 'timestamp', nullable: true, name: 'fecha_ultimo_acceso' })
  @IsOptional()
  fechaUltimoAcceso: Date;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0, name: 'porcentaje_completado' })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El porcentaje debe tener máximo 2 decimales' })
  @Min(0, { message: 'El porcentaje debe ser mayor o igual a 0' })
  @Max(100, { message: 'El porcentaje debe ser menor o igual a 100' })
  porcentajeCompletado: number;

  // Relaciones
  @ManyToOne(() => Usuario, (usuario) => usuario.progresos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @ManyToOne(() => Tema, (tema) => tema.progresos, { nullable: true })
  @JoinColumn({ name: 'tema_id' })
  tema: Tema;

  @ManyToOne(() => Subtema, (subtema) => subtema.progresos, { nullable: true })
  @JoinColumn({ name: 'subtema_id' })
  subtema: Subtema;
}