/**
 * Onderzoek op aanvraag: de app zoekt een onderwerp uit (Engelse Wikipedia en Wikisource, plus
 * wat Claude zelf weet) en maakt er daarna iets van in een vorm naar keuze. Alleen met je eigen
 * Claude-sleutel. Alles hier is standaardwaarde; de logica staat in src/research.
 */
export type ResearchForm = 'tekst' | 'podcast' | 'college' | 'bellen';
export type EssayLength = 'kort' | 'lang';

export const RESEARCH = {
  questionMinLength: 5,
  questionMaxLength: 200,
  /** Een panel: hooguit drie denkers (keuzes 5c en 1a). */
  maxFigures: 3,
  /** Hoeveel zoektermen het plan mag opleveren. */
  maxQueries: { wikipedia: 3, wikisource: 2 },
  /** Treffers per zoekterm, en hoeveel pagina's we daarna helemaal lezen. */
  searchResults: 3,
  maxArticles: { wikipedia: 4, wikisource: 2 },
  /** Tekens per pagina die meegaan naar Claude: de inleiding plus de best passende alinea's. */
  charsPerArticle: { wikipedia: 6_000, wikisource: 6_000 },
  /** Zo lang mag één aanvraag bij Wikipedia of Wikisource duren. */
  fetchTimeoutMs: 12_000,
  /** Letterlijke citaten: niet te kort (dan zegt het niets) en niet te lang. */
  quoteLength: { min: 20, max: 400 },
  essayWords: { kort: 400, lang: 1_500 } satisfies Record<EssayLength, number>,
  /** Een direct gesprek duurt tien minuten (keuze 2c). */
  callMinutes: 10,
  /**
   * Indicatieve prijs van een gesprek bij ElevenLabs Agents, in dollars per minuut: ongeveer
   * $0,08 voor de stem plus het brein (Claude). Oktober 2026; controleer
   * https://elevenlabs.io/pricing. Na elk gesprek zie je wat het echt kostte.
   */
  callUsdPerMinute: 0.12,
  sites: {
    wikipedia: 'https://en.wikipedia.org',
    wikisource: 'https://en.wikisource.org',
  },
} as const;

export const RESEARCH_FORMS: readonly ResearchForm[] = ['tekst', 'podcast', 'college', 'bellen'];
