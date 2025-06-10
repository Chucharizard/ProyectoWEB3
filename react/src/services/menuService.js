const API_BASE_URL = 'http://localhost:5000/api';

export const menuService = {
  // Obtener todos los menús
  obtenerTodosLosMenus: async () => {
    const response = await fetch(`${API_BASE_URL}/menus`);
    if (!response.ok) throw new Error('Error al obtener menús');
    return response.json();
  },

  // Obtener menús de hoy
  obtenerMenusHoy: async () => {
    const response = await fetch(`${API_BASE_URL}/menus/hoy`);
    if (!response.ok) throw new Error('Error al obtener menús de hoy');
    return response.json();
  },

  // Obtener detalle de un menú
  obtenerDetalleMenu: async (idMenu) => {
    const response = await fetch(`${API_BASE_URL}/menus/${idMenu}/detalle`);
    if (!response.ok) throw new Error('Error al obtener detalle del menú');
    return response.json();
  },

  // Obtener menús por fecha
  obtenerMenusPorFecha: async (fecha) => {
    const response = await fetch(`${API_BASE_URL}/menus/fecha/${fecha}`);
    if (!response.ok) throw new Error('Error al obtener menús por fecha');
    return response.json();
  }
};
