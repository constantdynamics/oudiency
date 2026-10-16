import { HashRouter, useRoutes } from 'react-router';
import { ErrorBoundary } from './ErrorBoundary';
import { routes } from './routes';

/*
 * HashRouter: deeplinks werken op GitHub Pages zonder server-rewrites.
 * Bewust de declaratieve router (geen data-router): die is ~17 kB gzip kleiner. De routes staan in
 * routes.tsx, zodat main.tsx de pagina van een deeplink al kan ophalen vóór de eerste render.
 */
function AppRoutes() {
  return useRoutes(routes);
}

export function App() {
  return (
    <HashRouter>
      <ErrorBoundary fullPage>
        <AppRoutes />
      </ErrorBoundary>
    </HashRouter>
  );
}
