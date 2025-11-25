// src/components/LoadingScreen.tsx
import { Box, CircularProgress, Typography } from '@mui/material';

interface LoadingScreenProps {
  message?: string;
}

export const LoadingScreen = ({ message = 'Cargando...' }: LoadingScreenProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        gap: 2,
      }}
    >
      <CircularProgress size={48} thickness={4} />
      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
        {message}
      </Typography>
    </Box>
  );
};