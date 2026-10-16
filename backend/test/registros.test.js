const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { crearAlmacen } = require('../src/services/archivo');
const { entorno, iniciarServidor, peticion, ideaValida } = require('./helpers');

async function preparar(t) {
  const datos = await entorno(t);
  const servidor = await iniciarServidor(datos.archivo);
  t.after(() => servidor.cerrar());
  return { ...datos, servidor };
}

test('GET inicializa el JSON inexistente con [] y permite CORS', async (t) => {
  const { servidor, archivo } = await preparar(t);
  const respuesta = await peticion(servidor);
  assert.equal(respuesta.status, 200);
  assert.deepEqual(respuesta.datos, []);
  assert.equal(respuesta.headers.get('access-control-allow-origin'), '*');
  assert.deepEqual(JSON.parse(await fs.readFile(archivo, 'utf8')), []);
});

test('POST crea UUIDs únicos, limpia datos y conserva los registros anteriores', async (t) => {
  const { servidor } = await preparar(t);
  const primera = await peticion(servidor, 'POST', { ...ideaValida, nombre: '  Persona de prueba  ', inversion: '80' });
  const segunda = await peticion(servidor, 'POST', { ...ideaValida, titulo: 'Segunda idea' });
  assert.equal(primera.status, 201);
  assert.equal(segunda.status, 201);
  assert.match(primera.datos.id, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  assert.notEqual(primera.datos.id, segunda.datos.id);
  assert.equal(primera.datos.nombre, ideaValida.nombre);
  assert.equal(primera.datos.inversion, 80);
  assert.ok(Number.isFinite(Date.parse(primera.datos.creadoEn)));
  const consulta = await peticion(servidor);
  assert.equal(consulta.status, 200);
  assert.equal(consulta.datos.length, 2);
  assert.deepEqual(new Set(consulta.datos.map((idea) => idea.id)), new Set([primera.datos.id, segunda.datos.id]));
});

test('Los datos inválidos reciben 400 sin modificar el archivo', async (t) => {
  const { servidor, archivo } = await preparar(t);
  await peticion(servidor, 'POST', ideaValida);
  const original = await fs.readFile(archivo, 'utf8');
  const invalidos = [
    {}, [], null, { ...ideaValida, nombre: ' ' }, { ...ideaValida, email: 'correo-invalido' },
    { ...ideaValida, titulo: 'corto'.repeat(20) }, { ...ideaValida, descripcion: 'corta' },
    { ...ideaValida, fecha: '2026-02-31' }, { ...ideaValida, fecha: '9999-12-31' },
    { ...ideaValida, categoria: 'Otra' }, { ...ideaValida, inversion: 0 },
    { ...ideaValida, inversion: 501 }, { ...ideaValida, inversion: true },
  ];
  for (const datos of invalidos) {
    const respuesta = await peticion(servidor, 'POST', datos);
    assert.equal(respuesta.status, 400, JSON.stringify(datos));
    assert.ok(respuesta.datos.errores.length > 0);
  }
  assert.equal(await fs.readFile(archivo, 'utf8'), original);
});

test('JSON mal formado devuelve 400 y una ruta inexistente devuelve 404', async (t) => {
  const { servidor } = await preparar(t);
  const respuesta = await fetch(servidor.url + '/registros', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{invalido',
  });
  assert.equal(respuesta.status, 400);
  assert.ok((await respuesta.json()).errores.length);
  assert.equal((await fetch(servidor.url + '/inexistente')).status, 404);
});

test('La consulta conserva los registros después de reiniciar el proceso', async (t) => {
  const { archivo } = await entorno(t);
  const primero = await iniciarServidor(archivo);
  let creada;
  try { creada = await peticion(primero, 'POST', ideaValida); }
  finally { await primero.cerrar(); }
  assert.equal(creada.status, 201);
  const segundo = await iniciarServidor(archivo);
  t.after(() => segundo.cerrar());
  const respuesta = await peticion(segundo);
  assert.equal(respuesta.status, 200);
  assert.equal(respuesta.datos.length, 1);
  assert.equal(respuesta.datos[0].id, creada.datos.id);
});

test('Un archivo corrupto devuelve 500, conserva su contenido y no detiene la API', async (t) => {
  const { servidor, archivo } = await preparar(t);
  await peticion(servidor);
  await fs.writeFile(archivo, '{corrupto');
  assert.equal((await peticion(servidor)).status, 500);
  assert.equal((await peticion(servidor, 'POST', ideaValida)).status, 500);
  assert.equal(await fs.readFile(archivo, 'utf8'), '{corrupto');
  assert.equal((await fetch(servidor.url)).status, 200);
  await fs.writeFile(archivo, '[]');
  assert.equal((await peticion(servidor, 'POST', ideaValida)).status, 201);
});

test('40 publicaciones simultáneas y consultas intercaladas no pierden registros', async (t) => {
  const { servidor, archivo } = await preparar(t);
  const operaciones = Array.from({ length: 40 }, (_, indice) =>
    peticion(servidor, 'POST', { ...ideaValida, titulo: 'Idea concurrente ' + indice }));
  const consultas = Array.from({ length: 8 }, () => peticion(servidor));
  const creadas = await Promise.all(operaciones);
  for (const respuesta of creadas) assert.equal(respuesta.status, 201);
  for (const respuesta of await Promise.all(consultas)) assert.equal(respuesta.status, 200);
  const respuesta = await peticion(servidor);
  assert.equal(respuesta.datos.length, 40);
  assert.equal(new Set(respuesta.datos.map((idea) => idea.id)).size, 40);
  assert.equal(JSON.parse(await fs.readFile(archivo, 'utf8')).length, 40);
});

test('Una escritura fallida conserva el original, limpia temporales y libera la cola', async (t) => {
  const { archivo, carpeta } = await entorno(t);
  const almacen = crearAlmacen(archivo);
  await almacen.agregarRegistro({ id: 'original' });
  const original = await fs.readFile(archivo, 'utf8');
  const fallo = t.mock.method(fs, 'rename', async () => { throw new Error('Fallo de disco simulado'); });
  await assert.rejects(almacen.agregarRegistro({ id: 'fallido' }), /No se pudo guardar/);
  assert.equal(await fs.readFile(archivo, 'utf8'), original);
  assert.deepEqual((await fs.readdir(path.join(carpeta, 'data'))).sort(), ['registros.json']);
  fallo.mock.restore();
  await almacen.agregarRegistro({ id: 'recuperado' });
  assert.deepEqual((await almacen.leerRegistros()).map((idea) => idea.id), ['original', 'recuperado']);
});
