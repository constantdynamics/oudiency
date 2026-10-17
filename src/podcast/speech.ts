/**
 * Gesproken fragmenten (ElevenLabs, keuze 4c: het goedkoopste model met Nederlands). Elk fragment
 * wordt één keer gemaakt en op het apparaat bewaard; tegelijk gevraagde fragmenten worden niet
 * dubbel gemaakt.
 */
import { PODCAST } from '@/config/podcast';
import { markdownToPlainText } from '@/lib/markdown';
import type { PodcastSegment } from '@/store/schemas';
import type { ElevenLabsApi } from '@/voice/api';
import { audioKey, getAudio, putAudio } from './audioCache';
import { type LibraryVoice, libraryVoicesFrom, type SpeakerVoice } from './voices';

const inFlight = new Map<string, Promise<Blob>>();

/** Uit de opslag, of nu gemaakt bij ElevenLabs (en bewaard). */
export function segmentAudio(
  api: ElevenLabsApi,
  episodeId: string,
  segment: PodcastSegment,
  voice: SpeakerVoice,
): Promise<Blob> {
  const key = audioKey(episodeId, segment.id, voice.voiceId);
  const pending = inFlight.get(key);
  if (pending) return pending;
  const promise = (async () => {
    const cached = await getAudio(key);
    if (cached) return cached;
    const blob = await api.speech({
      voiceId: voice.voiceId,
      text: speakableText(segment.text),
      model: PODCAST.ttsModel,
      languageCode: PODCAST.language,
      outputFormat: PODCAST.outputFormat,
      settings:
        voice.source === 'eigen' ? { stability: voice.stability, speed: voice.speed } : undefined,
    });
    await putAudio(key, blob);
    return blob;
  })().finally(() => inFlight.delete(key));
  inFlight.set(key, promise);
  return promise;
}

/** Tekst zoals hij uitgesproken wordt: zonder opmaak. */
export function speakableText(text: string): string {
  return markdownToPlainText(text).replace(/\s+/g, ' ').trim();
}

/** Geschatte ElevenLabs-credits voor de nog niet gemaakte fragmenten. */
export function estimateCredits(segments: readonly PodcastSegment[]): number {
  const chars = segments.reduce((sum, segment) => sum + speakableText(segment.text).length, 0);
  return Math.ceil(chars * PODCAST.creditsPerChar);
}

let library: { key: string; voices: Promise<LibraryVoice[]> } | null = null;

/** De kant-en-klare stemmen, één keer per sleutel opgehaald. */
export function loadLibrary(api: ElevenLabsApi, apiKey: string): Promise<LibraryVoice[]> {
  if (!library || library.key !== apiKey) {
    const voices = api.libraryVoices().then(libraryVoicesFrom);
    library = { key: apiKey, voices };
    voices.catch(() => {
      if (library?.voices === voices) library = null;
    });
  }
  return library.voices;
}
