import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

// Tras un deploy, un chunk puede fallar por dos motivos:
//  1. Su hash es viejo y ya no existe → hay que recargar para obtener el
//     index.html nuevo con los hashes vigentes.
//  2. El navegador lo pidió durante la ventana del deploy, Cloudflare
//     devolvió el HTML de fallback con `immutable, max-age=1y`, y esa
//     respuesta quedó en la caché HTTP bajo la URL del chunk. Recargar no
//     basta: el navegador vuelve a leer la misma caché. Hay que pedir el
//     chunk otra vez con `cache: 'reload'` para sobrescribirla.
// Por eso re-descargamos las URLs de /assets/ que aparecen en el error y
// después recargamos, una sola vez por sesión de carga.
window.addEventListener('vite:preloadError', (event) => {
  if (sessionStorage.getItem('chunk-reload')) return;
  event.preventDefault();
  sessionStorage.setItem('chunk-reload', '1');
  const message = String((event as Event & { payload?: unknown }).payload ?? '');
  const urls = Array.from(new Set(message.match(/[^\s'"]*\/assets\/[^\s'"]+\.(?:js|css)/g) ?? []));
  Promise.allSettled(urls.map(url => fetch(url, { cache: 'reload' })))
    .finally(() => window.location.reload());
});

// Si la página llega a cargar bien, liberamos el flag para que un deploy
// posterior en la misma pestaña también pueda recuperarse.
window.addEventListener('load', () => {
  setTimeout(() => sessionStorage.removeItem('chunk-reload'), 10000);
});

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);