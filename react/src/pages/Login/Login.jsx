import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Container
} from '@mui/material';
import { Login as LoginIcon, Person, Lock } from '@mui/icons-material';
import { authService } from '../../services/authService';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({
    ci_empleado: '',
    password_empleado: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.ci_empleado || !formData.password_empleado) {
      setError('Por favor complete todos los campos');
      return;
    }

    setLoading(true);
    try {
      await authService.loginEmpleado(formData.ci_empleado, formData.password_empleado);
      navigate('/admin');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Card sx={{ boxShadow: 6 }}>
        <CardContent sx={{ p: 4 }}>
          <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
            <LoginIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" component="h1" gutterBottom>
              Login Empleados
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Ingresa tus credenciales para acceder al sistema
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Cédula de Identidad"
              name="ci_empleado"
              value={formData.ci_empleado}
              onChange={handleChange}
              required
              margin="normal"
              InputProps={{
                startAdornment: <Person sx={{ mr: 1, color: 'action.active' }} />
              }}
            />

            <TextField
              fullWidth
              label="Contraseña"
              name="password_empleado"
              type="password"
              value={formData.password_empleado}
              onChange={handleChange}
              required
              margin="normal"
              InputProps={{
                startAdornment: <Lock sx={{ mr: 1, color: 'action.active' }} />
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 3, mb: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Iniciar Sesión'}
            </Button>
          </form>

          <Box mt={3} p={2} bgcolor="grey.50" borderRadius={1}>
            <Typography variant="h6" gutterBottom>
              Usuarios de prueba:
            </Typography>
            <Typography variant="body2">
              <strong>Administrador:</strong> CI: 12345678, Password: 12345678<br />
              <strong>Cajero:</strong> CI: 87654321, Password: 87654321<br />
              <strong>Cocina:</strong> CI: 11111111, Password: 11111111<br />
              <strong>Mesero:</strong> CI: 22222222, Password: 22222222
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Login;
