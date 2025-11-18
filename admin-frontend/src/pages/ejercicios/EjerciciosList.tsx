// src/pages/ejercicios/EjerciciosList.tsx
import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Chip,
} from '@mui/material';
import { Edit, Delete, Add, ArrowBack } from '@mui/icons-material';
import { ejerciciosApi } from '../../api/ejercicios.api';
import type { Ejercicio } from '../../types/materia.types';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';

const getDificultadColor = (dificultad: string) => {
  switch (dificultad) {
    case 'básica':
      return 'success';
    case 'intermedia':
      return 'warning';
    case 'avanzada':
      return 'error';
    default:
      return 'default';
  }
};

export const EjerciciosList = () => {
  const { subtemaId } = useParams<{ subtemaId: string }>();
  const [ejercicios, setEjercicios] = useState<Ejercicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; ejercicio: Ejercicio | null }>({
    open: false,
    ejercicio: null,
  });

  const navigate = useNavigate();

  const fetchEjercicios = async () => {
    if (!subtemaId) return;
    
    try {
      setLoading(true);
      const data = await ejerciciosApi.getBySubtema(Number(subtemaId));
      setEjercicios(data);
    } catch (error: any) {
      toast.error('Error al cargar ejercicios');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEjercicios();
  }, [subtemaId]);

  const handleDelete = async () => {
    if (!deleteDialog.ejercicio) return;

    try {
      await ejerciciosApi.delete(deleteDialog.ejercicio.id);
      toast.success('Ejercicio eliminado correctamente');
      setDeleteDialog({ open: false, ejercicio: null });
      fetchEjercicios();
    } catch (error: any) {
      const message = error.response?.data?.mensaje || 'Error al eliminar ejercicio';
      toast.error(message);
    }
  };

  if (loading && ejercicios.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton onClick={() => navigate(-1)}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h4" component="h1">
            Gestión de Ejercicios
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate(`/dashboard/ejercicios/crear/${subtemaId}`)}
        >
          Nuevo Ejercicio
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Enunciado</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Dificultad</TableCell>
              <TableCell>Puntos</TableCell>
              <TableCell>Lenguaje</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ejercicios.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography color="textSecondary">No hay ejercicios registrados</Typography>
                </TableCell>
              </TableRow>
            ) : (
              ejercicios.map((ejercicio) => (
                <TableRow key={ejercicio.id} hover>
                  <TableCell>{ejercicio.id}</TableCell>
                  <TableCell>
                    <strong>
                      {ejercicio.enunciado.substring(0, 60)}
                      {ejercicio.enunciado.length > 60 ? '...' : ''}
                    </strong>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={ejercicio.tipoEjercicio.replace('_', ' ')} 
                      size="small" 
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={ejercicio.dificultad} 
                      size="small" 
                      color={getDificultadColor(ejercicio.dificultad)}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip label={ejercicio.puntosMaximos} size="small" color="primary" />
                  </TableCell>
                  <TableCell>{ejercicio.lenguajeProgramacion || '-'}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      color="primary"
                      onClick={() => navigate(`/dashboard/ejercicios/editar/${ejercicio.id}`)}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => setDeleteDialog({ open: true, ejercicio })}
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog de confirmación de eliminación */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, ejercicio: null })}
      >
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas eliminar este ejercicio?
          </Typography>
          <Typography variant="caption" color="error" sx={{ mt: 2, display: 'block' }}>
            Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, ejercicio: null })}>
            Cancelar
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};