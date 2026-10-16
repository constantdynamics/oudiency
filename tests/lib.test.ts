import { describe, expect, it } from 'vitest';
import {
  addDaysToKey,
  daysBetweenKeys,
  formatCountdown,
  formatLifespan,
  formatLongDate,
  formatTime,
  localDateKey,
  relativeDayLabel,
  timeAgo,
  timeUntil,
} from '@/lib/dates';
import { buildIcs, escapeIcsText, foldLine } from '@/lib/ics';
import { closeOpenMarkers, markdownToPlainText, parseInline, parseMarkdown } from '@/lib/markdown';
import { rankTrending, topTerms, trendingScore } from '@/lib/ranking';
import { hashString, pick, seededRng, shuffle } from '@/lib/seeded-rng';
import { extractHashtags, keywordScore, salientWord, stem, tokenize, truncate } from '@/lib/text';

const HOUR = 3_600_000;

describe('seeded-rng', () => {
  it('is deterministisch per seed', () => {
    const a = seededRng('2026-10-15|socrates');
    const b = seededRng('2026-10-15|socrates');
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
    expect(hashString('x')).not.toBe(hashString('y'));
  });

  it('shuffle behoudt alle elementen', () => {
    const items = [1, 2, 3, 4, 5, 6];
    expect(shuffle(seededRng('s'), items).sort()).toEqual(items);
    expect(pick(seededRng('s'), [])).toBeUndefined();
  });
});

describe('ranking', () => {
  it('trending = likes_7d / (uren + 2)^1,5', () => {
    const now = Date.UTC(2026, 9, 15, 12);
    const published = now - 10 * HOUR;
    const likes = [{ at: now - HOUR }, { at: now - 2 * HOUR }];
    expect(trendingScore(likes, published, now)).toBeCloseTo(2 / Math.pow(12, 1.5), 10);
  });

  it('negeert likes ouder dan 7 dagen en likes in de toekomst', () => {
    const now = Date.UTC(2026, 9, 15, 12);
    const old = [{ at: now - 8 * 24 * HOUR }];
    expect(trendingScore(old, now - 9 * 24 * HOUR, now)).toBe(0);
    expect(trendingScore([{ at: now + HOUR }], now - HOUR, now)).toBe(0);
  });

  it('nieuwer met evenveel likes scoort hoger', () => {
    const now = Date.UTC(2026, 9, 15, 12);
    const items = [
      { id: 'oud', publishedAt: now - 48 * HOUR, likes: [{ at: now - HOUR }] },
      { id: 'nieuw', publishedAt: now - 3 * HOUR, likes: [{ at: now - HOUR }] },
      { id: 'geen', publishedAt: now - HOUR, likes: [] },
    ];
    expect(rankTrending(items, now).map((i) => i.id)).toEqual(['nieuw', 'oud']);
  });

  it('topTerms telt en sorteert', () => {
    expect(topTerms(['a', 'b', 'a', 'c', 'a', 'b'], 2)).toEqual([
      { term: 'a', count: 3 },
      { term: 'b', count: 2 },
    ]);
  });
});

describe('markdown (veilig)', () => {
  it('parset alinea’s, vet, cursief en lijsten', () => {
    const blocks = parseMarkdown(
      'Een **vette** en *schuine* zin.\n\n- een\n- twee\n\n1. eerste\n2. tweede',
    );
    expect(blocks).toHaveLength(3);
    expect(blocks[0]).toEqual({
      type: 'paragraph',
      children: [
        { type: 'text', text: 'Een ' },
        { type: 'strong', children: [{ type: 'text', text: 'vette' }] },
        { type: 'text', text: ' en ' },
        { type: 'em', children: [{ type: 'text', text: 'schuine' }] },
        { type: 'text', text: ' zin.' },
      ],
    });
    expect(blocks[1]).toMatchObject({ type: 'list', ordered: false });
    expect(blocks[2]).toMatchObject({ type: 'list', ordered: true });
  });

  it('laat HTML als platte tekst staan (React escapet het)', () => {
    const inline = parseInline('<img src=x onerror=alert(1)> **ok**');
    expect(inline[0]).toEqual({ type: 'text', text: '<img src=x onerror=alert(1)> ' });
  });

  it('toont links als platte tekst', () => {
    expect(parseInline('Zie [deze pagina](javascript:alert(1)).')).toEqual([
      { type: 'text', text: 'Zie deze pagina.' },
    ]);
  });

  it('behoudt regeleinden binnen een alinea (Laozi schrijft soms in versregels)', () => {
    const blocks = parseMarkdown('Water is zacht\nen toch overwint het steen.');
    expect(blocks[0]).toMatchObject({ type: 'paragraph' });
    expect((blocks[0] as { children: unknown[] }).children).toContainEqual({ type: 'break' });
  });

  it('laat losse sterretjes en snake_case met rust', () => {
    expect(parseInline('2 * 3 = 6')).toEqual([{ type: 'text', text: '2 * 3 = 6' }]);
    expect(parseInline('wu_wei_tekst')).toEqual([{ type: 'text', text: 'wu_wei_tekst' }]);
  });

  it('sluit open markeringen tijdens het streamen', () => {
    expect(closeOpenMarkers('Dit is **bel')).toBe('Dit is **bel**');
    expect(closeOpenMarkers('Dit is **')).toBe('Dit is ');
    expect(closeOpenMarkers('Een *schuin')).toBe('Een *schuin*');
    expect(closeOpenMarkers('Klaar **vet**.')).toBe('Klaar **vet**.');
  });

  it('maakt platte tekst', () => {
    expect(markdownToPlainText('**Kern**: deugd\n\n- een\n- twee')).toBe(
      'Kern: deugd\n\n• een\n• twee',
    );
  });
});

