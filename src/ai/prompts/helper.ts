/**
 * "Wie kan mij helpen?" (§7.4): één lichte structured-output-call kiest drie denkers met één zin
 * waarom. De kandidatenlijst (het hele rooster) is stabiel en dus cachebaar.
 */
import type { FigureMeta } from '@/data/figures';
import type { DemoContext } from '../demoContext';
import type { TextRequest } from '../provider';
import { FRAME } from './frame';

export const HELPER_TASK = `TAAK: WIE KAN MIJ HELPEN?
Een student beschrijft een vraag of probleem. Kies uit de kandidatenlijst precies drie verschillende denkers die er vanuit hun eigen denken het best bij kunnen helpen, elk vanuit een andere invalshoek.
- Per denker één zin (hooguit 25 woorden) waarom, gericht aan de student ("je") en concreet over diens vraag.
- Alleen id's uit de lijst. Geen citaten.
- Je bent geen hulpverlener: gaat het om medische, juridische of acute zorgen, noem dan in de zin dat een professional de eerste stap is.`;

export function helperLine(meta: FigureMeta): string {
  return `- ${meta.id}: ${meta.name} (${meta.epithet.replace(/\.$/, '')}) — thema's: ${meta.tags.slice(0, 4).join(', ')}; helpt bij: ${meta.helpsWith.slice(0, 3).join(', ')}`;
}

export function helperRequest(
  query: string,
  candidates: readonly FigureMeta[],
  demo: Extract<DemoContext, { kind: 'helper' }>,
): TextRequest {
  return {
    task: 'helper',
    system: [
      { text: FRAME, cache: true },
      { text: HELPER_TASK },
      { text: `KANDIDATEN\n${candidates.map(helperLine).join('\n')}`, cache: true },
    ],
    messages: [{ role: 'user', content: query.trim() }],
    demo,
  };
}
