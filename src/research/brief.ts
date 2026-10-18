/**
 * Van het antwoord van Claude naar een opgeslagen onderzoeksnotitie (pure functies, getest).
 * Citaten blijven alleen staan als ze letterlijk in het Wikisource-fragment staan dat Claude zag;
 * bronnummers en denkers worden nagekeken.
 */
import type { SourceText } from '@/ai/prompts/research';
import type { ResearchBriefOutput } from '@/ai/schemas';
import { RESEARCH } from '@/config/research';
import type { ResearchBrief } from '@/store/researchSchemas';

/** Voor het vergelijken: aanhalingstekens, streepjes en witruimte gelijk, en kleine letters. */
export function matchable(text: string): string {
  return text
    .normalize('NFKC')
    .replace(/[‘’‚‛′`´]/g, "'")
    .replace(/[“”„‟″«»]/g, '"')
    .replace(/[‐‑‒–—―]/g, '-')
    .replace(/…/g, '...')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/** Het citaat zonder omringende aanhalingstekens en slotleesteken. */
function core(quote: string): string {
  return matchable(quote)
    .replace(/^["'\s]+|["'\s]+$/g, '')
    .replace(/[.,;:!?]+$/, '');
}

/** Staat het citaat letterlijk in de brontekst (en is het niet te kort of te lang)? */
export function isVerbatim(quote: string, source: string): boolean {
  const text = core(quote);
  const { min, max } = RESEARCH.quoteLength;
  if (text.length < min || text.length > max || text.includes('...')) return false;
  return matchable(source).includes(text);
}

const MAX = { facts: 12, quotes: 4, caveats: 3 };

const clean = (text: string) => text.trim().replace(/\s+/g, ' ');

/** Bronnummers (vanaf 1) naar indexen; onbekende nummers vallen weg. */
function sourceIndexes(numbers: readonly number[], count: number): number[] {
  return [...new Set(numbers.filter((n) => n >= 1 && n <= count).map((n) => n - 1))];
}

export function toBrief(
  output: ResearchBriefOutput,
  sources: readonly SourceText[],
  figureIds: readonly string[],
): ResearchBrief {
  const allowed = new Set(figureIds);
  const perspectives: ResearchBrief['perspectives'] = [];
  for (const p of output.perspectives) {
    const angle = clean(p.angle);
    if (!allowed.has(p.figureId) || !angle) continue;
    if (perspectives.some((other) => other.figureId === p.figureId)) continue;
    perspectives.push({ figureId: p.figureId, angle });
  }

  const seenQuotes = new Set<string>();
  const quotes = output.quotes
    .filter((quote) => {
      const source = sources[quote.source - 1];
      if (!source || source.kind !== 'wikisource' || !quote.translation.trim()) return false;
      if (!isVerbatim(quote.text, source.text)) return false;
      const key = core(quote.text);
      if (seenQuotes.has(key)) return false;
      seenQuotes.add(key);
      return true;
    })
    .slice(0, MAX.quotes)
    .map((quote) => ({
      text: clean(quote.text).replace(/^["“”]+|["“”]+$/g, ''),
      translation: clean(quote.translation).replace(/^["“”]+|["“”]+$/g, ''),
      source: quote.source - 1,
    }));

  return {
    basis: sources.length > 0 ? 'bronnen' : 'kennis',
    summary: output.summary.trim(),
    facts: output.facts
      .filter((fact) => fact.text.trim())
      .slice(0, MAX.facts)
      .map((fact) => ({
        text: clean(fact.text),
        sources: sourceIndexes(fact.sources, sources.length),
      })),
    perspectives,
    quotes,
    caveats: output.caveats.map(clean).filter(Boolean).slice(0, MAX.caveats),
  };
}
