/**
 * Prompts voor de timeline (§8.6): één lichte structured-output-call bepaalt welke denkers (0–3)
 * reageren, en een korte call zet de vraag van de dag in de stijl van de denker.
 */
import { LIMITS } from '@/config/limits';
import type { FigureMeta } from '@/data/figures';
import type { DailyQuestion, Figure } from '@/data/types';
import type { DemoContext } from '../demoContext';
import type { TextRequest } from '../provider';
import { FRAME } from './frame';
import { buildPersona } from './persona';

export const TIMELINE_TASK = `TAAK: REACTIES OP EEN TIMELINE-BERICHT
Een student plaatst een kort bericht op de eigen timeline. Bepaal welke denkers uit de kandidatenlijst zich aangesproken voelen en hoe ze reageren.
- Kies 0 tot ${LIMITS.timeline.maxReactions} denkers. Niet elk bericht krijgt reacties: bij een alledaags of kort bericht vaak geen of één. Alleen denkers voor wie het onderwerp echt dichtbij hun denken ligt.
- Per denker: meestal alleen een like (type "like", lege tekst). Soms een korte reactie (type "comment"): hooguit ${LIMITS.timeline.commentMaxWords} woorden, in de eigen stijl en met de eigen beelden van die denker, eventueel met één wedervraag. Spreek de student aan met "je".
- Geen letterlijke citaten en geen aanhalingstekens rond de hele reactie. Elke reactie is een AI-simulatie; doe niet alsof de denker echt meeleest.
- Gebruik alleen id's uit de kandidatenlijst. Een denker met [nieuw] kent de student nog niet: kies hooguit één zo'n denker, alleen als die er echt iets over te zeggen heeft, en laat die zich dan kort voorstellen in de reactie.`;

/** Eén regel per kandidaat: id, naam, kernwoorden en (bij nieuwe denkers) het label [nieuw]. */
export function candidateLine(meta: FigureMeta, isNew: boolean): string {
  return `- ${meta.id}: ${meta.name} (${meta.epithet.replace(/\.$/, '')}; ${meta.school}) — thema's: ${meta.tags.slice(0, 5).join(', ')}${isNew ? ' [nieuw]' : ''}`;
}

export function timelineReactionsRequest(params: {
  text: string;
  candidates: readonly FigureMeta[];
  undiscovered: readonly string[];
  allowDiscovery: boolean;
  demo: Extract<DemoContext, { kind: 'timeline-reactions' }>;
}): TextRequest {
  const { text, candidates, undiscovered, allowDiscovery, demo } = params;
  const lines = candidates
    .filter((meta) => allowDiscovery || !undiscovered.includes(meta.id))
    .map((meta) => candidateLine(meta, undiscovered.includes(meta.id)));
  return {
    task: 'timelineReactions',
    system: [
      { text: FRAME, cache: true },
      { text: TIMELINE_TASK, cache: true },
    ],
    messages: [
      {
        role: 'user',
        content: [`KANDIDATEN\n${lines.join('\n')}`, `BERICHT VAN DE STUDENT\n${text.trim()}`],
      },
    ],
    demo,
  };
}

export const DAILY_QUESTION_TASK = `TAAK: VRAAG VAN DE DAG
Stel de vraag hieronder aan de student, in jouw eigen stijl en met jouw eigen beelden.
- Hooguit 35 woorden, één of twee zinnen; de betekenis blijft precies gelijk.
- Spreek de student aan met "je". Geen aanhef, geen uitleg, geen aanhalingstekens. Alleen de vraag.`;

export function dailyQuestionRequest(figure: Figure, question: DailyQuestion): TextRequest {
  return {
    task: 'dailyQuestion',
    system: [
      { text: FRAME, cache: true },
      { text: buildPersona(figure), cache: true },
      { text: DAILY_QUESTION_TASK },
    ],
    messages: [{ role: 'user', content: question.text }],
    demo: {
      kind: 'daily-question',
      figureId: figure.id,
      questionId: question.id,
      question: question.text,
    },
  };
}
