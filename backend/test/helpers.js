const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { once } = require('node:events');

async function entorno(t) {
  const carpeta = await fs.mkdtemp(path.join(os.tmpdir(), 'micro-ideas-test-'));
  t.after(() => fs.rm(carpeta, { recursive: true, force: true }));
  return { carpeta, archivo: path.join(carpeta, 'data', 'registros.json') };
}

async function iniciarServidor(archivo) {
  const proceso = spawn(process.execPath, ['src/server.js'], {
    cwd: path.join(__dirname, '..'),
    env: { ...process.env, PORT: '0', REGISTROS_FILE: archivo },
    windowsHide: true,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let salida = '';
  let errores = '';
  proceso.stderr.on('data', (datos) => { errores += datos; });
  let puerto;
  try {
    puerto = await new Promise((resolve, reject) => {
      const temporizador = setTimeout(() => reject(new Error('La API no arrancó: ' + errores)), 10000);
      proceso.once('error', (error) => { clearTimeout(temporizador); reject(error); });
      proceso.once('exit', (codigo) => { clearTimeout(temporizador); reject(new Error('La API terminó: ' + codigo + ' ' + errores)); });
      proceso.stdout.on('data', (datos) => {
        salida += datos;
        const encontrado = salida.match(/localhost:(\d+)/);
        if (encontrado) { clearTimeout(temporizador); resolve(Number(encontrado[1])); }
      });
    });
  } catch (error) {
    proceso.kill();
    throw error;
  }
  return {
    url: 'http://127.0.0.1:' + puerto,
    async cerrar() {
      if (proceso.exitCode !== null || proceso.signalCode !== null) return;
      const fin = once(proceso, 'exit');
      proceso.kill();
      await fin;
    },
  };
}

async function peticion(servidor, metodo = 'GET', datos) {
  const respuesta = await fetch(servidor.url + '/registros', {
    method: metodo,
    headers: { 'Content-Type': 'application/json', Origin: 'http://localhost:5173' },
    body: datos === undefined ? undefined : JSON.stringify(datos),
    signal: AbortSignal.timeout(10000),
  });
  return { status: respuesta.status, headers: respuesta.headers, datos: await respuesta.json() };
}

const ideaValida = {
  nombre: 'Persona de prueba', email: 'persona@example.test', titulo: 'Idea de prueba',
  descripcion: 'Servicio de reparación de bicicletas para estudiantes.',
  fecha: '2026-01-01', categoria: 'Servicios', inversion: 80,
};

module.exports = { entorno, iniciarServidor, peticion, ideaValida };
