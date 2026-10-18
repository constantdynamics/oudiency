/**
 * "Andere stem" (keuzes 2d en 8): per spreker de volgende passende kant-en-klare stem. De keuze
 * geldt meteen overal: in podcasts, bij inbellen en bij bellen. Laadt de stemmenlijst van
 * ElevenLabs met je eigen sleutel.
 */
import { PODCAST } from '@/config/podcast';
import { figureName } from '@/data/figures';
import { HOST_ID } from '@/data/podcastHost';
import { usePodcastStore } from '@/store/podcastStore';
import { elevenLabsKeyStorage } from '@/store/settingsStore';
import { useVoiceStore } from '@/store/voiceStore';
import { createElevenLabsApi, VoiceApiError } from '@/voice/api';
import { tp } from '@/i18n/podcast';
import { loadLibrary, segmentAudio } from './speech';
import {
  assignVoices,
  type LibraryVoice,
  nextVoice,
  type SpeakerVoice,
  speakerVoiceType,
} from './voices';

export interface CurrentVoice extends SpeakerVoice {
  /** Naam van de stem bij ElevenLabs (onbekend bij een ontworpen stem). */
  name?: string;
}

function apiWithKey() {
  const key = elevenLabsKeyStorage.get();
  if (!key) throw new VoiceApiError('auth', tp.player.needsKey);
  return { key, api: createElevenLabsApi(key) };
}

export function libraryForKey(): Promise<LibraryVoice[]> {
  const { key, api } = apiWithKey();
  return loadLibrary(api, key);
}

/** De stem die deze spreker nu heeft. */
export function currentVoiceOf(
  speaker: string,
  library: readonly LibraryVoice[],
): CurrentVoice | undefined {
  const { voices, overrides = {} } = useVoiceStore.getState();
  const assigned = assignVoices([speaker], voices, library, overrides)[speaker];
  if (!assigned) return undefined;
  const name =
    overrides[speaker]?.name ?? library.find((voice) => voice.voiceId === assigned.voiceId)?.name;
  return { ...assigned, ...(name ? { name } : {}) };
}

/** Kies de volgende passende stem en bewaar die voor deze spreker (geldt meteen overal). */
export async function chooseAnotherVoice(speaker: string): Promise<CurrentVoice | undefined> {
  const library = await libraryForKey();
  const current = currentVoiceOf(speaker, library);
  const next = nextVoice(speakerVoiceType(speaker), library, current?.voiceId);
  if (!next) return undefined;
  useVoiceStore.getState().setOverride(speaker, next.voiceId, next.name);
  return { voiceId: next.voiceId, name: next.name, source: 'gekozen' };
}

/** Terug naar automatisch (of naar de ontworpen stem). */
export function resetVoice(speaker: string): void {
  useVoiceStore.getState().clearOverride(speaker);
}

/** De voorbeeldzin van een spreker (met de AI-melding). */
export function sampleText(speaker: string): string {
  if (speaker === HOST_ID) return tp.voices.sampleHost;
  return tp.voices.sample(figureName(speaker));
}

/** Een kort voorbeeld in de huidige stem en het gekozen model (kost een paar credits; daarna bewaard). */
export async function voiceSample(speaker: string): Promise<Blob> {
  const { api } = apiWithKey();
  const library = await libraryForKey();
  const voice = currentVoiceOf(speaker, library);
  if (!voice) throw new VoiceApiError('not_found', tp.player.noVoice);
  const model = usePodcastStore.getState().settings.ttsModel ?? PODCAST.defaultTtsModel;
  return segmentAudio(
    api,
    'voorbeeld',
    { id: `stem-${speaker}`, text: sampleText(speaker) },
    voice,
    model,
  );
}

/** Het eerste fragment van een aflevering in een bepaald stemmodel, voor de vergelijking (keuze 1f). */
export async function comparisonSample(episodeId: string, model: string): Promise<Blob> {
  const { key, api } = apiWithKey();
  const episode = usePodcastStore.getState().episodes.find((e) => e.id === episodeId);
  const segment = episode?.segments[0];
  if (!episode || !segment) throw new VoiceApiError('not_found', tp.model.noEpisode);
  const speakers = [...new Set(episode.segments.map((s) => s.speaker))];
  const { voices, overrides = {} } = useVoiceStore.getState();
  const needsLibrary = speakers.some((speaker) => !overrides[speaker] && !voices[speaker]);
  const library = needsLibrary ? await loadLibrary(api, key) : [];
  const voice = assignVoices(speakers, voices, library, overrides)[segment.speaker];
  if (!voice) throw new VoiceApiError('not_found', tp.player.noVoice);
  return segmentAudio(api, episode.id, segment, voice, model);
}
