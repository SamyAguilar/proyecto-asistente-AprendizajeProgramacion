// src/pages/usuarios/CrearAdmin.tsx
import { useState } from 'react';
import { Box, Paper, Typography, TextField, Button, Stack, Alert } from '@mui/material';
import { PersonAdd } from '@mui/icons-material';
import { crearAdmin } from '../../api/usuarios-admin.api';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const crearAdminSchema = z.object({
  nombre: z.string().min(2, 'Mínimo 2 caracteres'),
  apellido: z.string().min(2, 'Mínimo 2 caracteres'),
  email: z.string().email('Email inválido'),
  contraseña: z.string().min(6, 'Mínimo 6 caracteres'),
});

type CrearAdminData = z.infer<typeof crearAdminSchema>;

export const CrearAdmin = () => {
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CrearAdminData>({
    resolver: zodResolver(crearAdminSchema),
  });

  const onSubmit = async (data: CrearAdminData) => {
    try {
      setLoading(true);
      await crearAdmin(data);
      toast.success('Administrador creado exitosamente');
      reset();
    } catch (error: any) {
      toast.error(error.response?.data?.mensaje || 'Error al crear administrador');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
        Crear Nuevo Administrador
      </Typography>

      <Paper sx={{ p: 4, mt: 3 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3}>
            <Alert severity="info">
              El nuevo administrador tendrá acceso completo al panel de administración
            </Alert>

            <TextField
              fullWidth
              label="Nombre"
              {...register('nombre')}
              error={!!errors.nombre}
              helperText={errors.nombre?.message}
              disabled={loading}
            />

            <TextField
              fullWidth
              label="Apellido"
              {...register('apellido')}
              error={!!errors.apellido}
              helperText={errors.apellido?.message}
              disabled={loading}
            />

            <TextField
              fullWidth
              label="Email"
              type="email"
              {...register('email')}
              error={!!errors.email}
              helperText={errors.email?.message}
              disabled={loading}
            />

            <TextField
              fullWidth
              label="Contraseña"
              type="password"
              {...register('contraseña')}
              error={!!errors.contraseña}
              helperText={errors.contraseña?.message}
              disabled={loading}
            />

            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              startIcon={<PersonAdd />}
            >
              {loading ? 'Creando...' : 'Crear Administrador'}
            </Button>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
};