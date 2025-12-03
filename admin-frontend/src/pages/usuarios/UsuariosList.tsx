// src/pages/usuarios/UsuariosList.tsx
import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Alert,
} from '@mui/material';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  CheckCircle,
  Block,
  PauseCircle,
} from '@mui/icons-material';
import { listarUsuarios, cambiarEstadoUsuario } from '../../api/usuarios-admin.api';
import type { Usuario } from '../../api/usuarios-admin.api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export const UsuariosList = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [usuariosFiltrados, setUsuariosFiltrados] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | null>(null);

  useEffect(() => {
    cargarUsuarios();
  }, []);

  useEffect(() => {
    filtrarUsuarios();
  }, [busqueda, usuarios]);

  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      const data = await listarUsuarios();
      setUsuarios(data);
      setUsuariosFiltrados(data);
    } catch (error) {
      toast.error('Error al cargar usuarios');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filtrarUsuarios = () => {
    if (!busqueda.trim()) {
      setUsuariosFiltrados(usuarios);
      return;
    }

    const query = busqueda.toLowerCase();
    const filtrados = usuarios.filter(
      (u) =>
        u.nombre.toLowerCase().includes(query) ||
        u.apellido.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query)
    );
    setUsuariosFiltrados(filtrados);
  };

  const handleCambiarEstado = async (estado: 'activo' | 'suspendido' | 'inactivo') => {
    if (!usuarioSeleccionado) return;

    try {
      await cambiarEstadoUsuario(usuarioSeleccionado.id, estado);
      toast.success('Estado actualizado correctamente');
      setDialogOpen(false);
      cargarUsuarios();
    } catch (error) {
      toast.error('Error al cambiar estado');
      console.error(error);
    }
  };

  const abrirDialogo = (usuario: Usuario) => {
    setUsuarioSeleccionado(usuario);
    setDialogOpen(true);
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'activo':
        return 'success';
      case 'suspendido':
        return 'error';
      case 'inactivo':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getEstadoLabel = (estado: string) => {
    switch (estado) {
      case 'activo':
        return 'Activo';
      case 'suspendido':
        return 'Suspendido';
      case 'inactivo':
        return 'Inactivo';
      default:
        return estado;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
        Gestión de Usuarios
      </Typography>

      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          placeholder="Buscar por nombre o email..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          sx={{ flexGrow: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <Button variant="contained" onClick={cargarUsuarios}>
          Actualizar
        </Button>
      </Box>

      <TableContainer component={Paper}>
        {loading && <LinearProgress />}
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Materias</TableCell>
              <TableCell>Progreso</TableCell>
              <TableCell>Última Conexión</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {usuariosFiltrados.map((usuario) => (
              <TableRow key={usuario.id} hover>
                <TableCell>{usuario.id}</TableCell>
                <TableCell>{`${usuario.nombre} ${usuario.apellido}`}</TableCell>
                <TableCell>{usuario.email}</TableCell>
                <TableCell>
                  <Chip
                    label={getEstadoLabel(usuario.estado)}
                    color={getEstadoColor(usuario.estado) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {usuario.materiasCompletadas}/{usuario.totalMaterias}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 100 }}>
                      <LinearProgress
                        variant="determinate"
                        value={usuario.progresoGeneral}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>
                    <Typography variant="body2">
                      {usuario.progresoGeneral.toFixed(1)}%
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  {usuario.ultimaConexion
                    ? format(new Date(usuario.ultimaConexion), 'dd/MM/yyyy HH:mm')
                    : 'Nunca'}
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    size="small"
                    onClick={() => abrirDialogo(usuario)}
                    color="primary"
                  >
                    <EditIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {!loading && usuariosFiltrados.length === 0 && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">No se encontraron usuarios</Typography>
          </Box>
        )}
      </TableContainer>

      {/* Diálogo para cambiar estado */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Cambiar estado de {usuarioSeleccionado?.nombre} {usuarioSeleccionado?.apellido}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Alert severity="info">
              Estado actual: <strong>{getEstadoLabel(usuarioSeleccionado?.estado || '')}</strong>
            </Alert>

            <Button
              fullWidth
              variant="outlined"
              startIcon={<CheckCircle />}
              color="success"
              onClick={() => handleCambiarEstado('activo')}
              disabled={usuarioSeleccionado?.estado === 'activo'}
            >
              Activar Usuario
            </Button>

            <Button
              fullWidth
              variant="outlined"
              startIcon={<Block />}
              color="error"
              onClick={() => handleCambiarEstado('suspendido')}
              disabled={usuarioSeleccionado?.estado === 'suspendido'}
            >
              Suspender Usuario
            </Button>

            <Button
              fullWidth
              variant="outlined"
              startIcon={<PauseCircle />}
              color="warning"
              onClick={() => handleCambiarEstado('inactivo')}
              disabled={usuarioSeleccionado?.estado === 'inactivo'}
            >
              Desactivar Usuario
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};