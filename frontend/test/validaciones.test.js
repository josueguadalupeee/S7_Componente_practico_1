import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { validarFormulario, validarCampo, hoyComoTexto } from '../src/utils/validaciones.js';
const require = createRequire(import.meta.url);
const { validarIdea } = require('../../backend/src/validations/idea.js');

const idea = {
  nombre: 'Persona de prueba', email: 'persona@example.test', titulo: 'Idea de prueba',
  descripcion: 'Servicio de reparación de bicicletas para estudiantes.',
  fecha: '2026-01-01', categoria: 'Servicios', inversion: '80',
};

test('Los siete campos siguen siendo obligatorios si faltan claves', () => {
  assert.equal(Object.keys(validarFormulario({})).length, 7);
  assert.equal(Object.keys(validarFormulario(null)).length, 7);
  assert.deepEqual(validarFormulario(idea), {});
});

test('Cliente y servidor coinciden al aceptar o rechazar las ideas', () => {
  const casos = [
    [idea, true], [{ ...idea, inversion: 0.01 }, true], [{ ...idea, inversion: '500' }, true],
    [{ ...idea, nombre: ' ' }, false], [{ ...idea, email: 'invalido' }, false],
    [{ ...idea, titulo: 'x'.repeat(81) }, false], [{ ...idea, descripcion: 'corta' }, false],
    [{ ...idea, fecha: '2026-02-31' }, false], [{ ...idea, fecha: '9999-12-31' }, false],
    [{ ...idea, fecha: '0099-01-01' }, false], [{ ...idea, categoria: 'Otra' }, false],
    [{ ...idea, inversion: true }, false], [{ ...idea, inversion: '' }, false],
    [{ ...idea, inversion: 0 }, false], [{ ...idea, inversion: 501 }, false],
  ];
  for (const [datos, valido] of casos) {
    assert.equal(Object.keys(validarFormulario(datos)).length === 0, valido, JSON.stringify(datos));
    assert.equal(validarIdea(datos).length === 0, valido, JSON.stringify(datos));
  }
});

test('La fecha actual es válida y un día inexistente se rechaza', () => {
  assert.equal(validarCampo('fecha', hoyComoTexto()), '');
  assert.equal(validarCampo('fecha', '2024-02-29'), '');
  assert.notEqual(validarCampo('fecha', '2025-02-29'), '');
});
