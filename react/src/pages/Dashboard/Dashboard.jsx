import React from 'react'
import { 
  Typography, 
  Box, 
  Card,
  CardContent,
  Grid,
  CardMedia,
  Button
} from '@mui/material'
import { 
  Restaurant,
  Schedule,
  Phone
} from '@mui/icons-material'

const Dashboard = () => {
  return (
    <Box>
      {/* Hero Section */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h2" gutterBottom color="primary">
          Bienvenidos a El Sabor
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Auténtica cocina mediterránea con los mejores ingredientes frescos
        </Typography>
      </Box>

      {/* Información del Restaurante */}
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Restaurant fontSize="large" color="primary" sx={{ mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Nuestra Cocina
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Platos tradicionales preparados con técnicas modernas y ingredientes de la más alta calidad.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Schedule fontSize="large" color="primary" sx={{ mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Horarios
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Lunes a Domingo<br />
                12:00 - 16:00<br />
                19:00 - 23:30
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Phone fontSize="large" color="primary" sx={{ mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Contacto
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Teléfono: +591 123 456 789<br />
                Email: info@elsabor.com<br />
                Av. Principal 123, Santa Cruz
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Llamada a la acción */}
      <Box sx={{ textAlign: 'center', mt: 6 }}>
        <Typography variant="h4" gutterBottom>
          ¿Listo para una experiencia única?
        </Typography>
        <Button 
          variant="contained" 
          size="large" 
          sx={{ mt: 2 }}
          href="/reservas"
        >
          Hacer una Reserva
        </Button>
      </Box>
    </Box>
  )
}

export default Dashboard
