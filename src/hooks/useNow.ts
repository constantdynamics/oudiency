import { useEffect, useState } from 'react';
import { clock } from '@/lib/clock';

/**
 * De huidige (eventueel dev-verschoven) tijd, die elke `intervalMs` ververst en meteen
 * reageert op verschuivingen in het dev-paneel.
 */
export function useNow(intervalMs = 1000): number {
  const [now, setNow] = useState(() => clock.now());
  useEffect(() => {
    const tick = () => setNow(clock.now());
    const timer = setInterval(tick, intervalMs);
    const unsubscribe = clock.subscribe(tick);
    const onVisible = () => {
      if (document.visibilityState === 'visible') tick();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(timer);
      unsubscribe();
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [intervalMs]);
  return now;
}
