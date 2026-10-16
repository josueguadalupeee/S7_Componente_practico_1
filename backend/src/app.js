// Punto de entrada del backend: configura Express y arranca el servidor.
const express = require('express');
const cors = require('cors');
const rutasRegistros = require('./routes/registros');

const app = express();

// CORS: permite que el frontend (puerto 5173) haga peticiones a esta API (puerto 3001)
app.use(cors());
// Convierte el body JSON de las peticiones en un objeto disponible en req.body
app.use(express.json());

// Ruta simple para comprobar que la API está viva
app.get('/', (req, res) => {
  res.json({ mensaje: 'API de Micro-Ideas funcionando. Usa GET o POST en /registros' });
});

// Rutas de las ideas
app.use('/registros', rutasRegistros);

// Cualquier otra ruta → 404
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Middleware de errores: atrapa cualquier error para que el servidor NO se detenga
app.use((error, req, res, next) => {
  // JSON mal formado en el body (lo detecta express.json())
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ errores: ['El cuerpo de la petición no es un JSON válido'] });
  }
  console.error('Error:', error.message);
  res.status(500).json({ error: error.message || 'Error interno del servidor' });
});

module.exports = app;
