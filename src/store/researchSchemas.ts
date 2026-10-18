/**
 * Opslag van onderzoeken (zod/mini). Apart van schemas.ts: deze schema's laden pas mee met het
 * onderzoek (en bij exporteren), niet in de startbundel.
 */
import * as z from 'zod/mini';

const isoDate = z.string().check(z.minLength(10));
const count = () => z.int().check(z.minimum(0));

export const ResearchFormSchema = z.enum(['tekst', 'podcast', 'college', 'bellen']);

export const ResearchSourceSchema = z.object({
  kind: z.enum(['wikipedia', 'wikisource']),
  title: z.string(),
  url: z.string(),
  /** Wikisource: auteur en vertaler volgens de kop van de tekst. */
  author: z.optional(z.string()),
  translator: z.optional(z.string()),
});
export type ResearchSource = z.infer<typeof ResearchSourceSchema>;

/** Een letterlijk citaat dat is gecontroleerd tegen de brontekst. */
export const ResearchQuoteSchema = z.object({
  /** Precies zoals in de bron (meestal Engels). */
  text: z.string(),
  /** Nederlandse vertaling (eigen vertaling). */
  translation: z.string(),
  /** Index in `sources`. */
  source: count(),
});
export type ResearchQuote = z.infer<typeof ResearchQuoteSchema>;

/** De onderzoeksnotitie: niet zichtbaar voor de gebruiker, wel de basis voor elke vorm. */
export const ResearchBriefSchema = z.object({
  /** 'bronnen': met Wikipedia/Wikisource; 'kennis': alleen wat Claude zelf weet. */
  basis: z.enum(['bronnen', 'kennis']),
  summary: z.string(),
  facts: z.array(z.object({ text: z.string(), sources: z.array(count()) })),
  perspectives: z.array(z.object({ figureId: z.string(), angle: z.string() })),
  quotes: z.array(ResearchQuoteSchema),
  caveats: z.array(z.string()),
});
export type ResearchBrief = z.infer<typeof ResearchBriefSchema>;

export const ResearchOutputSchema = z.object({
  id: z.string(),
  form: ResearchFormSchema,
  createdAt: isoDate,
  status: z.enum(['maken', 'klaar', 'fout']),
  error: z.optional(z.string()),
  /** Wie: de schrijver, de sprekers, de docent (eerst) met gastdocenten, of wie je belt. */
  figureIds: z.array(z.string()),
  /** Tekst: lengte, titel, de tekst zelf en leestips (indexen in keyWorks van de schrijver). */
  length: z.optional(z.enum(['kort', 'lang'])),
  title: z.optional(z.string()),
  text: z.optional(z.string()),
  furtherReading: z.optional(z.array(count())),
  /** Podcast: vorm en lengte; podcast of college: wat ervan is gemaakt. */
  podcastFormat: z.optional(z.enum(['monoloog', 'gesprek', 'interview'])),
  minutes: z.optional(count()),
  refId: z.optional(z.string()),
});
export type ResearchOutput = z.infer<typeof ResearchOutputSchema>;

export const ResearchSchema = z.object({
  id: z.string(),
  createdAt: isoDate,
  /** De dag (JJJJ-MM-DD) waarop het onderzoek meetelt voor de daglimiet. */
  day: z.string(),
  question: z.string(),
  /** Korte titel uit het onderzoeksplan. */
  title: z.optional(z.string()),
  /** Eén tot drie denkers (een panel). */
  figureIds: z.array(z.string()),
  status: z.enum(['zoeken', 'klaar', 'fout']),
  error: z.optional(z.string()),
  /** Geweigerd (ongeschikte vraag): opnieuw proberen heeft geen zin. */
  refused: z.optional(z.boolean()),
  /** Laatste voortgang, om een onderbroken onderzoek te herkennen. */
  updatedAt: isoDate,
  brief: z.optional(ResearchBriefSchema),
  sources: z.array(ResearchSourceSchema),
  outputs: z.array(ResearchOutputSchema),
});
export type Research = z.infer<typeof ResearchSchema>;

export const ResearchStateSchema = z.object({ researches: z.array(ResearchSchema) });
export type ResearchState = z.infer<typeof ResearchStateSchema>;
