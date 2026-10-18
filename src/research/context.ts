/**
 * De onderzoeksnotitie als achtergrond voor een vorm: een podcast, een college of een gesprek
 * gemaakt uit een onderzoek krijgen hem mee. Klein en zonder AI-code, zodat ook de podcast- en
 * collegecode hem kan gebruiken.
 */
import { type ResearchContext, researchBlock } from '@/ai/prompts/research';
import { findMeta } from '@/data/figures';
import type { Research } from '@/store/researchSchemas';
import { findResearch } from '@/store/researchStore';

/** De context van een afgerond onderzoek (niets zolang er geen notitie is). */
export function researchContextOf(research: Research | undefined): ResearchContext | undefined {
  if (!research?.brief) return undefined;
  return {
    question: research.question,
    brief: research.brief,
    sources: research.sources,
    names: Object.fromEntries(research.figureIds.map((id) => [id, findMeta(id)?.name ?? id])),
  };
}

/** Het notitieblok voor een prompt, bij een onderzoek-id (niets als het onderzoek weg is). */
export function researchBlockFor(researchId: string | undefined): string | undefined {
  const context = researchContextOf(findResearch(researchId));
  return context ? researchBlock(context) : undefined;
}
