import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { IsNotEmpty, IsBoolean, IsInt, Min, IsOptional } from 'class-validator';
import { PreguntaQuiz } from './PreguntaQuiz';
import { IntentoQuiz } from './IntentoQuiz';

@Entity('opciones_respuesta')
export class OpcionRespuesta {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'pregunta_id' })
  preguntaId: number;

  @Column({ type: 'text', name: 'texto_opcion' })
  @IsNotEmpty({ message: 'El texto de la opción es requerido' })
  textoOpcion: string;

  @Column({ type: 'boolean', default: false, name: 'es_correcta' })
  @IsBoolean({ message: 'Es correcta debe ser verdadero o falso' })
  esCorrecta: boolean;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  explicacion: string;

  @Column({ type: 'int', nullable: true })
  @IsOptional()
  @IsInt({ message: 'El orden debe ser un número entero' })
  @Min(1, { message: 'El orden debe ser mayor a 0' })
  orden: number;

  // Relaciones
  @ManyToOne(() => PreguntaQuiz, (pregunta) => pregunta.opciones, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pregunta_id' })
  pregunta: PreguntaQuiz;

  @OneToMany(() => IntentoQuiz, (intento) => intento.opcionSeleccionada)
  intentosQuiz: IntentoQuiz[];
}