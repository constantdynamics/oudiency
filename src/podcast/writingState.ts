/**
 * Welke afleveringen er nu (in deze sessie) geschreven worden. Staat een aflevering op
 * "schrijven" maar niet hier, dan is het schrijven onderbroken (bijv. de app ging dicht).
 */
import { tp } from '@/i18n/podcast';
import { usePodcastStore } from '@/store/podcastStore';

const active = new Set<string>();

export function markWriting(episodeId: string, writing: boolean): void {
  if (writing) active.add(episodeId);
  else active.delete(episodeId);
}

export function isWriting(episodeId: string): boolean {
  return active.has(episodeId);
}

/** Begin met schrijven (de AI-code laadt pas nu); meteen zichtbaar als "wordt geschreven". */
export function startWriting(episodeId: string): void {
  markWriting(episodeId, true);
  usePodcastStore.getState().updateEpisode(episodeId, { status: 'schrijven', error: undefined });
  import('./podcastAi').then(
    (ai) => ai.writeEpisode(episodeId),
    () => {
      markWriting(episodeId, false);
      usePodcastStore
        .getState()
        .updateEpisode(episodeId, { status: 'fout', error: tp.writeFailed });
    },
  );
}
