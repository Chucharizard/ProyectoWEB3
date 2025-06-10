const API_BASE_URL = 'http://localhost:5000/api';

export const reservaService = {
  // Buscar cliente por CI
  buscarCliente: async (ci) => {
    const response = await fetch(`${API_BASE_URL}/clientes/${ci}`);
    if (!response.ok && response.status !== 404) {
      throw new Error('Error al buscar cliente');
    }
    return response.status === 404 ? null : response.json();
  },

  // Verificar reservas pendientes del cliente
  verificarReservasPendientes: async (ci) => {
    const response = await fetch(`${API_BASE_URL}/clientes/${ci}/reservas-pendientes`);
    if (!response.ok) throw new Error('Error al verificar reservas pendientes');
    return response.json();
  },

  // Obtener todas las mesas
  obtenerMesas: async () => {
    const response = await fetch(`${API_BASE_URL}/mesas`);
    if (!response.ok) throw new Error('Error al obtener mesas');
    return response.json();
  },

  // Obtener mesas disponibles para fecha y hora específica
  obtenerMesasDisponibles: async (fecha, hora) => {
    try {
      // Enviar la hora en formato HH:MM (el backend se encarga del formateo)
      console.log('Consultando mesas para:', { fecha, hora }); // Debug
      const response = await fetch(`${API_BASE_URL}/mesas/disponibles?fecha=${fecha}&hora=${hora}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error del servidor:', errorText);
        throw new Error(`Error ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Mesas recibidas:', data); // Debug
      return data;
    } catch (error) {
      console.error('Error en obtenerMesasDisponibles:', error);
      throw error;
    }
  },

  // Crear nueva reserva
  crearReserva: async (datosReserva) => {
    try {
      console.log('Enviando datos de reserva:', datosReserva); // Debug
      
      const response = await fetch(`${API_BASE_URL}/reservas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(datosReserva), // Enviar datos tal como vienen
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear la reserva');
      }
      return response.json();
    } catch (error) {
      console.error('Error en crearReserva:', error);
      throw error;
    }
  }
};
