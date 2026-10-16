import { type ComponentType, type JSX, lazy, useEffect, useReducer } from 'react';
import { PageFallback } from './PageFallback';

export interface LazyPage {
  (): JSX.Element;
  /** Begint alvast met ophalen van de chunk (één keer): voor een deeplink, zie main.tsx. */
  preload: () => Promise<unknown>;
}

/**
 * Een pagina in een eigen chunk. Bij navigeren via React.lazy: de vorige pagina blijft staan tot
 * de nieuwe er is. Is de chunk vooraf opgehaald (een deeplink), dan toont de pagina zelf de
 * laadindicator en wisselt ze met gewone state: na een Suspense-fallback houdt React 19 nieuwe
 * inhoud minstens 300 ms tegen, en die tijd kost een deeplink dan niet.
 */
export function lazyPage(load: () => Promise<ComponentType>): LazyPage {
  let Loaded: ComponentType | undefined;
  let pending: Promise<ComponentType> | undefined;
  let preloaded = false;
  let failed = false;
  const fetchChunk = () =>
    (pending ??= load().then(
      (page) => {
        Loaded = page;
        return page;
      },
      (error: unknown) => {
        failed = true;
        throw error;
      },
    ));
  const preload = () => {
    preloaded = true;
    return fetchChunk();
  };
  const Lazy = lazy(() => fetchChunk().then((page) => ({ default: page })));

  function Page() {
    const [, rerender] = useReducer((n: number) => n + 1, 0);
    const waiting = preloaded && !Loaded && !failed;
    useEffect(() => {
      if (!waiting) return;
      let active = true;
      const done = () => {
        if (active) rerender();
      };
      void fetchChunk().then(done, done);
      return () => {
        active = false;
      };
    }, [waiting]);
    if (Loaded) return <Loaded />;
    // Mislukt het ophalen, dan gooit React.lazy de fout naar de foutgrens van de pagina.
    return waiting ? <PageFallback /> : <Lazy />;
  }
  return Object.assign(Page, { preload });
}
