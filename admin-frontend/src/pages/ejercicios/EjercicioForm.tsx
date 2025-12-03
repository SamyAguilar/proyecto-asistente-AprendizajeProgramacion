// src/pages/ejercicios/EjercicioForm.tsx
import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  TextField,
  Typography,
  Stack,
  CircularProgress,
  MenuItem,
  Divider,
  IconButton,
  Alert,
  Chip,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { Save, ArrowBack, Add, Delete } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ejerciciosApi } from '../../api/ejercicios.api';
import toast from 'react-hot-toast';

const ejercicioSchema = z.object({
  subtemaId: z.number().min(1),
  enunciado: z.string().min(10, 'El enunciado debe tener al menos 10 caracteres'),
  dificultad: z.enum(['basica', 'intermedia', 'avanzada']),
  tipoEjercicio: z.enum(['codificacion', 'multiple', 'completar']),
  puntosMaximos: z.number().min(1).max(100),
  // Campos para CODIFICACION
  lenguajeProgramacion: z.string().optional(),
  codigoBase: z.string().optional(),
  codigoSolucion: z.string().optional(),
  // Campos para MULTIPLE
  opcionesRespuesta: z.array(z.object({
    id: z.string(),
    texto: z.string(),
    esCorrecta: z.boolean(),
  })).optional(),
  // Campos para COMPLETAR
  textoConEspacios: z.string().optional(),
  respuestasCorrectas: z.array(z.string()).optional(),
});

type EjercicioFormData = z.infer<typeof ejercicioSchema>;

