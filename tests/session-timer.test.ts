import { describe, expect, it } from 'vitest';
import {
  compensate,
  extendedEndsAt,
  initialEndsAt,
  screenReaderAnnouncement,
  timerColor,
  timerState,
  turnContext,
} from '@/services/session-timer';

const MIN = 60_000;
const start = Date.UTC(2026, 9, 15, 12, 0, 0);

describe('sessietimer (endsAt-gebaseerd)', () => {
  it('start met 15:00', () => {
    const endsAt = initialEndsAt(start);
    const state = timerState(start, endsAt, start);
    expect(state.remainingMs).toBe(15 * MIN);
    expect(state.phase).toBe('normaal');
    expect(state.color).toBe('groen');
  });

  it('waarschuwt na 12 minuten (nog 3 minuten) en geeft een slotgedachte bij 1 minuut', () => {
    const endsAt = initialEndsAt(start);
    expect(timerState(start, endsAt, start + 11 * MIN).phase).toBe('normaal');
    expect(timerState(start, endsAt, start + 12 * MIN).phase).toBe('afronden');
    expect(timerState(start, endsAt, start + 14 * MIN).phase).toBe('slot');
    expect(timerState(start, endsAt, start + 15 * MIN).phase).toBe('voorbij');
  });

  it('klopt na herladen: de resterende tijd volgt uit endsAt, niet uit een teller', () => {
    const endsAt = initialEndsAt(start);
    // "herladen" na 7,5 minuut
    const state = timerState(start, endsAt, start + 7.5 * MIN);
    expect(state.remainingMs).toBe(7.5 * MIN);
    // nooit negatief
    expect(timerState(start, endsAt, start + 99 * MIN).remainingMs).toBe(0);
  });

  it('kleuren: groen > 5, oranje 3–5, rood < 3 minuten', () => {
    expect(timerColor(6 * MIN)).toBe('groen');
    expect(timerColor(5 * MIN)).toBe('oranje');
    expect(timerColor(3 * MIN)).toBe('oranje');
    expect(timerColor(2.9 * MIN)).toBe('rood');
  });

  it('verlengen voegt 5 minuten toe, ook als de tijd net om was', () => {
    const endsAt = initialEndsAt(start);
    expect(extendedEndsAt(endsAt, start + 13 * MIN)).toBe(endsAt + 5 * MIN);
    expect(extendedEndsAt(endsAt, endsAt + 2_000)).toBe(endsAt + 2_000 + 5 * MIN);
  });

  it('compenseert verloren tijd tot maximaal 2 minuten per sessie', () => {
    const endsAt = initialEndsAt(start);
    const first = compensate(endsAt, 0, 90_000);
    expect(first.compensatedMs).toBe(90_000);
    expect(first.endsAt).toBe(endsAt + 90_000);
    const second = compensate(first.endsAt, first.compensatedMs, 90_000);
    expect(second.compensatedMs).toBe(2 * MIN);
    expect(second.endsAt).toBe(endsAt + 2 * MIN);
    const third = compensate(second.endsAt, second.compensatedMs, 60_000);
    expect(third.endsAt).toBe(second.endsAt);
  });

  it('schermlezer: alleen bij 3 en 1 minuut', () => {
    expect(screenReaderAnnouncement(2.5 * MIN)).toBe('Nog 3 minuten.');
    expect(screenReaderAnnouncement(0.5 * MIN)).toBe('Nog 1 minuut.');
    expect(screenReaderAnnouncement(4.5 * MIN)).toBeNull();
  });

  it('maakt de beurtcontext', () => {
    expect(turnContext(7, 9 * MIN + 40_000, 5 * MIN + 20_000)).toBe(
      '[beurt 7 · verstreken 9:40 · resterend 5:20]',
    );
  });
});
