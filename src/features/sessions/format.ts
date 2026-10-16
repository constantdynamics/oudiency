import { formatLongDate, formatTime, localDateKey, relativeDayLabel } from '@/lib/dates';
import { bookingStart } from '@/services/booking.service';
import type { Booking } from '@/store/schemas';

/**
 * 'vrijdag 16 oktober, 14:30'. Met `now` worden vandaag en morgen ook zo genoemd
 * ('vandaag, 14:30'), zoals bij de dagkeuze.
 */
export function whenLabel(booking: Pick<Booking, 'date' | 'time'>, now?: number): string {
  const start = bookingStart(booking);
  if (now !== undefined) {
    const day = relativeDayLabel(booking.date, localDateKey(now));
    if (day === 'vandaag' || day === 'morgen') return `${day}, ${formatTime(start)}`;
  }
  return `${formatLongDate(start)}, ${formatTime(start)}`;
}
