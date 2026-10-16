// Almacenamiento JSON para una sola instancia de Node.
// La cola protege toda la operación leer → modificar → guardar, incluyendo la inicialización.
const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');

const RUTA_ARCHIVO = process.env.REGISTROS_FILE
  ? path.resolve(process.env.REGISTROS_FILE)
  : path.join(__dirname, '..', '..', 'data', 'registros.json');

function crearAlmacen(rutaArchivo) {
  let cola = Promise.resolve();

  function encolar(tarea) {
    const operacion = cola.then(tarea);
    // Una escritura fallida no bloquea las siguientes solicitudes.
    cola = operacion.catch(() => {});
    return operacion;
  }

  async function escribirArchivo(registros) {
    const temporal = rutaArchivo + '.' + process.pid + '.' + crypto.randomUUID() + '.tmp';
    let archivo;
    try {
      await fs.mkdir(path.dirname(rutaArchivo), { recursive: true });
      archivo = await fs.open(temporal, 'wx', 0o600);
      await archivo.writeFile(JSON.stringify(registros, null, 2), 'utf-8');
      await archivo.sync();
      await archivo.close();
      archivo = undefined;
      // El archivo anterior solo se reemplaza cuando el nuevo ya está completo.
      await fs.rename(temporal, rutaArchivo);
    } catch {
      throw new Error('No se pudo guardar el archivo de registros');
    } finally {
      if (archivo) await archivo.close().catch(() => {});
      await fs.unlink(temporal).catch(() => {});
    }
  }

  async function leerArchivo() {
    let contenido;
    try {
      contenido = await fs.readFile(rutaArchivo, 'utf-8');
    } catch (error) {
      if (error.code === 'ENOENT') {
        await escribirArchivo([]);
        return [];
      }
      throw new Error('No se pudo leer el archivo de registros');
    }
    if (contenido.trim() === '') return [];
    try {
      const datos = JSON.parse(contenido);
      if (!Array.isArray(datos)) throw new Error('formato');
      return datos;
    } catch {
      throw new Error('El archivo de registros está dañado (JSON inválido)');
    }
  }

  function leerRegistros() {
    return encolar(leerArchivo);
  }

  function agregarRegistro(registro) {
    return encolar(async () => {
      const registros = await leerArchivo();
      registros.push(registro);
      await escribirArchivo(registros);
      return registro;
    });
  }

  return { leerRegistros, agregarRegistro };
}

const almacen = crearAlmacen(RUTA_ARCHIVO);
module.exports = { ...almacen, crearAlmacen };
