import { CodeValidationRequest, CodeValidationResponse } from '../../domain/entities/CodeValidationRequest';
import { IGeminiClient } from '../../domain/interfaces/IGeminiClient';
import { ICacheService } from '../../domain/interfaces/ICacheService';
import { AppDataSource } from '../../config/database';
import { RetroalimentacionLlm } from '../../models/RetroalimentacionLlm';
import crypto from 'crypto';

export class ValidateCodeUseCase {
  constructor(
    private geminiClient: IGeminiClient,
    private cacheService: ICacheService
  ) {}

  async execute(request: CodeValidationRequest): Promise<CodeValidationResponse> {
    console.log('🔍 [UseCase] Iniciando validación de código...');
    
    try {
      // 1. Buscar en caché en memoria primero (más rápido)
      const cacheResult = await this.cacheService.buscarCodigoEnCache(
        request.codigo_enviado,
        request.ejercicio_id
      );

      if (cacheResult.encontrado) {
        console.log('✓ [UseCase] Respuesta encontrada en caché en memoria');
        return {
          resultado: cacheResult.data.resultado,
          puntos_obtenidos: cacheResult.data.puntos,
          retroalimentacion_llm: cacheResult.data.retroalimentacion,
          errores_encontrados: [],
          casos_prueba_pasados: 0,
          casos_prueba_totales: 0
        };
      }

      // 2. Si no está en memoria, buscar en tabla retroalimentacion_llm (caché persistente)
      console.log('🔍 [UseCase] Buscando en caché persistente (BD)...');
      const codigoHash = crypto.createHash('md5').update(request.codigo_enviado).digest('hex');
      
      const retroalimentacionRepo = AppDataSource.getRepository(RetroalimentacionLlm);
      
      const retroalimentacionBD = await retroalimentacionRepo
        .createQueryBuilder('retro')
        .where("retro.contexto_original->>'codigo_hash' = :codigoHash", { codigoHash })
        .andWhere("retro.contexto_original->>'ejercicio_id' = :ejercicioId", { ejercicioId: request.ejercicio_id.toString() })
        .andWhere("retro.tipo_retroalimentacion = 'validacion_codigo'")
        .orderBy('retro.fecha_generacion', 'DESC')
        .getOne();

      if (retroalimentacionBD) {
        console.log('✓ [UseCase] Respuesta encontrada en BD - Evitando llamada a Gemini');
        
        const contexto = retroalimentacionBD.contextoOriginal;
        const response: CodeValidationResponse = {
          resultado: contexto.resultado || 'correcto',
          puntos_obtenidos: contexto.puntos || 0,
          retroalimentacion_llm: retroalimentacionBD.contenidoRetroalimentacion,
          errores_encontrados: contexto.errores_encontrados || [],
          casos_prueba_pasados: contexto.casos_prueba_pasados || 0,
          casos_prueba_totales: contexto.casos_prueba_totales || 0
        };

        // Guardar en caché en memoria para próximas consultas
        await this.cacheService.guardarCodigoEnCache(
          request.codigo_enviado,
          request.ejercicio_id,
          request.usuario_id,
          response
        );

        return response;
      }

      // 3. No está en ningún caché, construir prompt y llamar a Gemini
      console.log('❌ [UseCase] No encontrado en caché - Llamando a Gemini');
      const prompt = this.buildPrompt(request);

      console.log('🤖 [UseCase] Llamando a Gemini...');
      const respuestaGemini = await this.geminiClient.generate(prompt, {
        temperature: 0.3,
        maxTokens: 2500,  // ✅ AUMENTADO de 1500 a 2500
        tipo: 'code_validation'
      });

      // Parsear respuesta
      const resultado = this.parseResponse(respuestaGemini);

      // Calcular puntos
      const puntosMaximos = 100;
      const puntosObtenidos = this.calcularPuntos(resultado, puntosMaximos);

      const response: CodeValidationResponse = {
        resultado: resultado.resultado,
        puntos_obtenidos: puntosObtenidos,
        retroalimentacion_llm: resultado.retroalimentacion_educativa,
        errores_encontrados: resultado.errores_encontrados || [],
        casos_prueba_pasados: resultado.casos_prueba_pasados || 0,
        casos_prueba_totales: resultado.casos_prueba_totales || 0
      };

      // Guardar en caché memoria
      await this.cacheService.guardarCodigoEnCache(
        request.codigo_enviado,
        request.ejercicio_id,
        request.usuario_id,
        response
      );

      // Guardar en base de datos (caché persistente)
      try {
        const retroalimentacion = retroalimentacionRepo.create({
          usuarioId: request.usuario_id,
          tipoRetroalimentacion: 'validacion_codigo',
          contenidoRetroalimentacion: response.retroalimentacion_llm,
          contextoOriginal: {
            ejercicio_id: request.ejercicio_id,
            codigo_hash: codigoHash,
            codigo_enviado: request.codigo_enviado,
            lenguaje: request.lenguaje,
            resultado: response.resultado,
            puntos: response.puntos_obtenidos,
            errores_encontrados: response.errores_encontrados,
            casos_prueba_pasados: response.casos_prueba_pasados,
            casos_prueba_totales: response.casos_prueba_totales,
          },
          generadoPorLlm: true,
          modeloLlmUsado: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
        });

        await retroalimentacionRepo.save(retroalimentacion);
        console.log('💾 [UseCase] Retroalimentación guardada en BD');
      } catch (dbError: any) {
        console.warn('⚠️ [UseCase] Error al guardar en BD (continuando):', dbError.message);
      }

      console.log(`✓ [UseCase] Validación completada: ${response.resultado}`);
      return response;

    } catch (error: any) {
      console.error('❌ [UseCase] Error:', error.message);
      return {
        resultado: 'error',
        puntos_obtenidos: 0,
        retroalimentacion_llm: 'Hubo un error al procesar tu código. Por favor, intenta nuevamente.',
        errores_encontrados: [error.message],
        casos_prueba_pasados: 0,
        casos_prueba_totales: 0
      };
    }
  }

