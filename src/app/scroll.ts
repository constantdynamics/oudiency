import { useEffect, useLayoutEffect } from 'react';
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
