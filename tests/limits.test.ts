import { describe, expect, it } from 'vitest';
import {
  canExtend,
  canUse,
  consume,
  dailyLimit,
  LimitError,
  pruneUsage,
  release,
  remainingOn,
  resetDay,
} from '@/services/limits.service';

describe('limits.service', () => {
  it('kent de daglimieten voor Basis en Premium', () => {
    expect(dailyLimit('sessions', 'basis')).toBe(1);
    expect(dailyLimit('sessions', 'premium')).toBe(3);
    expect(dailyLimit('lectures', 'basis')).toBe(1);
    expect(dailyLimit('lectures', 'premium')).toBe(3);
  });

  it('verbruikt een plek en weigert daarna (gratis: 1 per dag)', () => {
    let usage = {};
    usage = consume(usage, 'basis', 'sessions', '2026-10-15');
    expect(canUse(usage, 'basis', 'sessions', '2026-10-15')).toBe(false);
    expect(() => consume(usage, 'basis', 'sessions', '2026-10-15')).toThrow(LimitError);
    // een andere dag is los
    expect(canUse(usage, 'basis', 'sessions', '2026-10-16')).toBe(true);
    // colleges tellen apart
    expect(canUse(usage, 'basis', 'lectures', '2026-10-15')).toBe(true);
  });

  it('Premium krijgt drie plekken per dag', () => {
    let usage = {};
    for (let i = 0; i < 3; i++) usage = consume(usage, 'premium', 'lectures', '2026-10-15');
    expect(remainingOn(usage, 'premium', 'lectures', '2026-10-15')).toBe(0);
    expect(() => consume(usage, 'premium', 'lectures', '2026-10-15')).toThrow(LimitError);
  });

  it('annuleren geeft de dagplek terug, nooit onder nul', () => {
    let usage = consume({}, 'basis', 'sessions', '2026-10-15');
    usage = release(usage, 'sessions', '2026-10-15');
    expect(canUse(usage, 'basis', 'sessions', '2026-10-15')).toBe(true);
    usage = release(usage, 'sessions', '2026-10-15');
    expect(usage['2026-10-15']?.sessions).toBe(0);
  });

  it('reset en opruimen', () => {
    let usage = consume({}, 'basis', 'sessions', '2026-10-15');
    usage = consume(usage, 'basis', 'sessions', '2026-06-01');
    expect(resetDay(usage, '2026-10-15')['2026-10-15']).toBeUndefined();
    const pruned = pruneUsage(usage, '2026-10-15', 60);
    expect(pruned['2026-06-01']).toBeUndefined();
    expect(pruned['2026-10-15']).toBeDefined();
  });

  it('verlengen: alleen vanaf de waarschuwing, met credit, max. 2×', () => {
    const base = { credits: 2, extensions: 0, active: true, remainingMs: 2 * 60_000 };
    expect(canExtend(base)).toEqual({ ok: true });
    expect(canExtend({ ...base, remainingMs: 4 * 60_000 })).toEqual({ ok: false, reason: 'te-vroeg' });
    expect(canExtend({ ...base, credits: 0 })).toEqual({ ok: false, reason: 'geen-credits' });
    expect(canExtend({ ...base, extensions: 2 })).toEqual({ ok: false, reason: 'maximum' });
    expect(canExtend({ ...base, active: false })).toEqual({ ok: false, reason: 'niet-actief' });
  });
});
