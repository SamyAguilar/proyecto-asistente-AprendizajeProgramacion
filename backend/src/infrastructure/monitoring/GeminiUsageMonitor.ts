import { AppDataSource } from '../../config/database';
import { GeminiUsageLog } from '../../models/GeminiUsageLog';

interface UsageRecord {
  timestamp: Date;
  tipo: string;
  tokensEstimados: number;
  fueCache: boolean;
  tiempoRespuesta: number;
  userId?: number;
}

interface DailyStats {
  fecha: string;
  totalRequests: number;
  requestsReales: number;
  requestsCache: number;
  tiempoPromedioMs: number;
  tokensEstimados: number;
}

/**
 * Monitoreo de uso de Gemini API
 * Registra estadísticas y genera alertas
 */
export class GeminiUsageMonitor {
  private records: UsageRecord[] = [];
  private readonly RETENTION_DAYS = 30;
  private readonly DAILY_LIMIT = parseInt(process.env.GEMINI_DAILY_LIMIT || '1500');
  private readonly MONTHLY_LIMIT = parseInt(process.env.GEMINI_MONTHLY_LIMIT || '45000');

  /**
   * Registrar una llamada a Gemini
   */
  async registrarLlamada(params: {
    tipo: string;
    tokensEstimados: number;
    fueCache: boolean;
    tiempoRespuesta: number;
    userId?: number;
  }): Promise<void> {
    const record: UsageRecord = {
      timestamp: new Date(),
      ...params
    };

    // Guardar en memoria
    this.records.push(record);
    this.limpiarRecordsAntiguos();
    this.verificarAlertas();

    // Guardar en base de datos
    try {
      const logRepo = AppDataSource.getRepository(GeminiUsageLog);
      await logRepo.save({
        usuarioId: params.userId,
        tipoRequest: params.tipo,
        tokensEstimados: params.tokensEstimados,
        fueCache: params.fueCache,
        tiempoRespuestaMs: params.tiempoRespuesta,
        modeloUsado: process.env.GEMINI_MODEL || 'gemini-1.5-flash-002'
      });
    } catch (error) {
      console.warn('⚠️ [Monitor] Error al guardar en BD:', error);
    }

    console.log(`📊 [Monitor] Registrado: ${params.tipo} (${params.fueCache ? 'CACHE' : 'API'}) - ${params.tiempoRespuesta}ms`);
  }

  /**
   * Obtener estadísticas del día actual
   */
  getStatsHoy(): DailyStats {
    const hoy = new Date().toISOString().split('T')[0];
    return this.getStatsPorFecha(hoy);
  }

  /**
   * Obtener estadísticas de un mes
   */
  getStatsMes(): {
    totalRequests: number;
    requestsReales: number;
    requestsCache: number;
    porcentajeCache: number;
    tiempoPromedioMs: number;
    porcentajeLimiteDiario: number;
    porcentajeLimiteMensual: number;
  } {
    const hace30Dias = new Date();
    hace30Dias.setDate(hace30Dias.getDate() - 30);

    const recordsMes = this.records.filter(r => r.timestamp >= hace30Dias);
    const requestsReales = recordsMes.filter(r => !r.fueCache).length;
    const requestsCache = recordsMes.filter(r => r.fueCache).length;
    
    const tiempoPromedio = recordsMes.length > 0
      ? recordsMes.reduce((sum, r) => sum + r.tiempoRespuesta, 0) / recordsMes.length
      : 0;

    return {
      totalRequests: recordsMes.length,
      requestsReales,
      requestsCache,
      porcentajeCache: recordsMes.length > 0 ? (requestsCache / recordsMes.length * 100) : 0,
      tiempoPromedioMs: Math.round(tiempoPromedio),
      porcentajeLimiteDiario: (this.getStatsHoy().requestsReales / this.DAILY_LIMIT) * 100,
      porcentajeLimiteMensual: (requestsReales / this.MONTHLY_LIMIT) * 100
    };
  }

