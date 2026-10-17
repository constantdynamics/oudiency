import { beforeEach, describe, expect, it } from 'vitest';
import { FRAME } from '@/ai/prompts/frame';
import {
  arrivalText,
  sessionContextBlock,
  sessionMessages,
  sessionSystem,
  transcriptText,
} from '@/ai/prompts/session';
import { TIME_CUES } from '@/ai/prompts/voice';
import { ALL_FIGURES } from '@/data/figures/all';
import type { Figure } from '@/data/types';
import { whenLabel } from '@/features/sessions/format';
import { saveCall } from '@/features/sessions/voiceCall';
import { clock } from '@/lib/clock';
import { localDateKey, localDateTime, MINUTE } from '@/lib/dates';
import { daySlots } from '@/services/booking.service';
import { LimitError } from '@/services/limits.service';
import {
  BookingError,
  bookingIcs,
  bookSession,
  cancelBooking,
  compensateSession,
  extendSession,
  finishSession,
  memoryFor,
  newMessage,
  overdueSessions,
  rescheduleBooking,
  startSession,
  upcomingBookings,
} from '@/services/session.service';
import {
  addUserMessage,
  generateOpening,
  generateReply,
  summarizeSession,
} from '@/services/sessionAi';
import { useBookingStore } from '@/store/bookingStore';
import { initialProfile, useProfileStore } from '@/store/profileStore';
import type { Booking, Message, Session } from '@/store/schemas';
import { useSessionStore } from '@/store/sessionStore';
import { useSettingsStore } from '@/store/settingsStore';
import { CallSession, type CallConnection, type CallEvents } from '@/voice/callSession';

const socrates = ALL_FIGURES.find((f) => f.id === 'socrates') as Figure;
/** Een vaste maandag, ruim vóór de spreekuren van Socrates. */
const DAY = '2026-10-19';
const MORNING = localDateTime(DAY, '08:00');

function freeSlot(date = DAY): string {
  const slot = daySlots(socrates, date, MORNING, useBookingStore.getState().bookings).find(
    (s) => s.status === 'vrij',
  );
  if (!slot) throw new Error('geen vrij slot');
  return slot.time;
}

beforeEach(() => {
  useBookingStore.setState({ bookings: [] });
  useSessionStore.setState({ sessions: [] });
  useProfileStore.setState({ profile: initialProfile() });
  useSettingsStore.getState().update({ devInstantReactions: true, aiSource: 'demo' });
});

/* ---------- Prompt ---------- */

describe('sessieprompt', () => {
  it('kader en persona eerst (cachebaar), dan regels en context', () => {
    const system = sessionSystem({
      figure: socrates,
      studentName: 'Sanne',
      memory: ['Over moed.'],
    });
    expect(system[0]?.text).toBe(FRAME);
    expect(system[1]?.text).toContain('Socrates');
    expect(system.every((block) => block.cache)).toBe(true);
    expect(system[2]?.text).toContain('[beurt 7 · verstreken 9:40 · resterend 5:20]');
    expect(system[2]?.text).toContain('60 tot 150 woorden');
  });

  it('context: naam, onderwerp en geheugen', () => {
    const block = sessionContextBlock({
      figure: socrates,
      studentName: 'Sanne',
      topicHint: 'twijfel over mijn baan',
      memory: ['Je sprak over moed.', 'Je sprak over vriendschap.'],
    });
    expect(block).toContain('Sanne genoemd worden');
    expect(block).toContain('twijfel over mijn baan');
    expect(block).toContain('Je sprak over moed.');
    expect(sessionContextBlock({ figure: socrates })).toContain('eerste gesprek');
  });

  it('berichten: binnenkomst als student, tijdregel per beurt, opeenvolgend samengevoegd', () => {
    const messages: Message[] = [
      newMessage('system', arrivalText(false), { hidden: true }),
      newMessage('figure', 'Wees gegroet!'),
      newMessage('user', 'Wat is moed?', {
        timeContext: '[beurt 1 · verstreken 0:30 · resterend 14:30]',
      }),
      newMessage('system', 'Verlengd met 5 minuten (1 credit).'),
      newMessage('figure', 'Wat denk jij?'),
      newMessage('user', 'Weet ik niet.', {
        timeContext: '[beurt 2 · verstreken 1:00 · resterend 14:00]',
      }),
      newMessage('user', 'Help me.', { error: true }),
    ];
    const chat = sessionMessages(messages);
    expect(chat.map((m) => m.role)).toEqual(['user', 'assistant', 'user', 'assistant', 'user']);
    expect(chat[0]?.content).toContain('[App: De student komt binnen');
    expect(chat[2]?.content).toEqual([
      'Wat is moed?',
      '[beurt 1 · verstreken 0:30 · resterend 14:30]',
    ]);
    expect(JSON.stringify(chat)).not.toContain('Verlengd');
    expect(JSON.stringify(chat)).not.toContain('Help me');
  });

  it('transcript voor de samenvatting zonder verborgen berichten', () => {
    const text = transcriptText(
      [
        newMessage('system', 'geheim', { hidden: true }),
        newMessage('user', 'Hoi'),
        newMessage('figure', 'Gegroet'),
      ],
      'Socrates',
    );
    expect(text).toBe('Student: Hoi\n\nSocrates: Gegroet');
  });
});

