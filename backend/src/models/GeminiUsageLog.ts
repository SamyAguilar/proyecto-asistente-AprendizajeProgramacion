import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Usuario } from './Usuario';

@Entity('gemini_usage_logs')
export class GeminiUsageLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: true, name: 'usuario_id' })
  usuarioId: number;

  @Column({ type: 'varchar', length: 50, name: 'tipo_request' })
  tipoRequest: string;

  @Column({ type: 'int', name: 'tokens_estimados' })
  tokensEstimados: number;

  @Column({ type: 'boolean', name: 'fue_cache' })
  fueCache: boolean;

  @Column({ type: 'int', name: 'tiempo_respuesta_ms' })
  tiempoRespuestaMs: number;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'modelo_usado' })
  modeloUsado: string;

  @CreateDateColumn({ type: 'timestamp', name: 'fecha_hora' })
  fechaHora: Date;

  // Relación con Usuario
  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;
}
