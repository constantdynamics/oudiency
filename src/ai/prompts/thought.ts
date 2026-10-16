/** Gedachte van vandaag (§6.5): max. 1 per dag per denker, kort, gelabeld als AI. */
import type { Figure } from '@/data/types';
import { formatLongDate } from '@/lib/dates';
import type { TextRequest } from '../provider';
import { FRAME } from './frame';
import { buildPersona } from './persona';

export function thoughtRequest(figure: Figure, dateKey: string, nowMs: number): TextRequest {
  return {
    task: 'thoughtOfTheDay',
    system: [
      { text: FRAME, cache: true },
      { text: buildPersona(figure), cache: true },
      {
        text: `TAAK: GEDACHTE VAN VANDAAG
Schrijf één korte gedachte voor vandaag (${formatLongDate(nowMs)}), zoals jij die op een briefje zou schrijven voor iemand die je profiel bezoekt.
- 20 tot 45 woorden, in de tweede persoon ("je") of als uitnodiging.
- Concreet en uitvoerbaar vandaag; in jouw stijl en met jouw beelden.
- Geen letterlijk citaat, geen aanhalingstekens, geen aanhef of afsluiting. Alleen de gedachte zelf.`,
      },
    ],
    messages: [{ role: 'user', content: `Geef je gedachte van vandaag (${dateKey}).` }],
    demo: { kind: 'thought', figureId: figure.id, dateKey },
  };
}