/* ---------- Boeken ---------- */

describe('boeken, annuleren en verzetten', () => {
  it('boekt een vrij slot en verbruikt de dagplek', () => {
    const time = freeSlot();
    const booking = bookSession(
      socrates,
      { figureId: 'socrates', date: DAY, time, topicHint: '  moed  ' },
      MORNING,
    );
    expect(booking).toMatchObject({ status: 'gepland', date: DAY, time, topicHint: 'moed' });
    expect(useProfileStore.getState().profile.usageByDate[DAY]?.sessions).toBe(1);
    expect(() => bookSession(socrates, { figureId: 'socrates', date: DAY, time }, MORNING)).toThrow(
      BookingError,
    );
  });

  it('respecteert de daglimiet (Basis 1, Premium 3)', () => {
    bookSession(socrates, { figureId: 'socrates', date: DAY, time: freeSlot() }, MORNING);
    expect(() =>
      bookSession(socrates, { figureId: 'socrates', date: DAY, time: freeSlot() }, MORNING),
    ).toThrow(LimitError);
    useProfileStore.getState().setTier('premium');
    expect(() =>
      bookSession(socrates, { figureId: 'socrates', date: DAY, time: freeSlot() }, MORNING),
    ).not.toThrow();
  });

  it('annuleren geeft de dagplek terug, maar niet meer na de starttijd', () => {
    const time = freeSlot();
    const booking = bookSession(socrates, { figureId: 'socrates', date: DAY, time }, MORNING);
    expect(cancelBooking(booking.id, localDateTime(DAY, time) + 1)).toBe(false);
    expect(cancelBooking(booking.id, MORNING)).toBe(true);
    expect(useBookingStore.getState().bookings[0]?.status).toBe('geannuleerd');
    expect(useProfileStore.getState().profile.usageByDate[DAY]?.sessions).toBe(0);
  });

  it('verzetten naar een andere dag verplaatst de dagplek; mislukt het, dan blijft alles staan', () => {
    const old = bookSession(
      socrates,
      { figureId: 'socrates', date: DAY, time: freeSlot() },
      MORNING,
    );
    const nextDay = '2026-10-20';
    const moved = rescheduleBooking(
      old.id,
      socrates,
      { date: nextDay, time: freeSlot(nextDay) },
      MORNING,
    );
    const usage = useProfileStore.getState().profile.usageByDate;
    expect(usage[DAY]?.sessions).toBe(0);
    expect(usage[nextDay]?.sessions).toBe(1);
    expect(useBookingStore.getState().bookings.find((b) => b.id === old.id)?.status).toBe(
      'geannuleerd',
    );
    expect(() =>
      rescheduleBooking(moved.id, socrates, { date: nextDay, time: '03:00' }, MORNING),
    ).toThrow(BookingError);
    expect(useBookingStore.getState().bookings.find((b) => b.id === moved.id)?.status).toBe(
      'gepland',
    );
    expect(useProfileStore.getState().profile.usageByDate[nextDay]?.sessions).toBe(1);
  });

  it('komende afspraken: gepland of bezig, vroegste eerst, zonder gemiste', () => {
    const at = (date: string, time: string, status: Booking['status'] = 'gepland'): Booking => ({
      id: `${date}${time}`,
      figureId: 'socrates',
      date,
      time,
      status,
      createdAt: '2026-10-18T10:00:00.000Z',
    });
    const list = upcomingBookings(
      [
        at('2026-10-21', '10:00'),
        at(DAY, '07:00'),
        at('2026-10-20', '09:00'),
        at(DAY, '07:50', 'actief'),
      ],
      MORNING,
    );
    expect(list.map((b) => b.id)).toEqual([`${DAY}07:50`, '2026-10-2009:00', '2026-10-2110:00']);
  });

  it('agenda-afspraak (.ics) met titel, tijd, link en herinnering', () => {
    const booking = bookSession(
      socrates,
      { figureId: 'socrates', date: DAY, time: freeSlot() },
      MORNING,
    );
    const ics = bookingIcs(booking, 'Socrates', MORNING);
    expect(ics).toContain('SUMMARY:Gesprek met Socrates (Oudiency\\, AI-simulatie)');
    expect(ics).toContain('BEGIN:VALARM');
    expect(ics.replace(/\r\n /g, '')).toContain(`#/sessies/${booking.id}`);
  });
});

