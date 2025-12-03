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
  Tabs,
  Tab,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
  School as SchoolIcon,
  PersonAdd as PersonAddIcon,
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

const registerSchema = z.object({
  email: z.string().email('Email invalido'),
  contraseña: z.string().min(6, 'La contrasena debe tener al menos 6 caracteres'),
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  apellido: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onLoginSubmit = async (data: LoginFormData) => {
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

  const onRegisterSubmit = async (data: RegisterFormData) => {
    try {
      setLoading(true);
      setError('');

      await axiosInstance.post('/auth/registro', {
        ...data,
        rol: 'admin'
      });

      toast.success('Cuenta de administrador creada exitosamente. Ahora puedes iniciar sesión.');
      
      // Cambiar a tab de login y limpiar formulario
      setTabValue(0);
      registerForm.reset();
    } catch (error: any) {
      console.error('Error completo:', error);
      const message = error.response?.data?.message || 'Error al crear cuenta';
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

            {/* Tabs */}
            <Tabs
              value={tabValue}
              onChange={(_, newValue) => {
                setTabValue(newValue);
                setError('');
              }}
              variant="fullWidth"
              sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab label="Iniciar Sesión" icon={<LoginIcon />} iconPosition="start" />
              <Tab label="Crear Cuenta" icon={<PersonAddIcon />} iconPosition="start" />
            </Tabs>

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

            {/* Formulario de Login */}
            {tabValue === 0 && (
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <TextField
                    fullWidth
                    label="Correo Electronico"
                    type="email"
                    {...loginForm.register('email')}
                    error={!!loginForm.formState.errors.email}
                    helperText={loginForm.formState.errors.email?.message}
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
                    {...loginForm.register('contraseña')}
                    error={!!loginForm.formState.errors.contraseña}
                    helperText={loginForm.formState.errors.contraseña?.message}
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
            )}

            {/* Formulario de Registro */}
            {tabValue === 1 && (
              <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <TextField
                    fullWidth
                    label="Nombre"
                    {...registerForm.register('nombre')}
                    error={!!registerForm.formState.errors.nombre}
                    helperText={registerForm.formState.errors.nombre?.message}
                    autoFocus
                    disabled={loading}
                    InputProps={{
                      sx: { borderRadius: 2 },
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Apellido"
                    {...registerForm.register('apellido')}
                    error={!!registerForm.formState.errors.apellido}
                    helperText={registerForm.formState.errors.apellido?.message}
                    disabled={loading}
                    InputProps={{
                      sx: { borderRadius: 2 },
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Correo Electronico"
                    type="email"
                    {...registerForm.register('email')}
                    error={!!registerForm.formState.errors.email}
                    helperText={registerForm.formState.errors.email?.message}
                    autoComplete="email"
                    disabled={loading}
                    InputProps={{
                      sx: { borderRadius: 2 },
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Contrasena"
                    type={showPassword ? 'text' : 'password'}
                    {...registerForm.register('contraseña')}
                    error={!!registerForm.formState.errors.contraseña}
                    helperText={registerForm.formState.errors.contraseña?.message}
                    autoComplete="new-password"
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
                    startIcon={loading ? <CircularProgress size={20} /> : <PersonAddIcon />}
                    sx={{
                      mt: 1,
                      py: 1.8,
                      borderRadius: 2,
                      fontSize: '1rem',
                      fontWeight: 700,
                      textTransform: 'none',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      boxShadow: '0 6px 20px rgba(16, 185, 129, 0.4)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                        boxShadow: '0 8px 24px rgba(16, 185, 129, 0.5)',
                        transform: 'translateY(-2px)',
                      },
                      '&:active': {
                        transform: 'translateY(0)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {loading ? 'Creando cuenta...' : 'Crear Cuenta de Administrador'}
                  </Button>
                </Box>
              </form>
            )}

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
                  {tabValue === 0 ? (
                    <>
                      Solo usuarios con rol de <strong>Administrador</strong> o{' '}
                      <strong>Profesor</strong> pueden acceder
                    </>
                  ) : (
                    <>
                      La nueva cuenta se creará con permisos de <strong>Administrador</strong>
                    </>
                  )}
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