export const EjercicioForm = () => {
  const { id, subtemaId } = useParams<{ id?: string; subtemaId?: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!id);

  const isEditMode = !!id;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    control,
    setValue,
  } = useForm<EjercicioFormData>({
    resolver: zodResolver(ejercicioSchema),
    defaultValues: {
      subtemaId: subtemaId ? Number(subtemaId) : undefined,
      puntosMaximos: 10,
      dificultad: 'basica',
      tipoEjercicio: 'codificacion',
      opcionesRespuesta: [
        { id: '1', texto: '', esCorrecta: false },
        { id: '2', texto: '', esCorrecta: false },
      ],
      respuestasCorrectas: [''],
    },
  });

  const { fields: opcionesFields, append: appendOpcion, remove: removeOpcion } = useFieldArray({
    control,
    name: 'opcionesRespuesta',
  });

  const { fields: respuestasFields, append: appendRespuesta, remove: removeRespuesta } = useFieldArray({
    control,
    name: 'respuestasCorrectas',
  });

  const tipoEjercicio = watch('tipoEjercicio');
  const textoConEspacios = watch('textoConEspacios');

  useEffect(() => {
    if (isEditMode) {
      fetchEjercicio();
    }
  }, [id]);

  // Contar espacios en blanco ____
  const contarEspacios = (texto: string): number => {
    return (texto.match(/____/g) || []).length;
  };

  const fetchEjercicio = async () => {
    try {
      setInitialLoading(true);
      const ejercicio = await ejerciciosApi.getById(Number(id));
      
      const formData: any = {
        subtemaId: ejercicio.subtemaId,
        enunciado: ejercicio.enunciado,
        dificultad: ejercicio.dificultad,
        tipoEjercicio: ejercicio.tipoEjercicio,
        puntosMaximos: ejercicio.puntosMaximos,
      };

      if (ejercicio.tipoEjercicio === 'codificacion') {
        formData.lenguajeProgramacion = ejercicio.lenguajeProgramacion || 'javascript';
        formData.codigoBase = ejercicio.codigoBase || '';
        formData.codigoSolucion = ejercicio.codigoSolucion || '';
      } else if (ejercicio.tipoEjercicio === 'multiple') {
        formData.opcionesRespuesta = ejercicio.opcionesRespuesta || [
          { id: '1', texto: '', esCorrecta: false },
          { id: '2', texto: '', esCorrecta: false },
        ];
      } else if (ejercicio.tipoEjercicio === 'completar') {
        formData.textoConEspacios = ejercicio.textoConEspacios || '';
        formData.respuestasCorrectas = ejercicio.respuestasCorrectas || [''];
      }

      reset(formData);
    } catch (error) {
      toast.error('Error al cargar el ejercicio');
      navigate(-1);
    } finally {
      setInitialLoading(false);
    }
  };

  const onSubmit = async (data: EjercicioFormData) => {
    try {
      setLoading(true);

      // Validaciones adicionales según tipo
      if (data.tipoEjercicio === 'multiple') {
        if (!data.opcionesRespuesta || data.opcionesRespuesta.length < 2) {
          toast.error('Debes agregar al menos 2 opciones');
          return;
        }
        
        const tieneCorrecta = data.opcionesRespuesta.some(op => op.esCorrecta);
        if (!tieneCorrecta) {
          toast.error('Debes marcar al menos una opción como correcta');
          return;
        }

        const todasVacias = data.opcionesRespuesta.every(op => !op.texto.trim());
        if (todasVacias) {
          toast.error('Las opciones no pueden estar vacías');
          return;
        }
      }

      if (data.tipoEjercicio === 'completar') {
        if (!data.textoConEspacios || !data.respuestasCorrectas) {
          toast.error('Debes completar el texto y las respuestas');
          return;
        }

        const numeroEspacios = contarEspacios(data.textoConEspacios);
        const numeroRespuestas = data.respuestasCorrectas.filter(r => r.trim()).length;

        if (numeroEspacios !== numeroRespuestas) {
          toast.error(`El número de espacios (${numeroEspacios}) debe coincidir con las respuestas (${numeroRespuestas})`);
          return;
        }
      }

      // Limpiar datos según tipo
      const datosLimpios: any = {
        subtemaId: data.subtemaId,
        enunciado: data.enunciado,
        dificultad: data.dificultad,
        tipoEjercicio: data.tipoEjercicio,
        puntosMaximos: data.puntosMaximos,
      };

      if (data.tipoEjercicio === 'codificacion') {
        datosLimpios.lenguajeProgramacion = data.lenguajeProgramacion || 'javascript';
        datosLimpios.codigoBase = data.codigoBase || '';
        datosLimpios.codigoSolucion = data.codigoSolucion || '';
      } else if (data.tipoEjercicio === 'multiple') {
        datosLimpios.opcionesRespuesta = data.opcionesRespuesta?.filter(op => op.texto.trim()) || [];
      } else if (data.tipoEjercicio === 'completar') {
        datosLimpios.textoConEspacios = data.textoConEspacios;
        datosLimpios.respuestasCorrectas = data.respuestasCorrectas?.filter(r => r.trim()) || [];
      }

      if (isEditMode) {
        await ejerciciosApi.update(Number(id), datosLimpios);
        toast.success('Ejercicio actualizado correctamente');
      } else {
        await ejerciciosApi.create(datosLimpios);
        toast.success('Ejercicio creado correctamente');
      }

      navigate(`/dashboard/ejercicios/${data.subtemaId}`);
    } catch (error: any) {
      const message =
        error.response?.data?.mensaje ||
        `Error al ${isEditMode ? 'actualizar' : 'crear'} el ejercicio`;
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={3}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => {
            if (subtemaId) {
              navigate(`/dashboard/ejercicios/${subtemaId}`);
            } else {
              navigate(-1);
            }
          }}
        >
          Volver
        </Button>
        <Typography variant="h4" component="h1" ml={2}>
          {isEditMode ? 'Editar Ejercicio' : 'Nuevo Ejercicio'}
        </Typography>
      </Box>

      <Paper sx={{ p: 4 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3}>
            <Typography variant="h6">Información Básica</Typography>

            {/* Enunciado */}
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Enunciado del Ejercicio"
              {...register('enunciado')}
              error={!!errors.enunciado}
              helperText={errors.enunciado?.message}
              required
            />

            {/* Tipo, Dificultad y Puntos */}
            <Box display="flex" gap={2}>
              <Controller
                name="tipoEjercicio"
                control={control}
                render={({ field }) => (
                  <TextField
                    select
                    label="Tipo de Ejercicio"
                    {...field}
                    error={!!errors.tipoEjercicio}
                    helperText={errors.tipoEjercicio?.message}
                    required
                    sx={{ flex: 1 }}
                  >
                    <MenuItem value="codificacion">Codificación</MenuItem>
                    <MenuItem value="multiple">Opción Múltiple</MenuItem>
                    <MenuItem value="completar">Completar</MenuItem>
                  </TextField>
                )}
              />

              <Controller
                name="dificultad"
                control={control}
                render={({ field }) => (
                  <TextField
                    select
                    label="Dificultad"
                    {...field}
                    error={!!errors.dificultad}
                    helperText={errors.dificultad?.message}
                    required
                    sx={{ flex: 1 }}
                  >
                    <MenuItem value="basica">Básica</MenuItem>
                    <MenuItem value="intermedia">Intermedia</MenuItem>
                    <MenuItem value="avanzada">Avanzada</MenuItem>
                  </TextField>
                )}
              />

              <TextField
                type="number"
                label="Puntos Máximos"
                {...register('puntosMaximos', { valueAsNumber: true })}
                error={!!errors.puntosMaximos}
                helperText={errors.puntosMaximos?.message}
                required
                InputProps={{ inputProps: { min: 1, max: 100 } }}
                sx={{ flex: 1 }}
              />
            </Box>

            {/* SECCIÓN DE CODIFICACIÓN */}
            {tipoEjercicio === 'codificacion' && (
              <>
                <Divider />
                <Typography variant="h6">Configuración de Código</Typography>
                <Alert severity="info">
                  Este ejercicio será evaluado automáticamente por IA. Proporciona una solución de referencia.
                </Alert>

                <Controller
                  name="lenguajeProgramacion"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      select
                      fullWidth
                      label="Lenguaje de Programación"
                      {...field}
                      error={!!errors.lenguajeProgramacion}
                      helperText={errors.lenguajeProgramacion?.message}
                      required
                    >
                      <MenuItem value="javascript">JavaScript</MenuItem>
                      <MenuItem value="python">Python</MenuItem>
                      <MenuItem value="java">Java</MenuItem>
                      <MenuItem value="cpp">C++</MenuItem>
                      <MenuItem value="csharp">C#</MenuItem>
                    </TextField>
                  )}
                />

                <TextField
                  fullWidth
                  multiline
                  rows={6}
                  label="Código Base"
                  {...register('codigoBase')}
                  error={!!errors.codigoBase}
                  helperText={errors.codigoBase?.message || 'Código inicial que verá el estudiante (opcional)'}
                  placeholder="function ejercicio() {\n  // Tu código aquí\n}"
                />

                <TextField
                  fullWidth
                  multiline
                  rows={6}
                  label="Código Solución"
                  {...register('codigoSolucion')}
                  error={!!errors.codigoSolucion}
                  helperText={errors.codigoSolucion?.message || 'Solución correcta del ejercicio (requerido para evaluación)'}
                  required
                />
              </>
            )}

            {/* SECCIÓN DE OPCIÓN MÚLTIPLE */}
            {tipoEjercicio === 'multiple' && (
              <>
                <Divider />
                <Typography variant="h6">Opciones de Respuesta</Typography>
                <Alert severity="info">
                  Agrega al menos 2 opciones y marca la(s) correcta(s). Las opciones incorrectas se mostrarán en orden aleatorio al estudiante.
                </Alert>

                {opcionesFields.map((field, index) => (
                  <Box key={field.id} display="flex" gap={2} alignItems="flex-start">
                    <TextField
                      fullWidth
                      label={`Opción ${index + 1}`}
                      {...register(`opcionesRespuesta.${index}.texto`)}
                      required
                    />
                    <Controller
                      name={`opcionesRespuesta.${index}.esCorrecta`}
                      control={control}
                      render={({ field }) => (
                        <FormControlLabel
                          control={<Checkbox {...field} checked={field.value} />}
                          label="Correcta"
                          sx={{ minWidth: '120px' }}
                        />
                      )}
                    />
                    {opcionesFields.length > 2 && (
                      <IconButton onClick={() => removeOpcion(index)} color="error">
                        <Delete />
                      </IconButton>
                    )}
                  </Box>
                ))}

                <Button
                  startIcon={<Add />}
                  onClick={() =>
                    appendOpcion({ id: String(Date.now()), texto: '', esCorrecta: false })
                  }
                  variant="outlined"
                >
                  Agregar Opción
                </Button>
              </>
            )}

            {/* SECCIÓN DE COMPLETAR */}
            {tipoEjercicio === 'completar' && (
              <>
                <Divider />
                <Typography variant="h6">Ejercicio de Completar</Typography>
                <Alert severity="info">
                  Escribe el texto y usa <code>____</code> (4 guiones bajos) para marcar los espacios que debe completar el estudiante.
                  <br />
                  Ejemplo: "Una ____ es una estructura de datos que ____"
                </Alert>

                <TextField
                  fullWidth
                  multiline
                  rows={6}
                  label="Texto con Espacios"
                  {...register('textoConEspacios')}
                  error={!!errors.textoConEspacios}
                  helperText={
                    textoConEspacios
                      ? `${contarEspacios(textoConEspacios)} espacio(s) detectado(s)`
                      : 'Usa ____ para marcar espacios'
                  }
                  required
                  placeholder="Una ____ es una estructura de datos que almacena ____"
                />

                <Typography variant="subtitle1">Respuestas Correctas (en orden):</Typography>
                
                {respuestasFields.map((field, index) => (
                  <Box key={field.id} display="flex" gap={2} alignItems="center">
                    <Chip label={index + 1} color="primary" size="small" />
                    <TextField
                      fullWidth
                      label={`Respuesta ${index + 1}`}
                      {...register(`respuestasCorrectas.${index}`)}
                      required
                      placeholder="Escribe la respuesta correcta"
                    />
                    {respuestasFields.length > 1 && (
                      <IconButton onClick={() => removeRespuesta(index)} color="error">
                        <Delete />
                      </IconButton>
                    )}
                  </Box>
                ))}

                <Button
                  startIcon={<Add />}
                  onClick={() => appendRespuesta()}
                  variant="outlined"
                >
                  Agregar Respuesta
                </Button>
              </>
            )}

            {/* Botones */}
            <Box display="flex" gap={2} justifyContent="flex-end" mt={2}>
              <Button
                variant="outlined"
                onClick={() => {
                  if (subtemaId) {
                    navigate(`/dashboard/ejercicios/${subtemaId}`);
                  } else {
                    navigate(-1);
                  }
                }}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                disabled={loading}
              >
                {isEditMode ? 'Actualizar' : 'Crear'} Ejercicio
              </Button>
            </Box>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
};