/* ---------- Gesprek ---------- */

function startedSession(at = MORNING): Session {
  const time = freeSlot();
  const booking = bookSession(socrates, { figureId: 'socrates', date: DAY, time }, at);
  return startSession(booking, 'tekst', 'demo', localDateTime(DAY, time) + 1_000);
}

describe('sessie: starten, verlengen, afronden', () => {
  it('start alleen als de deur openstaat, met 15 minuten vanaf nu', () => {
    const time = freeSlot();
    const booking = bookSession(socrates, { figureId: 'socrates', date: DAY, time }, MORNING);
    expect(() => startSession(booking, 'tekst', 'demo', MORNING)).toThrow(BookingError);
    const start = localDateTime(DAY, time) + 2 * MINUTE;
    const session = startSession(booking, 'tekst', 'demo', start);
    expect(Date.parse(session.endsAt) - start).toBe(15 * MINUTE);
    expect(useBookingStore.getState().bookings[0]).toMatchObject({
      status: 'actief',
      sessionId: session.id,
    });
    expect(startSession(useBookingStore.getState().bookings[0]!, 'tekst', 'demo', start)).toEqual(
      session,
    );
  });

  it('verlengen: pas vanaf de waarschuwing, 1 credit, max. 2×', () => {
    const session = startedSession();
    const endsAt = Date.parse(session.endsAt);
    expect(extendSession(session.id, endsAt - 10 * MINUTE)).toEqual({
      ok: false,
      reason: 'te-vroeg',
    });
    expect(extendSession(session.id, endsAt - 2 * MINUTE)).toEqual({ ok: true });
    let current = useSessionStore.getState().sessions[0]!;
    expect(Date.parse(current.endsAt)).toBe(endsAt + 5 * MINUTE);
    expect(current.extensions).toBe(1);
    expect(useProfileStore.getState().profile.credits).toBe(1);
    expect(current.messages.at(-1)?.text).toContain('Verlengd');
    expect(extendSession(session.id, Date.parse(current.endsAt) - MINUTE)).toEqual({ ok: true });
    current = useSessionStore.getState().sessions[0]!;
    expect(extendSession(session.id, Date.parse(current.endsAt) - MINUTE)).toEqual({
      ok: false,
      reason: 'maximum',
    });
  });

  it('tijdverlies door een storing: max. 2 minuten terug per sessie', () => {
    const session = startedSession();
    const endsAt = Date.parse(session.endsAt);
    compensateSession(session.id, 90_000);
    compensateSession(session.id, 90_000);
    const current = useSessionStore.getState().sessions[0]!;
    expect(Date.parse(current.endsAt)).toBe(endsAt + 2 * MINUTE);
    expect(current.compensatedMs).toBe(2 * MINUTE);
  });

  it('afronden: afscheid in eigen stijl, invoer dicht, afspraak afgerond', () => {
    const session = startedSession();
    expect(finishSession(session.id, socrates, 'tijd')).toBe(true);
    expect(finishSession(session.id, socrates, 'tijd')).toBe(false);
    const current = useSessionStore.getState().sessions[0]!;
    expect(current.status).toBe('afronden');
    expect(current.endReason).toBe('tijd');
    expect(socrates.microcopy.farewells).toContain(current.messages.at(-1)?.text);
    expect(useBookingStore.getState().bookings[0]?.status).toBe('afgerond');
  });

  it('na een crisissignaal of bij bellen geen afscheid van de app', () => {
    const session = startedSession();
    finishSession(session.id, socrates, 'crisis');
    expect(useSessionStore.getState().sessions[0]?.messages).toEqual([]);
  });

  it('geheugen: de laatste drie afgeronde gesprekken met samenvatting, nieuwste eerst', () => {
    const base = (id: string, day: number, summary?: string, figureId = 'socrates'): Session => ({
      id,
      bookingId: `b${id}`,
      figureId,
      startedAt: new Date(Date.UTC(2026, 9, day)).toISOString(),
      endsAt: new Date(Date.UTC(2026, 9, day, 0, 15)).toISOString(),
      extensions: 0,
      compensatedMs: 0,
      messages: [],
      status: 'afgerond',
      provider: 'demo',
      summary,
    });
    const sessions = [
      base('a', 1, 'eerste'),
      base('b', 2, 'tweede'),
      base('c', 3),
      base('d', 4, 'vierde'),
      base('e', 5, 'vijfde'),
      base('f', 6, 'van kant', 'kant'),
      base('g', 7, 'huidige'),
    ];
    expect(memoryFor(sessions, 'socrates', 'g')).toEqual(['vijfde', 'vierde', 'tweede']);
  });

  it('sessies over tijd (tabblad dicht) worden gevonden', () => {
    const session = startedSession();
    const endsAt = Date.parse(session.endsAt);
    expect(overdueSessions(useSessionStore.getState().sessions, endsAt + 30_000)).toEqual([]);
    expect(overdueSessions(useSessionStore.getState().sessions, endsAt + 90_000)).toHaveLength(1);
  });
});

