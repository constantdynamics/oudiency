/**
 * Podcasts: je afleveringen (tekst en waar je was), de wachtrij en de spelerinstellingen. De
 * audio zelf staat in IndexedDB (src/podcast/audioCache.ts), niet hier: die is te groot voor
 * localStorage en gaat niet mee in een export.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PODCAST } from '@/config/podcast';
import { persistOptions, registerStore } from './persist';
import {
  type PodcastEpisode,
  type PodcastSegment,
  type PodcastSettings,
  type PodcastState,
  PodcastStateSchema,
} from './schemas';

export type QueuePlacement = 'nu' | 'hierna' | 'achteraan';

interface PodcastStore extends PodcastState {
  addEpisode: (episode: PodcastEpisode) => void;
  updateEpisode: (id: string, patch: Partial<PodcastEpisode>) => void;
  /** Voegt fragmenten in na positie `after` (bijv. het antwoord op een luistervraag). */
  insertSegments: (id: string, after: number, segments: PodcastSegment[]) => void;
  setPosition: (id: string, segment: number, seconds: number) => void;
  removeEpisode: (id: string) => void;
  enqueue: (id: string, placement: QueuePlacement) => void;
  dequeue: (id: string) => void;
  /** Verplaatst een aflevering in de wachtrij naar een nieuwe plek (index). */
  moveInQueue: (id: string, to: number) => void;
  updateSettings: (patch: Partial<PodcastSettings>) => void;
}

export function initialPodcastSettings(): PodcastSettings {
  return {
    dailyEnabled: PODCAST.daily.enabled,
    dailyMinutes: PODCAST.daily.minutes,
    speed: 1,
    autoplay: true,
  };
}

export function initialPodcastState(): PodcastState {
  return { episodes: [], queue: [], settings: initialPodcastSettings() };
}

/** De wachtrij na een toevoeging: nu (vooraan), hierna (tweede) of achteraan; nooit dubbel. */
export function placeInQueue(queue: readonly string[], id: string, placement: QueuePlacement) {
  const rest = queue.filter((item) => item !== id);
  if (placement === 'nu') return [id, ...rest];
  if (placement === 'hierna') return [...rest.slice(0, 1), id, ...rest.slice(1)];
  return [...rest, id];
}

export function moveItem(queue: readonly string[], id: string, to: number): string[] {
  const from = queue.indexOf(id);
  if (from === -1) return [...queue];
  const next = queue.filter((item) => item !== id);
  const target = Math.max(0, Math.min(to, next.length));
  next.splice(target, 0, id);
  return next;
}

export const usePodcastStore = create<PodcastStore>()(
  persist(
    (set) => ({
      ...initialPodcastState(),
      addEpisode: (episode) => set((s) => ({ episodes: [episode, ...s.episodes] })),
      updateEpisode: (id, patch) =>
        set((s) => ({ episodes: s.episodes.map((e) => (e.id === id ? { ...e, ...patch } : e)) })),
      insertSegments: (id, after, segments) =>
        set((s) => ({
          episodes: s.episodes.map((e) =>
            e.id === id
              ? {
                  ...e,
                  segments: [
                    ...e.segments.slice(0, after + 1),
                    ...segments,
                    ...e.segments.slice(after + 1),
                  ],
                }
              : e,
          ),
        })),
      setPosition: (id, segment, seconds) =>
        set((s) => ({
          episodes: s.episodes.map((e) =>
            e.id === id ? { ...e, position: { segment, seconds: Math.max(0, seconds) } } : e,
          ),
        })),
      removeEpisode: (id) =>
        set((s) => ({
          episodes: s.episodes.filter((e) => e.id !== id),
          queue: s.queue.filter((item) => item !== id),
        })),
      enqueue: (id, placement) => set((s) => ({ queue: placeInQueue(s.queue, id, placement) })),
      dequeue: (id) => set((s) => ({ queue: s.queue.filter((item) => item !== id) })),
      moveInQueue: (id, to) => set((s) => ({ queue: moveItem(s.queue, id, to) })),
      updateSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),
    }),
    persistOptions<PodcastStore, PodcastState>({
      name: 'podcasts',
      version: 1,
      schema: PodcastStateSchema,
      partialize: (s) => ({ episodes: s.episodes, queue: s.queue, settings: s.settings }),
    }),
  ),
);

registerStore({
  name: 'podcasts',
  version: 1,
  schema: PodcastStateSchema,
  rehydrate: () => usePodcastStore.persist.rehydrate(),
});
