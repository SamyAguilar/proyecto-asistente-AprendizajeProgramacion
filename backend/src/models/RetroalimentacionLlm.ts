import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { IsNotEmpty, IsBoolean, Length, IsOptional } from 'class-validator';
import { Usuario } from './Usuario';

@Entity('retroalimentacion_llm')
export class RetroalimentacionLlm {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'usuario_id' })
  usuarioId: number;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'tipo_retroalimentacion' })
  @IsOptional()
  @Length(3, 100, { message: 'El tipo de retroalimentación debe tener entre 3 y 100 caracteres' })
  tipoRetroalimentacion: string;

  @Column({ type: 'text', name: 'contenido_retroalimentacion' })
  @IsNotEmpty({ message:  'El contenido de la retroalimentación es requerido' })
  contenidoRetroalimentacion: string;

  @Column({ type: 'jsonb', nullable: true, name: 'contexto_original' })
  @IsOptional()
  contextoOriginal: any;

  @Column({ type: 'boolean', default: true, name: 'generado_por_llm' })
  @IsBoolean({ message: 'Generado por LLM debe ser verdadero o falso' })
  generadoPorLlm: boolean;

  @CreateDateColumn({ type: 'timestamp', name: 'fecha_generacion' })
  fechaGeneracion: Date;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'modelo_llm_usado' })
  @IsOptional()
  @Length(3, 100, { message: 'El modelo LLM usado debe tener entre 3 y 100 caracteres' })
  modeloLlmUsado: string;

  // Relaciones
  @ManyToOne(() => Usuario, (usuario) => usuario.retroalimentaciones)
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;
}