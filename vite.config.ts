import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '/be-an-astronaut/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        design: resolve(__dirname, 'design.html'),
      },
    },
  },
});
