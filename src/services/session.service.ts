/**
 * Sessies (§7.1), zonder AI: boeken, annuleren, verzetten, starten binnen het venster,
 * verlengen, afronden met afscheid en het geheugen van de laatste drie gesprekken.
 * De AI-kant (beurten en samenvatting) staat in sessionAi.ts, zodat die lazy laadt.
 */
import { APP } from '@/config/app';
import { LIMITS } from '@/config/limits';
import type { Figure } from '@/data/types';
import { clock } from '@/lib/clock';
import { localDateKey } from '@/lib/dates';
import { buildIcs } from '@/lib/ics';
import { uid } from '@/lib/ids';
import { pick, seededRng } from '@/lib/seeded-rng';
import { useBookingStore } from '@/store/bookingStore';
import { useProfileStore } from '@/store/profileStore';
import type { Booking, Message, Session } from '@/store/schemas';
import { useSessionStore } from '@/store/sessionStore';
import {
  bookingStart,
  canChangeBooking,
  daySlots,
  isActiveBooking,
  type SlotFigure,
  startWindow,
} from './booking.service';
import { canExtend, type ExtendCheck } from './limits.service';
import { compensate, extendedEndsAt, initialEndsAt } from './session-timer';

export type SessionMode = 'tekst' | 'bellen';
export type SessionEndReason = NonNullable<Session['endReason']>;

export class BookingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BookingError';
  }
}

/* ---------- Boeken ---------- */

export interface BookingInput {
  figureId: string;
  date: string;
  time: string;
  topicHint?: string;
}

function cleanTopic(topic: string | undefined): string | undefined {
  const text = topic?.trim().replace(/\s+/g, ' ').slice(0, LIMITS.session.topicHintMaxLength);
  return text || undefined;
}

/**
 * Reserveer een slot: alleen als het vrij is, en binnen de daglimiet van die dag (gooit dan een
 * LimitError). Geeft de nieuwe afspraak terug.
 */
export function bookSession(figure: SlotFigure, input: BookingInput, now = clock.now()): Booking {
  const { bookings, add } = useBookingStore.getState();
  const slot = daySlots(figure, input.date, now, bookings).find((s) => s.time === input.time);
  if (!slot || slot.status !== 'vrij') {
    throw new BookingError('Dit tijdstip is niet (meer) vrij. Kies een ander moment.');
  }
  useProfileStore.getState().consumeUsage('sessions', input.date);
  const booking: Booking = {
    id: uid('afspraak'),
    figureId: input.figureId,
    date: input.date,
    time: input.time,
    topicHint: cleanTopic(input.topicHint),
    status: 'gepland',
    createdAt: new Date(now).toISOString(),
  };
  add(booking);
  return booking;
}

/** Annuleren kan tot de starttijd; de dagplek komt weer vrij. */
export function cancelBooking(bookingId: string, now = clock.now()): boolean {
  const { bookings, update } = useBookingStore.getState();
  const booking = bookings.find((b) => b.id === bookingId);
  if (!booking || !canChangeBooking(booking, now)) return false;
  update(booking.id, { status: 'geannuleerd' });
  useProfileStore.getState().releaseUsage('sessions', booking.date);
  return true;
}

/**
 * Verzetten = het nieuwe slot boeken en daarna het oude annuleren. Lukt het nieuwe slot niet,
 * dan blijft de oude afspraak gewoon staan.
 */
export function rescheduleBooking(
  bookingId: string,
  figure: SlotFigure,
  target: { date: string; time: string },
  now = clock.now(),
): Booking {
  const { bookings } = useBookingStore.getState();
  const old = bookings.find((b) => b.id === bookingId);
  if (!old || !canChangeBooking(old, now)) {
    throw new BookingError('Deze afspraak kan niet meer worden verzet.');
  }
  // De oude dagplek telt niet mee als je binnen dezelfde dag verzet.
  useProfileStore.getState().releaseUsage('sessions', old.date);
  try {
    const next = bookSession(
      figure,
      { figureId: old.figureId, date: target.date, time: target.time, topicHint: old.topicHint },
      now,
    );
    useBookingStore.getState().update(old.id, { status: 'geannuleerd' });
    return next;
  } catch (error) {
    useProfileStore.getState().consumeUsage('sessions', old.date);
    throw error;
  }
}

