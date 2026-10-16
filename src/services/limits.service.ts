/**
 * Limietlogica op één plek (§5.4). Pure functies: dezelfde regels kan Fase 2 serverside
 * afdwingen. In Fase 1 zijn limieten alleen in de browser te handhaven (en dus te omzeilen) —
 * dat is bewust en acceptabel; de logica is wel gecentraliseerd.
 */
import { LIMITS, type Tier } from '@/config/limits';
import { addDaysToKey } from '@/lib/dates';

export type LimitKind = 'sessions' | 'lectures';
export type UsageByDate = Record<string, { sessions: number; lectures: number }>;

export class LimitError extends Error {
  readonly kind: LimitKind;
  constructor(kind: LimitKind, message: string) {
    super(message);
    this.name = 'LimitError';
    this.kind = kind;
  }
}

export function dailyLimit(kind: LimitKind, tier: Tier): number {
  return kind === 'sessions' ? LIMITS.session.perDay[tier] : LIMITS.lecture.perDay[tier];
}

export function usedOn(usage: UsageByDate, kind: LimitKind, dateKey: string): number {
  return usage[dateKey]?.[kind] ?? 0;
}

export function remainingOn(
  usage: UsageByDate,
  tier: Tier,
  kind: LimitKind,
  dateKey: string,
): number {
  return Math.max(0, dailyLimit(kind, tier) - usedOn(usage, kind, dateKey));
}

export function canUse(usage: UsageByDate, tier: Tier, kind: LimitKind, dateKey: string): boolean {
  return remainingOn(usage, tier, kind, dateKey) > 0;
}

/** Verbruik één plek op `dateKey`. Gooit een LimitError als de daglimiet bereikt is. */
export function consume(
  usage: UsageByDate,
  tier: Tier,
  kind: LimitKind,
  dateKey: string,
): UsageByDate {
  if (!canUse(usage, tier, kind, dateKey)) {
    throw new LimitError(
      kind,
      kind === 'sessions'
        ? 'Je hebt voor die dag al het maximale aantal sessies gepland.'
        : 'Je hebt vandaag al het maximale aantal colleges aangevraagd.',
    );
  }
  const day = usage[dateKey] ?? { sessions: 0, lectures: 0 };
  return { ...usage, [dateKey]: { ...day, [kind]: day[kind] + 1 } };
}

/** Geef een plek terug (annuleren, verzetten, gemiste afspraak). Nooit onder nul. */
export function release(usage: UsageByDate, kind: LimitKind, dateKey: string): UsageByDate {
  const day = usage[dateKey];
  if (!day) return usage;
  return { ...usage, [dateKey]: { ...day, [kind]: Math.max(0, day[kind] - 1) } };
}

/** Dev-paneel: daglimieten voor een dag terugzetten. */
export function resetDay(usage: UsageByDate, dateKey: string): UsageByDate {
  const next = { ...usage };
  delete next[dateKey];
  return next;
}

/** Ruim tellerstanden op die ouder zijn dan `keepDays` dagen. */
export function pruneUsage(usage: UsageByDate, todayKey: string, keepDays = 60): UsageByDate {
  const cutoff = addDaysToKey(todayKey, -keepDays);
  return Object.fromEntries(Object.entries(usage).filter(([date]) => date >= cutoff));
}

/* ---------- Verlengen met credits ---------- */

export type ExtendCheck =
  { ok: true } | { ok: false; reason: 'geen-credits' | 'maximum' | 'niet-actief' | 'te-vroeg' };

/**
 * Verlengen kan vanaf de waarschuwing (nog ≤ 3 minuten), max. 2× per sessie, kost 1 credit.
 */
export function canExtend(params: {
  credits: number;
  extensions: number;
  active: boolean;
  remainingMs: number;
}): ExtendCheck {
  const { extension, warnAtRemainingMinutes } = LIMITS.session;
  if (!params.active) return { ok: false, reason: 'niet-actief' };
  if (params.extensions >= extension.maxPerSession) return { ok: false, reason: 'maximum' };
  if (params.remainingMs > warnAtRemainingMinutes * 60_000)
    return { ok: false, reason: 'te-vroeg' };
  if (params.credits < extension.creditCost) return { ok: false, reason: 'geen-credits' };
  return { ok: true };
}
