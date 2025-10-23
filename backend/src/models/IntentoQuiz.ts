import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { IsBoolean, IsInt, Min, IsOptional } from 'class-validator';
import { Usuario } from './Usuario';
import { PreguntaQuiz } from './PreguntaQuiz';
import { OpcionRespuesta } from './OpcionRespuesta';

@Entity('intentos_quiz')
export class IntentoQuiz {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'usuario_id' })
  usuarioId: number;

  @Column({ type: 'int', name: 'pregunta_id' })
  preguntaId: number;

  @Column({ type: 'int', nullable: true, name: 'opcion_seleccionada' })
  @IsOptional()
  opcionSeleccionadaId: number;

  @Column({ type: 'boolean', nullable: true, name: 'es_correcta' })
  @IsOptional()
  @IsBoolean({ message: 'Es correcta debe ser verdadero o falso' })
  esCorrecta: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  timestamp: Date;

  @Column({ type: 'int', nullable: true, name: 'tiempo_respuesta' })
  @IsOptional()
  @IsInt({ message: 'El tiempo de respuesta debe ser un número entero' })
  @Min(0, { message: 'El tiempo de respuesta debe ser mayor o igual a 0' })
  tiempoRespuesta: number;

  // Relaciones
  @ManyToOne(() => Usuario, (usuario) => usuario.intentosQuiz, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @ManyToOne(() => PreguntaQuiz, (pregunta) => pregunta.intentos)
  @JoinColumn({ name: 'pregunta_id' })
  pregunta: PreguntaQuiz;

  @ManyToOne(() => OpcionRespuesta, (opcion) => opcion.intentosQuiz, { nullable: true })
  @JoinColumn({ name: 'opcion_seleccionada' })
  opcionSeleccionada: OpcionRespuesta;
}