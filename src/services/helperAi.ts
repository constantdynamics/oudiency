/**
 * "Wie kan mij helpen?" (lazy): drie passende denkers met één zin waarom. In de demomodus op
 * trefwoorden; met een eigen key via het lichte model. Antwoorden worden gecontroleerd.
 */
import { getProvider } from '@/ai';
import { helperRequest } from '@/ai/prompts/helper';
import { HelperSchema } from '@/ai/schemas';
import { FIGURES_META } from '@/data/figures';
import { type HelperSuggestion, validateSuggestions } from './discover.service';

export async function findHelpers(query: string): Promise<HelperSuggestion[]> {
  const candidates = [...FIGURES_META];
  const output = await getProvider().structured({
    ...helperRequest(query, candidates, {
      kind: 'helper',
      query,
      candidates: candidates.map((c) => ({ id: c.id, name: c.name, tags: c.tags })),
    }),
    schema: HelperSchema,
  });
  return validateSuggestions(output.suggestions, new Set(candidates.map((c) => c.id)));
}
