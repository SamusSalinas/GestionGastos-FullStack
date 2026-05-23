// Importamos la URL base desde nuestro archivo .env
const BASE_URL = import.meta.env.VITE_API_URL;

export const apiService = {
  
  // --- AUTH ---
  login: async (usuario, password) => {
    const response = await fetch(`${BASE_URL}/Auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario, password })
    });
    if (!response.ok) throw new Error("Usuario o contraseña incorrectos");
    return await response.json();
  },

  registrar: async (usuario, password) => {
    const response = await fetch(`${BASE_URL}/Auth/registrar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario, password })
    });
    if (!response.ok) throw new Error("Error al registrarse");
    return await response.json();
  },

  // --- CATEGORÍAS ---
  obtenerCategorias: async (token) => {
    const response = await fetch(`${BASE_URL}/categorias`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error("Error al obtener las categorías");
    return await response.json();
  },

  crearCategoria: async (token, nombre, tipo) => {
    const response = await fetch(`${BASE_URL}/categorias`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({ nombre, tipo })
    });
    if (!response.ok) throw new Error("Error al crear la categoría");
    return await response.json();
  },

  // --- TRANSACCIONES ---
  obtenerTransacciones: async (token, desde = "", hasta = "", catId = "") => {
    const params = new URLSearchParams();
    if (desde) params.append("desde", desde);
    if (hasta) params.append("hasta", hasta);
    if (catId) params.append("categoriaId", catId);

    const response = await fetch(`${BASE_URL}/transacciones?${params.toString()}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error("Error al obtener las transacciones");
    return await response.json();
  },

  crearTransaccion: async (token, datosTransaccion) => {
    const response = await fetch(`${BASE_URL}/transacciones`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify(datosTransaccion)
    });
    if (!response.ok) throw new Error(`El Backend lo rechazó (Error ${response.status})`);
    return await response.json();
  },

  borrarTransaccion: async (token, id) => {
    const response = await fetch(`${BASE_URL}/transacciones/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error("Error al eliminar el registro");
    return true;
  }
};