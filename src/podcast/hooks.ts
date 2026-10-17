/**
 * Welke aflevering de speler toont: die nu in de speler zit, anders de eerste uit je wachtrij die
 * klaar is om te spelen.
 */
import { usePodcastStore } from '@/store/podcastStore';
import type { PodcastEpisode } from '@/store/schemas';
import { usePlayer } from './playerState';

export function useCurrentEpisode(): PodcastEpisode | undefined {
  const episodeId = usePlayer((s) => s.episodeId);
  const episodes = usePodcastStore((s) => s.episodes);
  const queue = usePodcastStore((s) => s.queue);
  const active = episodes.find((e) => e.id === episodeId);
  if (active) return active;
  for (const id of queue) {
    const episode = episodes.find((e) => e.id === id);
    if (episode?.status === 'klaar') return episode;
  }
  return undefined;
}
