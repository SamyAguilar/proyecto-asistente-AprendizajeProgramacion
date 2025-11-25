// src/pages/temas/TemasList.tsx
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
import { temasApi } from '../../api/temas.api';
import type { Tema } from '../../types/materia.types';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';

export const TemasList = () => {
  const { materiaId } = useParams<{ materiaId: string }>();
  const [temas, setTemas] = useState<Tema[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; tema: Tema | null }>({
    open: false,
    tema: null,
  });

  const navigate = useNavigate();

  const fetchTemas = async () => {
    if (!materiaId) return;
    
    try {
      setLoading(true);
      const data = await temasApi.getByMateria(Number(materiaId));
      setTemas(data);
    } catch (error: any) {
      toast.error('Error al cargar temas');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemas();
  }, [materiaId]);

  const handleDelete = async () => {
    if (!deleteDialog.tema) return;

    try {
      await temasApi.delete(deleteDialog.tema.id);
      toast.success('Tema eliminado correctamente');
      setDeleteDialog({ open: false, tema: null });
      fetchTemas();
    } catch (error: any) {
      const message = error.response?.data?.mensaje || 'Error al eliminar tema';
      toast.error(message);
    }
  };

  if (loading && temas.length === 0) {
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
          <IconButton onClick={() => navigate('/dashboard/materias')}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h4" component="h1">
            Gestión de Temas
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate(`/dashboard/temas/crear/${materiaId}`)}
        >
          Nuevo Tema
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
              <TableCell>Subtemas</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {temas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography color="textSecondary">No hay temas registrados</Typography>
                </TableCell>
              </TableRow>
            ) : (
              temas.map((tema) => (
                <TableRow key={tema.id} hover>
                  <TableCell>{tema.id}</TableCell>
                  <TableCell>
                    <strong>{tema.nombre}</strong>
                  </TableCell>
                  <TableCell>
                    {tema.descripcion
                      ? tema.descripcion.substring(0, 50) + '...'
                      : '-'}
                  </TableCell>
                  <TableCell>
                    <Chip label={tema.orden || 0} size="small" color="primary" />
                  </TableCell>
                  <TableCell>
                    <Chip label={tema.totalSubtemas || 0} size="small" />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      color="info"
                      onClick={() => navigate(`/dashboard/subtemas/${tema.id}`)}
                      title="Ver Subtemas"
                    >
                      <Typography variant="caption">📚</Typography>
                    </IconButton>
                    <IconButton
                      color="primary"
                      onClick={() => navigate(`/dashboard/temas/editar/${tema.id}`)}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => setDeleteDialog({ open: true, tema })}
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
        onClose={() => setDeleteDialog({ open: false, tema: null })}
      >
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas eliminar el tema{' '}
            <strong>{deleteDialog.tema?.nombre}</strong>?
          </Typography>
          <Typography variant="caption" color="error" sx={{ mt: 2, display: 'block' }}>
            Esta acción no se puede deshacer. El tema solo se eliminará si no tiene
            subtemas asociados.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, tema: null })}>
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