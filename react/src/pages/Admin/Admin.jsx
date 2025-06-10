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
  Avatar
} from '@mui/material';
import {
  Restaurant,
  ShoppingCart,
  Menu as MenuIcon,
  Logout,
  AccountCircle
} from '@mui/icons-material';
import { authService } from '../../services/authService';
import { useNavigate } from 'react-router-dom';
import Ordenes from '../Ordenes/Ordenes';
import Cocina from '../Cocina/Cocina';

const drawerWidth = 280;

const Admin = () => {
  const [selectedOption, setSelectedOption] = useState('cocina');
  const [empleado, setEmpleado] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar si hay un empleado logueado
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

  if (!empleado) {
    return null; // O un loading spinner
  }

  return (
    <Box sx={{ display: 'flex' }}>
      {/* AppBar */}
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <MenuIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Sistema Restaurante - Panel Empleados
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
            <Avatar sx={{ mr: 1, bgcolor: 'secondary.main' }}>
              <AccountCircle />
            </Avatar>
            <Box>
              <Typography variant="body2">
                {empleado.nombre} {empleado.apellido}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {empleado.cargo}
              </Typography>
            </Box>
          </Box>

          <Button 
            color="inherit" 
            onClick={handleLogout}
            startIcon={<Logout />}
          >
            Salir
          </Button>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto', p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
            Módulos Disponibles
          </Typography>
          
          <List>
            {menuItems.map((item) => (
              <ListItem
                key={item.id}
                button
                selected={selectedOption === item.id}
                onClick={() => setSelectedOption(item.id)}
                sx={{
                  mb: 1,
                  borderRadius: 2,
                  '&.Mui-selected': {
                    backgroundColor: 'primary.light',
                    '& .MuiListItemIcon-root': {
                      color: 'primary.contrastText',
                    },
                    '& .MuiListItemText-primary': {
                      color: 'primary.contrastText',
                      fontWeight: 'bold',
                    },
                  },
                }}
              >
                <ListItemIcon>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.label}
                  secondary={item.description}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Contenido principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'background.default',
          p: 3,
          minHeight: '100vh',
        }}
      >
        <Toolbar />
        {renderContent()}
      </Box>
    </Box>
  );
};

export default Admin;
