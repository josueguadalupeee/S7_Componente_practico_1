import { defineConfig, devices } from '@playwright/test';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

// Todas las publicaciones E2E se guardan fuera de backend/data/registros.json.
const carpetaDatos = mkdtempSync(path.join(tmpdir(), 'micro-ideas-e2e-'));
const archivoDatos = path.join(carpetaDatos, 'registros.json');
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  globalTeardown: './e2e/limpiar.js',
  metadata: { carpetaDatos, archivoDatos },
  use: { baseURL: 'http://127.0.0.1:5175', trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command: 'node ../backend/src/server.js',
      url: 'http://127.0.0.1:3003',
      env: { PORT: '3003', REGISTROS_FILE: archivoDatos },
      reuseExistingServer: false,
    },
    {
      command: 'node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5175 --strictPort',
      url: 'http://127.0.0.1:5175',
      env: { VITE_API_URL: 'http://127.0.0.1:3003' },
      reuseExistingServer: false,
    },
  ],
});
