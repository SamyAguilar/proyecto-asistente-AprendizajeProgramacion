// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { Toaster } from 'react-hot-toast';

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

// Theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

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
          </Route>

          {/* Redirect root to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* 404 - Redirect to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
      
      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#4caf50',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#f44336',
              secondary: '#fff',
            },
          },
        }}
      />
    </ThemeProvider>
  );
}

export default App;