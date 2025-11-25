// src/components/PageHeader.tsx
import { Box, Typography, Button } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backPath?: string;
  action?: {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    color?: 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
  };
}

export const PageHeader = ({ title, subtitle, backPath, action }: PageHeaderProps) => {
  const navigate = useNavigate();

  return (
    <Box sx={{ mb: 4 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, width: '100%' }}>
          {backPath && (
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(backPath)}
              sx={{
                minWidth: 'auto',
                px: 2,
                borderRadius: 2,
                flexShrink: 0,
              }}
            >
              Volver
            </Button>
          )}

          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 700,
                color: 'text.primary',
                mb: subtitle ? 0.5 : 0,
              }}
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>

        {action && (
          <Button
            variant="contained"
            color={action.color || 'primary'}
            startIcon={action.icon}
            onClick={action.onClick}
            sx={{
              borderRadius: 2,
              px: 3,
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            {action.label}
          </Button>
        )}
      </Box>
    </Box>
  );
};