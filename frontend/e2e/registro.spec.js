import { test, expect } from '@playwright/test';
import { writeFile } from 'node:fs/promises';

async function completar(page) {
  await page.getByLabel('Tu nombre').fill('Persona E2E');
  await page.getByLabel('Email', { exact: true }).fill('e2e@example.test');
  await page.getByLabel('Título de la idea').fill('Reparación de bicicletas E2E');
  await page.getByLabel('Descripción', { exact: true }).fill('Servicio de reparación de bicicletas para estudiantes del campus.');
  await page.getByLabel('Fecha', { exact: true }).fill('2026-01-01');
  await page.getByLabel('Categoría', { exact: true }).selectOption('Servicios');
  await page.getByLabel('Inversión (USD)').fill('80');
}

test.beforeEach(async ({}, testInfo) => {
  await writeFile(testInfo.config.metadata.archivoDatos, '[]');
});

test('Navegación entre las tres rutas y datos inválidos sin POST', async ({ page }) => {
  let publicaciones = 0;
  page.on('request', (request) => { if (request.method() === 'POST') publicaciones++; });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Tu próximo negocio');
  await page.getByRole('navigation').getByRole('link', { name: 'Ver ideas' }).click();
  await expect(page.getByText('Aún no hay ideas registradas')).toBeVisible();
  await page.getByRole('navigation').getByRole('link', { name: 'Publicar idea' }).click();
  await page.getByRole('button', { name: 'Publicar idea' }).click();
  await expect(page.getByLabel('Tu nombre')).toBeFocused();
  await expect(page.locator('.campo__error')).toHaveCount(7);
  await completar(page);
  await page.getByLabel('Email', { exact: true }).fill('correo-invalido');
  await page.getByLabel('Fecha', { exact: true }).fill('9999-12-31');
  await page.getByLabel('Inversión (USD)').fill('501');
  await page.getByRole('button', { name: 'Publicar idea' }).click();
  await expect(page.getByText('Ingresa un email válido', { exact: false })).toBeVisible();
  await expect(page.getByText('La fecha no puede ser futura')).toBeVisible();
  await expect(page.getByText('La inversión debe ser mayor que $0 y máximo $500')).toBeVisible();
  expect(publicaciones).toBe(0);
});

test('Formulario → POST real → JSON → GET real → tarjeta y recarga', async ({ page }, testInfo) => {
  await page.goto('/registro');
  await completar(page);
  const creacion = page.waitForResponse((response) => response.url().endsWith('/registros') && response.request().method() === 'POST');
  await page.getByRole('button', { name: 'Publicar idea' }).click();
  expect((await creacion).status()).toBe(201);
  await expect(page).toHaveURL(/\/lista$/);
  await expect(page.getByRole('status').filter({ hasText: '¡Tu idea fue publicada!' })).toBeVisible();
  await expect(page.getByRole('article').getByRole('heading')).toHaveText('Reparación de bicicletas E2E');
  await expect(page.getByRole('article').getByRole('link', { name: 'e2e@example.test' })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('lista-desktop.png'), fullPage: true });
  await page.reload();
  await expect(page.getByRole('article').getByRole('heading')).toHaveText('Reparación de bicicletas E2E');
});

test('Carga, lista vacía, error de consulta y reintento', async ({ page }) => {
  let liberar;
  const espera = new Promise((resolve) => { liberar = resolve; });
  await page.route('**/registros', async (route) => { await espera; await route.fulfill({ json: [] }); });
  await page.goto('/lista');
  await expect(page.getByText('Cargando ideas…')).toBeVisible();
  liberar();
  await expect(page.getByText('Aún no hay ideas registradas')).toBeVisible();
  await page.unroute('**/registros');
  await page.route('**/registros', (route) => route.fulfill({ status: 500, json: { error: 'Error de prueba' } }));
  await page.reload();
  await expect(page.getByRole('alert')).toContainText('El servidor no pudo devolver las ideas');
  await page.unroute('**/registros');
  await page.route('**/registros', (route) => route.fulfill({ json: {} }));
  await page.getByRole('button', { name: 'Reintentar' }).click();
  await expect(page.getByRole('alert')).toContainText('El servidor devolvió una lista de ideas inválida');
  await page.unroute('**/registros');
  await page.getByRole('button', { name: 'Reintentar' }).click();
  await expect(page.getByText('Aún no hay ideas registradas')).toBeVisible();
});

test('Los errores 400 y 500 conservan los datos y permiten corregir el envío', async ({ page }) => {
  let intento = 0;
  await page.route('**/registros', async (route) => {
    if (route.request().method() !== 'POST') return route.continue();
    intento++;
    if (intento === 1) return route.fulfill({ status: 400, json: { errores: ['Revisa la categoría de la idea'] } });
    if (intento === 2) return route.fulfill({ status: 500, json: { error: 'No se pudo guardar el archivo de registros' } });
    return route.continue();
  });
  await page.goto('/registro'); await completar(page);
  await page.getByRole('button', { name: 'Publicar idea' }).click();
  await expect(page.getByRole('alert')).toContainText('Revisa la categoría');
  await expect(page.getByLabel('Tu nombre')).toHaveValue('Persona E2E');
  await page.getByRole('button', { name: 'Publicar idea' }).click();
  await expect(page.getByRole('alert')).toContainText('No se pudo guardar');
  await expect(page.getByLabel('Descripción', { exact: true })).not.toHaveValue('');
  await page.getByRole('button', { name: 'Publicar idea' }).click();
  await expect(page).toHaveURL(/\/lista$/);
});

test('Una desconexión permite reintentar sin perder el formulario', async ({ page }) => {
  await page.route('**/registros', (route) => route.abort('connectionrefused'));
  await page.goto('/registro'); await completar(page);
  await page.getByRole('button', { name: 'Publicar idea' }).click();
  await expect(page.getByRole('alert')).toContainText('No se pudo conectar con el servidor');
  await expect(page.getByLabel('Email', { exact: true })).toHaveValue('e2e@example.test');
  await page.unroute('**/registros');
  await page.getByRole('button', { name: 'Publicar idea' }).click();
  await expect(page).toHaveURL(/\/lista$/);
});

test('Un envío pendiente bloquea campos y evita un segundo POST', async ({ page }) => {
  let publicaciones = 0, liberar;
  const espera = new Promise((resolve) => { liberar = resolve; });
  await page.route('**/registros', async (route) => {
    if (route.request().method() === 'POST') { publicaciones++; await espera; }
    await route.continue();
  });
  await page.goto('/registro'); await completar(page);
  await page.getByRole('button', { name: 'Publicar idea' }).click();
  await expect(page.getByRole('button', { name: 'Enviando…' })).toBeDisabled();
  await expect(page.getByLabel('Tu nombre')).toBeDisabled();
  await page.locator('form').dispatchEvent('submit');
  await expect.poll(() => publicaciones).toBe(1);
  liberar();
  await expect(page).toHaveURL(/\/lista$/);
  expect(publicaciones).toBe(1);
});

test('Las tres pantallas se adaptan a 375 px sin desbordamiento horizontal', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 375, height: 812 });
  for (const ruta of ['/', '/registro', '/lista']) {
    await page.goto(ruta);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await expect(page.getByRole('navigation').getByRole('link', { name: 'Publicar idea' })).toBeVisible();
  }
  await page.goto('/registro');
  await page.screenshot({ path: testInfo.outputPath('registro-mobile.png'), fullPage: true });
});
