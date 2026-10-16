/**
 * Ranking voor Ontdekken. Pure functies, unit-getest, zodat Fase 2 dezelfde formules
 * serverside kan gebruiken over de likes van de hele community.
 */
import { DAY, HOUR } from './dates';

export interface LikeEvent {
  at: number;
}

export const TRENDING_WINDOW_MS = 7 * DAY;
export const TRENDING_GRAVITY = 1.5;

/**
 * Trending-score met tijdsverval:
 *   score = likes_7d / (uren_sinds_publicatie + 2) ^ 1,5
 * Alleen likes van de afgelopen 7 dagen tellen mee.
 */
export function trendingScore(
  likes: readonly LikeEvent[],
  publishedAt: number,
  now: number,
): number {
  const recentLikes = likes.filter(
    (like) => like.at <= now && now - like.at <= TRENDING_WINDOW_MS,
  ).length;
  if (recentLikes === 0) return 0;
  const hours = Math.max(0, (now - publishedAt) / HOUR);
  return recentLikes / Math.pow(hours + 2, TRENDING_GRAVITY);
}

/** Topscore: totaal aantal likes (Fase 1: alleen die van jezelf). */
export function topScore(likes: readonly LikeEvent[]): number {
  return likes.length;
}

export interface Rankable {
  id: string;
  publishedAt: number;
  likes: readonly LikeEvent[];
}

export function rankTrending<T extends Rankable>(items: readonly T[], now: number): T[] {
  return [...items]
    .map((item) => ({ item, score: trendingScore(item.likes, item.publishedAt, now) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || b.item.publishedAt - a.item.publishedAt)
    .map((entry) => entry.item);
}

export function rankTop<T extends Rankable>(items: readonly T[]): T[] {
  return [...items].sort(
    (a, b) => topScore(b.likes) - topScore(a.likes) || b.publishedAt - a.publishedAt,
  );
}

/**
 * Aanbeveling: overlap tussen de thema's van een item en de interesses van de gebruiker,
 * plus een bonus als de docent gevolgd wordt. Items die je al afrondde zakken.
 */
export interface RecommendationInput {
  tags: readonly string[];
  figureId: string;
  completed: boolean;
}

export function recommendationScore(
  item: RecommendationInput,
  interests: ReadonlyMap<string, number>,
  followed: ReadonlySet<string>,
): number {
  let score = 0;
  for (const tag of item.tags) score += interests.get(tag) ?? 0;
  if (followed.has(item.figureId)) score += 3;
  if (item.completed) score -= 10;
  return score;
}

/** Tel hoe vaak termen voorkomen en geef de top-N terug. */
export function topTerms(terms: readonly string[], n: number): { term: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const term of terms) counts.set(term, (counts.get(term) ?? 0) + 1);
  return [...counts.entries()]
    .map(([term, count]) => ({ term, count }))
    .sort((a, b) => b.count - a.count || a.term.localeCompare(b.term, 'nl'))
    .slice(0, n);
}