  /**
   * Obtener estadísticas por tipo de request
   */
  getStatsPorTipo(): Record<string, {
    total: number;
    cache: number;
    api: number;
    tasaCache: string;
  }> {
    const stats: Record<string, any> = {};

    for (const record of this.records) {
      if (!stats[record.tipo]) {
        stats[record.tipo] = { total: 0, cache: 0, api: 0 };
      }
      
      stats[record.tipo].total++;
      if (record.fueCache) {
        stats[record.tipo].cache++;
      } else {
        stats[record.tipo].api++;
      }
    }

    // Calcular tasa de cache
    for (const tipo in stats) {
      stats[tipo].tasaCache = `${((stats[tipo].cache / stats[tipo].total) * 100).toFixed(1)}%`;
    }

    return stats;
  }

  /**
   * Verificar alertas de uso
   */
  private verificarAlertas(): void {
    const statsHoy = this.getStatsHoy();
    const porcentajeDiario = (statsHoy.requestsReales / this.DAILY_LIMIT) * 100;

    if (porcentajeDiario >= 95) {
      console.error(`🚨 [ALERTA CRÍTICA] Uso de Gemini: ${porcentajeDiario.toFixed(1)}% del límite diario`);
      console.error(`   Requests hoy: ${statsHoy.requestsReales}/${this.DAILY_LIMIT}`);
      this.enviarAlertaCritica(statsHoy);
    } else if (porcentajeDiario >= 80) {
      console.warn(`⚠️ [ALERTA] Uso de Gemini: ${porcentajeDiario.toFixed(1)}% del límite diario`);
      console.warn(`   Requests hoy: ${statsHoy.requestsReales}/${this.DAILY_LIMIT}`);
    }

    // Alerta mensual
    const statsMes = this.getStatsMes();
    if (statsMes.porcentajeLimiteMensual >= 90) {
      console.error(`🚨 [ALERTA MENSUAL] Uso: ${statsMes.porcentajeLimiteMensual.toFixed(1)}% del límite mensual`);
    }
  }

  /**
   * Enviar alerta crítica (aquí podrías integrar email, Slack, etc.)
   */
  private enviarAlertaCritica(stats: DailyStats): void {
    // TODO: Integrar con servicio de notificaciones
    // Por ahora solo log
    console.error('═══════════════════════════════════════');
    console.error('🚨 ALERTA CRÍTICA - LÍMITE GEMINI API');
    console.error(`Fecha: ${stats.fecha}`);
    console.error(`Requests API reales: ${stats.requestsReales}/${this.DAILY_LIMIT}`);
    console.error(`Requests desde cache: ${stats.requestsCache}`);
    console.error(`Tasa de cache: ${((stats.requestsCache / stats.totalRequests) * 100).toFixed(1)}%`);
    console.error('ACCIÓN: Considerar upgrade a plan pago');
    console.error('═══════════════════════════════════════');
  }

  /**
   * Obtener estadísticas por fecha
   */
  private getStatsPorFecha(fecha: string): DailyStats {
    const recordsDia = this.records.filter(r => {
      const recordFecha = r.timestamp.toISOString().split('T')[0];
      return recordFecha === fecha;
    });

    const requestsReales = recordsDia.filter(r => !r.fueCache).length;
    const requestsCache = recordsDia.filter(r => r.fueCache).length;
    const tiempoPromedio = recordsDia.length > 0
      ? recordsDia.reduce((sum, r) => sum + r.tiempoRespuesta, 0) / recordsDia.length
      : 0;
    const tokensTotal = recordsDia.reduce((sum, r) => sum + r.tokensEstimados, 0);

    return {
      fecha,
      totalRequests: recordsDia.length,
      requestsReales,
      requestsCache,
      tiempoPromedioMs: Math.round(tiempoPromedio),
      tokensEstimados: tokensTotal
    };
  }

  /**
   * Limpiar records antiguos (> 30 días)
   */
  private limpiarRecordsAntiguos(): void {
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - this.RETENTION_DAYS);

    const before = this.records.length;
    this.records = this.records.filter(r => r.timestamp >= fechaLimite);
    const eliminados = before - this.records.length;

    if (eliminados > 0) {
      console.log(`🗑️ [Monitor] ${eliminados} records antiguos eliminados`);
    }
  }

  /**
   * Resetear estadísticas (para testing)
   */
  reset(): void {
    this.records = [];
    console.log('✓ [Monitor] Estadísticas reseteadas');
  }

  /**
   * Exportar datos para análisis
   */
  exportarDatos(): UsageRecord[] {
    return [...this.records]; // Copia defensiva
  }
}

// Singleton instance
export const geminiUsageMonitor = new GeminiUsageMonitor();
