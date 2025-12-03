// src/pages/usuarios/EstudiantesPorMateria.tsx
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
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Card,
  CardContent,
  Grid, // En MUI v6, este Grid ya es la versión nueva
} from '@mui/material';
import { 
  School as SchoolIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon 
} from '@mui/icons-material';
import { listarEstudiantesPorMateria } from '../../api/usuarios-admin.api';
import { materiasApi } from '../../api/materias.api';
import type { EstudianteMateria } from '../../api/usuarios-admin.api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface MateriaInfo {
  materiaId: number;
  materiaNombre: string;
  totalEstudiantes: number;
  estudiantes: EstudianteMateria[];
}

export const EstudiantesPorMateria = () => {
  const [materias, setMaterias] = useState<any[]>([]);
  const [materiaSeleccionada, setMateriaSeleccionada] = useState<number>(0);
  const [datosMateria, setDatosMateria] = useState<MateriaInfo | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarMaterias();
  }, []);

  useEffect(() => {
    if (materiaSeleccionada > 0) {
      cargarEstudiantes();
    }
  }, [materiaSeleccionada]);

  const cargarMaterias = async () => {
    try {
      const data = await materiasApi.getAll();
      setMaterias(data);
      if (data.length > 0) {
        setMateriaSeleccionada(data[0].id);
      }
    } catch (error) {
      toast.error('Error al cargar materias');
      console.error(error);
    }
  };

  const cargarEstudiantes = async () => {
    if (!materiaSeleccionada) return;

    try {
      setLoading(true);
      const data = await listarEstudiantesPorMateria(materiaSeleccionada);
      setDatosMateria(data);
    } catch (error) {
      toast.error('Error al cargar estudiantes');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const calcularPromedioProgreso = () => {
    if (!datosMateria || datosMateria.estudiantes.length === 0) return 0;
    const suma = datosMateria.estudiantes.reduce((acc, est) => acc + est.progresoMateria, 0);
    return (suma / datosMateria.estudiantes.length).toFixed(1);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
        Estudiantes por Materia
      </Typography>

      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Seleccionar Materia</InputLabel>
        <Select
          value={materiaSeleccionada}
          label="Seleccionar Materia"
          onChange={(e) => setMateriaSeleccionada(Number(e.target.value))}
        >
          {materias.map((materia) => (
            <MenuItem key={materia.id} value={materia.id}>
              {materia.nombre}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {datosMateria && (
        <>
          {/* Tarjetas de estadísticas */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            {/* CORRECCIÓN PARA MUI v6:
               1. Quitamos la propiedad 'item'
               2. Usamos 'size' en lugar de 'xs' y 'md' directos
            */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: 'primary.lighter',
                        display: 'flex',
                      }}
                    >
                      <SchoolIcon sx={{ fontSize: 32, color: 'primary.main' }} />
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Materia
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {datosMateria.materiaNombre}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: 'success.lighter',
                        display: 'flex',
                      }}
                    >
                      <PeopleIcon sx={{ fontSize: 32, color: 'success.main' }} />
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Total Estudiantes
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {datosMateria.totalEstudiantes}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: 'info.lighter',
                        display: 'flex',
                      }}
                    >
                      <TrendingUpIcon sx={{ fontSize: 32, color: 'info.main' }} />
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Progreso Promedio
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {calcularPromedioProgreso()}%
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Tabla de estudiantes */}
          <TableContainer component={Paper}>
            {loading && <LinearProgress />}
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Nombre Completo</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Progreso en Materia</TableCell>
                  <TableCell>Fecha Matrícula</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {datosMateria.estudiantes.map((estudiante) => (
                  <TableRow key={estudiante.id} hover>
                    <TableCell>{estudiante.id}</TableCell>
                    <TableCell>
                      {estudiante.nombre} {estudiante.apellido}
                    </TableCell>
                    <TableCell>{estudiante.email}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 120 }}>
                          <LinearProgress
                            variant="determinate"
                            value={estudiante.progresoMateria}
                            sx={{ height: 8, borderRadius: 4 }}
                            color={
                              estudiante.progresoMateria >= 75
                                ? 'success'
                                : estudiante.progresoMateria >= 50
                                ? 'info'
                                : 'warning'
                            }
                          />
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {estudiante.progresoMateria.toFixed(1)}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {format(new Date(estudiante.fechaMatricula), 'dd/MM/yyyy')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {!loading && datosMateria.estudiantes.length === 0 && (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Alert severity="info">
                  No hay estudiantes matriculados en esta materia
                </Alert>
              </Box>
            )}
          </TableContainer>
        </>
      )}
    </Box>
  );
};