  /**
   * PROMPT 2 del documento del proyecto (página 26)
   * Análisis y Retroalimentación de Código
   */
  private buildPrompt(request: CodeValidationRequest): string {
    return `Eres un profesor de programación brindando retroalimentación constructiva.

El estudiante ha enviado el siguiente código para el ejercicio:

**CÓDIGO DEL ESTUDIANTE:**
\`\`\`${request.lenguaje}
${request.codigo_enviado}
\`\`\`

**EJERCICIO SOLICITADO:**
"${request.enunciado || 'No especificado'}"

**CASOS DE PRUEBA:**
${JSON.stringify(request.casos_prueba, null, 2)}

**INSTRUCCIONES:**
1. Analiza el código y verifica si es correcto, Análisis de lo que el estudiante hizo bien
2. Evalúa si pasa los casos de prueba
3. Identifica errores de sintaxis o lógica y explicación del por qué
4. Proporciona retroalimentación educativa CONCISA (máximo 4-5 oraciones)
5. Sugiere mejoras específicas para corregir errores o mejorar el código
5. Recursos para aprender los conceptos faltantes

**TONO:** Alentador, educativo, sin ser condescendiente.

**IMPORTANTE:** 
- Responde ÚNICAMENTE en formato JSON válido
- NO uses bloques de código markdown (no uses \`\`\`json)
- Mantén la retroalimentación_educativa BREVE (máximo 350 palabras)
- Responde solo el objeto JSON puro


**RESPONDE EN ESTE FORMATO JSON EXACTO:**
{
  "resultado": "correcto" | "incorrecto" | "error",
  "errores_encontrados": ["lista de errores específicos y el porque"],
  "casos_prueba_pasados": número de casos que pasa,
  "casos_prueba_totales": ${Array.isArray(request.casos_prueba) ? request.casos_prueba.length : 0},
  "retroalimentacion_educativa": "Explicación pedagógica BREVE de qué hizo bien o mal y cómo mejorar y Recursos para aprender los conceptos faltantes y una pequeña sugerencia de guía de estudio",
  "sugerencias_mejora": ["sugerencia 1", "sugerencia 2"]
}`;
  }