/** Je komende afspraken (gepland of nu bezig), vroegste eerst. */
export function upcomingBookings(bookings: readonly Booking[], now: number): Booking[] {
  return bookings
    .filter(
      (b) => b.status === 'actief' || (b.status === 'gepland' && startWindow(b, now) !== 'gemist'),
    )
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
}

/** Heb je nog een sessieplek op die dag? */
export function hasSessionRoom(dateKey: string): boolean {
  const { profile } = useProfileStore.getState();
  const used = profile.usageByDate[dateKey]?.sessions ?? 0;
  return used < LIMITS.session.perDay[profile.tier];
}

/* ---------- Gesprek ---------- */

/** Samenvattingen van de laatste gesprekken met deze denker (meest recente eerst). */
export function memoryFor(
  sessions: readonly Session[],
  figureId: string,
  excludeId?: string,
): string[] {
  return sessions
    .filter(
      (s) => s.figureId === figureId && s.id !== excludeId && s.status === 'afgerond' && s.summary,
    )
    .sort((a, b) => Date.parse(b.startedAt) - Date.parse(a.startedAt))
    .slice(0, LIMITS.session.memorySessions)
    .map((s) => s.summary ?? '');
}

export function sessionForBooking(
  sessions: readonly Session[],
  booking: Booking,
): Session | undefined {
  return booking.sessionId ? sessions.find((s) => s.id === booking.sessionId) : undefined;
}

export function newMessage(
  role: Message['role'],
  text: string,
  extra: Partial<Message> = {},
  now = clock.now(),
): Message {
  return { id: uid('bericht'), role, text, createdAt: new Date(now).toISOString(), ...extra };
}

/**
 * Start het gesprek (alleen als de deur openstaat). De timer loopt vanaf nu: 15 minuten,
 * opgeslagen als `endsAt`.
 */
export function startSession(
  booking: Booking,
  mode: SessionMode,
  provider: Session['provider'],
  now = clock.now(),
): Session {
  if (booking.status === 'actief' && booking.sessionId) {
    const existing = useSessionStore.getState().sessions.find((s) => s.id === booking.sessionId);
    if (existing) return existing;
  }
  if (booking.status !== 'gepland' || startWindow(booking, now) !== 'open') {
    throw new BookingError('Deze afspraak kan nu niet starten.');
  }
  const session: Session = {
    id: uid('sessie'),
    bookingId: booking.id,
    figureId: booking.figureId,
    startedAt: new Date(now).toISOString(),
    endsAt: new Date(initialEndsAt(now)).toISOString(),
    extensions: 0,
    compensatedMs: 0,
    messages: [],
    status: 'actief',
    topicHint: booking.topicHint,
    provider,
    mode,
  };
  useSessionStore.getState().add(session);
  useBookingStore.getState().update(booking.id, { status: 'actief', sessionId: session.id });
  return session;
}

/** Verleng met 5 minuten voor 1 credit (vanaf de waarschuwing, max. 2×). */
export function extendSession(sessionId: string, now = clock.now()): ExtendCheck {
  const session = useSessionStore.getState().sessions.find((s) => s.id === sessionId);
  if (!session) return { ok: false, reason: 'niet-actief' };
  const profile = useProfileStore.getState();
  const check = canExtend({
    credits: profile.profile.credits,
    extensions: session.extensions,
    active: session.status === 'actief',
    remainingMs: Date.parse(session.endsAt) - now,
  });
  if (!check.ok) return check;
  if (!profile.spendCredits(LIMITS.session.extension.creditCost)) {
    return { ok: false, reason: 'geen-credits' };
  }
  const endsAt = extendedEndsAt(Date.parse(session.endsAt), now);
  useSessionStore.getState().update(session.id, {
    endsAt: new Date(endsAt).toISOString(),
    extensions: session.extensions + 1,
    warned: false,
  });
  useSessionStore
    .getState()
    .appendMessage(session.id, newMessage('system', 'Verlengd met 5 minuten (1 credit).', {}, now));
  return check;
}

