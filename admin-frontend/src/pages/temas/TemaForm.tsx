// src/pages/temas/TemaForm.tsx
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
} from '@mui/material';
import { Save, ArrowBack } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { temasApi } from '../../api/temas.api';
import { materiasApi } from '../../api/materias.api';
import type { Materia } from '../../types/materia.types';
import toast from 'react-hot-toast';

const temaSchema = z.object({
  materiaId: z.number().min(1, 'Selecciona una materia'),
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(255),
  descripcion: z.string().optional(),
  contenido: z.string().optional(),
  orden: z.number().min(0).optional().or(z.nan()),
});

type TemaFormData = z.infer<typeof temaSchema>;

export const TemaForm = () => {
  const { id, materiaId } = useParams<{ id?: string; materiaId?: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!id);
  const [materias, setMaterias] = useState<Materia[]>([]);

  const isEditMode = !!id;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<TemaFormData>({
    resolver: zodResolver(temaSchema),
    defaultValues: {
      materiaId: materiaId ? Number(materiaId) : undefined,
    },
  });

  useEffect(() => {
    fetchMaterias();
    if (isEditMode) {
      fetchTema();
    } else if (materiaId) {
      setValue('materiaId', Number(materiaId));
    }
  }, [id, materiaId]);

  const fetchMaterias = async () => {
    try {
      const data = await materiasApi.getAll();
      setMaterias(data);
    } catch (error) {
      toast.error('Error al cargar materias');
    }
  };

  const fetchTema = async () => {
    try {
      setInitialLoading(true);
      const tema = await temasApi.getById(Number(id));
      reset({
        materiaId: tema.materiaId,
        nombre: tema.nombre,
        descripcion: tema.descripcion || '',
        contenido: tema.contenido || '',
        orden: tema.orden || 0,
      });
    } catch (error) {
      toast.error('Error al cargar el tema');
      navigate('/dashboard/materias');
    } finally {
      setInitialLoading(false);
    }
  };

  const onSubmit = async (data: TemaFormData) => {
    try {
      setLoading(true);

      const cleanData = {
        ...data,
        orden: isNaN(data.orden as number) ? undefined : data.orden,
      };

      if (isEditMode) {
        await temasApi.update(Number(id), cleanData);
        toast.success('Tema actualizado correctamente');
      } else {
        await temasApi.create(cleanData);
        toast.success('Tema creado correctamente');
      }

      navigate(`/dashboard/temas/${data.materiaId}`);
    } catch (error: any) {
      const message =
        error.response?.data?.mensaje ||
        `Error al ${isEditMode ? 'actualizar' : 'crear'} el tema`;
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
          onClick={() => navigate(materiaId ? `/dashboard/temas/${materiaId}` : '/dashboard/materias')}
        >
          Volver
        </Button>
        <Typography variant="h4" component="h1" ml={2}>
          {isEditMode ? 'Editar Tema' : 'Nuevo Tema'}
        </Typography>
      </Box>

      <Paper sx={{ p: 4 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3}>
            {/* Materia */}
            <TextField
              select
              fullWidth
              label="Materia"
              {...register('materiaId', { valueAsNumber: true })}
              error={!!errors.materiaId}
              helperText={errors.materiaId?.message}
              required
              disabled={!!materiaId || isEditMode}
            >
              {materias.map((materia) => (
                <MenuItem key={materia.id} value={materia.id}>
                  {materia.codigo} - {materia.nombre}
                </MenuItem>
              ))}
            </TextField>

            {/* Nombre y Orden */}
            <Box display="flex" gap={2}>
              <Box flex={3}>
                <TextField
                  fullWidth
                  label="Nombre del Tema"
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
              helperText={errors.descripcion?.message || 'Descripción breve del tema'}
            />

            {/* Contenido */}
            <TextField
              fullWidth
              multiline
              rows={8}
              label="Contenido"
              {...register('contenido')}
              error={!!errors.contenido}
              helperText={errors.contenido?.message || 'Contenido detallado del tema'}
            />

            {/* Botones */}
            <Box display="flex" gap={2} justifyContent="flex-end">
              <Button
                variant="outlined"
                onClick={() => navigate(materiaId ? `/dashboard/temas/${materiaId}` : '/dashboard/materias')}
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
                {isEditMode ? 'Actualizar' : 'Crear'} Tema
              </Button>
            </Box>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
};