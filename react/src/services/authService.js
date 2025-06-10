const API_BASE_URL = 'http://localhost:5000/api';

export const authService = {
  // Login de empleado
  loginEmpleado: async (ci_empleado, password_empleado) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ci_empleado, password_empleado }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error en el login');
      }

      const data = await response.json();
      
      // Guardar datos del empleado en localStorage
      localStorage.setItem('empleadoLogueado', JSON.stringify(data.empleado));
      
      return data;
    } catch (error) {
      console.error('Error en loginEmpleado:', error);
      throw error;
    }
  },

  // Obtener empleado logueado
  getEmpleadoLogueado: () => {
    const empleado = localStorage.getItem('empleadoLogueado');
    return empleado ? JSON.parse(empleado) : null;
  },

  // Logout
  logout: () => {
    localStorage.removeItem('empleadoLogueado');
  },

  // Verificar si está logueado
  isLoggedIn: () => {
    return localStorage.getItem('empleadoLogueado') !== null;
  }
};
