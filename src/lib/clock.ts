/**
 * Klok-abstractie. Alle domeinlogica vraagt de tijd hier op — nooit direct `Date.now()` —
 * zodat tijd in tests en in het dev-paneel te verschuiven is (bijvoorbeeld naar de
 * starttijd van een afspraak, of een sessietimer vooruitspoelen).
 */

type Listener = () => void;

const OFFSET_KEY = 'oudiency:dev:clockOffset';

function readStoredOffset(): number {
  try {
    const raw = globalThis.localStorage?.getItem(OFFSET_KEY);
    const value = raw ? Number(raw) : 0;
    return Number.isFinite(value) ? value : 0;
  } catch {
    return 0;
  }
}

let offsetMs = readStoredOffset();
let frozenAt: number | null = null;
const listeners = new Set<Listener>();

function notify() {
  for (const listener of listeners) listener();
}

export const clock = {
  /** Huidige tijd in milliseconden (met eventuele dev-verschuiving). */
  now(): number {
    return (frozenAt ?? Date.now()) + offsetMs;
  },
  date(): Date {
    return new Date(clock.now());
  },
  iso(): string {
    return clock.date().toISOString();
  },
  /** Huidige dev-verschuiving in milliseconden (0 = echte tijd). */
  offset(): number {
    return offsetMs;
  },
  setOffset(ms: number): void {
    offsetMs = Math.round(ms);
    try {
      if (offsetMs === 0) globalThis.localStorage?.removeItem(OFFSET_KEY);
      else globalThis.localStorage?.setItem(OFFSET_KEY, String(offsetMs));
    } catch {
      // opslag niet beschikbaar: alleen in geheugen
    }
    notify();
  },
  advance(ms: number): void {
    clock.setOffset(offsetMs + ms);
  },
  /** Spring naar een absoluut tijdstip (alleen dev). */
  travelTo(ms: number): void {
    clock.setOffset(ms - (frozenAt ?? Date.now()));
  },
  reset(): void {
    clock.setOffset(0);
  },
  /** Alleen voor tests: zet de klok stil op een vast tijdstip. */
  freeze(at: number | string | Date): void {
    frozenAt = typeof at === 'number' ? at : new Date(at).getTime();
    offsetMs = 0;
    notify();
  },
  unfreeze(): void {
    frozenAt = null;
    notify();
  },
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
