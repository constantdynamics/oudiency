/**
 * Welke stem spreekt wie in een aflevering. Een eigen ontworpen stem gaat voor (kerndenkers en
 * Sophie, via Stem & bellen); anders een kant-en-klare stem uit de bibliotheek van ElevenLabs die
 * past bij het stemtype (keuze 3c). In één aflevering klinkt iedereen anders.
 */
import { findMeta } from '@/data/figures';
import { HOST, HOST_ID } from '@/data/podcastHost';
import { type VoiceAge, type VoiceGender, type VoiceType, voiceTypeOf } from '@/data/voiceTypes';
import { CORE_VOICES } from '@/data/voices';
import { hashString } from '@/lib/seeded-rng';
import type { RawVoice } from '@/voice/api';

export interface LibraryVoice {
  voiceId: string;
  name: string;
  gender?: VoiceGender;
  age?: VoiceAge;
}

const GENDERS: Readonly<Record<string, VoiceGender>> = { male: 'man', female: 'vrouw' };

function ageOf(label: string | null | undefined): VoiceAge | undefined {
  const text = label?.toLowerCase() ?? '';
  if (text.includes('young')) return 'jong';
  if (text.includes('middle')) return 'midden';
  if (text.includes('old') || text.includes('senior') || text.includes('elder')) return 'oud';
  return undefined;
}

/** Alleen de kant-en-klare stemmen van ElevenLabs (geen eigen, ontworpen of gekloonde). */
export function libraryVoicesFrom(raw: readonly RawVoice[]): LibraryVoice[] {
  return raw
    .filter((voice) => voice.category === 'premade')
    .map((voice) => ({
      voiceId: voice.voice_id,
      name: voice.name,
      gender: GENDERS[(voice.labels?.gender ?? '').toLowerCase()],
      age: ageOf(voice.labels?.age),
    }))
    .sort((a, b) => a.voiceId.localeCompare(b.voiceId));
}

/**
 * Een passende kant-en-klare stem: hetzelfde geslacht en dezelfde leeftijd, anders hetzelfde
 * geslacht, anders wat er is. Vast per spreker (seed), en zo mogelijk niet al in gebruik.
 */
export function pickLibraryVoice(
  type: VoiceType,
  voices: readonly LibraryVoice[],
  seed: string,
  avoid: ReadonlySet<string> = new Set(),
): string | undefined {
  const free = voices.filter((voice) => !avoid.has(voice.voiceId));
  const tiers = [
    free.filter((voice) => voice.gender === type.gender && voice.age === type.age),
    free.filter((voice) => voice.gender === type.gender),
    free,
    voices.filter((voice) => voice.gender === type.gender),
    voices,
  ];
  const candidates = tiers.find((tier) => tier.length > 0);
  if (!candidates) return undefined;
  return candidates[hashString(seed) % candidates.length]?.voiceId;
}

export function speakerVoiceType(speaker: string): VoiceType {
  if (speaker === HOST_ID) return { gender: 'vrouw', age: 'midden' };
  const meta = findMeta(speaker);
  return meta ? voiceTypeOf(meta) : { gender: 'man', age: 'midden' };
}

export interface SpeakerVoice {
  voiceId: string;
  /** Met "andere stem" gekozen, eigen ontworpen, of automatisch een kant-en-klare bij het type. */
  source: 'gekozen' | 'eigen' | 'type';
  stability?: number;
  speed?: number;
}

function designSettings(speaker: string): Pick<SpeakerVoice, 'stability' | 'speed'> {
  const spec = speaker === HOST_ID ? HOST.voice : CORE_VOICES[speaker];
  return spec ? { stability: spec.stability, speed: spec.speed } : {};
}

/**
 * Stemmen voor alle sprekers van een aflevering. Een met "andere stem" gekozen stem gaat voor,
 * dan een ontworpen stem, dan automatisch een kant-en-klare (en dan klinkt iedereen anders).
 */
export function assignVoices(
  speakers: readonly string[],
  designed: Readonly<Record<string, { voiceId: string }>>,
  library: readonly LibraryVoice[],
  overrides: Readonly<Record<string, { voiceId: string }>> = {},
): Record<string, SpeakerVoice> {
  const result: Record<string, SpeakerVoice> = {};
  const used = new Set<string>();
  for (const speaker of speakers) {
    const chosen = overrides[speaker];
    if (!chosen || result[speaker]) continue;
    result[speaker] = { voiceId: chosen.voiceId, source: 'gekozen' };
    used.add(chosen.voiceId);
  }
  for (const speaker of speakers) {
    if (result[speaker]) continue;
    const own = designed[speaker];
    if (!own) continue;
    result[speaker] = { voiceId: own.voiceId, source: 'eigen', ...designSettings(speaker) };
    used.add(own.voiceId);
  }
  for (const speaker of speakers) {
    if (result[speaker]) continue;
    const voiceId = pickLibraryVoice(speakerVoiceType(speaker), library, speaker, used);
    if (!voiceId) continue;
    result[speaker] = { voiceId, source: 'type' };
    used.add(voiceId);
  }
  return result;
}

/**
 * De volgende stem bij "andere stem" (keuze 2d): de eerstvolgende kant-en-klare stem van hetzelfde
 * geslacht (eerst dezelfde leeftijd), rond en rond. Geen stemmen van dat geslacht? Dan alle.
 */
export function nextVoice(
  type: VoiceType,
  voices: readonly LibraryVoice[],
  current: string | undefined,
): LibraryVoice | undefined {
  const sameGender = [
    ...voices.filter((voice) => voice.gender === type.gender && voice.age === type.age),
    ...voices.filter((voice) => voice.gender === type.gender && voice.age !== type.age),
  ];
  const pool = sameGender.length > 0 ? sameGender : [...voices];
  if (pool.length === 0) return undefined;
  const index = pool.findIndex((voice) => voice.voiceId === current);
  return pool[(index + 1) % pool.length];
}
