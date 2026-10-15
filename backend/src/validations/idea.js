// Validación en el servidor. Aunque el frontend ya valida, el servidor NO puede confiar
// en el cliente: cualquiera podría enviar datos con curl o Postman.

const CATEGORIAS = ['Comida', 'Tecnología', 'Servicios', 'Manualidades', 'Comercio', 'Educación'];
const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REGEX_FECHA = /^\d{4}-\d{2}-\d{2}$/;

// Devuelve el texto sin espacios extremos, o '' si no es un string
function limpiarTexto(valor) {
  return typeof valor === 'string' ? valor.trim() : '';
}

// Comprueba que la fecha tenga formato YYYY-MM-DD y exista de verdad (ej. rechaza 2026-02-31)
function esFechaValida(texto) {
  if (!REGEX_FECHA.test(texto)) return false;
  const [anio, mes, dia] = texto.split('-').map(Number);
  const fecha = new Date(anio, mes - 1, dia);
  return fecha.getFullYear() === anio && fecha.getMonth() === mes - 1 && fecha.getDate() === dia;
}

// Convierte la inversión a número solo si llega como número o como texto numérico ("80").
// Devuelve NaN para cualquier otro tipo (true, [100], null…), porque Number(true) daría 1.
function leerInversion(valor) {
  if (typeof valor === 'number') return valor;
  if (typeof valor === 'string' && valor.trim() !== '') return Number(valor);
  return NaN;
}

// Fecha de hoy en formato YYYY-MM-DD (hora local) para comparar como texto
function hoyComoTexto() {
  const hoy = new Date();
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  const dia = String(hoy.getDate()).padStart(2, '0');
  return `${hoy.getFullYear()}-${mes}-${dia}`;
}

// Valida los datos de una idea. Devuelve un array de mensajes (vacío = todo correcto).
function validarIdea(datos) {
  const errores = [];

  // Si el body no es un objeto, no hay nada que validar
  if (!datos || typeof datos !== 'object') {
    return ['Los datos enviados no son válidos'];
  }

  const nombre = limpiarTexto(datos.nombre);
  const email = limpiarTexto(datos.email);
  const titulo = limpiarTexto(datos.titulo);
  const descripcion = limpiarTexto(datos.descripcion);
  const fecha = limpiarTexto(datos.fecha);
  const categoria = limpiarTexto(datos.categoria);
  const inversion = leerInversion(datos.inversion);

  if (nombre.length < 3) {
    errores.push('El nombre debe tener al menos 3 caracteres');
  }

  if (!REGEX_EMAIL.test(email)) {
    errores.push('El email no tiene un formato válido');
  }

  if (titulo.length < 5 || titulo.length > 80) {
    errores.push('El título debe tener entre 5 y 80 caracteres');
  }

  if (descripcion.length < 20 || descripcion.length > 500) {
    errores.push('La descripción debe tener entre 20 y 500 caracteres');
  }

  if (!esFechaValida(fecha)) {
    errores.push('La fecha no es válida (formato AAAA-MM-DD)');
  } else if (fecha > hoyComoTexto()) {
    // Las fechas YYYY-MM-DD se pueden comparar como texto
    errores.push('La fecha no puede ser futura');
  }

  if (!CATEGORIAS.includes(categoria)) {
    errores.push(`La categoría debe ser una de: ${CATEGORIAS.join(', ')}`);
  }

  // Se rechaza vacío, texto no numérico, otros tipos, 0, negativos y más de 500
  if (!Number.isFinite(inversion) || inversion <= 0 || inversion > 500) {
    errores.push('La inversión debe ser un número mayor que 0 y menor o igual a 500');
  }

  return errores;
}

module.exports = { validarIdea, leerInversion, CATEGORIAS };
