import md5 from 'md5';
import { ICacheService, CacheSearchResult } from '../../domain/interfaces/ICacheService';

interface CacheEntry {
  key: string;
  data: any;
  timestamp: Date;
  ttl_days: number;
}

export class InMemoryCacheService implements ICacheService {
  private cache = new Map<string, CacheEntry>();
  private readonly TTL_DAYS = parseInt(process.env.CACHE_TTL_DAYS || '7');

  async buscarCodigoEnCache(codigo: string, ejercicio_id: number): Promise<CacheSearchResult> {
    try {
      const codigoHash = this.generarHashCodigo(codigo);
      const key = `code_${ejercicio_id}_${codigoHash}`;
      
      const entry = this.cache.get(key);
      
      if (entry && !this.esExpirado(entry)) {
        const edadDias = this.calcularEdadDias(entry.timestamp);
        console.log(`✓ [Cache] HIT: Código encontrado (${edadDias} días)`);
        
        return {
          encontrado: true,
          data: entry.data,
          edad_dias: edadDias
        };
      }

      console.log('✗ [Cache] MISS: Código no encontrado');
      return { encontrado: false };

    } catch (error) {
      console.error('[Cache] Error al buscar:', error);
      return { encontrado: false };
    }
  }

  async guardarCodigoEnCache(
    codigo: string,
    ejercicio_id: number,
    usuario_id: number,
    resultado: any
  ): Promise<void> {
    try {
      const codigoHash = this.generarHashCodigo(codigo);
      const key = `code_${ejercicio_id}_${codigoHash}`;

      this.cache.set(key, {
        key,
        data: {
          resultado: resultado.resultado,
          puntos: resultado.puntos_obtenidos,
          retroalimentacion: resultado.retroalimentacion_llm
        },
        timestamp: new Date(),
        ttl_days: this.TTL_DAYS
      });

      console.log('✓ [Cache] Código guardado');
    } catch (error) {
      console.error('[Cache] Error al guardar:', error);
    }
  }

  async buscarPreguntasEnCache(
    subtema_id: number,
    cantidad: number,
    dificultad: string
  ): Promise<CacheSearchResult> {
    try {
      const key = `questions_${subtema_id}_${dificultad}`;
      const entry = this.cache.get(key);

      if (entry && !this.esExpirado(entry)) {
        const preguntas = entry.data;
        
        if (preguntas.length >= cantidad) {
          const edadDias = this.calcularEdadDias(entry.timestamp);
          console.log(`✓ [Cache] HIT: ${preguntas.length} preguntas encontradas (${edadDias} días)`);
          
          return {
            encontrado: true,
            data: preguntas.slice(0, cantidad),
            edad_dias: edadDias
          };
        }
      }

      console.log('✗ [Cache] MISS: Preguntas no encontradas');
      return { encontrado: false };

    } catch (error) {
      console.error('[Cache] Error al buscar preguntas:', error);
      return { encontrado: false };
    }
  }

  async guardarPreguntasEnCache(subtema_id: number, preguntas: any[]): Promise<void> {
    try {
      const key = `questions_${subtema_id}_${preguntas[0]?.dificultad || 'intermedia'}`;

      const existing = this.cache.get(key);
      const preguntasExistentes = existing?.data || [];

      const todasPreguntas = [...preguntasExistentes, ...preguntas];

      this.cache.set(key, {
        key,
        data: todasPreguntas,
        timestamp: new Date(),
        ttl_days: this.TTL_DAYS
      });

      console.log(`✓ [Cache] ${preguntas.length} preguntas guardadas`);
    } catch (error) {
      console.error('[Cache] Error al guardar preguntas:', error);
    }
  }

  private generarHashCodigo(codigo: string): string {
    const codigoNormalizado = codigo
      .replace(/\/\/.*$/gm, '')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
    
    return md5(codigoNormalizado);
  }

  private esExpirado(entry: CacheEntry): boolean {
    const ahora = new Date();
    const diferenciaDias = (ahora.getTime() - entry.timestamp.getTime()) / (1000 * 60 * 60 * 24);
    return diferenciaDias > entry.ttl_days;
  }

  private calcularEdadDias(fecha: Date): number {
    const ahora = new Date();
    const diferencia = ahora.getTime() - fecha.getTime();
    return Math.floor(diferencia / (1000 * 60 * 60 * 24));
  }

  limpiarCacheAntiguo(): void {
    let eliminados = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (this.esExpirado(entry)) {
        this.cache.delete(key);
        eliminados++;
      }
    }

    if (eliminados > 0) {
      console.log(`✓ [Cache] ${eliminados} entradas antiguas eliminadas`);
    }
  }

  getStats() {
    return {
      total_entradas: this.cache.size,
      ttl_dias: this.TTL_DAYS
    };
  }
}
