// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { Toaster } from 'react-hot-toast';
import { theme } from './theme/theme';

// Auth Pages
import { Login } from './pages/auth/Login';

// Dashboard
import { Dashboard } from './pages/Dashboard';

// Materias
import { MateriasList } from './pages/materias/MateriasList';
import { MateriaForm } from './pages/materias/MateriaForm';

// Temas
import { TemasList } from './pages/temas/TemasList';
import { TemaForm } from './pages/temas/TemaForm';

// Subtemas
import { SubtemasList } from './pages/subtemas/SubtemasList';
import { SubtemaForm } from './pages/subtemas/SubtemaForm';

// Ejercicios
import { EjerciciosList } from './pages/ejercicios/EjerciciosList';
import { EjercicioForm } from './pages/ejercicios/EjercicioForm';

// Usuarios Admin
import { UsuariosList } from './pages/usuarios/UsuariosList';
import { CrearAdmin } from './pages/usuarios/CrearAdmin';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('access_token');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          
          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          >
            {/* Redirect dashboard root to materias */}
            <Route index element={<Navigate to="/dashboard/materias" replace />} />
            
            {/* === MATERIAS ROUTES === */}
            <Route path="materias" element={<MateriasList />} />
            <Route path="materias/crear" element={<MateriaForm />} />
            <Route path="materias/editar/:id" element={<MateriaForm />} />
            
            {/* === TEMAS ROUTES === */}
            <Route path="temas/:materiaId" element={<TemasList />} />
            <Route path="temas/crear/:materiaId" element={<TemaForm />} />
            <Route path="temas/editar/:id" element={<TemaForm />} />
            
            {/* === SUBTEMAS ROUTES === */}
            <Route path="subtemas/:temaId" element={<SubtemasList />} />
            <Route path="subtemas/crear/:temaId" element={<SubtemaForm />} />
            <Route path="subtemas/editar/:id" element={<SubtemaForm />} />
            
            {/* === EJERCICIOS ROUTES === */}
            <Route path="ejercicios/:subtemaId" element={<EjerciciosList />} />
            <Route path="ejercicios/crear/:subtemaId" element={<EjercicioForm />} />
            <Route path="ejercicios/editar/:id" element={<EjercicioForm />} />
            
            {/* === USUARIOS ADMIN ROUTES === */}
            <Route path="usuarios" element={<UsuariosList />} />
            <Route path="crear-admin" element={<CrearAdmin />} />
          </Route>

          {/* Redirect root to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* 404 - Redirect to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
      
      {/* Toast notifications with custom styles */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '8px',
            background: '#1e293b',
            color: '#fff',
            fontSize: '0.875rem',
            fontWeight: 500,
            padding: '12px 16px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
            style: {
              background: '#059669',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
            style: {
              background: '#dc2626',
            },
          },
          loading: {
            iconTheme: {
              primary: '#3b82f6',
              secondary: '#fff',
            },
          },
        }}
      />
    </ThemeProvider>
  );
}

export default App;