import { Request, Response, NextFunction } from 'express';

interface RequestRecord {
  timestamp: number;
  userId?: number;
}

/**
 * Rate Limiter específico para Gemini AI
 * Límites: 15 RPM (requests por minuto) - Free tier
 * Límite diario: 1500 requests
 */
export class GeminiRateLimiter {
  private requests: RequestRecord[] = [];
  private dailyRequests: RequestRecord[] = [];
  private readonly RPM_LIMIT = parseInt(process.env.GEMINI_RPM_LIMIT || '15');
  private readonly DAILY_LIMIT = parseInt(process.env.GEMINI_DAILY_LIMIT || '1500');
  private readonly WINDOW_MS = 60 * 1000; // 1 minuto
  private readonly DAILY_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 horas

  middleware = (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    const userId = req.user?.id;

    // Limpiar requests antiguos (más de 1 minuto)
    this.requests = this.requests.filter(r => now - r.timestamp < this.WINDOW_MS);
    
    // Limpiar requests diarios antiguos (más de 24 horas)
    this.dailyRequests = this.dailyRequests.filter(r => now - r.timestamp < this.DAILY_WINDOW_MS);

    // Verificar límite por minuto
    if (this.requests.length >= this.RPM_LIMIT) {
      const oldestRequest = this.requests[0];
      const waitTime = this.WINDOW_MS - (now - oldestRequest.timestamp);
      
      console.warn(`⚠️ [GeminiRateLimiter] Límite de ${this.RPM_LIMIT} RPM alcanzado. Esperar ${Math.ceil(waitTime / 1000)}s`);
      
      return res.status(429).json({
        error: 'Límite de requests excedido',
        message: `Máximo ${this.RPM_LIMIT} requests por minuto a Gemini API`,
        retryAfter: Math.ceil(waitTime / 1000),
        limit: this.RPM_LIMIT,
        current: this.requests.length
      });
    }

    // Verificar límite diario
    if (this.dailyRequests.length >= this.DAILY_LIMIT) {
      console.error(`🚨 [GeminiRateLimiter] Límite diario de ${this.DAILY_LIMIT} requests alcanzado`);
      
      return res.status(429).json({
        error: 'Límite diario excedido',
        message: `Máximo ${this.DAILY_LIMIT} requests por día a Gemini API`,
        limit: this.DAILY_LIMIT,
        current: this.dailyRequests.length
      });
    }

    // Alerta al 80% del límite diario
    const dailyUsagePercent = (this.dailyRequests.length / this.DAILY_LIMIT) * 100;
    if (dailyUsagePercent >= 80 && dailyUsagePercent < 95) {
      console.warn(`⚠️ [GeminiRateLimiter] Alerta: ${dailyUsagePercent.toFixed(1)}% del límite diario usado`);
    } else if (dailyUsagePercent >= 95) {
      console.error(`🚨 [GeminiRateLimiter] CRÍTICO: ${dailyUsagePercent.toFixed(1)}% del límite diario usado`);
    }

    // Registrar request
    const record: RequestRecord = { timestamp: now, userId };
    this.requests.push(record);
    this.dailyRequests.push(record);

    console.log(`✓ [GeminiRateLimiter] Request permitido (${this.requests.length}/${this.RPM_LIMIT} RPM, ${this.dailyRequests.length}/${this.DAILY_LIMIT} diario)`);

    next();
  };

  /**
   * Obtener estadísticas de uso
   */
  getStats() {
    const now = Date.now();
    
    // Limpiar antes de calcular stats
    this.requests = this.requests.filter(r => now - r.timestamp < this.WINDOW_MS);
    this.dailyRequests = this.dailyRequests.filter(r => now - r.timestamp < this.DAILY_WINDOW_MS);

    return {
      requests_last_minute: this.requests.length,
      requests_today: this.dailyRequests.length,
      rpm_limit: this.RPM_LIMIT,
      daily_limit: this.DAILY_LIMIT,
      rpm_available: this.RPM_LIMIT - this.requests.length,
      daily_available: this.DAILY_LIMIT - this.dailyRequests.length,
      daily_usage_percent: ((this.dailyRequests.length / this.DAILY_LIMIT) * 100).toFixed(2) + '%'
    };
  }

  /**
   * Resetear contadores (para testing)
   */
  reset() {
    this.requests = [];
    this.dailyRequests = [];
    console.log('✓ [GeminiRateLimiter] Contadores reseteados');
  }
}

// Singleton instance
export const geminiRateLimiter = new GeminiRateLimiter();
