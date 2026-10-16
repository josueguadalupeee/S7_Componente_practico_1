import { rm } from 'node:fs/promises';
export default async function limpiar(config) {
  await rm(config.metadata.carpetaDatos, { recursive: true, force: true });
}
