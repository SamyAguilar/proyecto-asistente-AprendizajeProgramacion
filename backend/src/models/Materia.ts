import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { IsNotEmpty, Length, IsInt, Min, Max, IsOptional } from 'class-validator';
import { Matricula } from './Matricula';
import { Tema } from './Tema';

@Entity('materias')
export class Materia {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  @IsNotEmpty({ message: 'El nombre de la materia es requerido' })
  @Length(3, 255, { message: 'El nombre debe tener entre 3 y 255 caracteres' })
  nombre: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  @IsNotEmpty({ message: 'El código de la materia es requerido' })
  @Length(3, 50, { message: 'El código debe tener entre 3 y 50 caracteres' })
  codigo: string;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  descripcion: string;

  @Column({ type: 'int', nullable: true })
  @IsOptional()
  @IsInt({ message: 'El semestre debe ser un número entero' })
  @Min(1, { message: 'El semestre debe ser mayor a 0' })
  @Max(12, { message: 'El semestre debe ser menor o igual a 12' })
  semestre: number;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  prerequisitos: string;

  @Column({ type: 'int', nullable: true })
  @IsOptional()
  @IsInt({ message: 'Los créditos deben ser un número entero' })
  @Min(1, { message: 'Los créditos deben ser mayor a 0' })
  @Max(20, { message: 'Los créditos deben ser menor o igual a 20' })
  creditos: number;

  @CreateDateColumn({ type: 'timestamp', name: 'fecha_creacion' })
  fechaCreacion: Date;

  // Relaciones
  @OneToMany(() => Matricula, (matricula) => matricula.materia)
  matriculas: Matricula[];

  @OneToMany(() => Tema, (tema) => tema.materia)
  temas: Tema[];
}