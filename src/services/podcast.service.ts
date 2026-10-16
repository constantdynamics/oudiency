/**
 * Podcasts (logica, getest): een aanvraag controleren, een aflevering aanmaken en de aflevering
 * van vandaag plannen. Alleen met je eigen sleutels (keuze 9b); geen limieten (keuze 9e).
 */
import { detectCrisisSignals } from '@/ai/prompts/safety';
import { PODCAST } from '@/config/podcast';
import { CORE_IDS, findMeta } from '@/data/figures';
import { uid } from '@/lib/ids';
import { pick, seededRng } from '@/lib/seeded-rng';
import type { PodcastEpisode, PodcastFormat } from '@/store/schemas';

export interface EpisodeRequest {
  format: PodcastFormat;
  figureIds: string[];
  topic: string;
  minutes: number;
}

export type EpisodeProblem = 'sleutel' | 'denkers' | 'onbekend' | 'onderwerp' | 'lengte' | 'crisis';

export const TOPIC_MAX = 120;

/** Hoeveel denkers een vorm heeft: twee in een gesprek, anders één. */
export function figuresFor(format: PodcastFormat): number {
  return format === 'gesprek' ? 2 : 1;
}

export function episodeProblem(
  request: EpisodeRequest,
  known: ReadonlySet<string>,
  hasClaudeKey: boolean,
): EpisodeProblem | undefined {
  if (!hasClaudeKey) return 'sleutel';
  const ids = [...new Set(request.figureIds)];
  if (ids.length !== request.figureIds.length || ids.length !== figuresFor(request.format)) {
    return 'denkers';
  }
  if (ids.some((id) => !findMeta(id) || !known.has(id))) return 'onbekend';
  const topic = request.topic.trim();
  if (topic.length < 3 || topic.length > TOPIC_MAX) return 'onderwerp';
  if (!(PODCAST.lengths as readonly number[]).includes(request.minutes)) return 'lengte';
  if (detectCrisisSignals(topic)) return 'crisis';
  return undefined;
}

export function newEpisode(
  request: EpisodeRequest,
  source: PodcastEpisode['source'],
  nowIso: string,
  day?: string,
): PodcastEpisode {
  const topic = request.topic.trim();
  return {
    id: uid('aflevering'),
    createdAt: nowIso,
    title: topic,
    topic,
    format: request.format,
    figureIds: [...request.figureIds],
    minutes: request.minutes,
    source,
    status: 'schrijven',
    segments: [],
    ...(day ? { day } : {}),
  };
}

const DAILY_FORMATS: readonly PodcastFormat[] = ['monoloog', 'interview', 'gesprek'];

/**
 * De aflevering van vandaag (keuze 2d): de vorm wisselt per dag; denkers die je volgt gaan voor,
 * in een gesprek met iemand uit hun netwerk die je kent; het onderwerp komt uit je interesses.
 * Vast per dag (zelfde plan bij opnieuw openen).
 */
export function dailyPlan(
  day: string,
  input: {
    follows: readonly string[];
    known: ReadonlySet<string>;
    interests: ReadonlyMap<string, number>;
    minutes: number;
  },
): EpisodeRequest {
  const rng = seededRng(`${day}|podcast`);
  const format = pick(rng, DAILY_FORMATS) ?? 'monoloog';
  const followed = input.follows.filter((id) => findMeta(id) && input.known.has(id));
  const first = pick(rng, followed.length ? followed : CORE_IDS) ?? 'socrates';
  const figureIds = [first];
  if (format === 'gesprek') {
    const network = (findMeta(first)?.network ?? [])
      .map((link) => link.id)
      .filter((id) => id !== first && input.known.has(id));
    const others = CORE_IDS.filter((id) => id !== first);
    figureIds.push(pick(rng, network.length ? network : others) ?? others[0] ?? 'socrates');
  }
  const top = [...input.interests.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 3)
    .map(([term]) => term);
  const topic =
    pick(rng, top) ?? pick(rng, findMeta(first)?.helpsWith ?? []) ?? 'Hoe leef je goed?';
  return { format, figureIds, topic, minutes: input.minutes };
}
