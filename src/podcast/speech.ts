/**
 * Gesproken fragmenten bij ElevenLabs, met het model dat je kiest na het vergelijken (keuze 1f).
 * Elk fragment wordt één keer gemaakt en op het apparaat bewaard; tegelijk gevraagde fragmenten
 * worden niet dubbel gemaakt.
 */
import { PODCAST, ttsModelInfo } from '@/config/podcast';
import { markdownToPlainText } from '@/lib/markdown';
import type { PodcastSegment } from '@/store/schemas';
import type { ElevenLabsApi } from '@/voice/api';
import { audioKey, getAudio, putAudio } from './audioCache';
import { keepOneTag, stripTags } from './audioTags';
import { ttsEur } from './costs';
import { type LibraryVoice, libraryVoicesFrom, type SpeakerVoice } from './voices';

const inFlight = new Map<string, Promise<Blob>>();

/** Uit de opslag, of nu gemaakt bij ElevenLabs (en bewaard). */
export function segmentAudio(
  api: ElevenLabsApi,
  episodeId: string,
  segment: Pick<PodcastSegment, 'id' | 'text'>,
  voice: SpeakerVoice,
  model: string,
): Promise<Blob> {
  const key = audioKey(episodeId, segment.id, voice.voiceId, model);
  const pending = inFlight.get(key);
  if (pending) return pending;
  const promise = (async () => {
    const cached = await getAudio(key);
    if (cached) return cached;
    const info = ttsModelInfo(model);
    const blob = await api.speech({
      voiceId: voice.voiceId,
      text: speakableText(segment.text, model),
      model: info.id,
      languageCode: PODCAST.language,
      outputFormat: PODCAST.outputFormat,
      settings:
        voice.source === 'eigen' && info.voiceSettings
          ? { stability: voice.stability, speed: voice.speed }
          : undefined,
    });
    await putAudio(key, blob);
    return blob;
  })().finally(() => inFlight.delete(key));
  inFlight.set(key, promise);
  return promise;
}

/**
 * Tekst zoals hij uitgesproken wordt: zonder opmaak. Een emotie-aanwijzing blijft alleen staan
 * voor een model dat hem begrijpt (anders zou het woord hardop worden voorgelezen).
 */
export function speakableText(text: string, model?: string): string {
  const plain = markdownToPlainText(text).replace(/\s+/g, ' ').trim();
  return model && ttsModelInfo(model).audioTags ? keepOneTag(plain) : stripTags(plain);
}

/** Geschatte kosten in euro's om deze fragmenten voor te lezen. */
export function estimateTtsEur(segments: readonly PodcastSegment[], model: string): number {
  const chars = segments.reduce(
    (sum, segment) => sum + speakableText(segment.text, model).length,
    0,
  );
  return ttsEur(chars, model);
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
