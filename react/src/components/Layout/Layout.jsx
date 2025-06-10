import React from 'react'
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Container, 
  Box,
  Button
} from '@mui/material'
import { useNavigate, useLocation } from 'react-router-dom'

const Layout = ({ children }) => {
  const navigate = useNavigate()
  const location = useLocation()

  const menuItems = [
    { label: 'Inicio', path: '/' },
    { label: 'Menú del Día', path: '/menu' },
    { label: 'Reservas', path: '/reservas' }
  ]

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Restaurante App
          </Typography>
          {menuItems.map((item) => (
            <Button
              key={item.path}
              color="inherit"
              onClick={() => navigate(item.path)}
              variant={location.pathname === item.path ? 'outlined' : 'text'}
              sx={{ ml: 1 }}
            >
              {item.label}
            </Button>
          ))}
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        {children}
      </Container>
    </Box>
  )
}

export default Layout
