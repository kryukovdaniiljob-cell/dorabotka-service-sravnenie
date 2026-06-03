import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base — подпапка публикации на GitHub Pages (имя репозитория).
// В dev-режиме базовый путь '/'.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/podbor-mini-ahu/' : '/',
  plugins: [react()],
  server: { port: 5173, open: true },
}));
