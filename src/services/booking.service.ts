/**
 * Spreekuur en reserveringen. Bezette slots zijn deterministisch gesimuleerd
 * (seed = datum + denker), zodat ze na herladen gelijk blijven.
 */
import { LIMITS } from '@/config/limits';
import { addDaysToKey, localDateKey, localDateTime, MINUTE } from '@/lib/dates';
import { chance, randomInt, seededRng } from '@/lib/seeded-rng';
import type { Booking } from '@/store/schemas';

export type SlotStatus = 'vrij' | 'bezet' | 'verlopen' | 'jouw-afspraak' | 'onbeschikbaar';

export interface Slot {
  time: string;
  start: number;
  status: SlotStatus;
  note?: string;
  bookingId?: string;
}

export interface SlotFigure {
  id: string;
  availability: { slots: string[] };
  microcopy?: { unavailableNote?: { time: string; text: string } };
}

const ACTIVE_STATUSES = new Set(['gepland', 'actief', 'afgerond']);

export function bookingStart(booking: Pick<Booking, 'date' | 'time'>): number {
  return localDateTime(booking.date, booking.time);
}

export function isActiveBooking(booking: Booking): boolean {
  return ACTIVE_STATUSES.has(booking.status);
}

/** De slots die een denker op een bepaalde dag aanbiedt (vóór bezetting). */
export function offeredTimes(figure: SlotFigure, dateKey: string): string[] {
  const base = [...new Set(figure.availability.slots)].sort();
  const { min, max } = LIMITS.session.slotsPerDay;
  if (base.length <= min) return base;
  const rng = seededRng(`${dateKey}|${figure.id}|aanbod`);
  const count = randomInt(rng, min, Math.min(max, base.length));
  const keep = new Set<string>(base);
  while (keep.size > count) {
    const candidates = [...keep];
    const victim = candidates[Math.floor(rng() * candidates.length)];
    if (victim) keep.delete(victim);
  }
  return base.filter((time) => keep.has(time));
}

/** Welke van de aangeboden tijden zijn "bezet — in gesprek met een andere student"? */
export function busyTimes(figure: SlotFigure, dateKey: string, offered: string[]): Set<string> {
  const rng = seededRng(`${dateKey}|${figure.id}|bezet`);
  const busy = new Set(offered.filter(() => chance(rng, LIMITS.session.busyShare)));
  // Laat altijd minstens twee plekken vrij: schaarste, maar geen dichte deur.
  for (const time of [...offered].reverse()) {
    if (offered.length - busy.size >= Math.min(2, offered.length)) break;
    busy.delete(time);
  }
  return busy;
}

/**
 * Slots voor één dag, met status per slot. `bookings` zijn al je afspraken (alle denkers).
 */
export function daySlots(
  figure: SlotFigure,
  dateKey: string,
  now: number,
  bookings: readonly Booking[],
): Slot[] {
  const offered = offeredTimes(figure, dateKey);
  const busy = busyTimes(figure, dateKey, offered);
  const mine = bookings.filter((b) => isActiveBooking(b) && b.date === dateKey);

  const slots: Slot[] = offered.map((time) => {
    const start = localDateTime(dateKey, time);
    const own = mine.find((b) => b.figureId === figure.id && b.time === time);
    if (own) return { time, start, status: 'jouw-afspraak', bookingId: own.id };
    if (start <= now) return { time, start, status: 'verlopen' };
    if (busy.has(time)) return { time, start, status: 'bezet' };
    const clash = mine.find((b) => b.time === time);
    if (clash)
      return { time, start, status: 'onbeschikbaar', note: 'Je hebt dan al een andere afspraak.' };
    return { time, start, status: 'vrij' };
  });

  const special = figure.microcopy?.unavailableNote;
  if (special && !offered.includes(special.time)) {
    slots.push({
      time: special.time,
      start: localDateTime(dateKey, special.time),
      status: 'onbeschikbaar',
      note: special.text,
    });
    slots.sort((a, b) => a.start - b.start);
  }
  return slots;
}

/** Datumsleutels van vandaag en de komende 7 dagen. */
export function bookingDays(now: number): string[] {
  const today = localDateKey(now);
  return Array.from({ length: LIMITS.session.bookingDaysAhead + 1 }, (_, i) =>
    addDaysToKey(today, i),
  );
}

export type StartWindow = 'te-vroeg' | 'open' | 'gemist';

/** "De deur staat open" vanaf de starttijd tot 10 minuten erna. */
export function startWindow(booking: Pick<Booking, 'date' | 'time'>, now: number): StartWindow {
  const start = bookingStart(booking);
  if (now < start) return 'te-vroeg';
  if (now <= start + LIMITS.session.startWindowMinutes * MINUTE) return 'open';
  return 'gemist';
}

/** Annuleren of verzetten kan tot de starttijd. */
export function canChangeBooking(booking: Booking, now: number): boolean {
  return booking.status === 'gepland' && now < bookingStart(booking);
}

/** Geplande afspraken waarvan het startvenster verstreken is. */
export function findMissedBookings(bookings: readonly Booking[], now: number): Booking[] {
  return bookings.filter((b) => b.status === 'gepland' && startWindow(b, now) === 'gemist');
}

/** Eerstvolgende geplande afspraak (of de afspraak waarvan de deur nu openstaat). */
export function nextBooking(bookings: readonly Booking[], now: number): Booking | undefined {
  return bookings
    .filter(
      (b) => (b.status === 'gepland' && startWindow(b, now) !== 'gemist') || b.status === 'actief',
    )
    .sort((a, b) => bookingStart(a) - bookingStart(b))[0];
}
