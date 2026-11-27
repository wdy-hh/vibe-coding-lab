import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { aiPlugin } from './server/viteAiPlugin';

export default defineConfig({
  plugins: [react(), aiPlugin()],
  base: './',
  define: { __APP_BUILD_ID__: JSON.stringify(Date.now().toString(36)) },
  build: { target: 'es2020' },
});
