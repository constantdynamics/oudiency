/**
 * Moderatie-precheck (§7.5): een lichte structured-output-call geeft advies (ok, twijfel,
 * afwijzen) met redenen. De regels hieronder zijn de demo én het vangnet als de AI-call faalt.
 */
import { tokenize } from '@/lib/text';
import type { DemoContext } from '../demoContext';
import type { TextRequest } from '../provider';
import { FRAME } from './frame';
import { detectCrisisSignals } from './safety';

export const MODERATION_TASK = `TAAK: MODERATIE-PRECHECK
Een student wil een college (een AI-simulatie) delen in de openbare bibliotheek van de app. Geef een advies voor de menselijke moderator.
- Let op: persoonsgegevens (namen van echte privépersonen, adressen, e-mail, telefoon), haat of discriminatie, expliciete of anderszins schadelijke inhoud, gevaarlijke instructies, en tekst die zich voordoet als een echt citaat van de historische persoon.
- verdict: "ok" als er niets aan de hand is, "twijfel" als een moderator moet kijken, "afwijzen" bij duidelijke overtredingen.
- reasons: korte redenen in het Nederlands; leeg bij "ok".`;

export function moderationRequest(text: string): TextRequest {
  return {
    task: 'moderation',
    system: [
      { text: FRAME, cache: true },
      { text: MODERATION_TASK, cache: true },
    ],
    messages: [{ role: 'user', content: text }],
    demo: { kind: 'moderation', text } satisfies Extract<DemoContext, { kind: 'moderation' }>,
  };
}

const RISKY_WORDS = [
  'kanker',
  'tering',
  'klootzak',
  'kut',
  'hoer',
  'nazi',
  'neuk',
  'mongool',
  'flikker',
];

export interface RuleVerdict {
  verdict: 'ok' | 'twijfel' | 'afwijzen';
  reasons: string[];
}

/** Eenvoudige regels: persoonsgegevens, links, grof taalgebruik en crisissignalen. */
export function ruleCheck(text: string): RuleVerdict {
  const reasons: string[] = [];
  if (/[\w.+-]+@[\w-]+\.[\w.]+/.test(text))
    reasons.push('Bevat een e-mailadres (persoonsgegevens).');
  if (/(\+31|\b0)[1-9](?:[\s-]?\d){8}\b/.test(text))
    reasons.push('Bevat mogelijk een telefoonnummer.');
  if (/\bhttps?:\/\//i.test(text)) reasons.push('Bevat een link; controleer of die gepast is.');
  const words = new Set(tokenize(text));
  if (RISKY_WORDS.some((w) => words.has(w)))
    reasons.push('Bevat mogelijk kwetsend of grof taalgebruik.');
  if (detectCrisisSignals(text)) reasons.push('Bevat signalen van een persoonlijke crisis.');
  const verdict: RuleVerdict['verdict'] =
    reasons.length === 0
      ? 'ok'
      : reasons.some((r) => r.includes('kwetsend'))
        ? 'afwijzen'
        : 'twijfel';
  return { verdict, reasons };
}
