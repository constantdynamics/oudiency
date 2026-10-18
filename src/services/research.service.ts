/**
 * Onderzoek op aanvraag (logica, getest): een aanvraag controleren, het onderzoek aanmaken en de
 * daglimiet toepassen (1 per dag, Premium 3; keuze 4d). Een extra vorm uit hetzelfde onderzoek
 * telt niet mee (keuze 6a).
 */
import { detectCrisisSignals } from '@/ai/prompts/safety';
import { type EssayLength, RESEARCH, type ResearchForm } from '@/config/research';
import { PODCAST } from '@/config/podcast';
import { findMeta } from '@/data/figures';
import { localDateKey } from '@/lib/dates';
import { uid } from '@/lib/ids';
import type { PodcastFormat } from '@/store/schemas';
import type { Research, ResearchOutput } from '@/store/researchSchemas';

/** De gekozen vorm met wat erbij hoort. De denkers komen uit het onderzoek (of een keuze daaruit). */
export type FormRequest =
  | { form: 'tekst'; figureId: string; length: EssayLength }
  | { form: 'podcast'; figureIds: string[]; format: PodcastFormat; minutes: number }
  | { form: 'college'; figureIds: string[] }
  | { form: 'bellen'; figureId: string };

export interface ResearchRequest {
  question: string;
  figureIds: string[];
  first: FormRequest;
}

export type ResearchProblem =
  'sleutel' | 'stemsleutel' | 'vraag' | 'denkers' | 'onbekend' | 'vorm' | 'limiet' | 'crisis';

export function formFigures(request: FormRequest): string[] {
  return 'figureIds' in request ? [...request.figureIds] : [request.figureId];
}

/** Welke vorm past bij hoeveel denkers: een podcast-gesprek met twee of drie, anders één. */
export function podcastFormats(figures: number): PodcastFormat[] {
  return figures >= 2 ? ['gesprek'] : ['monoloog', 'interview'];
}

/** Klopt de vorm bij de denkers van het onderzoek? */
export function formProblem(
  request: FormRequest,
  researchFigures: readonly string[],
  keys: { elevenLabs: boolean },
): ResearchProblem | undefined {
  const ids = formFigures(request);
  if (ids.length === 0 || ids.some((id) => !researchFigures.includes(id))) return 'vorm';
  if (new Set(ids).size !== ids.length) return 'vorm';
  switch (request.form) {
    case 'tekst':
      return RESEARCH.essayWords[request.length] ? undefined : 'vorm';
    case 'podcast':
      if (ids.length > RESEARCH.maxFigures) return 'vorm';
      if (!podcastFormats(ids.length).includes(request.format)) return 'vorm';
      return (PODCAST.lengths as readonly number[]).includes(request.minutes) ? undefined : 'vorm';
    case 'college':
      return ids.length <= RESEARCH.maxFigures ? undefined : 'vorm';
    case 'bellen':
      return keys.elevenLabs ? undefined : 'stemsleutel';
  }
}

export function researchProblem(
  request: ResearchRequest,
  context: {
    hasClaudeKey: boolean;
    hasVoiceKey: boolean;
    known: ReadonlySet<string>;
    remainingToday: number;
  },
): ResearchProblem | undefined {
  if (!context.hasClaudeKey) return 'sleutel';
  const question = request.question.trim();
  if (
    question.length < RESEARCH.questionMinLength ||
    question.length > RESEARCH.questionMaxLength
  ) {
    return 'vraag';
  }
  const ids = request.figureIds;
  if (ids.length === 0 || ids.length > RESEARCH.maxFigures || new Set(ids).size !== ids.length) {
    return 'denkers';
  }
  if (ids.some((id) => !findMeta(id) || !context.known.has(id))) return 'onbekend';
  if (detectCrisisSignals(question)) return 'crisis';
  const form = formProblem(request.first, ids, { elevenLabs: context.hasVoiceKey });
  if (form) return form;
  if (context.remainingToday <= 0) return 'limiet';
  return undefined;
}

export function newOutput(request: FormRequest, nowIso: string): ResearchOutput {
  const base = {
    id: uid('vorm'),
    form: request.form,
    createdAt: nowIso,
    status: 'maken' as const,
    figureIds: formFigures(request),
  };
  if (request.form === 'tekst') return { ...base, length: request.length };
  if (request.form === 'podcast') {
    return { ...base, podcastFormat: request.format, minutes: request.minutes };
  }
  if (request.form === 'college') return base;
  // Een gesprek hoeft niet gemaakt te worden: je belt wanneer je wilt.
  return { ...base, status: 'klaar' };
}

export function newResearch(request: ResearchRequest, now: number): Research {
  const iso = new Date(now).toISOString();
  return {
    id: uid('onderzoek'),
    createdAt: iso,
    updatedAt: iso,
    day: localDateKey(now),
    question: request.question.trim(),
    figureIds: [...request.figureIds],
    status: 'zoeken',
    sources: [],
    outputs: [newOutput(request.first, iso)],
  };
}

/* ---------- De vorm kiezen (formulier) ---------- */

/** Wat het formulier bijhoudt; `draftRequest` maakt er een geldige aanvraag van. */
export interface FormDraft {
  form: ResearchForm;
  /** Tekst en bellen: wie; college: de hoofddocent. Standaard de eerste denker. */
  figureId?: string;
  length: EssayLength;
  podcastFormat?: PodcastFormat;
  minutes: number;
}

export function initialDraft(form: ResearchForm = 'tekst'): FormDraft {
  return { form, length: 'kort', minutes: PODCAST.defaultMinutes };
}

export function draftRequest(draft: FormDraft, figureIds: readonly string[]): FormRequest {
  const one =
    draft.figureId && figureIds.includes(draft.figureId) ? draft.figureId : (figureIds[0] ?? '');
  switch (draft.form) {
    case 'tekst':
      return { form: 'tekst', figureId: one, length: draft.length };
    case 'bellen':
      return { form: 'bellen', figureId: one };
    case 'college':
      // De hoofddocent eerst; de anderen zijn gastdocent.
      return { form: 'college', figureIds: [one, ...figureIds.filter((id) => id !== one)] };
    case 'podcast': {
      const formats = podcastFormats(figureIds.length);
      const format =
        draft.podcastFormat && formats.includes(draft.podcastFormat)
          ? draft.podcastFormat
          : formats[0]!;
      return { form: 'podcast', figureIds: [...figureIds], format, minutes: draft.minutes };
    }
  }
}
