/**
 * Prompts voor een college (§8.3): eerst een onzichtbaar plan (structured output), daarna per
 * onderdeel een gestreamde tekst. Kader en persona zijn cachebaar; het derde blok (regels,
 * aanvraag en plan) blijft gelijk zolang het college loopt. Per onderdeel gaat alleen een korte
 * terugblik mee (koppen en kernpunten, plus het slot van het vorige onderdeel), niet de hele tekst.
 */
import { LIMITS } from '@/config/limits';
import type { Figure } from '@/data/types';
import type { LecturePlan, LectureSegment } from '@/store/schemas';
import type { DemoContext } from '../demoContext';
import type { SystemBlock, TextRequest } from '../provider';
import { FRAME } from './frame';
import { buildPersona } from './persona';

export const LECTURE_RULES = `COLLEGE
- Je geeft een college aan één student die meeleest. Spreek de student aan met "je" en stel af en toe een retorische vraag.
- Gebruik voorbeelden uit je eigen tijd én uit het heden: je weet dat je een simulatie bent en kent de wereld van nu.
- Vertel levendig en concreet, in korte alinea's met een witregel ertussen. Geen koppen: de app zet de kop erboven. Opsommingen alleen waar daarom gevraagd wordt.
- Citeer letterlijk alleen uit je geverifieerde citaten, met bron; zeg verder alles in eigen woorden.
- Noem als leestip nooit een titel die niet bij WERKEN staat. De app toont de leestips zelf.
- Een bericht tussen vierkante haken dat met "App:" begint, komt van de app en zegt wat je nu schrijft. Citeer het niet.`;

export interface LectureContext {
  figure: Figure;
  topic: string;
  mainQuestion: string;
  plan?: LecturePlan;
  studentName?: string;
}

/** Doellengte per onderdeel, afgeleid van de totale leestijd (12–15 minuten). */
export function segmentWordRange(kind: LectureSegment['kind']): [number, number] {
  if (kind === 'antwoord') return [100, 200];
  const { targetReadingMinutes, playbackWordsPerMinute } = LIMITS.lecture;
  const share = { opening: 0.08, deel: 0.24, conclusie: 0.12 }[kind];
  const round = (n: number) => Math.round((n * share * playbackWordsPerMinute) / 10) * 10;
  return [round(targetReadingMinutes.min), round(targetReadingMinutes.max)];
}

function planText(plan: LecturePlan): string {
  return [
    `COLLEGEPLAN (onzichtbaar voor de student)`,
    `Titel: ${plan.title}`,
    ...plan.segments.map(
      (part, i) =>
        `Deel ${i + 1}: ${part.heading}\n${part.keyPoints.map((p) => `  - ${p}`).join('\n')}`,
    ),
  ].join('\n');
}

export function lectureContextBlock({
  topic,
  mainQuestion,
  plan,
  studentName,
}: LectureContext): string {
  const lines = [
    'AANVRAAG',
    `- Onderwerp: ${topic.trim()}`,
    `- Hoofdvraag van de student: ${mainQuestion.trim()}`,
    `- Opbouw: opening, drie delen en een conclusie; samen ${LIMITS.lecture.targetReadingMinutes.min} tot ${LIMITS.lecture.targetReadingMinutes.max} minuten lezen. Na elk deel mag de student een vraag stellen (in totaal hooguit ${LIMITS.lecture.maxQuestions}).`,
  ];
  const name = studentName?.trim();
  if (name) lines.push(`- De student heet ${name}; noem de naam hooguit een keer of twee.`);
  return plan ? `${lines.join('\n')}\n\n${planText(plan)}` : lines.join('\n');
}

export function lectureSystem(context: LectureContext): SystemBlock[] {
  return [
    { text: FRAME, cache: true },
    { text: buildPersona(context.figure), cache: true },
    { text: `${LECTURE_RULES}\n\n${lectureContextBlock(context)}`, cache: true },
  ];
}

/** De werken als genummerde lijst, zodat het plan leestips kan kiezen zonder titels te verzinnen. */
export function readingList(figure: Figure): string {
  return figure.keyWorks
    .map((work, i) => `${i + 1}. ${work.title}${work.year ? ` (${work.year})` : ''}`)
    .join('\n');
}

