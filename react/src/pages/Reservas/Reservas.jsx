import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Box,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Chip,
  Paper
} from '@mui/material';
import { Event, Restaurant, Person, Phone, Schedule, Group } from '@mui/icons-material';
import { reservaService } from '../../services/reservaService';

const Reservas = () => {
  // Estados del formulario
  const [formData, setFormData] = useState({
    ci_cliente: '',
    nombre_cliente: '',
    apellido_cliente: '',
    telefono_cliente: '',
    fecha_reserva: '',
    hora_reserva: '',
    numero_personas: '',
    notas: '',
    id_mesa: ''
  });

  // Estados de control
  const [mesas, setMesas] = useState([]);
  const [mesasDisponibles, setMesasDisponibles] = useState([]);
  const [reservasPendientes, setReservasPendientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCliente, setLoadingCliente] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [clienteEncontrado, setClienteEncontrado] = useState(false);

  useEffect(() => {
    cargarMesas();
  }, []);

  // Buscar cliente en tiempo real cuando cambia el CI
  useEffect(() => {
    if (formData.ci_cliente.length >= 3) {
      buscarCliente();
    } else {
      limpiarDatosCliente();
    }
  }, [formData.ci_cliente]);

  // Cargar mesas disponibles cuando cambian fecha y hora
  useEffect(() => {
    if (formData.fecha_reserva && formData.hora_reserva) {
      cargarMesasDisponibles();
    }
  }, [formData.fecha_reserva, formData.hora_reserva]);

  const cargarMesas = async () => {
    try {
      const data = await reservaService.obtenerMesas();
      setMesas(data);
    } catch (err) {
      setError('Error al cargar mesas');
    }
  };

  const buscarCliente = async () => {
    setLoadingCliente(true);
    try {
      // Buscar datos del cliente
      const cliente = await reservaService.buscarCliente(formData.ci_cliente);
      
      if (cliente) {
        setFormData(prev => ({
          ...prev,
          nombre_cliente: cliente.nombre_cliente,
          apellido_cliente: cliente.apellido_cliente,
          telefono_cliente: cliente.telefono_cliente
        }));
        setClienteEncontrado(true);

        // Verificar reservas pendientes
        const reservas = await reservaService.verificarReservasPendientes(formData.ci_cliente);
        setReservasPendientes(reservas);
      } else {
        limpiarDatosCliente();
      }
    } catch (err) {
      console.error('Error al buscar cliente:', err);
    } finally {
      setLoadingCliente(false);
    }
  };

  const limpiarDatosCliente = () => {
    setFormData(prev => ({
      ...prev,
      nombre_cliente: '',
      apellido_cliente: '',
      telefono_cliente: ''
    }));
    setClienteEncontrado(false);
    setReservasPendientes([]);
  };

  const cargarMesasDisponibles = async () => {
    try {
      console.log('Cargando mesas para:', formData.fecha_reserva, formData.hora_reserva); // Debug
      
      const data = await reservaService.obtenerMesasDisponibles(
        formData.fecha_reserva, 
        formData.hora_reserva
      );
      
      console.log('Mesas disponibles cargadas:', data); // Debug
      setMesasDisponibles(data);
      setError(null); // Limpiar errores previos
    } catch (err) {
      console.error('Error al cargar mesas disponibles:', err);
      setError(`Error al cargar mesas disponibles: ${err.message}`);
      // En caso de error, mostrar todas las mesas
      setMesasDisponibles(mesas);
    }
  };

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
    
    if (reservasPendientes.length > 0) {
      setError('Este cliente ya tiene una reserva pendiente');
      return;
    }

    setLoading(true);
    try {
      await reservaService.crearReserva(formData);
      setSuccess(true);
      setError(null);
      
      // Limpiar formulario
      setFormData({
        ci_cliente: '',
        nombre_cliente: '',
        apellido_cliente: '',
        telefono_cliente: '',
        fecha_reserva: '',
        hora_reserva: '',
        numero_personas: '',
        notas: '',
        id_mesa: ''
      });
      setReservasPendientes([]);
      setClienteEncontrado(false);
      
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box className="titulo-menu-dia">
        <Event sx={{ mr: 1, fontSize: 30 }} />
        <Typography variant="h4" component="h1">
          Sistema de Reservas
        </Typography>
      </Box>

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          ¡Reserva creada exitosamente!
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Mostrar reservas pendientes */}
      {reservasPendientes.length > 0 && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'warning.light', border: '2px solid orange' }}>
          <Typography variant="h6" gutterBottom color="warning.dark">
            ⚠️ Cliente con reserva pendiente
          </Typography>
          {reservasPendientes.map((reserva) => (
            <Chip
              key={reserva.id_reserva}
              label={`${reserva.nombre_mesa} - ${new Date(reserva.fecha_reserva).toLocaleDateString()} ${reserva.hora_reserva} - ${reserva.estado_reserva}`}
              color="warning"
              sx={{ mr: 1, mb: 1 }}
            />
          ))}
        </Paper>
      )}

      <Card className="menu-card">
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Datos del Cliente */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  <Person sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Datos del Cliente
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Cédula de Identidad"
                  name="ci_cliente"
                  value={formData.ci_cliente}
                  onChange={handleChange}
                  required
                  InputProps={{
                    endAdornment: loadingCliente && <CircularProgress size={20} />
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Teléfono"
                  name="telefono_cliente"
                  value={formData.telefono_cliente}
                  onChange={handleChange}
                  required
                  InputProps={{
                    startAdornment: <Phone sx={{ mr: 1, color: 'action.active' }} />
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nombre"
                  name="nombre_cliente"
                  value={formData.nombre_cliente}
                  onChange={handleChange}
                  required
                  disabled={clienteEncontrado}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Apellido"
                  name="apellido_cliente"
                  value={formData.apellido_cliente}
                  onChange={handleChange}
                  required
                  disabled={clienteEncontrado}
                />
              </Grid>

              {/* Datos de la Reserva */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  <Restaurant sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Datos de la Reserva
                </Typography>
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Fecha de Reserva"
                  name="fecha_reserva"
                  type="date"
                  value={formData.fecha_reserva}
                  onChange={handleChange}
                  required
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ min: new Date().toISOString().split('T')[0] }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Hora de Reserva"
                  name="hora_reserva"
                  type="time"
                  value={formData.hora_reserva}
                  onChange={handleChange}
                  required
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: <Schedule sx={{ mr: 1, color: 'action.active' }} />
                  }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Número de Personas"
                  name="numero_personas"
                  type="number"
                  value={formData.numero_personas}
                  onChange={handleChange}
                  required
                  inputProps={{ min: 1, max: 20 }}
                  InputProps={{
                    startAdornment: <Group sx={{ mr: 1, color: 'action.active' }} />
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Mesa</InputLabel>
                  <Select
                    name="id_mesa"
                    value={formData.id_mesa}
                    onChange={handleChange}
                    label="Mesa"
                  >
                    {(formData.fecha_reserva && formData.hora_reserva ? mesasDisponibles : mesas).map((mesa) => (
                      <MenuItem key={mesa.id_mesa} value={mesa.id_mesa}>
                        {mesa.nombre_mesa} - {mesa.ubicacion} (Cap: {mesa.capacidad})
                        {formData.fecha_reserva && formData.hora_reserva && ' ✓ Disponible'}
                      </MenuItem>
                    ))}
                  </Select>
                  {formData.fecha_reserva && formData.hora_reserva && (
                    <Typography variant="caption" color="primary" sx={{ mt: 1 }}>
                      Mostrando {mesasDisponibles.length} mesa(s) disponible(s) para la fecha y hora seleccionada
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Notas (opcional)"
                  name="notas"
                  value={formData.notas}
                  onChange={handleChange}
                  multiline
                  rows={2}
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={loading || reservasPendientes.length > 0}
                  sx={{ mt: 2 }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Crear Reserva'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Reservas;