/* ---------- AI (demomodus) ---------- */

describe('sessie met de demomodus', () => {
  const turn = { figure: socrates, studentName: 'Sanne', memory: [] as string[] };

  it('begroeting, beurt met tijdregel en een antwoord in karakter', async () => {
    const session = startedSession();
    const opening = await generateOpening(session.id, turn, () => undefined);
    expect(opening.length).toBeGreaterThan(20);
    expect(useSessionStore.getState().sessions[0]?.messages[0]?.hidden).toBe(true);
    useSessionStore.getState().appendMessage(session.id, newMessage('figure', opening));

    const message = addUserMessage(
      session.id,
      'Ik twijfel of ik mijn baan moet opzeggen.',
      Date.parse(session.startedAt) + 90_000,
    );
    expect(message.timeContext).toBe('[beurt 1 · verstreken 1:30 · resterend 13:30]');
    const reply = await generateReply(session.id, turn, () => undefined);
    expect(reply.length).toBeGreaterThan(20);
    expect(reply).not.toContain('{');
  });

  it('crisissignaal: de hulpkaart blijft bij het gesprek, het antwoord stapt uit de rol', async () => {
    const session = startedSession();
    addUserMessage(session.id, 'Soms wil ik er niet meer zijn.');
    expect(useSessionStore.getState().sessions[0]?.crisis).toBe(true);
    const reply = await generateReply(session.id, turn, () => undefined);
    expect(reply).toContain('113');
    expect(reply).toContain('AI-simulatie');
  });

  it('samenvatting en reflectievraag; na een crisis geen samenvatting', async () => {
    useProfileStore.getState().setTier('premium'); // twee sessies op één dag
    const session = startedSession();
    addUserMessage(session.id, 'Ik wil leren omgaan met kritiek van anderen.');
    useSessionStore
      .getState()
      .appendMessage(session.id, newMessage('figure', 'Wat is kritiek eigenlijk?'));
    finishSession(session.id, socrates, 'gebruiker');
    const first = summarizeSession(session.id, socrates);
    expect(summarizeSession(session.id, socrates)).toBe(first);
    expect(await first).toBe(true);
    const done = useSessionStore.getState().sessions[0]!;
    expect(done.status).toBe('afgerond');
    expect(done.summary).toContain('Socrates');
    expect(done.reflectionQuestion?.endsWith('?')).toBe(true);

    const crisis = startedSession();
    addUserMessage(crisis.id, 'Ik zie het echt niet meer zitten.');
    finishSession(crisis.id, socrates, 'crisis');
    expect(await summarizeSession(crisis.id, socrates)).toBe(false);
    expect(
      useSessionStore.getState().sessions.find((s) => s.id === crisis.id)?.summary,
    ).toBeUndefined();
  });
});

