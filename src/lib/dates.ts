import { format, formatDistanceStrict } from 'date-fns';
import { nl } from 'date-fns/locale';

export const MINUTE = 60_000;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;

/** Lokale kalenderdatum als 'YYYY-MM-DD'. */
export function localDateKey(ms: number): string {
  const d = new Date(ms);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Tijdstip (ms) van een lokale datum + 'HH:MM'. */
export function localDateTime(dateKey: string, time = '00:00'): number {
  const [y, m, d] = dateKey.split('-').map(Number);
  const [hh, mm] = time.split(':').map(Number);
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1, hh ?? 0, mm ?? 0, 0, 0).getTime();
}

/** Begin (00:00 lokale tijd) van de dag waarin `ms` valt. */
export function startOfLocalDay(ms: number): number {
  return localDateTime(localDateKey(ms));
}

/** Tel `days` kalenderdagen op bij een datumsleutel (DST-veilig). */
export function addDaysToKey(dateKey: string, days: number): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  const date = new Date(y ?? 1970, (m ?? 1) - 1, (d ?? 1) + days, 12, 0, 0, 0);
  return localDateKey(date.getTime());
}

/** Aantal kalenderdagen van a naar b (b - a). */
export function daysBetweenKeys(a: string, b: string): number {
  return Math.round((localDateTime(b, '12:00') - localDateTime(a, '12:00')) / DAY);
}

/** Dagnummer sinds 1970 voor een lokale datum (handig als seed/index). */
export function dayIndex(dateKey: string): number {
  return daysBetweenKeys('1970-01-01', dateKey);
}

export function formatDate(ms: number, pattern: string): string {
  return format(new Date(ms), pattern, { locale: nl });
}

/** 'dinsdag 14 oktober' */
export function formatLongDate(ms: number): string {
  return formatDate(ms, 'EEEE d MMMM');
}

/** '14:05' */
export function formatTime(ms: number): string {
  return formatDate(ms, 'HH:mm');
}

/** 'vandaag', 'morgen' of 'do 16 okt'. */
export function relativeDayLabel(dateKey: string, todayKey: string): string {
  const diff = daysBetweenKeys(todayKey, dateKey);
  if (diff === 0) return 'vandaag';
  if (diff === 1) return 'morgen';
  if (diff === -1) return 'gisteren';
  return formatDate(localDateTime(dateKey, '12:00'), 'EEE d MMM');
}

/** Resterende tijd als 'mm:ss' (nooit negatief). */
export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/** '5 minuten geleden' — relatief ten opzichte van `now`. */
export function timeAgo(ms: number, now: number): string {
  if (now - ms < MINUTE) return 'zojuist';
  return `${formatDistanceStrict(new Date(ms), new Date(now), { locale: nl })} geleden`;
}

/** Jaar met 'v.Chr.' voor negatieve jaartallen. */
export function formatYear(year: number, approximate = false): string {
  const prefix = approximate ? 'ca. ' : '';
  return year < 0 ? `${prefix}${Math.abs(year)} v.Chr.` : `${prefix}${year}`;
}

/** Levensjaren, bijv. 'ca. 470–399 v.Chr.' of '1632–1677'. */
export function formatLifespan(born: number, died: number, approximate = false): string {
  const prefix = approximate ? 'ca. ' : '';
  if (born < 0 && died < 0) return `${prefix}${Math.abs(born)}–${Math.abs(died)} v.Chr.`;
  if (born < 0) return `${prefix}${Math.abs(born)} v.Chr.–${died} n.Chr.`;
  return `${prefix}${born}–${died}`;
}
