/** Kleine weergavehulpjes voor de podcastpagina's. */
import { HOST_ID, HOST_NAME } from '@/data/podcastHost';
import { findMeta, figureName, type FigureMeta } from '@/data/figures';
import type { PodcastEpisode } from '@/store/schemas';

/** 1,25× */
export function formatSpeed(rate: number): string {
  return `${String(rate).replace('.', ',')}×`;
}

/** Naam van een spreker (denker of Sophie). */
export function speakerLabel(speaker: string): string {
  return speaker === HOST_ID ? HOST_NAME : figureName(speaker);
}

export type ListenState = 'nieuw' | 'bezig' | 'beluisterd';

/** Heb je de aflevering al gehoord, en zo niet: hoe ver ben je (0–100)? */
export function listenState(episode: PodcastEpisode): { state: ListenState; percent: number } {
  if (episode.finishedAt) return { state: 'beluisterd', percent: 100 };
  const total = episode.segments.length;
  const segment = episode.position?.segment ?? 0;
  if (!episode.position || total === 0 || (segment === 0 && episode.position.seconds < 1)) {
    return { state: 'nieuw', percent: 0 };
  }
  return {
    state: 'bezig',
    percent: Math.min(99, Math.max(1, Math.round((segment / total) * 100))),
  };
}

export function episodeFigures(episode: PodcastEpisode): FigureMeta[] {
  return episode.figureIds.map((id) => findMeta(id)).filter((meta) => meta !== undefined);
}

/** 820 kB of 3,4 MB */
export function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${new Intl.NumberFormat('nl-NL', { maximumFractionDigits: 0 }).format(bytes / 1024)} kB`;
  }
  return `${new Intl.NumberFormat('nl-NL', { maximumFractionDigits: 1 }).format(bytes / 1024 / 1024)} MB`;
}
