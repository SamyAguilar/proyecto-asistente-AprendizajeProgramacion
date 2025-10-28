-- Tabla para tracking de uso de Gemini API
-- Almacena estadísticas de cada llamada para monitoreo y análisis

CREATE TABLE IF NOT EXISTS gemini_usage_logs (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    tipo_request VARCHAR(50) NOT NULL,
    tokens_estimados INTEGER NOT NULL DEFAULT 0,
    fue_cache BOOLEAN NOT NULL DEFAULT false,
    tiempo_respuesta_ms INTEGER NOT NULL,
    modelo_usado VARCHAR(50),
    fecha_hora TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Índices para consultas frecuentes
    INDEX idx_fecha_hora (fecha_hora),
    INDEX idx_tipo_request (tipo_request),
    INDEX idx_usuario_id (usuario_id),
    INDEX idx_fue_cache (fue_cache)
);

-- Comentarios para documentación
COMMENT ON TABLE gemini_usage_logs IS 'Registro de uso de Gemini API para monitoreo y estadísticas';
COMMENT ON COLUMN gemini_usage_logs.tipo_request IS 'Tipo de request: code_validation, question_generation, chat, etc.';
COMMENT ON COLUMN gemini_usage_logs.tokens_estimados IS 'Tokens estimados de la llamada';
COMMENT ON COLUMN gemini_usage_logs.fue_cache IS 'Si la respuesta vino de caché (no llamó a Gemini)';
COMMENT ON COLUMN gemini_usage_logs.tiempo_respuesta_ms IS 'Tiempo de respuesta en milisegundos';
COMMENT ON COLUMN gemini_usage_logs.modelo_usado IS 'Modelo de Gemini utilizado (ej: gemini-1.5-flash-002)';

-- Consulta de ejemplo: Estadísticas del día
-- SELECT 
--   tipo_request,
--   COUNT(*) as total,
--   SUM(CASE WHEN fue_cache THEN 1 ELSE 0 END) as cache_hits,
--   AVG(tiempo_respuesta_ms) as tiempo_promedio
-- FROM gemini_usage_logs
-- WHERE DATE(fecha_hora) = CURRENT_DATE
-- GROUP BY tipo_request;
