/**
 * Datum- en tijdhulpjes. Bewust zonder datumbibliotheek: vaste Nederlandse namen geven overal
 * (browser, Node, tests) dezelfde uitvoer en houden de startbundel klein.
 */

const DAYS = ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'];
const DAYS_SHORT = ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'];
const MONTHS = [
  'januari',
  'februari',
  'maart',
  'april',
  'mei',
  'juni',
  'juli',
  'augustus',
  'september',
  'oktober',
  'november',
  'december',
];
const MONTHS_SHORT = [
  'jan',
  'feb',
  'mrt',
  'apr',
  'mei',
  'jun',
  'jul',
  'aug',
  'sep',
  'okt',
  'nov',
  'dec',
];

const pad = (n: number) => String(n).padStart(2, '0');

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

/** 'dinsdag 14 oktober' */
export function formatLongDate(ms: number): string {
  const d = new Date(ms);
  return `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

/** 'di 14 okt' */
export function formatShortDate(ms: number): string {
  const d = new Date(ms);
  return `${DAYS_SHORT[d.getDay()]} ${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
}

/** '14 oktober 2026' */
export function formatFullDate(ms: number): string {
  const d = new Date(ms);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/** '14:05' */
export function formatTime(ms: number): string {
  const d = new Date(ms);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** 'vandaag', 'morgen' of 'do 16 okt'. */
export function relativeDayLabel(dateKey: string, todayKey: string): string {
  const diff = daysBetweenKeys(todayKey, dateKey);
  if (diff === 0) return 'vandaag';
  if (diff === 1) return 'morgen';
  if (diff === -1) return 'gisteren';
  return formatShortDate(localDateTime(dateKey, '12:00'));
}

/** Resterende tijd als 'mm:ss' (nooit negatief). */
export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${pad(minutes)}:${pad(seconds)}`;
}

/** '5 minuten geleden' — relatief ten opzichte van `now` (afgerond naar beneden). */
export function timeAgo(ms: number, now: number): string {
  const diff = now - ms;
  if (diff < MINUTE) return 'zojuist';
  const unit = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many} geleden`;
  if (diff < HOUR) return unit(Math.floor(diff / MINUTE), 'minuut', 'minuten');
  if (diff < DAY) return unit(Math.floor(diff / HOUR), 'uur', 'uur');
  if (diff < 30 * DAY) return unit(Math.floor(diff / DAY), 'dag', 'dagen');
  if (diff < 365 * DAY) return unit(Math.floor(diff / (30 * DAY)), 'maand', 'maanden');
  return unit(Math.floor(diff / (365 * DAY)), 'jaar', 'jaar');
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
