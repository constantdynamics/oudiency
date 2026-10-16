import { beforeEach, describe, expect, it } from 'vitest';
import { FRAME } from '@/ai/prompts/frame';
import { helperLine, helperRequest } from '@/ai/prompts/helper';
import { CORE_IDS, FIGURES_META, findMeta } from '@/data/figures';
import { EXAMPLE_LECTURES } from '@/data/seed/lectures';
import { DAY, HOUR, localDateTime } from '@/lib/dates';
import {
  type DiscoverLecture,
  figureOfTheDay,
  hasFilters,
  interestsFrom,
  lengthBucket,
  popularQuestions,
  recommendLectures,
  searchLectures,
  themesOf,
  topLectures,
  trendingLectures,
  trendingTopics,
  validateSuggestions,
} from '@/services/discover.service';
import { findHelpers } from '@/services/helperAi';
import { useSettingsStore } from '@/store/settingsStore';

const NOW = localDateTime('2026-10-19', '12:00');
const iso = (ms: number) => new Date(ms).toISOString();

const lectures: DiscoverLecture[] = EXAMPLE_LECTURES.map((meta) => ({
  id: meta.id,
  figureId: meta.figureId,
  title: meta.title,
  topic: meta.topic,
  mainQuestion: meta.mainQuestion,
  tags: meta.tags,
  minutes: meta.minutes,
  date: meta.publishedAt,
}));

beforeEach(() => {
  useSettingsStore.getState().update({ devInstantReactions: true, aiSource: 'demo' });
});

describe('zoeken en filters', () => {
  it('lengte in drie emmers', () => {
    expect(lengthBucket(5)).toBe('kort');
    expect(lengthBucket(8)).toBe('middel');
    expect(lengthBucket(14)).toBe('middel');
    expect(lengthBucket(15)).toBe('lang');
  });

  it('zoekt in titel, onderwerp, hoofdvraag, thema en docent (alle woorden)', () => {
    expect(searchLectures(lectures, { query: 'agora' }).map((l) => l.id)).toEqual([
      'vb-socrates-agora',
    ]);
    expect(searchLectures(lectures, { query: 'SOCRATES sociale' })).toHaveLength(1);
    expect(searchLectures(lectures, { query: 'Kant' }).every((l) => l.figureId === 'kant')).toBe(
      true,
    );
    expect(searchLectures(lectures, { query: 'bestaatniet' })).toEqual([]);
    expect(searchLectures(lectures, { figureId: 'laozi' }).map((l) => l.figureId)).toEqual([
      'laozi',
    ]);
    const theme = lectures[0]!.tags[0]!;
    expect(searchLectures(lectures, { theme }).every((l) => l.tags.includes(theme))).toBe(true);
    expect(searchLectures(lectures, { length: 'lang' })).toEqual(
      lectures.filter((l) => l.minutes > 14),
    );
    expect(hasFilters({ query: '  ' })).toBe(false);
    expect(hasFilters({ theme })).toBe(true);
    expect(themesOf(lectures)).toContain(theme);
  });
});

