/**
 * Podcasts: afleveringen met denkers om naar te luisteren, alleen met je eigen sleutels (Claude
 * schrijft, ElevenLabs spreekt). Alles hier is standaardwaarde; de logica staat in src/podcast.
 */
export const PODCAST = {
  /** Goedkoopste ElevenLabs-model met Nederlands: ongeveer de helft van de prijs (keuze 4c). */
  ttsModel: 'eleven_flash_v2_5',
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
  /** ElevenLabs-credits per teken voor het gekozen model (Flash v2.5). */
  creditsPerChar: 0.5,
  /** Dagaflevering: de tekst staat klaar als je de app opent; de stemmen pas bij afspelen. */
  daily: { enabled: true, minutes: 10 },
  skipSeconds: 15,
  speeds: [0.75, 1, 1.25, 1.5, 1.75, 2] as const,
  sleepMinutes: [5, 10, 15, 30, 45, 60] as const,
  /** Zoveel fragmenten maakt de speler alvast klaar. */
  prefetchSegments: 2,
} as const;
