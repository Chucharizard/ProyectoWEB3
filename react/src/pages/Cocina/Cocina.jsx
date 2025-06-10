import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Paper
} from '@mui/material';
import {
  Restaurant,
  Timer,
  CheckCircle,
  PlayArrow,
  Pause,
  Done,
  LocalShipping
} from '@mui/icons-material';
import { ordenService } from '../../services/ordenService';

const Cocina = () => {
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrden, setSelectedOrden] = useState(null);
  const [detalleOrden, setDetalleOrden] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [actualizando, setActualizando] = useState(false);

  useEffect(() => {
    cargarOrdenes();
    // Actualizar cada 30 segundos
    const interval = setInterval(cargarOrdenes, 30000);
    return () => clearInterval(interval);
  }, []);

  const cargarOrdenes = async () => {
    try {
      const data = await ordenService.obtenerOrdenesCocina();
      setOrdenes(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar órdenes: ' + err.message);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const verDetalleOrden = async (orden) => {
    try {
      setSelectedOrden(orden);
      const detalle = await ordenService.obtenerDetalleCocina(orden.id_orden);
      setDetalleOrden(detalle);
      setOpenDialog(true);
    } catch (err) {
      setError('Error al cargar detalle de orden');
      console.error('Error:', err);
    }
  };

  const actualizarEstado = async (tipo, id, nuevoEstado) => {
    setActualizando(true);
    try {
      if (tipo === 'producto') {
        await ordenService.actualizarEstadoProducto(id, nuevoEstado);
      } else {
        await ordenService.actualizarEstadoMenu(id, nuevoEstado);
      }
      
      // Recargar detalle
      const detalle = await ordenService.obtenerDetalleCocina(selectedOrden.id_orden);
      setDetalleOrden(detalle);
      
      // Recargar órdenes
      await cargarOrdenes();
      
    } catch (err) {
      setError('Error al actualizar estado: ' + err.message);
    } finally {
      setActualizando(false);
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'pendiente': return 'error';
      case 'preparando': return 'warning';
      case 'listo': return 'success';
      case 'entregado': return 'default';
      default: return 'default';
    }
  };

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'pendiente': return <Timer />;
      case 'preparando': return <PlayArrow />;
      case 'listo': return <CheckCircle />;
      case 'entregado': return <Done />;
      default: return <Timer />;
    }
  };

  const getNextEstado = (estadoActual) => {
    switch (estadoActual) {
      case 'pendiente': return 'preparando';
      case 'preparando': return 'listo';
      case 'listo': return 'entregado';
      default: return estadoActual;
    }
  };

  const getActionText = (estadoActual) => {
    switch (estadoActual) {
      case 'pendiente': return 'Iniciar';
      case 'preparando': return 'Listo';
      case 'listo': return 'Entregar';
      default: return 'Completado';
    }
  };

  const cerrarDialog = () => {
    setOpenDialog(false);
    setSelectedOrden(null);
    setDetalleOrden(null);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Cargando órdenes de cocina...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        <Restaurant sx={{ mr: 1, verticalAlign: 'middle' }} />
        Cocina - Panel de Control
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
        <Button variant="contained" onClick={cargarOrdenes} disabled={loading}>
          Actualizar
        </Button>
        <Typography variant="body2" color="text.secondary">
          Última actualización: {new Date().toLocaleTimeString()}
        </Typography>
      </Box>

      {ordenes.length === 0 ? (
        <Alert severity="info">
          No hay órdenes pendientes en cocina
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {ordenes.map((orden) => (
            <Grid item xs={12} md={6} lg={4} key={orden.id_orden}>
              <Card sx={{ 
                border: '2px solid',
                borderColor: orden.estado_orden === 'pendiente' ? 'error.main' : 
                           orden.estado_orden === 'preparando' ? 'warning.main' : 'success.main'
              }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">
                      Orden #{orden.id_orden}
                    </Typography>
                    <Chip 
                      label={orden.estado_orden.toUpperCase()}
                      color={getEstadoColor(orden.estado_orden)}
                      icon={getEstadoIcon(orden.estado_orden)}
                    />
                  </Box>
                  
                  <Typography variant="body2" gutterBottom>
                    <strong>Cliente:</strong> {orden.nombre_cliente} {orden.apellido_cliente}
                  </Typography>
                  
                  <Typography variant="body2" gutterBottom>
                    <strong>Mesa:</strong> {orden.nombre_mesa}
                  </Typography>
                  
                  <Typography variant="body2" gutterBottom>
                    <strong>Mesero:</strong> {orden.nombre_empleado} {orden.apellido_empleado}
                  </Typography>
                  
                  <Typography variant="body2" gutterBottom>
                    <strong>Hora:</strong> {new Date(orden.fecha_orden).toLocaleTimeString()}
                  </Typography>
                  
                  <Typography variant="body2" gutterBottom>
                    <strong>Total:</strong> Bs. {orden.total_orden}
                  </Typography>

                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => verDetalleOrden(orden)}
                    sx={{ mt: 2 }}
                  >
                    Ver Detalles
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Dialog para detalle de orden */}
      <Dialog open={openDialog} onClose={cerrarDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              Orden #{selectedOrden?.id_orden} - {selectedOrden?.nombre_mesa}
            </Typography>
            <Chip 
              label={selectedOrden?.estado_orden?.toUpperCase()}
              color={getEstadoColor(selectedOrden?.estado_orden)}
            />
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {detalleOrden && (
            <Box>
              <Paper sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
                <Typography variant="body2">
                  <strong>Cliente:</strong> {selectedOrden.nombre_cliente} {selectedOrden.apellido_cliente} | 
                  <strong> Mesa:</strong> {selectedOrden.nombre_mesa} | 
                  <strong> Hora:</strong> {new Date(selectedOrden.fecha_orden).toLocaleString()}
                </Typography>
              </Paper>

              {/* Productos */}
              {detalleOrden.productos.length > 0 && (
                <Box mb={3}>
                  <Typography variant="h6" gutterBottom color="primary">
                    Productos Individuales
                  </Typography>
                  <List>
                    {detalleOrden.productos.map((producto) => (
                      <ListItem key={producto.id_detalle_orden_producto} divider>
                        <ListItemText
                          primary={`${producto.nombre_producto} (x${producto.cantidad_orden_producto})`}
                          secondary={`Categoría: ${producto.nombre_categoria}`}
                        />
                        <ListItemSecondaryAction sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip 
                            label={producto.estado_detalle}
                            color={getEstadoColor(producto.estado_detalle)}
                            size="small"
                            icon={getEstadoIcon(producto.estado_detalle)}
                          />
                          {producto.estado_detalle !== 'entregado' && (
                            <Button
                              size="small"
                              variant="contained"
                              onClick={() => actualizarEstado(
                                'producto', 
                                producto.id_detalle_orden_producto, 
                                getNextEstado(producto.estado_detalle)
                              )}
                              disabled={actualizando}
                            >
                              {getActionText(producto.estado_detalle)}
                            </Button>
                          )}
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              {/* Menús */}
              {detalleOrden.menus.length > 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom color="primary">
                    Menús Completos
                  </Typography>
                  <List>
                    {detalleOrden.menus.map((menu) => (
                      <ListItem key={menu.id_detalle_orden_menu} divider>
                        <ListItemText
                          primary={`${menu.nombre_menu} (x${menu.cantidad_orden_menu})`}
                          secondary="Menú completo del día"
                        />
                        <ListItemSecondaryAction sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip 
                            label={menu.estado_detalle}
                            color={getEstadoColor(menu.estado_detalle)}
                            size="small"
                            icon={getEstadoIcon(menu.estado_detalle)}
                          />
                          {menu.estado_detalle !== 'entregado' && (
                            <Button
                              size="small"
                              variant="contained"
                              onClick={() => actualizarEstado(
                                'menu', 
                                menu.id_detalle_orden_menu, 
                                getNextEstado(menu.estado_detalle)
                              )}
                              disabled={actualizando}
                            >
                              {getActionText(menu.estado_detalle)}
                            </Button>
                          )}
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={cerrarDialog}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Cocina;
