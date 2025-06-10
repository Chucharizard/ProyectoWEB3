const API_BASE_URL = 'http://localhost:5000/api';

export const ordenService = {
  // Obtener mesas libres
  obtenerMesasLibres: async () => {
    const response = await fetch(`${API_BASE_URL}/ordenes/mesas-libres`);
    if (!response.ok) throw new Error('Error al obtener mesas libres');
    return response.json();
  },

  // Obtener productos disponibles
  obtenerProductos: async () => {
    const response = await fetch(`${API_BASE_URL}/productos`);
    if (!response.ok) throw new Error('Error al obtener productos');
    return response.json();
  },

  // Obtener menús disponibles
  obtenerMenusDisponibles: async () => {
    const response = await fetch(`${API_BASE_URL}/ordenes/menus-disponibles`);
    if (!response.ok) throw new Error('Error al obtener menús');
    return response.json();
  },

  // Crear nueva orden
  crearOrden: async (datosOrden) => {
    try {
      const response = await fetch(`${API_BASE_URL}/ordenes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(datosOrden),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear la orden');
      }
      return response.json();
    } catch (error) {
      console.error('Error en crearOrden:', error);
      throw error;
    }
  },

  // Obtener órdenes para cocina
  obtenerOrdenesCocina: async () => {
    const response = await fetch(`${API_BASE_URL}/ordenes/cocina`);
    if (!response.ok) throw new Error('Error al obtener órdenes de cocina');
    return response.json();
  },

  // Obtener detalle de orden
  obtenerDetalleOrden: async (idOrden) => {
    const response = await fetch(`${API_BASE_URL}/ordenes/${idOrden}/detalle`);
    if (!response.ok) throw new Error('Error al obtener detalle de orden');
    return response.json();
  },

  // Obtener detalle de orden para cocina
  obtenerDetalleCocina: async (idOrden) => {
    const response = await fetch(`${API_BASE_URL}/ordenes/${idOrden}/detalle-cocina`);
    if (!response.ok) throw new Error('Error al obtener detalle para cocina');
    return response.json();
  },

  // Actualizar estado de producto
  actualizarEstadoProducto: async (idDetalle, estado) => {
    try {
      const response = await fetch(`${API_BASE_URL}/ordenes/producto/${idDetalle}/estado`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ estado }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar estado');
      }
      return response.json();
    } catch (error) {
      console.error('Error en actualizarEstadoProducto:', error);
      throw error;
    }
  },

  // Actualizar estado de menú
  actualizarEstadoMenu: async (idDetalle, estado) => {
    try {
      const response = await fetch(`${API_BASE_URL}/ordenes/menu/${idDetalle}/estado`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ estado }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar estado');
      }
      return response.json();
    } catch (error) {
      console.error('Error en actualizarEstadoMenu:', error);
      throw error;
    }
  },

  // Buscar cliente por CI (agregar método faltante)
  buscarCliente: async (ci) => {
    const response = await fetch(`${API_BASE_URL}/clientes/${ci}`);
    if (!response.ok && response.status !== 404) {
      throw new Error('Error al buscar cliente');
    }
    return response.status === 404 ? null : response.json();
  },
};
