// Comunicación con el backend. Toda la app usa estas funciones, así la URL está en un solo lugar.
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Mensaje que se muestra cuando el servidor está apagado o no responde
export const ERROR_CONEXION = 'No se pudo conectar con el servidor';

// GET /registros → devuelve el array de ideas
export async function obtenerIdeas() {
  let respuesta;
  try {
    respuesta = await fetch(`${API_URL}/registros`);
  } catch {
    // fetch solo falla aquí si no hay conexión con el servidor
    throw new Error(ERROR_CONEXION);
  }

  if (!respuesta.ok) {
    throw new Error('El servidor no pudo devolver las ideas');
  }
  try {
    const datos = await respuesta.json();
    if (!Array.isArray(datos)) throw new Error();
    return datos;
  } catch {
    throw new Error('El servidor devolvió una lista de ideas inválida');
  }
}

// POST /registros → envía una idea nueva.
// Devuelve { ok, status, datos } para que el formulario decida qué mostrar (201 o 400).
export async function crearIdea(idea) {
  let respuesta;
  try {
    respuesta = await fetch(`${API_URL}/registros`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(idea),
    });
  } catch {
    throw new Error(ERROR_CONEXION);
  }

  const recibido = await respuesta.json().catch(() => ({}));
  const datos = recibido && typeof recibido === 'object' && !Array.isArray(recibido) ? recibido : {};
  return { ok: respuesta.ok, status: respuesta.status, datos };
}
