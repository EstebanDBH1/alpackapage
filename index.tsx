import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

// Tras un deploy, los chunks con hash viejo dejan de existir y el import
// dinámico falla (el CDN devuelve el HTML de fallback). Recargamos una vez
// para obtener el index.html nuevo con los hashes vigentes.
window.addEventListener('vite:preloadError', (event) => {
  const alreadyReloaded = sessionStorage.getItem('chunk-reload');
  if (!alreadyReloaded) {
    event.preventDefault();
    sessionStorage.setItem('chunk-reload', '1');
    window.location.reload();
  }
});

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);