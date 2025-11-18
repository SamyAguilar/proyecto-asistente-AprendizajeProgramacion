// src/pages/auth/Login.tsx
import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Container,
  Alert,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff, Login as LoginIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import axiosInstance from '../../api/axios.config';
import toast from 'react-hot-toast';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  contraseña: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setLoading(true);
      setError('');

      const response = await axiosInstance.post('/auth/login', data);

      console.log('Respuesta completa:', response.data);

      // CORRECCIÓN: Acceder directamente a response.data (no a response.data.data)
      const { accessToken, refreshToken, usuario } = response.data;

      // Verificar que el usuario sea admin o profesor
      if (usuario.rol !== 'admin' && usuario.rol !== 'profesor') {
        setError('No tienes permisos de administrador');
        setLoading(false);
        return;
      }

      // Guardar tokens (usar los nombres correctos del backend)
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
      localStorage.setItem('user_role', usuario.rol);
      localStorage.setItem('user_name', `${usuario.nombre} ${usuario.apellido}`);
      localStorage.setItem('user_email', usuario.email);

      toast.success(`¡Bienvenido ${usuario.nombre}!`);
      
      // Pequeño delay para que se vea el toast
      setTimeout(() => {
        navigate('/dashboard/materias');
      }, 500);

    } catch (error: any) {
      console.error('Error completo:', error);
      const message = error.response?.data?.message || 'Error al iniciar sesión';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Card sx={{ width: '100%' }}>
          <CardContent sx={{ p: 4 }}>
            <Box textAlign="center" mb={4}>
              <Typography variant="h4" component="h1" gutterBottom>
                Panel de Administración
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sistema de Gestión Educativa
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                {...register('email')}
                error={!!errors.email}
                helperText={errors.email?.message}
                margin="normal"
                autoComplete="email"
                autoFocus
              />

              <TextField
                fullWidth
                label="Contraseña"
                type={showPassword ? 'text' : 'password'}
                {...register('contraseña')}
                error={!!errors.contraseña}
                helperText={errors.contraseña?.message}
                margin="normal"
                autoComplete="current-password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                startIcon={<LoginIcon />}
                sx={{ mt: 3, mb: 2 }}
              >
                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>
            </form>

            <Box mt={3} textAlign="center">
              <Typography variant="caption" color="text.secondary">
                Solo usuarios con rol de <strong>Administrador</strong> o{' '}
                <strong>Profesor</strong> pueden acceder
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};