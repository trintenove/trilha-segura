import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

const raiz = (caminho) => fileURLToPath(new URL(caminho, import.meta.url));

// Um único projeto com três páginas: a escolha do app, o app do turista
// e o app-irmão dos bombeiros. Os dois apps compartilham o código de src/shared.
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        inicio: raiz('./index.html'),
        turista: raiz('./turista/index.html'),
        bombeiros: raiz('./bombeiros/index.html'),
      },
    },
  },
});
