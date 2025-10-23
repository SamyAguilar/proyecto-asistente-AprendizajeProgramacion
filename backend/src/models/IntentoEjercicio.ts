import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { IsEnum, IsInt, Min, Max, IsOptional } from 'class-validator';
import { Usuario } from './Usuario';
import { Ejercicio } from './Ejercicio';

export enum ResultadoEjercicio {
  CORRECTO = 'correcto',
  INCORRECTO = 'incorrecto',
  ERROR = 'error'
}

@Entity('intentos_ejercicios')
export class IntentoEjercicio {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'usuario_id' })
  usuarioId: number;

  @Column({ type: 'int', name: 'ejercicio_id' })
  ejercicioId: number;

  @Column({ type: 'text', nullable: true, name: 'codigo_enviado' })
  @IsOptional()
  codigoEnviado: string;

  @Column({
    type: 'enum',
    enum: ResultadoEjercicio,
    nullable: true
  })
  @IsOptional()
  @IsEnum(ResultadoEjercicio, { message: 'El resultado debe ser correcto, incorrecto o error' })
  resultado: ResultadoEjercicio;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  retroalimentacion: string;

  @Column({ type: 'text', nullable: true, name: 'retroalimentacion_llm' })
  @IsOptional()
  retroalimentacionLlm: string;

  @Column({ type: 'int', nullable: true, name: 'puntos_obtenidos' })
  @IsOptional()
  @IsInt({ message: 'Los puntos obtenidos deben ser un número entero' })
  @Min(0, { message: 'Los puntos obtenidos deben ser mayor o igual a 0' })
  @Max(100, { message: 'Los puntos obtenidos deben ser menor o igual a 100' })
  puntosObtenidos: number;

  @CreateDateColumn({ type: 'timestamp' })
  timestamp: Date;

  // Relaciones
  @ManyToOne(() => Usuario, (usuario) => usuario.intentosEjercicios, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @ManyToOne(() => Ejercicio, (ejercicio) => ejercicio.intentos)
  @JoinColumn({ name: 'ejercicio_id' })
  ejercicio: Ejercicio;
}