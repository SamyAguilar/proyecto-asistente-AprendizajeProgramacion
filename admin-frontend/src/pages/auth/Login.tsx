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
  CircularProgress,
  Paper,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import axiosInstance from '../../api/axios.config';
import toast from 'react-hot-toast';

const loginSchema = z.object({
  email: z.string().email('Email invalido'),
  contraseña: z.string().min(6, 'La contrasena debe tener al menos 6 caracteres'),
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
      const { accessToken, refreshToken, usuario } = response.data;

      if (usuario.rol !== 'admin' && usuario.rol !== 'profesor') {
        setError('No tienes permisos de administrador');
        setLoading(false);
        return;
      }

      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
      localStorage.setItem('user_role', usuario.rol);
      localStorage.setItem('user_name', `${usuario.nombre} ${usuario.apellido}`);
      localStorage.setItem('user_email', usuario.email);

      toast.success(`Bienvenido ${usuario.nombre}!`);

      setTimeout(() => {
        navigate('/dashboard/materias');
      }, 500);
    } catch (error: any) {
      console.error('Error completo:', error);
      const message = error.response?.data?.message || 'Error al iniciar sesion';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative elements */}
      <Box
        sx={{
          position: 'absolute',
          top: '-10%',
          right: '-5%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.15)',
          filter: 'blur(80px)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '-10%',
          left: '-5%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.15)',
          filter: 'blur(80px)',
        }}
      />

      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <Card
          sx={{
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(10px)',
            animation: 'fadeIn 0.5s ease-in-out',
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
            {/* Logo y titulo */}
            <Box textAlign="center" mb={4}>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 96,
                  height: 96,
                  borderRadius: '24px',
                  background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                  mb: 3,
                  boxShadow: '0 12px 32px rgba(99, 102, 241, 0.4)',
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.05) rotate(5deg)',
                  },
                }}
              >
                <SchoolIcon sx={{ fontSize: 52, color: 'white' }} />
              </Box>

              <Typography
                variant="h4"
                component="h1"
                gutterBottom
                sx={{ fontWeight: 800, color: 'text.primary', mb: 1 }}
              >
                Panel Administrativo
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                Sistema de Gestion Educativa
              </Typography>
            </Box>

            {error && (
              <Alert
                severity="error"
                sx={{
                  mb: 3,
                  borderRadius: 2,
                  animation: 'slideInRight 0.3s ease-out',
                }}
                onClose={() => setError('')}
              >
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <TextField
                  fullWidth
                  label="Correo Electronico"
                  type="email"
                  {...register('email')}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  autoComplete="email"
                  autoFocus
                  disabled={loading}
                  InputProps={{
                    sx: { borderRadius: 2 },
                  }}
                />

                <TextField
                  fullWidth
                  label="Contrasena"
                  type={showPassword ? 'text' : 'password'}
                  {...register('contraseña')}
                  error={!!errors.contraseña}
                  helperText={errors.contraseña?.message}
                  autoComplete="current-password"
                  disabled={loading}
                  InputProps={{
                    sx: { borderRadius: 2 },
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          disabled={loading}
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
                  startIcon={loading ? <CircularProgress size={20} /> : <LoginIcon />}
                  sx={{
                    mt: 1,
                    py: 1.8,
                    borderRadius: 2,
                    fontSize: '1rem',
                    fontWeight: 700,
                    textTransform: 'none',
                    background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                    boxShadow: '0 6px 20px rgba(99, 102, 241, 0.4)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #4f46e5 0%, #db2777 100%)',
                      boxShadow: '0 8px 24px rgba(99, 102, 241, 0.5)',
                      transform: 'translateY(-2px)',
                    },
                    '&:active': {
                      transform: 'translateY(0)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  {loading ? 'Iniciando sesion...' : 'Iniciar Sesion'}
                </Button>
              </Box>
            </form>

            <Box mt={4} textAlign="center">
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  bgcolor: 'info.lighter',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'info.light',
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Solo usuarios con rol de <strong>Administrador</strong> o{' '}
                  <strong>Profesor</strong> pueden acceder
                </Typography>
              </Paper>
            </Box>
          </CardContent>
        </Card>

        {/* Footer */}
        <Typography
          variant="body2"
          align="center"
          sx={{
            mt: 3,
            color: 'white',
            opacity: 0.9,
            textShadow: '0 2px 4px rgba(0,0,0,0.2)',
          }}
        >
          Sistema Educativo v1.0 - {new Date().getFullYear()}
        </Typography>
      </Container>
    </Box>
  );
};