  /**
   * Parsea la respuesta de Gemini y extrae el JSON
   * Maneja respuestas truncadas y con formato markdown
   */
  private parseResponse(respuesta: string): any {
    try {
      console.log('🔍 [Parse] Iniciando parseo de respuesta...');
      console.log('📏 [Parse] Longitud de respuesta:', respuesta.length);
      
      // Verificar si la respuesta está vacía
      if (!respuesta || respuesta.trim().length === 0) {
        console.error('❌ [Parse] La respuesta de Gemini está vacía');
        throw new Error('Respuesta vacía de Gemini');
      }
      
      // Limpiar la respuesta: remover bloques de código markdown
      let cleanResponse = respuesta.trim();
      
      // Remover múltiples variantes de bloques markdown
      cleanResponse = cleanResponse
        .replace(/^```json\s*/i, '')
        .replace(/^```javascript\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();
      
      console.log('🧹 [Parse] Longitud después de limpieza:', cleanResponse.length);
      
      // Buscar el primer { y el último }
      const primerLlave = cleanResponse.indexOf('{');
      let ultimaLlave = cleanResponse.lastIndexOf('}');
      
      console.log('🔍 [Parse] Índice primera llave {:', primerLlave);
      console.log('🔍 [Parse] Índice última llave }:', ultimaLlave);
      
      // ✅ MANEJO DE RESPUESTA TRUNCADA
      if (primerLlave === -1 || ultimaLlave === -1 || ultimaLlave < primerLlave) {
        console.warn('⚠️ [Parse] Respuesta parece truncada - intentando reparar JSON...');
        console.log('📝 [Parse] Respuesta recibida:', cleanResponse.substring(0, 500));
        
        // Intentar agregar la llave de cierre faltante
        if (primerLlave !== -1 && ultimaLlave === -1) {
          console.log('🔧 [Parse] Agregando llave de cierre faltante...');
          cleanResponse += '\n  ]\n}';
          ultimaLlave = cleanResponse.lastIndexOf('}');
          console.log('🔧 [Parse] Nueva última llave }:', ultimaLlave);
        } else {
          throw new Error('No se encontró JSON válido en la respuesta');
        }
      }

      const jsonStr = cleanResponse.substring(primerLlave, ultimaLlave + 1);
      console.log('✂️ [Parse] JSON extraído (longitud):', jsonStr.length);
      
      // Intentar parsear
      let parsed;
      try {
        parsed = JSON.parse(jsonStr);
        console.log('✅ [Parse] JSON parseado correctamente');
      } catch (parseError: any) {
        console.error('❌ [Parse] Error en JSON.parse:', parseError.message);
        console.error('📝 [Parse] String que causó el error:', jsonStr.substring(0, 500));
        
        // Último intento: reparar campos incompletos comunes
        try {
          console.log('🔧 [Parse] Intentando reparar JSON malformado...');
          let repairedJson = jsonStr;
          
          // Si termina con una cadena incompleta, cerrarla
          if (!repairedJson.endsWith('}')) {
            repairedJson = repairedJson.replace(/,\s*$/, '') + '\n}';
          }
          
          parsed = JSON.parse(repairedJson);
          console.log('✅ [Parse] JSON reparado y parseado correctamente');
        } catch (repairError) {
          throw new Error(`Error parseando JSON: ${parseError.message}`);
        }
      }
      
      // Validar que tenga los campos requeridos
      console.log('🔍 [Parse] Validando campos requeridos...');
      
      if (!parsed.resultado) {
        console.warn('⚠️ [Parse] Falta campo "resultado", asignando "error"');
        parsed.resultado = 'error';
      }
      
      if (!parsed.retroalimentacion_educativa) {
        console.warn('⚠️ [Parse] Falta campo "retroalimentacion_educativa", asignando mensaje genérico');
        parsed.retroalimentacion_educativa = 'Se encontraron problemas en el código. Por favor, revisa la lógica implementada.';
      }
      
      // Asegurar campos opcionales
      parsed.errores_encontrados = parsed.errores_encontrados || [];
      parsed.casos_prueba_pasados = parsed.casos_prueba_pasados || 0;
      parsed.casos_prueba_totales = parsed.casos_prueba_totales || 0;
      parsed.sugerencias_mejora = parsed.sugerencias_mejora || [];

      console.log('✅ [Parse] Validación completada exitosamente');
      return parsed;
      
    } catch (error: any) {
      console.error('❌ [Parse] Error general en parseResponse:', error.message);
      console.error('📝 [Parse] Respuesta original (primeros 1000 chars):', respuesta.substring(0, 1000));
      throw new Error(`Respuesta inválida de Gemini: ${error.message}`);
    }
  }

  private calcularPuntos(resultado: any, puntosMaximos: number): number {
    if (resultado.resultado === 'correcto') {
      return puntosMaximos;
    }
    if (resultado.resultado === 'incorrecto' && resultado.casos_prueba_pasados) {
      const porcentaje = resultado.casos_prueba_pasados / resultado.casos_prueba_totales;
      return Math.round(puntosMaximos * porcentaje);
    }
    return 0;
  }
}