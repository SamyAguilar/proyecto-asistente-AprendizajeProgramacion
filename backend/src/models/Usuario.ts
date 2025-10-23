import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { IsEmail, IsNotEmpty, IsEnum, Length, IsOptional, IsUrl } from 'class-validator';
import { Matricula } from './Matricula';
import { IntentoEjercicio } from './IntentoEjercicio';
import { Progreso } from './Progreso';
import { IntentoQuiz } from './IntentoQuiz';
import { RetroalimentacionLlm } from './RetroalimentacionLlm';

export enum RolUsuario {
  ESTUDIANTE = 'estudiante',
  PROFESOR = 'profesor',
  ADMIN = 'admin'
}

export enum EstadoUsuario {
  ACTIVO = 'activo',
  INACTIVO = 'inactivo',
  SUSPENDIDO = 'suspendido'
}

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  @IsEmail({}, { message: 'El email debe ser válido' })
  @IsNotEmpty({ message: 'El email es requerido' })
  email: string;

  @Column({ type: 'varchar', length: 255, name: 'contraseña_hash' })
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  contraseñaHash: string;

  @Column({ type: 'varchar', length: 255 })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @Length(2, 255, { message: 'El nombre debe tener entre 2 y 255 caracteres' })
  nombre: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @Length(2, 255, { message: 'El apellido debe tener entre 2 y 255 caracteres' })
  apellido: string;

  @Column({
    type: 'enum',
    enum: RolUsuario,
    default: RolUsuario.ESTUDIANTE
  })
  @IsEnum(RolUsuario, { message: 'El rol debe ser estudiante, profesor o admin' })
  rol: RolUsuario;

  @CreateDateColumn({ type: 'timestamp', name: 'fecha_registro' })
  fechaRegistro: Date;

  @Column({
    type: 'varchar',
    length: 50,
    default: EstadoUsuario.ACTIVO
  })
  @IsEnum(EstadoUsuario, { message: 'El estado debe ser activo, inactivo o suspendido' })
  estado: EstadoUsuario;

  @Column({ type: 'text', nullable: true, name: 'foto_perfil' })
  @IsOptional()
  @IsUrl({}, { message: 'La foto de perfil debe ser una URL válida' })
  fotoPerfil: string;

  @Column({ type: 'varchar', length: 20, unique: true, nullable: true })
  @IsOptional()
  @Length(5, 20, { message: 'La matrícula debe tener entre 5 y 20 caracteres' })
  matricula: string;

  // Relaciones
  @OneToMany(() => Matricula, (matricula) => matricula.usuario)
  matriculas: Matricula[];

  @OneToMany(() => IntentoEjercicio, (intento) => intento.usuario)
  intentosEjercicios: IntentoEjercicio[];

  @OneToMany(() => Progreso, (progreso) => progreso.usuario)
  progresos: Progreso[];

  @OneToMany(() => IntentoQuiz, (intento) => intento.usuario)
  intentosQuiz: IntentoQuiz[];

  @OneToMany(() => RetroalimentacionLlm, (retro) => retro.usuario)
  retroalimentaciones: RetroalimentacionLlm[];
}