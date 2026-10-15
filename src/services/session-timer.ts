/**
 * Sessietimer op basis van een opgeslagen eindtijd (`endsAt`), nooit een aftellende state.
 * Zo klopt de timer na herladen, tabwissel of een slapende laptop.
 */
import { LIMITS } from '@/config/limits';
import { MINUTE } from '@/lib/dates';

export type TimerPhase = 'normaal' | 'afronden' | 'slot' | 'voorbij';
export type TimerColor = 'groen' | 'oranje' | 'rood';

export interface TimerState {
  remainingMs: number;
  elapsedMs: number;
  totalMs: number;
  phase: TimerPhase;
  color: TimerColor;
}

export function timerState(startedAt: number, endsAt: number, now: number): TimerState {
  const remainingMs = Math.max(0, endsAt - now);
  const elapsedMs = Math.max(0, Math.min(now, endsAt) - startedAt);
  const totalMs = Math.max(0, endsAt - startedAt);
  let phase: TimerPhase = 'normaal';
  if (remainingMs <= 0) phase = 'voorbij';
  else if (remainingMs <= LIMITS.session.finalThoughtAtRemainingMinutes * MINUTE) phase = 'slot';
  else if (remainingMs <= LIMITS.session.warnAtRemainingMinutes * MINUTE) phase = 'afronden';
  return { remainingMs, elapsedMs, totalMs, phase, color: timerColor(remainingMs) };
}

/** Groen > 5 min, oranje 3–5 min, rood < 3 min. */
export function timerColor(remainingMs: number): TimerColor {
  if (remainingMs > 5 * MINUTE) return 'groen';
  if (remainingMs >= 3 * MINUTE) return 'oranje';
  return 'rood';
}

export function initialEndsAt(startedAt: number): number {
  return startedAt + LIMITS.session.durationMinutes * MINUTE;
}

/** Nieuwe eindtijd na verlengen met een credit. */
export function extendedEndsAt(endsAt: number, now: number): number {
  // Als de tijd net om was (race), verleng vanaf nu.
  return Math.max(endsAt, now) + LIMITS.session.extension.minutes * MINUTE;
}

/**
 * Compenseer tijd die verloren ging door een API-fout, met een plafond van 2 minuten per sessie.
 * Geeft de nieuwe totale compensatie en de nieuwe eindtijd terug.
 */
export function compensate(
  endsAt: number,
  compensatedMs: number,
  lostMs: number,
): { compensatedMs: number; endsAt: number } {
  const cap = LIMITS.session.maxCompensationMinutes * MINUTE;
  const extra = Math.max(0, Math.min(lostMs, cap - compensatedMs));
  return { compensatedMs: compensatedMs + extra, endsAt: endsAt + extra };
}

/** Schermlezer-aankondiging alleen bij 3 en bij 1 minuut resterend. */
export function screenReaderAnnouncement(remainingMs: number): string | null {
  const minutes = Math.ceil(remainingMs / MINUTE);
  if (minutes === 3) return 'Nog 3 minuten.';
  if (minutes === 1) return 'Nog 1 minuut.';
  return null;
}

/** "[beurt 7 · verstreken 9:40 · resterend 5:20]" — gaat per beurt mee naar het model. */
export function turnContext(turn: number, elapsedMs: number, remainingMs: number): string {
  const fmt = (ms: number) => {
    const total = Math.max(0, Math.round(ms / 1000));
    return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
  };
  return `[beurt ${turn} · verstreken ${fmt(elapsedMs)} · resterend ${fmt(remainingMs)}]`;
}
