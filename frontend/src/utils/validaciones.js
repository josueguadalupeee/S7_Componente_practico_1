// Validación del lado del cliente: da respuesta inmediata al usuario sin esperar al servidor.
// Las reglas son las mismas que en backend/src/validations/idea.js.

import { CATEGORIAS } from './categorias.js';

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REGEX_FECHA = /^\d{4}-\d{2}-\d{2}$/;

// Fecha de hoy en formato YYYY-MM-DD (hora local). También se usa como "max" del input date.
export function hoyComoTexto() {
  const hoy = new Date();
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  const dia = String(hoy.getDate()).padStart(2, '0');
  return `${hoy.getFullYear()}-${mes}-${dia}`;
}

// Valida UN campo y devuelve el mensaje de error, o '' si está bien
export function validarCampo(campo, valor) {
  const texto = typeof valor === 'string' ? valor.trim() : '';

  switch (campo) {
    case 'nombre':
      return texto.length < 3 ? 'El nombre debe tener al menos 3 caracteres' : '';

    case 'email':
      return !REGEX_EMAIL.test(texto) ? 'Ingresa un email válido (ej. nombre@correo.com)' : '';

    case 'titulo':
      return texto.length < 5 || texto.length > 80 ? 'El título debe tener entre 5 y 80 caracteres' : '';

    case 'descripcion':
      return texto.length < 20 || texto.length > 500 ? 'La descripción debe tener entre 20 y 500 caracteres' : '';

    case 'fecha': {
      if (!REGEX_FECHA.test(texto)) return 'Selecciona una fecha válida';
      // Comprobamos que la fecha exista (ej. no 2026-02-31)
      const [anio, mes, dia] = texto.split('-').map(Number);
      const fecha = new Date(anio, mes - 1, dia);
      if (fecha.getFullYear() !== anio || fecha.getMonth() !== mes - 1 || fecha.getDate() !== dia) return 'Selecciona una fecha válida';
      return texto > hoyComoTexto() ? 'La fecha no puede ser futura' : '';
    }

    case 'categoria':
      return !CATEGORIAS.includes(texto) ? 'Selecciona una categoría' : '';

    case 'inversion': {
      const numero = typeof valor === 'number' ? valor : texto === '' ? NaN : Number(texto);
      if (!Number.isFinite(numero) || numero <= 0 || numero > 500) {
        return 'La inversión debe ser mayor que $0 y máximo $500';
      }
      return '';
    }

    default:
      return '';
  }
}

// Valida todo el formulario. Devuelve un objeto { campo: mensaje } solo con los campos que fallan.
export function validarFormulario(datos) {
  const errores = {};
  for (const campo of ['nombre', 'email', 'titulo', 'descripcion', 'fecha', 'categoria', 'inversion']) {
    const mensaje = validarCampo(campo, datos?.[campo]);
    if (mensaje) errores[campo] = mensaje;
  }
  return errores;
}
