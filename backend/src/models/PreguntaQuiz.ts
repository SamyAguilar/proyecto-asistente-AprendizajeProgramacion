import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { IsNotEmpty, IsEnum, IsBoolean, IsOptional, Length } from 'class-validator';
import { Subtema } from './Subtema';
import { OpcionRespuesta } from './OpcionRespuesta';
import { IntentoQuiz } from './IntentoQuiz';

export enum TipoPregunta {
  OPCION_MULTIPLE = 'opcion_multiple',
  VERDADERO_FALSO = 'verdadero_falso',
  RESPUESTA_CORTA = 'respuesta_corta'
}

export enum DificultadPregunta {
  BASICA = 'básica',
  INTERMEDIA = 'intermedia',
  AVANZADA = 'avanzada'
}

@Entity('preguntas_quiz')
export class PreguntaQuiz {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'subtema_id' })
  subtemaId: number;

  @Column({ type: 'text', name: 'pregunta_texto' })
  @IsNotEmpty({ message: 'El texto de la pregunta es requerido' })
  preguntaTexto: string;

  @Column({
    type: 'enum',
    enum: TipoPregunta,
    nullable: true,
    name: 'tipo_pregunta'
  })
  @IsOptional()
  @IsEnum(TipoPregunta, { message: 'El tipo debe ser opcion_multiple, verdadero_falso o respuesta_corta' })
  tipoPregunta: TipoPregunta;

  @Column({ type: 'boolean', default: true, name: 'generado_por_llm' })
  @IsBoolean({ message: 'Generado por LLM debe ser verdadero o falso' })
  generadoPorLlm: boolean;

  @CreateDateColumn({ type: 'timestamp', name: 'fecha_generacion' })
  fechaGeneracion: Date;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true
  })
  @IsOptional()
  @IsEnum(DificultadPregunta, { message: 'La dificultad debe ser básica, intermedia o avanzada' })
  dificultad: DificultadPregunta;

  @Column({ type: 'text', nullable: true, name: 'retroalimentacion_correcta' })
  @IsOptional()
  retroalimentacionCorrecta: string;

  @Column({ type: 'text', nullable: true, name: 'retroalimentacion_incorrecta' })
  @IsOptional()
  retroalimentacionIncorrecta: string;

  // Relaciones
  @ManyToOne(() => Subtema, (subtema) => subtema.preguntasQuiz)
  @JoinColumn({ name: 'subtema_id' })
  subtema: Subtema;

  @OneToMany(() => OpcionRespuesta, (opcion) => opcion.pregunta)
  opciones: OpcionRespuesta[];

  @OneToMany(() => IntentoQuiz, (intento) => intento.pregunta)
  intentos: IntentoQuiz[];
}