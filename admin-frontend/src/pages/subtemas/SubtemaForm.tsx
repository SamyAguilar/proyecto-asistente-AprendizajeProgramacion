// src/pages/subtemas/SubtemaForm.tsx
import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  TextField,
  Typography,
  Stack,
  CircularProgress,
} from '@mui/material';
import { Save, ArrowBack } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { subtemasApi } from '../../api/subtemas.api';
import toast from 'react-hot-toast';

const subtemaSchema = z.object({
  temaId: z.number().min(1),
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(255),
  descripcion: z.string().optional(),
  contenidoDetalle: z.string().optional(),
  orden: z.number().min(0).optional().or(z.nan()),
});

type SubtemaFormData = z.infer<typeof subtemaSchema>;

export const SubtemaForm = () => {
  const { id, temaId } = useParams<{ id?: string; temaId?: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!id);

  const isEditMode = !!id;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SubtemaFormData>({
    resolver: zodResolver(subtemaSchema),
    defaultValues: {
      temaId: temaId ? Number(temaId) : undefined,
    },
  });

  useEffect(() => {
    if (isEditMode) {
      fetchSubtema();
    }
  }, [id]);

  const fetchSubtema = async () => {
    try {
      setInitialLoading(true);
      const subtema = await subtemasApi.getById(Number(id));
      reset({
        temaId: subtema.temaId,
        nombre: subtema.nombre,
        descripcion: subtema.descripcion || '',
        contenidoDetalle: subtema.contenidoDetalle || '',
        orden: subtema.orden || 0,
      });
    } catch (error) {
      toast.error('Error al cargar el subtema');
      navigate(-1);
    } finally {
      setInitialLoading(false);
    }
  };

  const onSubmit = async (data: SubtemaFormData) => {
    try {
      setLoading(true);

      const cleanData = {
        ...data,
        orden: isNaN(data.orden as number) ? undefined : data.orden,
      };

      if (isEditMode) {
        await subtemasApi.update(Number(id), cleanData);
        toast.success('Subtema actualizado correctamente');
      } else {
        await subtemasApi.create(cleanData);
        toast.success('Subtema creado correctamente');
      }

      navigate(`/dashboard/subtemas/${data.temaId}`);
    } catch (error: any) {
      const message =
        error.response?.data?.mensaje ||
        `Error al ${isEditMode ? 'actualizar' : 'crear'} el subtema`;
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
            if (temaId) {
              navigate(`/dashboard/subtemas/${temaId}`);
            } else {
              navigate(-1);
            }
          }}
        >
          Volver
        </Button>
        <Typography variant="h4" component="h1" ml={2}>
          {isEditMode ? 'Editar Subtema' : 'Nuevo Subtema'}
        </Typography>
      </Box>

      <Paper sx={{ p: 4 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3}>
            {/* Nombre y Orden */}
            <Box display="flex" gap={2}>
              <Box flex={3}>
                <TextField
                  fullWidth
                  label="Nombre del Subtema"
                  {...register('nombre')}
                  error={!!errors.nombre}
                  helperText={errors.nombre?.message}
                  required
                />
              </Box>
              <Box flex={1}>
                <TextField
                  fullWidth
                  type="number"
                  label="Orden"
                  {...register('orden', { valueAsNumber: true })}
                  error={!!errors.orden}
                  helperText={errors.orden?.message || 'Orden de visualización'}
                  InputProps={{ inputProps: { min: 0 } }}
                />
              </Box>
            </Box>

            {/* Descripción */}
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Descripción"
              {...register('descripcion')}
              error={!!errors.descripcion}
              helperText={errors.descripcion?.message || 'Descripción breve del subtema'}
            />

            {/* Contenido Detalle */}
            <TextField
              fullWidth
              multiline
              rows={10}
              label="Contenido Detallado"
              {...register('contenidoDetalle')}
              error={!!errors.contenidoDetalle}
              helperText={errors.contenidoDetalle?.message || 'Contenido detallado del subtema (teoría, ejemplos, etc.)'}
            />

            {/* Botones */}
            <Box display="flex" gap={2} justifyContent="flex-end">
              <Button
                variant="outlined"
                onClick={() => {
                  if (temaId) {
                    navigate(`/dashboard/subtemas/${temaId}`);
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
                {isEditMode ? 'Actualizar' : 'Crear'} Subtema
              </Button>
            </Box>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
};