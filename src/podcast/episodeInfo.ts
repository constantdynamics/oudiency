/**
 * Kleine hulpjes rond een aflevering voor de speler en de miniplayer (in de startbundel).
 */
import { figureName } from '@/data/figures';
import { HOST_ID, HOST_NAME } from '@/data/podcastHost';
import type { PodcastEpisode } from '@/store/schemas';

/** Naam van wie er in dit fragment spreekt. */
export function speakerName(episode: PodcastEpisode, segment: number): string | undefined {
  const speaker = episode.segments[segment]?.speaker;
  if (!speaker) return undefined;
  return speaker === HOST_ID ? HOST_NAME : figureName(speaker);
}

/** Hoe ver je bent (0–1): de fragmenten ervoor plus de positie in het huidige fragment. */
export function episodeProgress(
  episode: PodcastEpisode,
  segment: number,
  seconds: number,
  duration: number,
): number {
  const count = episode.segments.length;
  if (count === 0) return 0;
  const within = duration > 0 ? Math.min(1, Math.max(0, seconds / duration)) : 0;
  return Math.min(1, (Math.min(segment, count) + within) / count);
}
