// Servicio de archivo: única parte del backend que lee y escribe el JSON.
const fs = require('fs/promises');
const path = require('path');

// Ruta absoluta a backend/data/registros.json (no depende de desde dónde se ejecute node)
const RUTA_ARCHIVO = path.join(__dirname, '..', '..', 'data', 'registros.json');

// Lee todas las ideas guardadas. Si el archivo no existe, lo crea con [].
async function leerRegistros() {
  let contenido;
  try {
    contenido = await fs.readFile(RUTA_ARCHIVO, 'utf-8');
  } catch (error) {
    // ENOENT = el archivo no existe: lo creamos vacío y devolvemos una lista vacía
    if (error.code === 'ENOENT') {
      await guardarRegistros([]);
      return [];
    }
    throw new Error('No se pudo leer el archivo de registros');
  }

  // Un archivo vacío se trata como lista vacía
  if (contenido.trim() === '') {
    return [];
  }

  // Si el JSON está corrupto, lanzamos un error claro (la ruta responderá 500)
  try {
    const datos = JSON.parse(contenido);
    if (!Array.isArray(datos)) {
      throw new Error('formato');
    }
    return datos;
  } catch {
    throw new Error('El archivo de registros está dañado (JSON inválido)');
  }
}

// Sobrescribe el archivo con la lista completa de ideas.
async function guardarRegistros(registros) {
  try {
    // Crea la carpeta data/ si no existe
    await fs.mkdir(path.dirname(RUTA_ARCHIVO), { recursive: true });
    // null, 2 = JSON con sangría para que sea legible a simple vista
    await fs.writeFile(RUTA_ARCHIVO, JSON.stringify(registros, null, 2), 'utf-8');
  } catch {
    throw new Error('No se pudo guardar el archivo de registros');
  }
}

module.exports = { leerRegistros, guardarRegistros };
