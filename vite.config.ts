import path from 'path';
import fs from 'fs';
import { defineConfig, loadEnv, type Plugin, type Connect } from 'vite';
import react from '@vitejs/plugin-react';

// En dev/preview, Vite no resuelve /carpeta -> /carpeta/index.html para las
// landings estáticas de public/ (teachers, gpt-tesis, ...); sin esto la URL
// cae al fallback de la SPA. En Cloudflare Pages esto lo hace la plataforma.
const publicDirIndex = (): Plugin => {
  const middleware: Connect.NextHandleFunction = (req, _res, next) => {
    const url = (req.url ?? '').split('?')[0];
    const clean = url.replace(/\/+$/, '');
    if (
      clean &&
      !clean.includes('..') &&
      fs.existsSync(path.resolve(__dirname, 'public', clean.slice(1), 'index.html'))
    ) {
      req.url = clean + '/index.html';
    }
    next();
  };
  return {
    name: 'public-dir-index',
    configureServer(server) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
    },
  };
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react(), publicDirIndex()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});