/* ---------- Bellen in een sessie ---------- */

describe('bellen in een sessie', () => {
  it('vaste eindtijd en verlengen tijdens het bellen', async () => {
    let now = 1_000_000;
    let events!: CallEvents;
    const sent: string[] = [];
    const connection: CallConnection = {
      end: () => Promise.resolve(),
      setMuted: () => undefined,
      sendContext: (text) => sent.push(text),
      sendText: (text) => sent.push(text),
    };
    const session = new CallSession({
      durationMs: 15 * MINUTE,
      endsAt: now + 10 * MINUTE,
      now: () => now,
      every: () => () => undefined,
      start: (e) => {
        events = e;
        return Promise.resolve(connection);
      },
    });
    await session.start();
    events.connected('c1');
    expect(session.getSnapshot().endsAt).toBe(1_000_000 + 10 * MINUTE);
    now += 8 * MINUTE;
    session.tick();
    expect(sent).toEqual([TIME_CUES.afronden]);
    session.extend(5 * MINUTE);
    expect(session.getSnapshot().endsAt).toBe(1_000_000 + 15 * MINUTE);
    expect(sent.at(-1)).toBe(TIME_CUES.verlengd);
    now += 5 * MINUTE; // nog 2 minuten: opnieuw afronden
    session.tick();
    expect(sent.filter((s) => s === TIME_CUES.afronden)).toHaveLength(2);
  });

  it('na het bellen: transcript bewaard; bij een storing met tijd over blijft de sessie open', () => {
    const session = startedSession();
    useSessionStore.getState().update(session.id, { mode: 'bellen' });
    const endsAt = Date.parse(session.endsAt);
    const state = {
      status: 'beeindigd' as const,
      mode: 'luistert' as const,
      muted: false,
      crisis: false,
      transcript: [
        { id: 'r1', role: 'figure' as const, text: 'Wees gegroet!', at: endsAt - 10 * MINUTE },
        { id: 'r2', role: 'user' as const, text: 'Hallo', at: endsAt - 9 * MINUTE },
      ],
      endReason: 'verbinding' as const,
      endedAt: endsAt - 8 * MINUTE,
    };
    saveCall(session.id, socrates, state);
    let current = useSessionStore.getState().sessions[0]!;
    expect(current.messages.map((m) => m.text)).toEqual(['Wees gegroet!', 'Hallo']);
    expect(current.status).toBe('actief');
    saveCall(session.id, socrates, {
      ...state,
      transcript: [],
      endReason: 'tijd',
      endedAt: endsAt,
    });
    current = useSessionStore.getState().sessions[0]!;
    expect(current.status).toBe('afronden');
    expect(current.messages).toHaveLength(2);
  });
});

it('vandaag is een lokale datum', () => {
  expect(localDateKey(clock.now())).toMatch(/^\d{4}-\d{2}-\d{2}$/);
});

describe('wanneer', () => {
  it('noemt vandaag en morgen bij naam, verder de datum', () => {
    const now = localDateTime('2026-10-19', '08:00');
    expect(whenLabel({ date: '2026-10-19', time: '09:30' }, now)).toBe('vandaag, 09:30');
    expect(whenLabel({ date: '2026-10-20', time: '14:00' }, now)).toBe('morgen, 14:00');
    expect(whenLabel({ date: '2026-10-23', time: '14:00' }, now)).toBe('vrijdag 23 oktober, 14:00');
    expect(whenLabel({ date: '2026-10-19', time: '09:30' })).toBe('maandag 19 oktober, 09:30');
  });
});
