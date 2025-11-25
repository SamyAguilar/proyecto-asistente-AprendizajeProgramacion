// src/components/Breadcrumb.tsx
import { Box, Typography, Link as MuiLink } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { NavigateNext as NavigateNextIcon } from '@mui/icons-material';
import React from 'react';

interface BreadcrumbItem {
  label: string;
  path?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export const Breadcrumb = ({ items }: BreadcrumbProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        mb: 3,
        flexWrap: 'wrap',
      }}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {item.path && !isLast ? (
              <>
                <MuiLink
                  component={RouterLink}
                  to={item.path}
                  underline="hover"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    color: 'text.secondary',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    transition: 'color 0.2s',
                    '&:hover': {
                      color: 'primary.main',
                    },
                  }}
                >
                  {item.icon}
                  {item.label}
                </MuiLink>
                <NavigateNextIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
              </>
            ) : (
              <Typography
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  color: isLast ? 'text.primary' : 'text.secondary',
                  fontSize: '0.875rem',
                  fontWeight: isLast ? 600 : 500,
                }}
              >
                {item.icon}
                {item.label}
              </Typography>
            )}
          </Box>
        );
      })}
    </Box>
  );
};