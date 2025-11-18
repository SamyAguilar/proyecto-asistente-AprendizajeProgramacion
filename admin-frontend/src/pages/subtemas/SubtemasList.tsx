// src/pages/subtemas/SubtemasList.tsx
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
import { subtemasApi } from '../../api/subtemas.api';
import type { Subtema } from '../../types/materia.types';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';

export const SubtemasList = () => {
  const { temaId } = useParams<{ temaId: string }>();
  const [subtemas, setSubtemas] = useState<Subtema[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; subtema: Subtema | null }>({
    open: false,
    subtema: null,
  });

  const navigate = useNavigate();

  const fetchSubtemas = async () => {
    if (!temaId) return;
    
    try {
      setLoading(true);
      const data = await subtemasApi.getByTema(Number(temaId));
      setSubtemas(data);
    } catch (error: any) {
      toast.error('Error al cargar subtemas');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubtemas();
  }, [temaId]);

  const handleDelete = async () => {
    if (!deleteDialog.subtema) return;

    try {
      await subtemasApi.delete(deleteDialog.subtema.id);
      toast.success('Subtema eliminado correctamente');
      setDeleteDialog({ open: false, subtema: null });
      fetchSubtemas();
    } catch (error: any) {
      const message = error.response?.data?.mensaje || 'Error al eliminar subtema';
      toast.error(message);
    }
  };

  if (loading && subtemas.length === 0) {
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
            Gestión de Subtemas
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate(`/dashboard/subtemas/crear/${temaId}`)}
        >
          Nuevo Subtema
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>Orden</TableCell>
              <TableCell>Ejercicios</TableCell>
              <TableCell>Preguntas</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {subtemas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography color="textSecondary">No hay subtemas registrados</Typography>
                </TableCell>
              </TableRow>
            ) : (
              subtemas.map((subtema) => (
                <TableRow key={subtema.id} hover>
                  <TableCell>{subtema.id}</TableCell>
                  <TableCell>
                    <strong>{subtema.nombre}</strong>
                  </TableCell>
                  <TableCell>
                    {subtema.descripcion
                      ? subtema.descripcion.substring(0, 50) + '...'
                      : '-'}
                  </TableCell>
                  <TableCell>
                    <Chip label={subtema.orden || 0} size="small" color="primary" />
                  </TableCell>
                  <TableCell>
                    <Chip label={subtema.totalEjercicios || 0} size="small" color="success" />
                  </TableCell>
                  <TableCell>
                    <Chip label={subtema.totalPreguntas || 0} size="small" color="info" />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      color="success"
                      onClick={() => navigate(`/dashboard/ejercicios/${subtema.id}`)}
                      title="Ver Ejercicios"
                    >
                      <Typography variant="caption">💻</Typography>
                    </IconButton>
                    <IconButton
                      color="primary"
                      onClick={() => navigate(`/dashboard/subtemas/editar/${subtema.id}`)}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => setDeleteDialog({ open: true, subtema })}
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
        onClose={() => setDeleteDialog({ open: false, subtema: null })}
      >
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas eliminar el subtema{' '}
            <strong>{deleteDialog.subtema?.nombre}</strong>?
          </Typography>
          <Typography variant="caption" color="error" sx={{ mt: 2, display: 'block' }}>
            Esta acción no se puede deshacer. El subtema solo se eliminará si no tiene
            ejercicios asociados.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, subtema: null })}>
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