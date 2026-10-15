import { describe, expect, it } from 'vitest';
import { localDateTime } from '@/lib/dates';
import {
  bookingDays,
  busyTimes,
  canChangeBooking,
  daySlots,
  findMissedBookings,
  offeredTimes,
  startWindow,
} from '@/services/booking.service';
import type { Booking } from '@/store/schemas';

const figure = {
  id: 'socrates',
  availability: { slots: ['09:15', '10:30', '11:45', '13:00', '14:15', '16:00', '17:30', '19:45'] },
};

const booking = (overrides: Partial<Booking> = {}): Booking => ({
  id: 'b1',
  figureId: 'socrates',
  date: '2026-10-16',
  time: '10:30',
  status: 'gepland',
  createdAt: '2026-10-15T08:00:00.000Z',
  ...overrides,
});

describe('spreekuur', () => {
  it('biedt 6–8 slots per dag aan tussen 09:00 en 21:00', () => {
    for (const day of ['2026-10-15', '2026-10-16', '2026-10-17', '2026-12-24']) {
      const times = offeredTimes(figure, day);
      expect(times.length).toBeGreaterThanOrEqual(6);
      expect(times.length).toBeLessThanOrEqual(8);
      for (const t of times) {
        expect(t >= '09:00' && t <= '21:00').toBe(true);
      }
    }
  });

  it('bezette slots zijn deterministisch (gelijk na herladen)', () => {
    const offered = offeredTimes(figure, '2026-10-16');
    const a = [...busyTimes(figure, '2026-10-16', offered)];
    const b = [...busyTimes(figure, '2026-10-16', offered)];
    expect(a).toEqual(b);
    // en verschillend per denker/dag (op zijn minst niet altijd gelijk)
    const days = ['2026-10-16', '2026-10-17', '2026-10-18', '2026-10-19', '2026-10-20'];
    const patterns = new Set(days.map((d) => [...busyTimes(figure, d, offeredTimes(figure, d))].join(',')));
    expect(patterns.size).toBeGreaterThan(1);
  });

  it('laat altijd minstens twee plekken vrij', () => {
    for (let i = 1; i <= 28; i++) {
      const day = `2026-11-${String(i).padStart(2, '0')}`;
      const offered = offeredTimes(figure, day);
      const busy = busyTimes(figure, day, offered);
      expect(offered.length - busy.size).toBeGreaterThanOrEqual(2);
    }
  });

  it('markeert je eigen afspraak, verlopen slots en dubbele boekingen', () => {
    const now = localDateTime('2026-10-16', '12:00');
    const offered = offeredTimes(figure, '2026-10-16');
    const ownTime = offered.find((t) => t > '12:00') ?? offered[offered.length - 1]!;
    const own = booking({ time: ownTime });
    const other = booking({ id: 'b2', figureId: 'kant', time: offered[offered.length - 1]! });
    const slots = daySlots(figure, '2026-10-16', now, [own, other]);
    expect(slots.find((s) => s.time === ownTime)?.status).toBe('jouw-afspraak');
    for (const slot of slots.filter((s) => s.time < '12:00')) {
      expect(slot.status).toBe('verlopen');
    }
    if (other.time !== ownTime) {
      const clash = slots.find((s) => s.time === other.time);
      expect(['onbeschikbaar', 'bezet']).toContain(clash?.status);
    }
  });

  it('toont een speciale notitie, zoals Kants wandeling', () => {
    const kant = {
      id: 'kant',
      availability: { slots: ['09:00', '10:00', '11:00', '12:00', '14:00', '17:00', '18:00', '19:00'] },
      microcopy: { unavailableNote: { time: '15:30', text: 'Kant maakt zijn dagelijkse wandeling.' } },
    };
    const slots = daySlots(kant, '2026-10-16', localDateTime('2026-10-15', '12:00'), []);
    const walk = slots.find((s) => s.time === '15:30');
    expect(walk?.status).toBe('onbeschikbaar');
    expect(walk?.note).toContain('wandeling');
  });

  it('geeft vandaag + 7 dagen', () => {
    const days = bookingDays(localDateTime('2026-10-15', '10:00'));
    expect(days).toHaveLength(8);
    expect(days[0]).toBe('2026-10-15');
    expect(days[7]).toBe('2026-10-22');
  });
});

describe('startvenster', () => {
  const b = booking();
  const start = localDateTime(b.date, b.time);

  it('te vroeg, open (tot 10 minuten erna) en gemist', () => {
    expect(startWindow(b, start - 1)).toBe('te-vroeg');
    expect(startWindow(b, start)).toBe('open');
    expect(startWindow(b, start + 10 * 60_000)).toBe('open');
    expect(startWindow(b, start + 10 * 60_000 + 1)).toBe('gemist');
  });

  it('annuleren/verzetten kan tot de starttijd', () => {
    expect(canChangeBooking(b, start - 1)).toBe(true);
    expect(canChangeBooking(b, start)).toBe(false);
    expect(canChangeBooking({ ...b, status: 'geannuleerd' }, start - 1)).toBe(false);
  });

  it('vindt gemiste afspraken', () => {
    expect(findMissedBookings([b], start + 11 * 60_000)).toHaveLength(1);
    expect(findMissedBookings([b], start + 5 * 60_000)).toHaveLength(0);
  });
});
