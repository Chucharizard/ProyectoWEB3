import React, { useState, useEffect } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Button,
  Card,
  CardContent,
  Avatar,
  useTheme,
  useMediaQuery,
  Divider
} from '@mui/material';
import {
  Restaurant,
  ShoppingCart,
  Menu as MenuIcon,
  Logout,
  AccountCircle,
  ChevronLeft
} from '@mui/icons-material';
import { authService } from '../../services/authService';
import { useNavigate } from 'react-router-dom';
import Ordenes from '../Ordenes/Ordenes';
import Cocina from '../Cocina/Cocina';

const drawerWidth = 280;

const Admin = () => {
  const [selectedOption, setSelectedOption] = useState('cocina');
  const [empleado, setEmpleado] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(true);
  
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    const empleadoLogueado = authService.getEmpleadoLogueado();
    if (!empleadoLogueado) {
      navigate('/login');
      return;
    }
    setEmpleado(empleadoLogueado);
  }, [navigate]);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setDesktopOpen(!desktopOpen);
    }
  };

  const handleMenuItemClick = (option) => {
    setSelectedOption(option);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const menuItems = [
    {
      id: 'cocina',
      label: 'Cocina',
      icon: <Restaurant />,
      description: 'Gestión de pedidos y preparación'
    },
    {
      id: 'ordenes',
      label: 'Órdenes',
      icon: <ShoppingCart />,
      description: 'Administración de órdenes'
    }
  ];

  const renderContent = () => {
    switch (selectedOption) {
      case 'cocina':
        return <Cocina />;
      case 'ordenes':
        return <Ordenes />;
      default:
        return null;
    }
  };

  const drawerContent = (
    <Box>
      <Toolbar sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        px: 2
      }}>
        <Typography variant="h6" noWrap component="div" color="primary">
          Panel Admin
        </Typography>
        {!isMobile && (
          <IconButton onClick={handleDrawerToggle}>
            <ChevronLeft />
          </IconButton>
        )}
      </Toolbar>
      
      <Divider />
      
      <Box sx={{ overflow: 'auto', p: 2 }}>
        {/* Información del empleado en el sidebar */}
        {empleado && (
          <Card sx={{ 
            mb: 2, 
            background: 'linear-gradient(135deg, #37738F 0%, #56A099 100%)',
            border: '2px solid rgba(255,255,255,0.3)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
          }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ 
                  mr: 1, 
                  bgcolor: 'rgba(255,255,255,0.9)',
                  color: '#37738F',
                  border: '2px solid white'
                }}>
                  <AccountCircle />
                </Avatar>
                <Box>
                  <Typography variant="body2" fontWeight="bold" sx={{ 
                    color: '#FFFFFF !important',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
                  }}>
                    {empleado.nombre} {empleado.apellido}
                  </Typography>
                  <Typography variant="caption" sx={{ 
                    color: '#F0F0F0 !important',
                    fontWeight: 500,
                    textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
                  }}>
                    {empleado.cargo}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        )}

        <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
          Módulos Disponibles
        </Typography>
        
        <List>
          {menuItems.map((item) => (
            <ListItem
              key={item.id}
              button
              selected={selectedOption === item.id}
              onClick={() => handleMenuItemClick(item.id)}
              sx={{
                mb: 1,
                borderRadius: 2,
                '&.Mui-selected': {
                  backgroundColor: '#37738F !important',
                  color: '#FFFFFF !important',
                  boxShadow: '0 4px 12px rgba(55, 115, 143, 0.4)',
                  '& .MuiListItemIcon-root': {
                    color: '#FFFFFF !important',
                  },
                  '& .MuiListItemText-primary': {
                    color: '#FFFFFF !important',
                    fontWeight: 'bold !important',
                  },
                  '& .MuiListItemText-secondary': {
                    color: '#E0E0E0 !important',
                  },
                  '&:hover': {
                    backgroundColor: '#2D5A73 !important',
                  }
                },
                '&:hover': {
                  backgroundColor: selectedOption === item.id ? '#2D5A73 !important' : 'rgba(55, 115, 143, 0.1) !important',
                }
              }}
            >
              <ListItemIcon sx={{ 
                color: selectedOption === item.id ? '#FFFFFF !important' : '#37738F !important'
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.label}
                secondary={item.description}
                primaryTypographyProps={{
                  fontSize: '0.9rem',
                  fontWeight: selectedOption === item.id ? 'bold' : 'normal',
                  color: selectedOption === item.id ? '#FFFFFF !important' : '#333333 !important'
                }}
                secondaryTypographyProps={{
                  fontSize: '0.75rem',
                  color: selectedOption === item.id ? '#E0E0E0 !important' : '#666666 !important'
                }}
              />
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  );

  if (!empleado) {
    return null;
  }

  return (
    <Box sx={{ display: 'flex' }}>
      {/* AppBar */}
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          ml: { md: desktopOpen ? `${drawerWidth}px` : 0 },
          width: { 
            md: desktopOpen ? `calc(100% - ${drawerWidth}px)` : '100%' 
          },
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: 1,
              fontSize: { xs: '1rem', sm: '1.25rem' },
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {isMobile ? 'El Sabor' : 'El Sabor - Panel Empleados'}
          </Typography>
          
          {/* Info del empleado en AppBar (solo en móvil) */}
          {isMobile && empleado && (
            <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
              <Avatar sx={{ 
                width: 24, 
                height: 24, 
                mr: 1,
                bgcolor: 'rgba(255,255,255,0.2)'
              }}>
                <AccountCircle sx={{ fontSize: 16 }} />
              </Avatar>
              <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                {empleado.nombre}
              </Typography>
            </Box>
          )}

          <Button 
            color="inherit" 
            onClick={handleLogout}
            startIcon={!isMobile ? <Logout /> : null}
            size="small"
            sx={{
              minWidth: { xs: '40px', sm: 'auto' },
              px: { xs: 1, sm: 2 }
            }}
          >
            {isMobile ? <Logout /> : 'Salir'}
          </Button>
        </Toolbar>
      </AppBar>

      {/* Sidebar para móvil */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidth 
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Sidebar para desktop */}
      <Drawer
        variant="persistent"
        anchor="left"
        open={desktopOpen}
        sx={{
          display: { xs: 'none', md: 'block' },
          width: desktopOpen ? drawerWidth : 0,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Contenido principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'background.default',
          p: { xs: 2, sm: 3 },
          minHeight: '100vh',
          width: { 
            md: desktopOpen ? `calc(100% - ${drawerWidth}px)` : '100%' 
          },
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar />
        {renderContent()}
      </Box>
    </Box>
  );
};

export default Admin;
