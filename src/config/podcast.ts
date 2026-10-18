/**
 * Podcasts: afleveringen met denkers om naar te luisteren, alleen met je eigen sleutels (Claude
 * schrijft, ElevenLabs spreekt). Alles hier is standaardwaarde; de logica staat in src/podcast.
 */

export type TtsModelId = 'eleven_flash_v2_5' | 'eleven_v4_turbo' | 'eleven_v4';

export interface TtsModelInfo {
  id: TtsModelId;
  label: string;
  description: string;
  /**
   * Indicatieve API-prijs in dollars per 1.000 tekens (ElevenLabs, oktober 2026; controleer
   * https://elevenlabs.io/pricing/api). Met een abonnement betaal je in credits.
   */
  usdPer1kChars: number;
  /** Begrijpt emotie-aanwijzingen tussen blokhaken, zoals [laughs] of [sighs]. */
  audioTags: boolean;
  /** Accepteert stabiliteit en tempo per stem (de v4-modellen regelen dat zelf). */
  voiceSettings: boolean;
}

/** De modellen om uit te kiezen, na het vergelijken op de Podcasts-pagina (keuze 1f). */
export const TTS_MODELS: readonly TtsModelInfo[] = [
  {
    id: 'eleven_flash_v2_5',
    label: 'Flash v2.5',
    description: 'Snel en het goedkoopst, maar minder expressief.',
    usdPer1kChars: 0.05,
    audioTags: false,
    voiceSettings: true,
  },
  {
    id: 'eleven_v4_turbo',
    label: 'Eleven v4 Turbo',
    description: 'Expressief en snel: natuurlijker dan Flash.',
    usdPer1kChars: 0.04,
    audioTags: true,
    voiceSettings: false,
  },
  {
    id: 'eleven_v4',
    label: 'Eleven v4',
    description: 'Het meest natuurlijk en expressief, voor opgenomen audio.',
    usdPer1kChars: 0.08,
    audioTags: true,
    voiceSettings: false,
  },
];

export function ttsModelInfo(id: string | undefined): TtsModelInfo {
  return TTS_MODELS.find((model) => model.id === id) ?? TTS_MODELS[0]!;
}

export const PODCAST = {
  /** Tot je na het vergelijken kiest: het goedkoopste model (keuze 4c). */
  defaultTtsModel: 'eleven_flash_v2_5' as TtsModelId,
  /** Indicatieve koers voor de kostenschatting in euro's (oktober 2026). */
  usdToEur: 0.88,
  language: 'nl',
  /** Eén formaat voor alle fragmenten: zo sluiten ze naadloos op elkaar aan. */
  outputFormat: 'mp3_44100_128',
  /** Te kiezen lengtes in minuten (keuze 3d: per aflevering). */
  lengths: [5, 10, 15, 20, 30] as const,
  defaultMinutes: 10,
  /** Gemiddeld spreektempo, voor de schatting van lengte en kosten. */
  wordsPerMinute: 150,
  /** Gemiddeld aantal tekens per woord (met spatie), voor de kostenschatting vooraf. */
  charsPerWord: 6,
  /** Dagaflevering: de tekst staat klaar als je de app opent; de stemmen pas bij afspelen. */
  daily: { enabled: true, minutes: 10 },
  skipSeconds: 15,
  speeds: [0.75, 1, 1.25, 1.5, 1.75, 2] as const,
  sleepMinutes: [5, 10, 15, 30, 45, 60] as const,
  /** Inbellen tijdens een aflevering: hooguit zoveel minuten. */
  callMinutes: 5,
  /** Lengte van een getypte luistervraag. */
  questionMaxLength: 300,
  /** Zoveel fragmenten krijgt Claude mee als "wat de luisteraar net hoorde". */
  contextSegments: 6,
  /** Zoveel fragmenten maakt de speler alvast klaar. */
  prefetchSegments: 2,
} as const;
