import React, { useState } from 'react'
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Container, 
  Box,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Divider
} from '@mui/material'
import {
  Menu as MenuIcon,
  Home,
  Restaurant,
  Event,
  Login,
  Close
} from '@mui/icons-material'
import { useNavigate, useLocation } from 'react-router-dom'

const Layout = ({ children }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [drawerOpen, setDrawerOpen] = useState(false)

  const menuItems = [
    { label: 'Inicio', path: '/', icon: <Home /> },
    { label: 'Menú', path: '/menu', icon: <Restaurant /> },
    { label: 'Reservas', path: '/reservas', icon: <Event /> },
    { label: 'Empleados', path: '/login', icon: <Login /> }
  ]

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen)
  }

  const handleNavigation = (path) => {
    navigate(path)
    setDrawerOpen(false)
  }

  const drawerContent = (
    <Box sx={{ width: 280, height: '100%', bgcolor: 'background.paper' }}>
      {/* Header del drawer */}
      <Box sx={{ 
        p: 2, 
        background: 'linear-gradient(135deg, #37738F 0%, #56A099 100%)',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          El Sabor
        </Typography>
        <IconButton 
          onClick={handleDrawerToggle}
          sx={{ color: 'white' }}
        >
          <Close />
        </IconButton>
      </Box>

      <Divider />

      {/* Lista de navegación */}
      <List sx={{ pt: 2 }}>
        {menuItems.map((item) => (
          <ListItem
            key={item.path}
            button
            onClick={() => handleNavigation(item.path)}
            sx={{
              mx: 1,
              mb: 1,
              borderRadius: 2,
              backgroundColor: location.pathname === item.path ? 'primary.light' : 'transparent',
              color: location.pathname === item.path ? 'primary.contrastText' : 'text.primary',
              '&:hover': {
                backgroundColor: location.pathname === item.path ? 'primary.main' : 'action.hover',
              },
              transition: 'all 0.3s ease'
            }}
          >
            <ListItemIcon sx={{ 
              color: location.pathname === item.path ? 'primary.contrastText' : 'primary.main',
              minWidth: 40
            }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.label}
              primaryTypographyProps={{
                fontWeight: location.pathname === item.path ? 'bold' : 'normal'
              }}
            />
          </ListItem>
        ))}
      </List>

      {/* Footer del drawer */}
      <Box sx={{ 
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        p: 2,
        bgcolor: 'grey.50',
        borderTop: '1px solid',
        borderColor: 'divider'
      }}>
        <Typography variant="caption" color="text.secondary" align="center" display="block">
          © 2024 El Sabor
        </Typography>
        <Typography variant="caption" color="text.secondary" align="center" display="block">
          Auténtica cocina mediterránea
        </Typography>
      </Box>
    </Box>
  )

  return (
    <Box>
      <AppBar position="static" elevation={4}>
        <Toolbar>
          {/* Botón hamburguesa (solo en móvil) */}
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="menu"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Logo/Nombre del restaurante */}
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: 1,
              fontWeight: 'bold',
              cursor: 'pointer',
              '&:hover': { opacity: 0.8 }
            }}
            onClick={() => navigate('/')}
          >
            🍽️ El Sabor
          </Typography>

          {/* Navegación horizontal (solo en desktop) */}
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              {menuItems.slice(0, 3).map((item) => (
                <Button
                  key={item.path}
                  color="inherit"
                  onClick={() => navigate(item.path)}
                  variant={location.pathname === item.path ? 'outlined' : 'text'}
                  startIcon={item.icon}
                  sx={{ 
                    ml: 1,
                    borderColor: location.pathname === item.path ? 'rgba(255,255,255,0.7)' : 'transparent',
                    '&:hover': {
                      borderColor: 'rgba(255,255,255,0.5)',
                      backgroundColor: 'rgba(255,255,255,0.1)'
                    }
                  }}
                >
                  {item.label}
                </Button>
              ))}
              
              {/* Botón de empleados separado */}
              <Button
                color="inherit"
                onClick={() => navigate('/login')}
                variant="outlined"
                startIcon={<Login />}
                sx={{ 
                  ml: 2, 
                  borderColor: 'rgba(255,255,255,0.5)',
                  '&:hover': {
                    borderColor: 'rgba(255,255,255,0.8)',
                    backgroundColor: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                Empleados
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Drawer para móvil */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 280,
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Contenido principal */}
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {children}
      </Container>
    </Box>
  )
}

export default Layout
