// src/components/EmptyState.tsx
import { Box, Typography, Button } from '@mui/material';
import React from 'react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState = ({ icon, title, description, action }: EmptyStateProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        px: 3,
        textAlign: 'center',
      }}
    >
      {icon && (
        <Box
          sx={{
            fontSize: '4rem',
            color: 'text.disabled',
            mb: 2,
            opacity: 0.5,
          }}
        >
          {icon}
        </Box>
      )}

      <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}>
        {title}
      </Typography>

      {description && (
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            maxWidth: 400,
            mb: 3,
          }}
        >
          {description}
        </Typography>
      )}

      {action && (
        <Button variant="contained" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </Box>
  );
};