export function planInstruction(figure: Figure): string {
  return [
    '[App: Maak eerst het plan voor dit college. Geef een pakkende titel (hooguit 70 tekens) en precies drie delen, elk met een korte kop (hooguit 50 tekens) en twee tot vier kernpunten. De delen bouwen op naar een antwoord op de hoofdvraag.',
    `Kies daarnaast één tot drie leestips uit deze lijst en geef hun nummers:\nLEESTIPS\n${readingList(figure)}`,
    'Geef ook twee tot vier korte trefwoorden.]',
  ].join('\n\n');
}

export function lecturePlanRequest(
  context: LectureContext,
  demo: Extract<DemoContext, { kind: 'lecture-plan' }>,
): TextRequest {
  return {
    task: 'lecture',
    system: lectureSystem({ ...context, plan: undefined }),
    messages: [{ role: 'user', content: planInstruction(context.figure) }],
    demo,
  };
}

/** Wat er al is behandeld: koppen en kernpunten, de vragen en het slot van het vorige onderdeel. */
export function recap(
  plan: LecturePlan | undefined,
  segments: readonly Pick<LectureSegment, 'kind' | 'heading' | 'text'>[],
  questions: readonly { afterSegment: number; text: string }[],
): string {
  const lines: string[] = [];
  const done = segments.filter((s) => s.kind === 'deel').length;
  if (done > 0 && plan) {
    lines.push(
      `Al behandeld: ${plan.segments
        .slice(0, done)
        .map((p) => `“${p.heading}”`)
        .join(', ')}.`,
    );
  }
  for (const question of questions) {
    lines.push(
      `De student vroeg na “${segments[question.afterSegment]?.heading ?? 'de opening'}”: “${question.text}”`,
    );
  }
  const last = segments[segments.length - 1];
  if (last) {
    const paragraphs = last.text.trim().split(/\n{2,}/);
    lines.push(`Je vorige onderdeel eindigde zo: «${paragraphs[paragraphs.length - 1]}»`);
  }
  return lines.join('\n');
}

export type SegmentStep =
  | { kind: 'opening' }
  | { kind: 'deel'; part: number }
  | { kind: 'antwoord'; question: string }
  | { kind: 'conclusie' };

export function segmentInstruction(
  step: SegmentStep,
  plan: LecturePlan | undefined,
  context: string,
): string {
  const [min, max] = segmentWordRange(step.kind);
  const length = `ongeveer ${min} tot ${max} woorden`;
  let task: string;
  switch (step.kind) {
    case 'opening':
      task = `Schrijf nu de opening (${length}): een pakkend begin en waarom deze vraag ertoe doet. Kondig de drie delen kort aan, zonder ze al te behandelen.`;
      break;
    case 'deel': {
      const part = plan?.segments[step.part - 1];
      const points = part?.keyPoints.length ? ` Kernpunten: ${part.keyPoints.join('; ')}.` : '';
      task = `Schrijf nu deel ${step.part} van 3: “${part?.heading ?? `Deel ${step.part}`}” (${length}).${points} Heeft de student net een vraag gesteld, verwijs er dan waar het past kort naar.`;
      break;
    }
    case 'antwoord':
      task = `De student stelt een vraag: “${step.question}”. Beantwoord die (${length}) in je eigen stijl, eerlijk en concreet. Sluit af met een zin die terugleidt naar het college; begin nog niet aan het volgende deel.`;
      break;
    case 'conclusie':
      task = [
        `Schrijf nu de conclusie (${length}) met precies deze opbouw:`,
        `1. Eén of twee alinea's die de hoofdvraag beantwoorden.`,
        `2. Een regel “**Kernlessen**”, gevolgd door drie genummerde kernlessen (1., 2., 3.), elk één zin.`,
        `3. Een regel “**Denkvraag**”, gevolgd door één vraag om over na te denken.`,
        `Geen leestips: die toont de app.`,
      ].join('\n');
      break;
  }
  return [`[App: ${task}`, context ? `\n${context}]` : ']'].join('');
}

export function lectureSegmentRequest(
  context: LectureContext,
  step: SegmentStep,
  previous: {
    segments: readonly LectureSegment[];
    questions: readonly { afterSegment: number; text: string }[];
  },
  demo: Extract<DemoContext, { kind: 'lecture-segment' }>,
): TextRequest {
  const summary = recap(context.plan, previous.segments, previous.questions);
  return {
    task: 'lecture',
    system: lectureSystem(context),
    messages: [{ role: 'user', content: segmentInstruction(step, context.plan, summary) }],
    demo,
  };
}
