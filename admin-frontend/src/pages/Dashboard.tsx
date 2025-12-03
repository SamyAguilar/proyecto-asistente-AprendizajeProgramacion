// src/pages/Dashboard.tsx
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItemIcon,
  ListItemText,
  IconButton,
  Avatar,
  Divider,
  ListItemButton,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Book as BookIcon,
  Menu as MenuIcon,
  ExitToApp as LogoutIcon,
  School as SchoolIcon,
  People as PeopleIcon,
  PersonAdd as PersonAddIcon,
} from '@mui/icons-material';
import React, { useState } from 'react';

const drawerWidth = 280;

interface MenuItem {
  text: string;
  icon: React.ReactNode;
  path: string;
  description?: string;
}

export const Dashboard = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  const userName = localStorage.getItem('user_name') || 'Usuario';
  const userEmail = localStorage.getItem('user_email') || '';
  const userRole = localStorage.getItem('user_role') || 'admin';

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const menuItems: MenuItem[] = [
    {
      text: 'Materias',
      icon: <BookIcon />,
      path: '/dashboard/materias',
      description: 'Gestionar materias',
    },
    {
      text: 'Usuarios',
      icon: <PeopleIcon />,
      path: '/dashboard/usuarios',
      description: 'Gestión de usuarios del sistema',
    },
    {
      text: 'Crear Admin',
      icon: <PersonAddIcon />,
      path: '/dashboard/crear-admin',
      description: 'Crear nuevo administrador',
    },
  ];

  const isActivePath = (path: string) => {
    return location.pathname.startsWith(path);
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header del Sidebar */}
      <Box
        sx={{
          p: 3,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          color: 'white',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Avatar
            sx={{
              width: 56,
              height: 56,
              bgcolor: 'white',
              color: theme.palette.primary.main,
              fontWeight: 700,
              fontSize: '1.5rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}
          >
            {userName.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2, fontSize: '1.1rem' }}>
              {userName}
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                opacity: 0.95,
                bgcolor: 'rgba(255,255,255,0.2)',
                px: 1.5,
                py: 0.5,
                borderRadius: 2,
                display: 'inline-block',
                mt: 0.5,
                fontWeight: 600,
                fontSize: '0.7rem',
                letterSpacing: '0.5px',
              }}
            >
              {userRole === 'admin' ? 'ADMINISTRADOR' : 'PROFESOR'}
            </Typography>
          </Box>
        </Box>
        <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.8rem' }}>
          {userEmail}
        </Typography>
      </Box>

      <Divider />

      {/* Menu Items */}
      <List sx={{ flex: 1, px: 2, py: 3 }}>
        {menuItems.map((item) => {
          const isActive = isActivePath(item.path);
          return (
            <ListItemButton
              key={item.text}
              onClick={() => {
                navigate(item.path);
                if (mobileOpen) handleDrawerToggle();
              }}
              sx={{
                borderRadius: 3,
                mb: 1.5,
                py: 2,
                px: 2.5,
                backgroundColor: isActive
                  ? alpha(theme.palette.primary.main, 0.12)
                  : 'transparent',
                border: isActive
                  ? `2px solid ${theme.palette.primary.main}`
                  : '2px solid transparent',
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                  transform: 'translateX(4px)',
                  boxShadow: isActive ? '0 4px 12px rgba(99, 102, 241, 0.2)' : 'none',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: isActive ? theme.palette.primary.main : theme.palette.text.secondary,
                  minWidth: 48,
                  fontSize: 28,
                  '& .MuiSvgIcon-root': {
                    fontSize: 28,
                  },
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                secondary={item.description}
                primaryTypographyProps={{
                  fontWeight: isActive ? 700 : 600,
                  fontSize: '1rem',
                  color: isActive ? theme.palette.primary.main : theme.palette.text.primary,
                }}
                secondaryTypographyProps={{
                  fontSize: '0.75rem',
                  fontWeight: 500,
                }}
              />
              {isActive && (
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: theme.palette.primary.main,
                    boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.2)',
                  }}
                />
              )}
            </ListItemButton>
          );
        })}
      </List>

      <Divider />

      {/* Logout Button */}
      <Box sx={{ p: 2 }}>
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: 3,
            py: 2,
            px: 2.5,
            color: theme.palette.error.main,
            border: `2px solid ${alpha(theme.palette.error.main, 0.2)}`,
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: alpha(theme.palette.error.main, 0.1),
              border: `2px solid ${theme.palette.error.main}`,
              transform: 'scale(1.02)',
            },
          }}
        >
          <ListItemIcon 
            sx={{ 
              color: theme.palette.error.main, 
              minWidth: 48,
              fontSize: 26,
              '& .MuiSvgIcon-root': {
                fontSize: 26,
              },
            }}
          >
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText
            primary="Cerrar Sesion"
            primaryTypographyProps={{
              fontWeight: 700,
              fontSize: '1rem',
            }}
          />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* AppBar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: 'white',
          color: 'text.primary',
          borderBottom: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        }}
      >
        <Toolbar sx={{ py: 1 }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ 
              mr: 2, 
              display: { sm: 'none' },
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.1),
              },
            }}
          >
            <MenuIcon sx={{ fontSize: 28 }} />
          </IconButton>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 48,
                height: 48,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
              }}
            >
              <SchoolIcon sx={{ color: 'white', fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant="h6" noWrap sx={{ fontWeight: 800, lineHeight: 1.2, fontSize: '1.25rem' }}>
                Sistema Educativo
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.75rem' }}>
                Panel de Administracion
              </Typography>
            </Box>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {/* User info in AppBar for mobile */}
          <Box sx={{ display: { xs: 'flex', sm: 'none' }, alignItems: 'center', gap: 1 }}>
            <Avatar
              sx={{
                width: 40,
                height: 40,
                bgcolor: theme.palette.primary.main,
                fontSize: '1rem',
                fontWeight: 700,
                boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)',
              }}
            >
              {userName.charAt(0).toUpperCase()}
            </Avatar>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>

        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        <Toolbar />
        <Box
          className="container-responsive animate-fade-in"
          sx={{
            p: { xs: 2, sm: 3, md: 4 },
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};