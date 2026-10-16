// Rutas de la API para las ideas: GET /registros y POST /registros
const express = require('express');
const crypto = require('crypto');
const { leerRegistros, agregarRegistro } = require('../services/archivo');
const { validarIdea, leerInversion } = require('../validations/idea');

const router = express.Router();

// GET /registros → devuelve todas las ideas, las más recientes primero
router.get('/', async (req, res, next) => {
  try {
    const registros = await leerRegistros();
    // Copiamos y ordenamos por fecha de creación descendente
    const ordenados = [...registros].sort((a, b) => (b.creadoEn || '').localeCompare(a.creadoEn || ''));
    res.status(200).json(ordenados);
  } catch (error) {
    next(error); // lo maneja el middleware de errores de server.js
  }
});

// POST /registros → valida y guarda una nueva idea
router.post('/', async (req, res, next) => {
  try {
    const datos = req.body;

    // 1. Validar: si hay errores respondemos 400 y NO guardamos nada
    const errores = validarIdea(datos);
    if (errores.length > 0) {
      return res.status(400).json({ errores });
    }

    // 2. Construir la idea limpia (trim en textos, inversión como número)
    const nuevaIdea = {
      id: crypto.randomUUID(),
      nombre: datos.nombre.trim(),
      email: datos.email.trim(),
      titulo: datos.titulo.trim(),
      descripcion: datos.descripcion.trim(),
      fecha: datos.fecha.trim(),
      categoria: datos.categoria.trim(),
      inversion: leerInversion(datos.inversion),
      creadoEn: new Date().toISOString(),
    };

    // 3. La cola del servicio guarda la idea sin sobrescribir envíos concurrentes.
    await agregarRegistro(nuevaIdea);

    // 4. Responder 201 (creado) con la idea guardada
    res.status(201).json(nuevaIdea);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