describe('lijsten', () => {
  it('topcolleges: eerst wat je leuk vindt, daarna het nieuwste', () => {
    const likes = { 'vb-kant-liegen': iso(NOW - DAY) };
    const top = topLectures(lectures, likes, 3);
    expect(top[0]?.id).toBe('vb-kant-liegen');
    const rest = lectures
      .filter((l) => l.id !== 'vb-kant-liegen')
      .sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
    expect(top[1]?.id).toBe(rest[0]?.id);
    expect(popularQuestions(lectures, likes, 2)[0]?.mainQuestion).toBe(top[0]?.mainQuestion);
  });

  it('trending: alleen likes van de afgelopen 7 dagen', () => {
    const likes = {
      'vb-kant-liegen': iso(NOW - 2 * HOUR),
      'vb-laozi-wuwei': iso(NOW - 8 * DAY),
    };
    expect(trendingLectures(lectures, likes, NOW).map((l) => l.id)).toEqual(['vb-kant-liegen']);
    expect(trendingLectures(lectures, {}, NOW)).toEqual([]);
  });

  it('aanbevolen: overlap met je interesses en gevolgde denkers; afgerond zakt', () => {
    const interests = interestsFrom({
      ownTags: [],
      likedTags: [],
      postTags: ['Rust', 'nieuws'],
      sessionTopics: ['stress'],
    });
    expect(interests.get('rust')).toBe(1);
    const recommended = recommendLectures(lectures, interests, new Set(), new Set(), 3);
    expect(recommended[0]?.id).toBe('vb-aurelius-nieuws');
    const afterReading = recommendLectures(
      lectures,
      interests,
      new Set(),
      new Set(['vb-aurelius-nieuws']),
      3,
    );
    expect(afterReading.map((l) => l.id)).not.toContain('vb-aurelius-nieuws');
    const followed = recommendLectures(lectures, new Map(), new Set(['gandhi']), new Set(), 3);
    expect(followed.map((l) => l.figureId)).toEqual(['gandhi']);
    expect(recommendLectures(lectures, new Map(), new Set(), new Set())).toEqual([]);
  });

  it('trending onderwerpen uit de bibliotheek', () => {
    const topics = trendingTopics(lectures, 5);
    expect(topics).toHaveLength(5);
    for (const topic of topics) expect(themesOf(lectures)).toContain(topic);
  });
});

describe('denker van de dag', () => {
  it('bij voorkeur een onbekende netwerkdenker aan de rand van je netwerk, vast per dag', () => {
    const known = new Set(CORE_IDS);
    const first = figureOfTheDay('2026-10-19', known);
    expect(figureOfTheDay('2026-10-19', known).id).toBe(first.id);
    expect(known.has(first.id)).toBe(false);
    expect(first.tier).toBe('netwerk');
    const linked = FIGURES_META.some(
      (m) => known.has(m.id) && m.network.some((link) => link.id === first.id),
    );
    expect(linked).toBe(true);
    // Iedereen bekend: dan gewoon iemand uit het rooster.
    const everyone = new Set(FIGURES_META.map((m) => m.id));
    expect(findMeta(figureOfTheDay('2026-10-19', everyone).id)).toBeDefined();
  });
});

describe('wie kan mij helpen?', () => {
  it('controle: bestaande, unieke denkers, max. drie, korte reden', () => {
    const ids = new Set(FIGURES_META.map((m) => m.id));
    const result = validateSuggestions(
      [
        { figureId: 'bestaat-niet', why: 'x' },
        { figureId: 'seneca', why: '“Omdat hij weet hoe kort het leven is.”' },
        { figureId: 'seneca', why: 'dubbel' },
        { figureId: 'kant', why: '   ' },
        { figureId: 'spinoza', why: Array.from({ length: 40 }, () => 'woord').join(' ') },
        { figureId: 'laozi', why: 'Rust.' },
        { figureId: 'gandhi', why: 'Te veel.' },
      ],
      ids,
    );
    expect(result.map((r) => r.figureId)).toEqual(['seneca', 'spinoza', 'laozi']);
    expect(result[0]?.why).toBe('Omdat hij weet hoe kort het leven is.');
    expect(result[1]?.why.split(' ')).toHaveLength(30);
  });

  it('prompt: kader, taak en het hele rooster als kandidaten', () => {
    const request = helperRequest('Ik ben bang om fouten te maken.', FIGURES_META, {
      kind: 'helper',
      query: 'Ik ben bang om fouten te maken.',
      candidates: [],
    });
    expect(request.task).toBe('helper');
    expect(request.system[0]?.text).toBe(FRAME);
    expect(request.system[2]?.text.split('\n')).toHaveLength(FIGURES_META.length + 1);
    expect(helperLine(findMeta('seneca')!)).toMatch(/^- seneca: .*helpt bij:/);
  });

  it('demomodus: drie passende denkers met een reden', async () => {
    const result = await findHelpers('Ik maak me zorgen over de dood en wil rustiger worden.');
    expect(result).toHaveLength(3);
    for (const suggestion of result) {
      expect(findMeta(suggestion.figureId)).toBeDefined();
      expect(suggestion.why.length).toBeGreaterThan(5);
    }
  });
});
