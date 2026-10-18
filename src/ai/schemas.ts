/**
 * Zod-schema's voor structured output (§5.3, §8). Dezelfde schema's valideren het antwoord van de
 * echte provider én van de demomodus. Houd ze eenvoudig: objecten, strings, enums en arrays.
 */
import { z } from 'zod';

export const SessionSummarySchema = z.object({
  summary: z
    .string()
    .describe('Samenvatting van het gesprek in 3–5 zinnen, in de tweede persoon ("je").'),
  reflectionQuestion: z
    .string()
    .describe('Eén reflectievraag om mee te nemen, in de stijl van de denker.'),
  topics: z
    .array(z.string())
    .describe('1–3 korte onderwerpen (één of twee woorden) waarover het ging.'),
});
export type SessionSummary = z.infer<typeof SessionSummarySchema>;

export const LecturePlanOutputSchema = z.object({
  title: z.string().describe('Pakkende titel voor het college, max. 70 tekens.'),
  segments: z
    .array(
      z.object({
        heading: z.string().describe('Korte kop voor dit deel, max. 50 tekens.'),
        keyPoints: z.array(z.string()).describe('2–4 kernpunten voor dit deel.'),
      }),
    )
    .describe('Precies drie delen.'),
  furtherReading: z
    .array(z.number().int())
    .describe('1–3 nummers uit de lijst LEESTIPS die het best bij dit college passen.'),
  tags: z
    .array(z.string())
    .describe('2–4 korte trefwoorden (één of twee woorden), kleine letters.'),
});
export type LecturePlanOutput = z.infer<typeof LecturePlanOutputSchema>;

export const TimelineReactionsSchema = z.object({
  reactions: z
    .array(
      z.object({
        figureId: z.string().describe('Id uit de kandidatenlijst.'),
        type: z.enum(['like', 'comment']),
        text: z
          .string()
          .describe('Korte reactie (max. ~60 woorden) bij type "comment"; leeg bij "like".'),
      }),
    )
    .describe('0 tot 3 reacties. Vaak geen of één.'),
});
export type TimelineReactionsOutput = z.infer<typeof TimelineReactionsSchema>;

export const ModerationSchema = z.object({
  verdict: z.enum(['ok', 'twijfel', 'afwijzen']),
  reasons: z
    .array(z.string())
    .describe('Korte redenen in het Nederlands; leeg als alles in orde is.'),
});
export type ModerationOutput = z.infer<typeof ModerationSchema>;

export const HelperSchema = z.object({
  suggestions: z
    .array(
      z.object({
        figureId: z.string().describe('Id uit de kandidatenlijst.'),
        why: z.string().describe('Eén zin (max. 25 woorden) waarom deze denker kan helpen.'),
      }),
    )
    .describe('Precies drie verschillende denkers.'),
});
export type HelperOutput = z.infer<typeof HelperSchema>;

export const PodcastScriptSchema = z.object({
  title: z.string().describe('Titel van de aflevering, max. 70 tekens.'),
  segments: z
    .array(
      z.object({
        speaker: z
          .string()
          .describe('Id van de spreker: "sophie" of een denker-id uit de opdracht.'),
        text: z
          .string()
          .describe('Wat de spreker zegt: gesproken tekst, 40–180 woorden, zonder opmaak.'),
      }),
    )
    .describe('Alle fragmenten in volgorde; het eerste en het laatste zijn van Sophie.'),
});
export type PodcastScriptOutput = z.infer<typeof PodcastScriptSchema>;

export const ListenerAnswerSchema = z.object({
  segments: z
    .array(
      z.object({
        speaker: z
          .string()
          .describe('Id van de spreker: "sophie" of een denker-id uit de opdracht.'),
        text: z
          .string()
          .describe('Wat de spreker zegt: gesproken tekst, hooguit 120 woorden, zonder opmaak.'),
      }),
    )
    .describe(
      'De fragmenten in volgorde: Sophie met de vraag, het antwoord, en de weg terug naar het onderwerp.',
    ),
});
export type ListenerAnswerOutput = z.infer<typeof ListenerAnswerSchema>;

/* ---------- Onderzoek op aanvraag ---------- */

export const ResearchPlanSchema = z.object({
  suitable: z
    .boolean()
    .describe('false alleen bij een schadelijke, expliciete of privacyschendende vraag.'),
  reason: z
    .string()
    .describe('Bij suitable=false één korte zin waarom, in het Nederlands; anders leeg.'),
  title: z.string().describe('Korte Nederlandse titel voor het onderzoek, max. 60 tekens.'),
  wikipedia: z
    .array(z.string())
    .describe('2–3 Engelse zoektermen voor Wikipedia, elk 1–5 woorden.'),
  wikisource: z
    .array(z.string())
    .describe('0–2 Engelse zoektermen voor teksten van de gekozen denkers op Wikisource.'),
});
export type ResearchPlanOutput = z.infer<typeof ResearchPlanSchema>;

export const ResearchBriefOutputSchema = z.object({
  summary: z.string().describe('De kern in 150–300 woorden, neutraal en helder (Nederlands).'),
  facts: z
    .array(
      z.object({
        text: z.string().describe('Eén feit of inzicht in één of twee zinnen (Nederlands).'),
        sources: z
          .array(z.number().int())
          .describe('Nummers van de bronfragmenten; leeg als het niet uit de bronnen komt.'),
      }),
    )
    .describe('5–12 feiten en inzichten.'),
  perspectives: z
    .array(
      z.object({
        figureId: z.string().describe('Id van een gekozen denker.'),
        angle: z
          .string()
          .describe('Eén tot drie zinnen: hoe deze denker naar de vraag kijkt (geen citaat).'),
      }),
    )
    .describe('Precies één per gekozen denker.'),
  quotes: z
    .array(
      z.object({
        text: z
          .string()
          .describe(
            'Letterlijk uit een Wikisource-fragment, in de taal van de bron, max. 60 woorden.',
          ),
        source: z.number().int().describe('Nummer van het Wikisource-fragment.'),
        translation: z.string().describe('Nederlandse vertaling van het citaat.'),
      }),
    )
    .describe('0–4 letterlijke citaten, alleen uit de Wikisource-fragmenten.'),
  caveats: z
    .array(z.string())
    .describe(
      '0–3 korte kanttekeningen: wat onzeker of omstreden is, of wat de bronnen niet dekken.',
    ),
});
export type ResearchBriefOutput = z.infer<typeof ResearchBriefOutputSchema>;

export const EssaySchema = z.object({
  title: z.string().describe('Titel van het essay, max. 70 tekens.'),
  text: z
    .string()
    .describe('Het essay in alinea’s met een witregel ertussen; hooguit *cursief* en **vet**.'),
  furtherReading: z
    .array(z.number().int())
    .describe('1–3 nummers uit de lijst LEESTIPS die het best bij dit essay passen.'),
});
export type EssayOutput = z.infer<typeof EssaySchema>;
