import '@fontsource-variable/literata/wght.css';
import '@fontsource-variable/literata/wght-italic.css';
import '@fontsource-variable/cormorant-garamond/wght.css';
import './styles/index.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import { preloadRoute } from './app/routes';

const root = document.getElementById('root');
if (!root) throw new Error('Root-element ontbreekt');

// Een deeplink (#/colleges/…): de chunk van die pagina laadt tegelijk met de eerste render.
// Mislukt dat, dan meldt de pagina het zelf (foutgrens); hier hoeft niets mee te gebeuren.
preloadRoute(location.hash.slice(1) || '/').catch(() => undefined);

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
