/**
 * Ontdekken (§7.4): zoeken en filters, topcolleges, trending, aanbevelingen, trending onderwerpen,
 * populaire vragen, de denker van de dag en de controle van "Wie kan mij helpen?". Pure functies.
 */
import { FIGURES_META, figureName, type FigureMeta } from '@/data/figures';
import { pick, seededRng } from '@/lib/seeded-rng';
import {
  type LikeEvent,
  rankTop,
  rankTrending,
  recommendationScore,
  topTerms,
} from '@/lib/ranking';
import { normalize } from '@/lib/text';

/** Wat Ontdekken van een college nodig heeft (zie features/lectures/summary.ts). */
export interface DiscoverLecture {
  id: string;
  figureId: string;
  title: string;
  topic: string;
  mainQuestion: string;
  tags: string[];
  minutes: number;
  date: string;
}

export type LengthBucket = 'kort' | 'middel' | 'lang';

/** Kort (< 8 min), middel (8–14 min) of lang (> 14 min). */
export function lengthBucket(minutes: number): LengthBucket {
  if (minutes < 8) return 'kort';
  if (minutes <= 14) return 'middel';
  return 'lang';
}

export interface LectureFilters {
  query?: string;
  figureId?: string;
  theme?: string;
  length?: LengthBucket;
}

export function hasFilters(filters: LectureFilters): boolean {
  return Boolean(filters.query?.trim() || filters.figureId || filters.theme || filters.length);
}

/** Zoeken in titel, onderwerp, hoofdvraag, thema's en de naam van de docent; plus filters. */
export function searchLectures<T extends DiscoverLecture>(
  lectures: readonly T[],
  filters: LectureFilters,
): T[] {
  const words = normalize(filters.query ?? '')
    .split(' ')
    .filter(Boolean);
  return lectures.filter((lecture) => {
    if (filters.figureId && lecture.figureId !== filters.figureId) return false;
    if (filters.theme && !lecture.tags.includes(filters.theme)) return false;
    if (filters.length && lengthBucket(lecture.minutes) !== filters.length) return false;
    if (words.length === 0) return true;
    const haystack = normalize(
      [
        lecture.title,
        lecture.topic,
        lecture.mainQuestion,
        lecture.tags.join(' '),
        figureName(lecture.figureId),
      ].join(' '),
    );
    return words.every((word) => haystack.includes(word));
  });
}

/** Thema's in de bibliotheek (voor het filter), alfabetisch. */
export function themesOf(lectures: readonly DiscoverLecture[]): string[] {
  return [...new Set(lectures.flatMap((l) => l.tags))].sort((a, b) => a.localeCompare(b, 'nl'));
}

function rankable<T extends DiscoverLecture>(
  lectures: readonly T[],
  likes: Readonly<Record<string, string>>,
) {
  return lectures.map((lecture) => ({
    id: lecture.id,
    lecture,
    publishedAt: Date.parse(lecture.date) || 0,
    likes: likes[lecture.id] ? [{ at: Date.parse(likes[lecture.id]!) } satisfies LikeEvent] : [],
  }));
}

/** Topcolleges: meeste likes (Fase 1: alleen die van jezelf), daarna de nieuwste. */
export function topLectures<T extends DiscoverLecture>(
  lectures: readonly T[],
  likes: Readonly<Record<string, string>>,
  n = 4,
): T[] {
  return rankTop(rankable(lectures, likes))
    .slice(0, n)
    .map((entry) => entry.lecture);
}

/** Trending: likes van de afgelopen 7 dagen met tijdsverval. */
export function trendingLectures<T extends DiscoverLecture>(
  lectures: readonly T[],
  likes: Readonly<Record<string, string>>,
  now: number,
  n = 4,
): T[] {
  return rankTrending(rankable(lectures, likes), now)
    .slice(0, n)
    .map((entry) => entry.lecture);
}

