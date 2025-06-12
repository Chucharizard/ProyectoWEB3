import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import {
  ShoppingCart,
  Person,
  TableRestaurant,
  Add,
  Remove,
  Delete,
  Receipt
} from '@mui/icons-material';
import { ordenService } from '../../services/ordenService';
import { authService } from '../../services/authService';

const Ordenes = () => {
  // Estados del formulario cliente
  const [datosCliente, setDatosCliente] = useState({
    ci_cliente: '',
    nombre_cliente: '',
    apellido_cliente: '',
    telefono_cliente: '',
    id_mesa: ''
  });

  // Estados de productos y menús
  const [productos, setProductos] = useState([]);
  const [menus, setMenus] = useState([]);
  const [mesas, setMesas] = useState([]);
  
  // Estados del carrito
  const [carrito, setCarrito] = useState({
    productos: [],
    menus: []
  });

  // Estados de control
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loadingCliente, setLoadingCliente] = useState(false);
  const [clienteEncontrado, setClienteEncontrado] = useState(false);
  
  // Dialog states
  const [openProductDialog, setOpenProductDialog] = useState(false);
  const [openMenuDialog, setOpenMenuDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [cantidad, setCantidad] = useState(1);

  const empleado = authService.getEmpleadoLogueado();

  useEffect(() => {
    cargarDatos();
  }, []);

  // Buscar cliente cuando cambia el CI
  useEffect(() => {
    if (datosCliente.ci_cliente.length >= 3) {
      buscarCliente();
    } else {
      limpiarDatosCliente();
    }
  }, [datosCliente.ci_cliente]);

  const cargarDatos = async () => {
    try {
      const [productosData, menusData, mesasData] = await Promise.all([
        ordenService.obtenerProductos(),
        ordenService.obtenerMenusDisponibles(),
        ordenService.obtenerMesasLibres()
      ]);
      
      setProductos(productosData);
      setMenus(menusData);
      setMesas(mesasData);
    } catch (err) {
      setError('Error al cargar datos: ' + err.message);
    }
  };

  const buscarCliente = async () => {
    setLoadingCliente(true);
    try {
      const cliente = await ordenService.buscarCliente(datosCliente.ci_cliente);
      if (cliente) {
        setDatosCliente(prev => ({
          ...prev,
          nombre_cliente: cliente.nombre_cliente,
          apellido_cliente: cliente.apellido_cliente,
          telefono_cliente: cliente.telefono_cliente
        }));
        setClienteEncontrado(true);
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
    setDatosCliente(prev => ({
      ...prev,
      nombre_cliente: '',
      apellido_cliente: '',
      telefono_cliente: ''
    }));
    setClienteEncontrado(false);
  };

  const handleClienteChange = (e) => {
    const { name, value } = e.target;
    setDatosCliente(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const abrirDialogProducto = (producto) => {
    setSelectedItem(producto);
    setCantidad(1);
    setOpenProductDialog(true);
  };

  const abrirDialogMenu = (menu) => {
    setSelectedItem(menu);
    setCantidad(1);
    setOpenMenuDialog(true);
  };

  const agregarProducto = () => {
    const producto = { ...selectedItem, cantidad };

    setCarrito(prev => {
      const productosExistentes = [...prev.productos];
      const indiceExistente = productosExistentes.findIndex(p => p.id_producto === producto.id_producto);
      
      if (indiceExistente >= 0) {
        productosExistentes[indiceExistente].cantidad += cantidad;
      } else {
        productosExistentes.push(producto);
      }

      return { ...prev, productos: productosExistentes };
    });

    setOpenProductDialog(false);
    setSelectedItem(null);
    setCantidad(1);
  };

  const agregarMenu = () => {
    const menu = { ...selectedItem, cantidad };

    setCarrito(prev => {
      const menusExistentes = [...prev.menus];
      const indiceExistente = menusExistentes.findIndex(m => m.id_menu === menu.id_menu);
      
      if (indiceExistente >= 0) {
        menusExistentes[indiceExistente].cantidad += cantidad;
      } else {
        menusExistentes.push(menu);
      }

      return { ...prev, menus: menusExistentes };
    });

    setOpenMenuDialog(false);
    setSelectedItem(null);
    setCantidad(1);
  };

  const eliminarDelCarrito = (tipo, id) => {
    setCarrito(prev => ({
      ...prev,
      [tipo === 'producto' ? 'productos' : 'menus']: 
        prev[tipo === 'producto' ? 'productos' : 'menus'].filter(
          item => item[tipo === 'producto' ? 'id_producto' : 'id_menu'] !== id
        )
    }));
  };

  const calcularTotal = () => {
    const totalProductos = carrito.productos.reduce((sum, p) => sum + (p.precio_producto * p.cantidad), 0);
    const totalMenus = carrito.menus.reduce((sum, m) => sum + (m.precio_menu * m.cantidad), 0);
    return totalProductos + totalMenus;
  };

  const crearOrden = async () => {
    if (!datosCliente.ci_cliente || !datosCliente.nombre_cliente || !datosCliente.apellido_cliente || !datosCliente.id_mesa) {
      setError('Complete todos los datos del cliente y seleccione una mesa');
      return;
    }

    if (carrito.productos.length === 0 && carrito.menus.length === 0) {
      setError('Debe agregar al menos un producto o menú');
      return;
    }

    setLoading(true);
    try {
      const datosOrden = {
        ...datosCliente,
        ci_empleado: empleado.ci,
        productos: carrito.productos.map(p => ({ id_producto: p.id_producto, cantidad: p.cantidad })),
        menus: carrito.menus.map(m => ({ id_menu: m.id_menu, cantidad: m.cantidad })),
        total_orden: calcularTotal()
      };

      await ordenService.crearOrden(datosOrden);
      setSuccess(true);
      setError(null);

      // Limpiar formulario
      setDatosCliente({
        ci_cliente: '',
        nombre_cliente: '',
        apellido_cliente: '',
        telefono_cliente: '',
        id_mesa: ''
      });
      setCarrito({ productos: [], menus: [] });
      setClienteEncontrado(false);
      
      // Recargar mesas
      cargarDatos();
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Agrupar productos por categoría
  const productosPorCategoria = productos.reduce((acc, producto) => {
    const categoria = producto.nombre_categoria;
    if (!acc[categoria]) acc[categoria] = [];
    acc[categoria].push(producto);
    return acc;
  }, {});

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        <ShoppingCart sx={{ mr: 1, verticalAlign: 'middle' }} />
        Gestión de Órdenes
      </Typography>

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          ¡Orden creada exitosamente!
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Panel de datos del cliente */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <Person sx={{ mr: 1, verticalAlign: 'middle' }} />
                Datos del Cliente
              </Typography>
              
              <TextField
                fullWidth
                label="Cédula de Identidad"
                name="ci_cliente"
                value={datosCliente.ci_cliente}
                onChange={handleClienteChange}
                required
                margin="normal"
                InputProps={{
                  endAdornment: loadingCliente && <CircularProgress size={20} />
                }}
              />

              <TextField
                fullWidth
                label="Nombre"
                name="nombre_cliente"
                value={datosCliente.nombre_cliente}
                onChange={handleClienteChange}
                required
                margin="normal"
                disabled={clienteEncontrado}
              />

              <TextField
                fullWidth
                label="Apellido"
                name="apellido_cliente"
                value={datosCliente.apellido_cliente}
                onChange={handleClienteChange}
                required
                margin="normal"
                disabled={clienteEncontrado}
              />

              <TextField
                fullWidth
                label="Teléfono"
                name="telefono_cliente"
                value={datosCliente.telefono_cliente}
                onChange={handleClienteChange}
                margin="normal"
                disabled={clienteEncontrado}
              />

              <FormControl fullWidth required margin="normal">
                <InputLabel>Mesa</InputLabel>
                <Select
                  name="id_mesa"
                  value={datosCliente.id_mesa}
                  onChange={handleClienteChange}
                  label="Mesa"
                >
                  {mesas.map((mesa) => (
                    <MenuItem key={mesa.id_mesa} value={mesa.id_mesa}>
                      <TableRestaurant sx={{ mr: 1 }} />
                      {mesa.nombre_mesa} - {mesa.ubicacion} (Cap: {mesa.capacidad})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </CardContent>
          </Card>

          {/* Carrito */}
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <Receipt sx={{ mr: 1, verticalAlign: 'middle' }} />
                Carrito de Compras
              </Typography>

              {carrito.productos.length === 0 && carrito.menus.length === 0 ? (
                <Typography color="text.secondary">
                  No hay productos en el carrito
                </Typography>
              ) : (
                <List dense>
                  {carrito.productos.map((producto) => (
                    <ListItem key={producto.id_producto}>
                      <ListItemText
                        primary={producto.nombre_producto}
                        secondary={`Bs. ${producto.precio_producto} x ${producto.cantidad} = Bs. ${(producto.precio_producto * producto.cantidad).toFixed(2)}`}
                      />
                      <ListItemSecondaryAction>
                        <IconButton 
                          edge="end" 
                          onClick={() => eliminarDelCarrito('producto', producto.id_producto)}
                          size="small"
                        >
                          <Delete />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}

                  {carrito.menus.map((menu) => (
                    <ListItem key={menu.id_menu}>
                      <ListItemText
                        primary={menu.nombre_menu}
                        secondary={`Bs. ${menu.precio_menu} x ${menu.cantidad} = Bs. ${(menu.precio_menu * menu.cantidad).toFixed(2)}`}
                      />
                      <ListItemSecondaryAction>
                        <IconButton 
                          edge="end" 
                          onClick={() => eliminarDelCarrito('menu', menu.id_menu)}
                          size="small"
                        >
                          <Delete />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}

              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" align="right">
                Total: Bs. {calcularTotal().toFixed(2)}
              </Typography>

              <Button
                variant="contained"
                fullWidth
                onClick={crearOrden}
                disabled={loading || (carrito.productos.length === 0 && carrito.menus.length === 0)}
                sx={{ mt: 2 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Crear Orden'}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Panel de menús y productos */}
        <Grid item xs={12} md={8}>
          {/* Menús disponibles */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Menús del Día
              </Typography>
              <Grid container spacing={2}>
                {menus.map((menu) => (
                  <Grid item xs={12} sm={6} md={4} key={menu.id_menu}>
                    <Card 
                      sx={{ 
                        cursor: 'pointer',
                        '&:hover': { boxShadow: 4 }
                      }}
                      onClick={() => abrirDialogMenu(menu)}
                    >
                      <CardContent>
                        <Typography variant="h6" noWrap>
                          {menu.nombre_menu}
                        </Typography>
                        <Typography variant="h5" color="primary">
                          Bs. {menu.precio_menu}
                        </Typography>
                        <Chip 
                          label="Menú Completo" 
                          size="small" 
                          color="success"
                          sx={{ mt: 1 }}
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>

          {/* Productos por categoría */}
          {Object.entries(productosPorCategoria).map(([categoria, productosCategoria]) => (
            <Card key={categoria} sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {categoria}
                </Typography>
                <Grid container spacing={2}>
                  {productosCategoria.map((producto) => (
                    <Grid item xs={12} sm={6} md={4} key={producto.id_producto}>
                      <Card 
                        sx={{ 
                          cursor: 'pointer',
                          '&:hover': { boxShadow: 4 }
                        }}
                        onClick={() => abrirDialogProducto(producto)}
                      >
                        <CardContent>
                          <Typography variant="h6" noWrap>
                            {producto.nombre_producto}
                          </Typography>
                          <Typography variant="h5" color="primary">
                            Bs. {producto.precio_producto}
                          </Typography>
                          <Chip 
                            label={producto.nombre_categoria} 
                            size="small" 
                            sx={{ mt: 1 }}
                          />
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          ))}
        </Grid>
      </Grid>

      {/* Dialog para agregar producto */}
      <Dialog open={openProductDialog} onClose={() => setOpenProductDialog(false)}>
        <DialogTitle>Agregar Producto</DialogTitle>
        <DialogContent>
          {selectedItem && (
            <Box>
              <Typography variant="h6">{selectedItem.nombre_producto}</Typography>
              <Typography variant="body1" color="text.secondary">
                Precio: Bs. {selectedItem.precio_producto}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                <IconButton onClick={() => setCantidad(Math.max(1, cantidad - 1))}>
                  <Remove />
                </IconButton>
                <TextField
                  value={cantidad}
                  onChange={(e) => setCantidad(Math.max(1, parseInt(e.target.value) || 1))}
                  type="number"
                  sx={{ width: 80, mx: 1 }}
                  inputProps={{ min: 1 }}
                />
                <IconButton onClick={() => setCantidad(cantidad + 1)}>
                  <Add />
                </IconButton>
              </Box>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Total: Bs. {(selectedItem.precio_producto * cantidad).toFixed(2)}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenProductDialog(false)}>Cancelar</Button>
          <Button onClick={agregarProducto} variant="contained">Agregar</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para agregar menú */}
      <Dialog open={openMenuDialog} onClose={() => setOpenMenuDialog(false)}>
        <DialogTitle>Agregar Menú</DialogTitle>
        <DialogContent>
          {selectedItem && (
            <Box>
              <Typography variant="h6">{selectedItem.nombre_menu}</Typography>
              <Typography variant="body1" color="text.secondary">
                Precio: Bs. {selectedItem.precio_menu}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                <IconButton onClick={() => setCantidad(Math.max(1, cantidad - 1))}>
                  <Remove />
                </IconButton>
                <TextField
                  value={cantidad}
                  onChange={(e) => setCantidad(Math.max(1, parseInt(e.target.value) || 1))}
                  type="number"
                  sx={{ width: 80, mx: 1 }}
                  inputProps={{ min: 1 }}
                />
                <IconButton onClick={() => setCantidad(cantidad + 1)}>
                  <Add />
                </IconButton>
              </Box>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Total: Bs. {(selectedItem.precio_menu * cantidad).toFixed(2)}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenMenuDialog(false)}>Cancelar</Button>
          <Button onClick={agregarMenu} variant="contained">Agregar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Ordenes;
