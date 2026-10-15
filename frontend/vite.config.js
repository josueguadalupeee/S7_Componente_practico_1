import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Configuración de Vite: plugin de React y puerto 5173
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
});
