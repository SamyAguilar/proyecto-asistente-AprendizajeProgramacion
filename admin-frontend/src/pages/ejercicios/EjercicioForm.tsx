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
} from '@mui/material';
import { Save, ArrowBack } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ejerciciosApi } from '../../api/ejercicios.api';
import toast from 'react-hot-toast';

const ejercicioSchema = z.object({
  subtemaId: z.number().min(1),
  enunciado: z.string().min(10, 'El enunciado debe tener al menos 10 caracteres'),
  dificultad: z.enum(['básica', 'intermedia', 'avanzada']),
  tipoEjercicio: z.enum(['codificación', 'múltiple', 'completar']),
  puntosMaximos: z.number().min(1).max(100),
  lenguajeProgramacion: z.string().optional(),
  codigoBase: z.string().optional(),
  codigoSolucion: z.string().optional(),
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
  } = useForm<EjercicioFormData>({
    resolver: zodResolver(ejercicioSchema),
    defaultValues: {
      subtemaId: subtemaId ? Number(subtemaId) : undefined,
      puntosMaximos: 10,
      dificultad: 'básica',
      tipoEjercicio: 'codificación',
    },
  });

  const tipoEjercicio = watch('tipoEjercicio');

  useEffect(() => {
    if (isEditMode) {
      fetchEjercicio();
    }
  }, [id]);

  const fetchEjercicio = async () => {
    try {
      setInitialLoading(true);
      const ejercicio = await ejerciciosApi.getById(Number(id));
      reset({
        subtemaId: ejercicio.subtemaId,
        enunciado: ejercicio.enunciado,
        dificultad: ejercicio.dificultad,
        tipoEjercicio: ejercicio.tipoEjercicio,
        puntosMaximos: ejercicio.puntosMaximos,
        lenguajeProgramacion: ejercicio.lenguajeProgramacion || '',
        codigoBase: ejercicio.codigoBase || '',
        codigoSolucion: ejercicio.codigoSolucion || '',
      });
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

      if (isEditMode) {
        await ejerciciosApi.update(Number(id), data);
        toast.success('Ejercicio actualizado correctamente');
      } else {
        await ejerciciosApi.create(data);
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
              <TextField
                select
                label="Tipo de Ejercicio"
                {...register('tipoEjercicio')}
                error={!!errors.tipoEjercicio}
                helperText={errors.tipoEjercicio?.message}
                required
                sx={{ flex: 1 }}
              >
                <MenuItem value="codificación">Código Abierto</MenuItem>
                <MenuItem value="múltiple">Opción Múltiple</MenuItem>
                <MenuItem value="completar">Llenar Blancos</MenuItem>
              </TextField>

              <TextField
                select
                label="Dificultad"
                {...register('dificultad')}
                error={!!errors.dificultad}
                helperText={errors.dificultad?.message}
                required
                sx={{ flex: 1 }}
              >
                <MenuItem value="básica">Básica</MenuItem>
                <MenuItem value="intermedia">Intermedia</MenuItem>
                <MenuItem value="avanzada">Avanzada</MenuItem>
              </TextField>

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

            {/* Lenguaje de Programación (solo para código) */}
            {tipoEjercicio === 'codificación' && (
              <>
                <Divider />
                <Typography variant="h6">Configuración de Código</Typography>

                <TextField
                  select
                  fullWidth
                  label="Lenguaje de Programación"
                  {...register('lenguajeProgramacion')}
                  error={!!errors.lenguajeProgramacion}
                  helperText={errors.lenguajeProgramacion?.message}
                >
                  <MenuItem value="javascript">JavaScript</MenuItem>
                  <MenuItem value="python">Python</MenuItem>
                  <MenuItem value="java">Java</MenuItem>
                  <MenuItem value="cpp">C++</MenuItem>
                  <MenuItem value="csharp">C#</MenuItem>
                </TextField>

                <TextField
                  fullWidth
                  multiline
                  rows={6}
                  label="Código Base"
                  {...register('codigoBase')}
                  error={!!errors.codigoBase}
                  helperText={errors.codigoBase?.message || 'Código inicial que verá el estudiante'}
                  placeholder="function ejercicio() {\n  // Tu código aquí\n}"
                />

                <TextField
                  fullWidth
                  multiline
                  rows={6}
                  label="Código Solución"
                  {...register('codigoSolucion')}
                  error={!!errors.codigoSolucion}
                  helperText={errors.codigoSolucion?.message || 'Solución correcta del ejercicio'}
                />
              </>
            )}

            {/* Botones */}
            <Box display="flex" gap={2} justifyContent="flex-end">
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