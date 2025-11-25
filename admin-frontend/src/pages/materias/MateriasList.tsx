// src/pages/materias/MateriasList.tsx
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
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import { Edit, Delete, Add, Search } from '@mui/icons-material';
import { materiasApi } from '../../api/materias.api';
import type { Materia } from '../../types/materia.types';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export const MateriasList = () => {
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; materia: Materia | null }>({
    open: false,
    materia: null,
  });

  const navigate = useNavigate();

  const fetchMaterias = async () => {
    try {
      setLoading(true);
      const data = await materiasApi.getAll();
      setMaterias(data);
    } catch (error: any) {
      toast.error('Error al cargar materias');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterias();
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchMaterias();
      return;
    }

    try {
      setLoading(true);
      const data = await materiasApi.search(searchQuery);
      setMaterias(data);
    } catch (error) {
      toast.error('Error al buscar materias');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.materia) return;

    try {
      await materiasApi.delete(deleteDialog.materia.id);
      toast.success('Materia eliminada correctamente');
      setDeleteDialog({ open: false, materia: null });
      fetchMaterias();
    } catch (error: any) {
      const message = error.response?.data?.mensaje || 'Error al eliminar materia';
      toast.error(message);
    }
  };

  if (loading && materias.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Gestión de Materias
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/dashboard/materias/crear')}
        >
          Nueva Materia
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" gap={2}>
          <TextField
            fullWidth
            placeholder="Buscar por nombre o código..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button variant="contained" startIcon={<Search />} onClick={handleSearch}>
            Buscar
          </Button>
        </Box>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Código</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>Semestre</TableCell>
              <TableCell>Créditos</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {materias.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography color="textSecondary">No hay materias registradas</Typography>
                </TableCell>
              </TableRow>
            ) : (
              materias.map((materia) => (
                <TableRow key={materia.id} hover>
                  <TableCell>{materia.id}</TableCell>
                  <TableCell>
                    <strong>{materia.codigo}</strong>
                  </TableCell>
                  <TableCell>{materia.nombre}</TableCell>
                  <TableCell>
                    {materia.descripcion
                      ? materia.descripcion.substring(0, 50) + '...'
                      : '-'}
                  </TableCell>
                  <TableCell>{materia.semestre || '-'}</TableCell>
                  <TableCell>{materia.creditos || '-'}</TableCell>
                  <TableCell align="center">
                    {/* BOTÓN PARA VER TEMAS */}
                    <IconButton
                      color="info"
                      onClick={() => navigate(`/dashboard/temas/${materia.id}`)}
                      title="Ver Temas"
                    >
                      <Typography variant="caption">📚</Typography>
                    </IconButton>
                    <IconButton
                      color="primary"
                      onClick={() => navigate(`/dashboard/materias/editar/${materia.id}`)}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => setDeleteDialog({ open: true, materia })}
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
        onClose={() => setDeleteDialog({ open: false, materia: null })}
      >
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas eliminar la materia{' '}
            <strong>{deleteDialog.materia?.nombre}</strong>?
          </Typography>
          <Typography variant="caption" color="error" sx={{ mt: 2, display: 'block' }}>
            Esta acción no se puede deshacer. La materia solo se eliminará si no tiene
            estudiantes matriculados.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, materia: null })}>
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