/** Een afscheid in de stijl van de denker (vast per sessie, zodat herladen hetzelfde geeft). */
export function farewellFor(figure: Pick<Figure, 'microcopy'>, sessionId: string): string {
  return (
    pick(seededRng(`${sessionId}|afscheid`), figure.microcopy.farewells) ??
    'Onze tijd is om; ik moet nu door naar een andere student. Dank je wel voor het gesprek.'
  );
}

/**
 * Rond het gesprek af: het afscheid (als de denker dat nog niet zei), invoer dicht, status
 * 'afronden' tot de samenvatting klaar is. Geeft false als het al was afgerond.
 */
export function finishSession(
  sessionId: string,
  figure: Pick<Figure, 'microcopy'>,
  reason: SessionEndReason,
  now = clock.now(),
): boolean {
  const store = useSessionStore.getState();
  const session = store.sessions.find((s) => s.id === sessionId);
  if (!session || session.status !== 'actief') return false;
  if (reason !== 'crisis' && session.mode !== 'bellen') {
    store.appendMessage(session.id, newMessage('figure', farewellFor(figure, session.id), {}, now));
  }
  store.update(session.id, {
    status: 'afronden',
    endedAt: new Date(now).toISOString(),
    endReason: reason,
  });
  const booking = useBookingStore.getState().bookings.find((b) => b.id === session.bookingId);
  if (booking && isActiveBooking(booking)) {
    useBookingStore.getState().update(booking.id, { status: 'afgerond' });
  }
  return true;
}

/** Sessies die al langer over tijd zijn (bijvoorbeeld tabblad gesloten tijdens het gesprek). */
export function overdueSessions(sessions: readonly Session[], now: number, graceMs = 60_000) {
  return sessions.filter((s) => s.status === 'actief' && Date.parse(s.endsAt) + graceMs < now);
}

/** Gesprekken van vandaag (lokale datum), voor het overzicht. */
export function sessionsOn(sessions: readonly Session[], now: number): Session[] {
  const today = localDateKey(now);
  return sessions.filter((s) => localDateKey(Date.parse(s.startedAt)) === today);
}

/** Tijd die verloren ging door een API-fout, compenseren (max. 2 minuten per sessie). */
export function compensateSession(sessionId: string, lostMs: number): void {
  const store = useSessionStore.getState();
  const session = store.sessions.find((s) => s.id === sessionId);
  if (!session || session.status !== 'actief' || lostMs <= 0) return;
  const next = compensate(Date.parse(session.endsAt), session.compensatedMs, lostMs);
  if (next.compensatedMs === session.compensatedMs) return;
  store.update(session.id, {
    endsAt: new Date(next.endsAt).toISOString(),
    compensatedMs: next.compensatedMs,
  });
}

/** De agenda-afspraak (.ics) voor een reservering. */
export function bookingIcs(booking: Booking, figureName: string, now = clock.now()): string {
  return buildIcs({
    uid: `${booking.id}@oudiency`,
    start: bookingStart(booking),
    durationMinutes: LIMITS.session.durationMinutes,
    title: `Gesprek met ${figureName} (Oudiency, AI-simulatie)`,
    description: [
      `Je afspraak met een AI-simulatie van ${figureName}. De deur staat open vanaf de starttijd tot ${LIMITS.session.startWindowMinutes} minuten erna.`,
      booking.topicHint ? `Onderwerp: ${booking.topicHint}` : '',
      `${APP.siteUrl}#/sessies/${booking.id}`,
    ]
      .filter(Boolean)
      .join('\n'),
    location: 'Oudiency',
    stamp: now,
    alarmMinutesBefore: 10,
  });
}
