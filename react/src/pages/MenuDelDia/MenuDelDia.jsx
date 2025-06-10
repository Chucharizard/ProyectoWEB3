import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  CircularProgress,
  Alert,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import { Restaurant, AttachMoney, Today } from '@mui/icons-material';
import { menuService } from '../../services/menuService';

const MenuDelDia = () => {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [detalleMenu, setDetalleMenu] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    cargarMenusHoy();
  }, []);

  const cargarMenusHoy = async () => {
    try {
      setLoading(true);
      const data = await menuService.obtenerMenusHoy();
      setMenus(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar los menús del día. Verifica que el servidor esté funcionando.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const verDetalleMenu = async (menu) => {
    try {
      setSelectedMenu(menu);
      const detalle = await menuService.obtenerDetalleMenu(menu.id_menu);
      setDetalleMenu(detalle);
      setOpenDialog(true);
    } catch (err) {
      setError('Error al cargar el detalle del menú');
      console.error('Error:', err);
    }
  };

  const cerrarDialog = () => {
    setOpenDialog(false);
    setSelectedMenu(null);
    setDetalleMenu(null);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Cargando menús del día...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
        <Button onClick={cargarMenusHoy} sx={{ ml: 2 }}>
          Reintentar
        </Button>
      </Alert>
    );
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={3}>
        <Today sx={{ mr: 1, fontSize: 30 }} />
        <Typography variant="h4" component="h1">
          Menú del Día
        </Typography>
      </Box>

      {menus.length === 0 ? (
        <Alert severity="info">
          No hay menús disponibles para hoy. ¡Vuelve pronto!
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {menus.map((menu, index) => (
            <Grid item xs={12} sm={6} md={4} key={menu.id_menu}>
              <Card className="menu-card">
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Restaurant className="menu-icon" sx={{ mr: 1 }} />
                    <Typography variant="h6" component="h2">
                      {menu.nombre_menu}
                    </Typography>
                  </Box>
                  
                  <Box display="flex" alignItems="center" mb={2}>
                    <AttachMoney className="price-icon" sx={{ mr: 1 }} />
                    <Typography variant="h5" className="precio-menu">
                      Bs. {menu.precio_menu}
                    </Typography>
                  </Box>

                  <Chip 
                    label={new Date(menu.fecha_menu).toLocaleDateString('es-ES')}
                    variant="outlined"
                    size="small"
                    sx={{ mb: 2 }}
                  />

                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => verDetalleMenu(menu)}
                    sx={{ mt: 'auto' }}
                  >
                    Ver Detalles
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Dialog para mostrar detalle del menú */}
      <Dialog open={openDialog} onClose={cerrarDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <Restaurant sx={{ mr: 1 }} />
            {selectedMenu?.nombre_menu}
          </Box>
        </DialogTitle>
        <DialogContent>
          {detalleMenu && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Precio: <strong>Bs. {detalleMenu.precio_menu}</strong>
              </Typography>
              <Typography variant="h6" gutterBottom>
                Productos incluidos:
              </Typography>
              <List>
                {detalleMenu.productos.map((producto, index) => (
                  <React.Fragment key={producto.id_producto}>
                    <ListItem>
                      <ListItemText
                        primary={producto.nombre_producto}
                        secondary={
                          <React.Fragment>
                            <Typography component="span" variant="body2" display="block">
                              Categoría: {producto.categoria}
                            </Typography>
                            <Typography component="span" variant="body2" display="block">
                              Precio individual: Bs. {producto.precio_producto}
                            </Typography>
                            {producto.cantidad_pensionado && (
                              <Typography component="span" variant="body2" className="pensionado-text" display="block">
                                Cantidad para pensionados: {producto.cantidad_pensionado}
                              </Typography>
                            )}
                          </React.Fragment>
                        }
                      />
                    </ListItem>
                    {index < detalleMenu.productos.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default MenuDelDia;
