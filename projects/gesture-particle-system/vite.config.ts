import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  server: { watch: { ignored: ['**/outputs/**', '**/work/**'] } },
  build: { target: ['chrome120', 'edge120'] },
});