describe('ics', () => {
  it('escapet en vouwt', () => {
    expect(escapeIcsText('a,b;c\\d\ne')).toBe('a\\,b\\;c\\\\d\\ne');
    const long = `DESCRIPTION:${'x'.repeat(200)}`;
    const folded = foldLine(long);
    for (const line of folded.split('\r\n')) {
      expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
    }
  });

  it('bouwt een geldig VEVENT', () => {
    const start = Date.UTC(2026, 9, 16, 8, 30);
    const ics = buildIcs({
      uid: 'b1@oudiency',
      start,
      durationMinutes: 15,
      title: 'Sessie met Socrates',
      description: 'Over moed, en waarom.',
      stamp: Date.UTC(2026, 9, 15, 10),
      alarmMinutesBefore: 10,
    });
    expect(ics).toContain('BEGIN:VCALENDAR\r\n');
    expect(ics).toContain('DTSTART:20261016T083000Z');
    expect(ics).toContain('DTEND:20261016T084500Z');
    expect(ics).toContain('SUMMARY:Sessie met Socrates');
    expect(ics).toContain('DESCRIPTION:Over moed\\, en waarom.');
    expect(ics).toContain('TRIGGER:-PT10M');
    expect(ics.endsWith('END:VCALENDAR\r\n')).toBe(true);
  });
});

describe('dates', () => {
  it('rekent met lokale datums', () => {
    expect(addDaysToKey('2026-10-31', 1)).toBe('2026-11-01');
    expect(addDaysToKey('2026-03-28', 2)).toBe('2026-03-30');
    expect(daysBetweenKeys('2026-10-15', '2026-11-14')).toBe(30);
    expect(localDateKey(new Date(2026, 9, 15, 23, 59).getTime())).toBe('2026-10-15');
  });

  it('formatteert aftellen en levensjaren', () => {
    expect(formatCountdown(15 * 60_000)).toBe('15:00');
    expect(formatCountdown(61_500)).toBe('01:02');
    expect(formatCountdown(-5)).toBe('00:00');
    expect(formatLifespan(-470, -399, true)).toBe('ca. 470–399 v.Chr.');
    expect(formatLifespan(1632, 1677)).toBe('1632–1677');
  });

  it('schrijft datums en tijden in het Nederlands', () => {
    const ms = new Date(2026, 9, 15, 9, 5).getTime();
    expect(formatLongDate(ms)).toBe('donderdag 15 oktober');
    expect(formatTime(ms)).toBe('09:05');
    expect(relativeDayLabel('2026-10-15', '2026-10-15')).toBe('vandaag');
    expect(relativeDayLabel('2026-10-16', '2026-10-15')).toBe('morgen');
    expect(relativeDayLabel('2026-10-20', '2026-10-15')).toBe('di 20 okt');
  });

  it('zegt hoe lang geleden iets was', () => {
    const now = new Date(2026, 9, 15, 12, 0).getTime();
    expect(timeAgo(now - 20_000, now)).toBe('zojuist');
    expect(timeAgo(now - 60_000, now)).toBe('1 minuut geleden');
    expect(timeAgo(now - 5 * 60_000, now)).toBe('5 minuten geleden');
    expect(timeAgo(now - 3 * 3_600_000, now)).toBe('3 uur geleden');
    expect(timeAgo(now - 2 * 86_400_000, now)).toBe('2 dagen geleden');
  });

  it('zegt hoe lang het nog duurt', () => {
    const now = new Date(2026, 9, 15, 12, 0).getTime();
    expect(timeUntil(now + 30_000, now)).toBe('zo meteen');
    expect(timeUntil(now + 25 * 60_000, now)).toBe('over 25 min');
    expect(timeUntil(now + 59.5 * 60_000, now)).toBe('over 1 u');
    expect(timeUntil(now + (3 * 60 + 19) * 60_000 - 500, now)).toBe('over 3 u 19 min');
    expect(timeUntil(now + 26 * 3_600_000, now)).toBe('over 1 dag');
    expect(timeUntil(now + 3 * 86_400_000, now)).toBe('over 3 dagen');
  });
});

describe('text', () => {
  it('tokenize zonder stopwoorden', () => {
    expect(tokenize('Ik maak me zorgen over mijn werk en de toekomst!')).toEqual([
      'maak',
      'zorgen',
      'werk',
      'toekomst',
    ]);
  });

  it('stam en trefwoordscore', () => {
    expect(stem('vrijheden')).toBe('vrijheid');
    expect(keywordScore('Ik voel veel angsten de laatste tijd', ['angst', 'vrees'])).toBe(1);
    expect(keywordScore('Hoe leef ik wu wei op kantoor?', ['wu wei'])).toBe(2);
  });

  it('salientWord, truncate en hashtags', () => {
    expect(salientWord('Ik twijfel over mijn loopbaan')).toBe('loopbaan');
    expect(truncate('een twee drie vier vijf zes', 15)).toBe('een twee drie…');
    expect(extractHashtags('Over #Moed en #moed en #stoa')).toEqual(['moed', 'stoa']);
  });
});
