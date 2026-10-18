/**
 * Kostenschattingen in euro's voor onderzoek op aanvraag (keuze 8c): wat het uitzoeken kost en
 * wat elke vorm daarna kost. Indicatief, op basis van de API-prijzen in config/models en
 * config/podcast; met een abonnement betaal je in credits.
 */
import { PODCAST } from '@/config/podcast';
import { type EssayLength, RESEARCH } from '@/config/research';
import { charsForMinutes, claudeEur, scriptEur, ttsEur } from '@/podcast/costs';
import type { FormRequest } from '@/services/research.service';

/** Ongeveer vier tekens per token (Engelse brontekst). */
const CHARS_PER_TOKEN = 4;
/** De notitie die als achtergrond meegaat naar elke vorm. */
const BRIEF_TOKENS = 1_500;

/** Uitzoeken: een licht plan en daarna de notitie, met alle bronfragmenten als invoer. */
export function researchEur(): number {
  const sourceChars =
    RESEARCH.maxArticles.wikipedia * RESEARCH.charsPerArticle.wikipedia +
    RESEARCH.maxArticles.wikisource * RESEARCH.charsPerArticle.wikisource;
  const plan = claudeEur('researchPlan', 800, 600);
  const brief = claudeEur('research', 1_500 + sourceChars / CHARS_PER_TOKEN, 4_500);
  return plan + brief;
}

/** Een essay: kader, persona en notitie erin; de tekst (en wat denkwerk) eruit. */
export function essayEur(length: EssayLength): number {
  const words = RESEARCH.essayWords[length];
  return claudeEur('researchText', 4_000 + BRIEF_TOKENS, Math.round(words * 1.6) + 1_500);
}

/** Een podcast: het script (met de notitie erbij) en het voorlezen bij het afspelen. */
export function podcastEur(minutes: number, figures: number, ttsModel: string | undefined) {
  return {
    write: scriptEur(minutes, figures) + claudeEur('podcast', BRIEF_TOKENS, 0),
    read: ttsEur(charsForMinutes(minutes), ttsModel),
  };
}

/** Een college: plan, opening, drie delen en een conclusie; elke gastdocent spreekt mee. */
export function lectureEur(figures: number): number {
  return claudeEur('lecture', 12_000 + BRIEF_TOKENS + (figures - 1) * 3_000, 9_000);
}

/** Een gesprek van tien minuten bij ElevenLabs Agents (stem en brein samen). */
export function callEur(minutes: number = RESEARCH.callMinutes): number {
  return minutes * RESEARCH.callUsdPerMinute * PODCAST.usdToEur;
}

export type CostKey = 'uitzoeken' | 'tekst' | 'script' | 'voorlezen' | 'college' | 'gesprek';

export interface CostLine {
  key: CostKey;
  eur: number;
  service: 'Claude' | 'ElevenLabs';
}

/** De kosten per onderdeel van een aanvraag (met of zonder het uitzoeken zelf). */
export function costLines(
  request: FormRequest,
  ttsModel: string | undefined,
  includeResearch: boolean,
): CostLine[] {
  const lines: CostLine[] = includeResearch
    ? [{ key: 'uitzoeken', eur: researchEur(), service: 'Claude' }]
    : [];
  switch (request.form) {
    case 'tekst':
      lines.push({ key: 'tekst', eur: essayEur(request.length), service: 'Claude' });
      break;
    case 'podcast': {
      const podcast = podcastEur(request.minutes, request.figureIds.length, ttsModel);
      lines.push(
        { key: 'script', eur: podcast.write, service: 'Claude' },
        { key: 'voorlezen', eur: podcast.read, service: 'ElevenLabs' },
      );
      break;
    }
    case 'college':
      lines.push({ key: 'college', eur: lectureEur(request.figureIds.length), service: 'Claude' });
      break;
    case 'bellen':
      lines.push({ key: 'gesprek', eur: callEur(), service: 'ElevenLabs' });
      break;
  }
  return lines;
}

export function totalEur(lines: readonly CostLine[]): number {
  return lines.reduce((sum, line) => sum + line.eur, 0);
}
