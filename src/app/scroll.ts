import { type RefObject, useEffect, useLayoutEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router';

/** Scrollposities per history-item, zodat 'terug' je op dezelfde plek laat landen. */
const positions = new Map<string, number>();

/**
 * Scrollherstel voor de HashRouter: nieuwe pagina's beginnen bovenaan, 'terug'/'vooruit' herstelt
 * de vorige positie, en een anker (`#/profiel#ai`) scrolt naar dat element.
 */
export function useScrollRestoration(): void {
  const location = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';
  }, []);

  useEffect(() => {
    const key = location.key;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => positions.set(key, window.scrollY));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
    };
  }, [location.key]);

  useLayoutEffect(() => {
    if (location.hash.length > 1) {
      const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (target) {
        target.scrollIntoView({ block: 'start' });
        return;
      }
    }
    const saved = navigationType === 'POP' ? positions.get(location.key) : undefined;
    window.scrollTo(0, saved ?? 0);
  }, [location.key, location.hash, navigationType]);
}

/**
 * Houdt `--header-h` gelijk aan de echte hoogte van de vaste kop (die groeit met de demomelding),
 * zodat andere vaste elementen (zoals de sessiekop) eronder passen en ankers niet wegvallen.
 */
export function useHeaderHeight(ref: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const header = ref.current;
    if (!header || typeof ResizeObserver === 'undefined') return;
    const root = document.documentElement;
    const observer = new ResizeObserver(() => {
      root.style.setProperty('--header-h', `${header.offsetHeight}px`);
    });
    observer.observe(header);
    return () => {
      observer.disconnect();
      root.style.removeProperty('--header-h');
    };
  }, [ref]);
}
