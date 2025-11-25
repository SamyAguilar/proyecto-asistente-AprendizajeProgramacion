// src/pages/materias/MateriaForm.tsx
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
import { materiasApi } from '../../api/materias.api';
import toast from 'react-hot-toast';

const materiaSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(255),
  codigo: z.string().min(3, 'El código debe tener al menos 3 caracteres').max(50),
  descripcion: z.string().optional(),
  semestre: z.number().min(1).max(12).optional().or(z.nan()),
  creditos: z.number().min(1).max(20).optional().or(z.nan()),
  prerequisitos: z.string().optional(),
});

type MateriaFormData = z.infer<typeof materiaSchema>;

export const MateriaForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!id);

  const isEditMode = !!id;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<MateriaFormData>({
    resolver: zodResolver(materiaSchema),
  });

  useEffect(() => {
    if (isEditMode) {
      fetchMateria();
    }
  }, [id]);

  const fetchMateria = async () => {
    try {
      setInitialLoading(true);
      const materia = await materiasApi.getById(Number(id));
      reset({
        nombre: materia.nombre,
        codigo: materia.codigo,
        descripcion: materia.descripcion || '',
        semestre: materia.semestre || undefined,
        creditos: materia.creditos || undefined,
        prerequisitos: materia.prerequisitos || '',
      });
    } catch (error) {
      toast.error('Error al cargar la materia');
      navigate('/dashboard/materias');
    } finally {
      setInitialLoading(false);
    }
  };

  const onSubmit = async (data: MateriaFormData) => {
    try {
      setLoading(true);

      const cleanData = {
        ...data,
        semestre: isNaN(data.semestre as number) ? undefined : data.semestre,
        creditos: isNaN(data.creditos as number) ? undefined : data.creditos,
      };

      if (isEditMode) {
        await materiasApi.update(Number(id), cleanData);
        toast.success('Materia actualizada correctamente');
      } else {
        await materiasApi.create(cleanData);
        toast.success('Materia creada correctamente');
      }

      navigate('/dashboard/materias');
    } catch (error: any) {
      const message =
        error.response?.data?.mensaje ||
        `Error al ${isEditMode ? 'actualizar' : 'crear'} la materia`;
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
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/dashboard/materias')}>
          Volver
        </Button>
        <Typography variant="h4" component="h1" ml={2}>
          {isEditMode ? 'Editar Materia' : 'Nueva Materia'}
        </Typography>
      </Box>

      <Paper sx={{ p: 4 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3}>
            {/* Fila 1: Nombre y Código */}
            <Box display="flex" gap={2}>
              <Box flex={2}>
                <TextField
                  fullWidth
                  label="Nombre de la Materia"
                  {...register('nombre')}
                  error={!!errors.nombre}
                  helperText={errors.nombre?.message}
                  required
                />
              </Box>
              <Box flex={1}>
                <TextField
                  fullWidth
                  label="Código"
                  {...register('codigo')}
                  error={!!errors.codigo}
                  helperText={errors.codigo?.message}
                  required
                />
              </Box>
            </Box>

            {/* Descripción */}
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Descripción"
              {...register('descripcion')}
              error={!!errors.descripcion}
              helperText={errors.descripcion?.message}
            />

            {/* Fila 2: Semestre y Créditos */}
            <Box display="flex" gap={2}>
              <Box flex={1}>
                <TextField
                  fullWidth
                  type="number"
                  label="Semestre"
                  {...register('semestre', { valueAsNumber: true })}
                  error={!!errors.semestre}
                  helperText={errors.semestre?.message}
                  InputProps={{ inputProps: { min: 1, max: 12 } }}
                />
              </Box>
              <Box flex={1}>
                <TextField
                  fullWidth
                  type="number"
                  label="Créditos"
                  {...register('creditos', { valueAsNumber: true })}
                  error={!!errors.creditos}
                  helperText={errors.creditos?.message}
                  InputProps={{ inputProps: { min: 1, max: 20 } }}
                />
              </Box>
            </Box>

            {/* Prerequisitos */}
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Prerequisitos"
              {...register('prerequisitos')}
              error={!!errors.prerequisitos}
              helperText={
                errors.prerequisitos?.message ||
                'Ejemplo: Materia1, Materia2'
              }
            />

            {/* Botones */}
            <Box display="flex" gap={2} justifyContent="flex-end">
              <Button
                variant="outlined"
                onClick={() => navigate('/dashboard/materias')}
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
                {isEditMode ? 'Actualizar' : 'Crear'} Materia
              </Button>
            </Box>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
};