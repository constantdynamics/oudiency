/**
 * Van het antwoord van Claude naar fragmenten: sprekers controleren (alleen Sophie en de denkers
 * van de aflevering), opmaak weghalen, en de AI-melding vooraan garanderen.
 */
import type { PodcastScriptOutput } from '@/ai/schemas';
import { PODCAST } from '@/config/podcast';
import { findMeta } from '@/data/figures';
import { HOST_ID } from '@/data/podcastHost';
import { uid } from '@/lib/ids';
import { keepOneTag, stripTags } from './audioTags';
import type { PodcastSegment } from '@/store/schemas';

/** Als Claude de AI-melding vergeet, zegt Sophie hem toch: geen aflevering zonder. */
export const FIXED_INTRO =
  'Je luistert naar de podcast van Oudiency. Dit is een AI-simulatie: de stemmen en woorden van de denkers zijn nagebootst door AI. Het zijn geen echte uitspraken.';

/**
 * Gesproken tekst: zonder opmaak. Van de blokhaken blijft alleen één emotie-aanwijzing over
 * (keuze 9d); de rest (regieaanwijzingen, notities) verdwijnt.
 */
export function cleanSpokenText(text: string): string {
  return keepOneTag(
    text
      .replace(/^\s*(?:#{1,6}|[-*•]|\d+[.)])\s+/gm, '')
      .replace(/(\*\*|__|\*|_)(\S(?:.*?\S)?)\1/g, '$2'),
  );
}

export function resolveSpeaker(raw: string, figureIds: readonly string[]): string | undefined {
  const key = raw.trim().toLowerCase();
  if (key === HOST_ID || key === 'presentator' || key.startsWith('sophie')) return HOST_ID;
  if (figureIds.includes(key)) return key;
  return figureIds.find((id) => {
    const meta = findMeta(id);
    return [meta?.name, meta?.shortName].some((name) => name?.toLowerCase() === key);
  });
}

export function toSegments(
  output: PodcastScriptOutput,
  figureIds: readonly string[],
): PodcastSegment[] {
  const parts = output.segments
    .map((segment) => ({
      speaker: resolveSpeaker(segment.speaker, figureIds),
      text: cleanSpokenText(segment.text),
    }))
    .filter((part): part is { speaker: string; text: string } =>
      Boolean(part.speaker && part.text),
    );
  // Zonder één denker die spreekt, is het geen aflevering.
  if (!parts.some((part) => part.speaker !== HOST_ID)) return [];
  const first = parts[0];
  if (!first || first.speaker !== HOST_ID || !/AI-simulatie/i.test(first.text)) {
    parts.unshift({ speaker: HOST_ID, text: FIXED_INTRO });
  }
  return parts.map((part, index) => ({
    id: uid('fragment'),
    speaker: part.speaker,
    text: part.text,
    kind:
      index === 0
        ? 'intro'
        : index === parts.length - 1 && part.speaker === HOST_ID
          ? 'outro'
          : 'deel',
  }));
}

export function wordCount(segments: readonly Pick<PodcastSegment, 'text'>[]): number {
  return segments.reduce((sum, s) => sum + (stripTags(s.text).match(/\S+/g)?.length ?? 0), 0);
}

/** Geschatte speelduur in minuten (gesproken tempo). */
export function estimatedMinutes(segments: readonly Pick<PodcastSegment, 'text'>[]): number {
  return wordCount(segments) / PODCAST.wordsPerMinute;
}