export interface InterestSources {
  /** Thema's van je eigen colleges. */
  ownTags: readonly string[];
  /** Thema's van colleges die je leuk vond. */
  likedTags: readonly string[];
  /** Hashtags uit je timeline. */
  postTags: readonly string[];
  /** Onderwerpen uit je sessies. */
  sessionTopics: readonly string[];
}

/** Interesses als gewicht per thema (genormaliseerd), uit wat je deed en leuk vond. */
export function interestsFrom(sources: InterestSources): Map<string, number> {
  const interests = new Map<string, number>();
  const add = (terms: readonly string[], weight: number) => {
    for (const term of terms) {
      const key = term.trim().toLowerCase();
      if (key) interests.set(key, (interests.get(key) ?? 0) + weight);
    }
  };
  add(sources.likedTags, 2);
  add(sources.ownTags, 2);
  add(sources.postTags, 1);
  add(sources.sessionTopics, 1);
  return interests;
}

/** Aanbevolen: overlap met je interesses en gevolgde denkers; afgeronde colleges zakken. */
export function recommendLectures<T extends DiscoverLecture>(
  lectures: readonly T[],
  interests: ReadonlyMap<string, number>,
  followed: ReadonlySet<string>,
  completed: ReadonlySet<string>,
  n = 3,
): T[] {
  return lectures
    .map((lecture) => ({
      lecture,
      score: recommendationScore(
        {
          tags: lecture.tags.map((t) => t.toLowerCase()),
          figureId: lecture.figureId,
          completed: completed.has(lecture.id),
        },
        interests,
        followed,
      ),
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || Date.parse(b.lecture.date) - Date.parse(a.lecture.date))
    .slice(0, n)
    .map((entry) => entry.lecture);
}

/** Trending onderwerpen: de thema's die het vaakst voorkomen in de bibliotheek. */
export function trendingTopics(lectures: readonly DiscoverLecture[], n = 8): string[] {
  return topTerms(
    lectures.flatMap((l) => l.tags),
    n,
  ).map((entry) => entry.term);
}

/** Populaire vragen: de hoofdvragen van de topcolleges. */
export function popularQuestions<T extends DiscoverLecture>(
  lectures: readonly T[],
  likes: Readonly<Record<string, string>>,
  n = 4,
): T[] {
  return topLectures(lectures, likes, n);
}

/**
 * Denker van de dag: bij voorkeur een nog niet ontdekte netwerkdenker aan de rand van wat je
 * kent, anders een andere onbekende, anders iemand uit het hele rooster (seed op datum).
 */
export function figureOfTheDay(dateKey: string, known: ReadonlySet<string>): FigureMeta {
  const rng = seededRng(`${dateKey}|denker-van-de-dag`);
  const edge = new Set<string>();
  for (const meta of FIGURES_META) {
    if (!known.has(meta.id)) continue;
    for (const link of meta.network) if (!known.has(link.id)) edge.add(link.id);
  }
  const frontier = FIGURES_META.filter((m) => edge.has(m.id));
  const unknown = FIGURES_META.filter((m) => !known.has(m.id));
  return pick(rng, frontier.length ? frontier : unknown.length ? unknown : FIGURES_META)!;
}

/* ---------- Wie kan mij helpen? ---------- */

export interface HelperSuggestion {
  figureId: string;
  why: string;
}

/** Precies drie verschillende, bestaande denkers; de reden kort en zonder aanhalingstekens. */
export function validateSuggestions(
  suggestions: readonly HelperSuggestion[],
  candidateIds: ReadonlySet<string>,
): HelperSuggestion[] {
  const seen = new Set<string>();
  const result: HelperSuggestion[] = [];
  for (const suggestion of suggestions) {
    if (!candidateIds.has(suggestion.figureId) || seen.has(suggestion.figureId)) continue;
    const why = suggestion.why
      .trim()
      .replace(/^["“‘']+|["”’']+$/g, '')
      .split(/\s+/)
      .slice(0, 30)
      .join(' ');
    if (!why) continue;
    seen.add(suggestion.figureId);
    result.push({ figureId: suggestion.figureId, why });
    if (result.length === 3) break;
  }
  return result;
}
