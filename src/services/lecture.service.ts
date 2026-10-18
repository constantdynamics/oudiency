/**
 * Colleges (§7.2): aanvragen (met daglimiet), de volgende stap bepalen, vragen stellen (max. 3),
 * afronden, delen en terugkijken. De AI-kant staat apart in lectureAi.ts (lazy).
 */
import { detectCrisisSignals } from '@/ai/prompts/safety';
import { LIMITS } from '@/config/limits';
import type { ExampleLecture, Figure, KeyWork } from '@/data/types';
import { clock } from '@/lib/clock';
import { localDateKey } from '@/lib/dates';
import { uid } from '@/lib/ids';
import { useLectureStore } from '@/store/lectureStore';
import { useProfileStore } from '@/store/profileStore';
import type { Lecture, LectureSegment } from '@/store/schemas';

export class LectureRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LectureRequestError';
  }
}

export interface LectureRequest {
  figureId: string;
  topic: string;
  mainQuestion: string;
}

/** Een foutmelding bij een ongeldige aanvraag, of `undefined` als alles klopt. */
export function requestProblem({ topic, mainQuestion }: Omit<LectureRequest, 'figureId'>) {
  const { topicMaxLength, mainQuestionMaxLength } = LIMITS.lecture;
  if (!topic.trim()) return 'Geef een onderwerp op.';
  if (topic.trim().length > topicMaxLength)
    return `Het onderwerp is te lang (max. ${topicMaxLength} tekens).`;
  if (!mainQuestion.trim()) return 'Stel één hoofdvraag.';
  if (mainQuestion.trim().length > mainQuestionMaxLength)
    return `De hoofdvraag is te lang (max. ${mainQuestionMaxLength} tekens).`;
  return undefined;
}

/**
 * Vraag een college aan: verbruikt de dagplek (LimitError als die op is) en maakt het college
 * aan. Plan en tekst volgen op de collegepagina.
 */
export function requestLecture(
  request: LectureRequest,
  provider: Lecture['provider'],
  now = clock.now(),
): Lecture {
  const problem = requestProblem(request);
  if (problem) throw new LectureRequestError(problem);
  useProfileStore.getState().consumeUsage('lectures', localDateKey(now));
  const lecture: Lecture = {
    id: uid('college'),
    figureId: request.figureId,
    topic: request.topic.trim(),
    mainQuestion: request.mainQuestion.trim(),
    segments: [],
    questions: [],
    status: 'bezig',
    share: 'privé',
    likedByMe: false,
    createdAt: new Date(now).toISOString(),
    provider,
  };
  useLectureStore.getState().add(lecture);
  return lecture;
}

export function findLecture(id: string): Lecture | undefined {
  return useLectureStore.getState().lectures.find((l) => l.id === id);
}

/* ---------- Het verloop ---------- */

export type LectureStep =
  | { kind: 'plan' }
  | { kind: 'opening' }
  | { kind: 'deel'; part: number }
  | { kind: 'antwoord'; question: string }
  | { kind: 'conclusie' }
  | { kind: 'klaar' };

/** Aantal delen volgens het plan (standaard drie). */
export function partCount(lecture: Pick<Lecture, 'plan'>): number {
  return lecture.plan?.segments.length || 3;
}

/** Een vraag die na het laatste onderdeel is gesteld en nog geen antwoord heeft. */
export function pendingQuestion(lecture: Pick<Lecture, 'segments' | 'questions'>) {
  const last = lecture.segments.length - 1;
  return lecture.questions.find((q) => q.afterSegment === last && last >= 0);
}

/** Wat er nu gemaakt moet worden. */
export function nextStep(lecture: Lecture): LectureStep {
  if (lecture.status === 'afgerond') return { kind: 'klaar' };
  if (!lecture.plan) return { kind: 'plan' };
  if (lecture.segments.length === 0) return { kind: 'opening' };
  const question = pendingQuestion(lecture);
  if (question) return { kind: 'antwoord', question: question.text };
  if (lecture.segments.some((s) => s.kind === 'conclusie')) return { kind: 'klaar' };
  const parts = lecture.segments.filter((s) => s.kind === 'deel').length;
  if (parts < partCount(lecture)) return { kind: 'deel', part: parts + 1 };
  return { kind: 'conclusie' };
}

/**
 * Welke gastdocent welk deel geeft (keuze 1c): één gast neemt deel 2, twee gasten nemen deel 2
 * en 3. De docent van het college opent, geeft de overige delen, beantwoordt vragen en sluit af.
 */
export function guestParts(
  lecture: Pick<Lecture, 'guestIds'>,
): { part: number; figureId: string }[] {
  return (lecture.guestIds ?? []).slice(0, 2).map((figureId, i) => ({ part: i + 2, figureId }));
}

/** Wie een onderdeel geeft: een gastdocent voor zijn deel, anders de docent van het college. */
export function speakerOf(
  lecture: Pick<Lecture, 'figureId' | 'guestIds'>,
  step: LectureStep,
): string {
  if (step.kind !== 'deel') return lecture.figureId;
  return guestParts(lecture).find((g) => g.part === step.part)?.figureId ?? lecture.figureId;
}

/** De kop van een onderdeel: 'Opening', de kop uit het plan, 'Antwoord op je vraag' of 'Conclusie'. */
export function stepHeading(lecture: Pick<Lecture, 'plan'>, step: LectureStep): string {
  switch (step.kind) {
    case 'deel':
      return lecture.plan?.segments[step.part - 1]?.heading ?? `Deel ${step.part}`;
    case 'antwoord':
      return 'Antwoord op je vraag';
    case 'conclusie':
      return 'Conclusie';
    default:
      return 'Opening';
  }
}

export function questionsLeft(lecture: Pick<Lecture, 'questions'>): number {
  return Math.max(0, LIMITS.lecture.maxQuestions - lecture.questions.length);
}

/** Vragen kan na een deel (of na een antwoord), zolang er vragen over zijn. */
export function canAsk(lecture: Lecture): boolean {
  const last = lecture.segments[lecture.segments.length - 1];
  return (
    lecture.status === 'bezig' &&
    questionsLeft(lecture) > 0 &&
    !pendingQuestion(lecture) &&
    (last?.kind === 'deel' || last?.kind === 'antwoord')
  );
}

export type AskResult = 'ok' | 'crisis' | 'leeg' | 'niet-nu';

/**
 * Stel een vraag. Bij een crisissignaal wordt de vraag niet bewaard en niet naar de docent
 * gestuurd: de app toont de hulpkaart (geen rollenspel).
 */
export function askQuestion(lectureId: string, text: string): AskResult {
  const lecture = findLecture(lectureId);
  const question = text.trim().slice(0, LIMITS.lecture.questionMaxLength);
  if (!question) return 'leeg';
  if (detectCrisisSignals(question)) return 'crisis';
  if (!lecture || !canAsk(lecture)) return 'niet-nu';
  useLectureStore.getState().update(lectureId, {
    questions: [
      ...lecture.questions,
      { afterSegment: lecture.segments.length - 1, text: question },
    ],
  });
  return 'ok';
}

/** Voeg een gemaakt onderdeel toe; na de conclusie is het college afgerond. */
export function addSegment(
  lectureId: string,
  segment: Omit<LectureSegment, 'index'>,
  now = clock.now(),
): void {
  const store = useLectureStore.getState();
  const lecture = findLecture(lectureId);
  if (!lecture) return;
  store.appendSegment(lectureId, { ...segment, index: lecture.segments.length });
  if (segment.kind === 'conclusie') {
    store.update(lectureId, { status: 'afgerond', completedAt: new Date(now).toISOString() });
  }
}

/** Voortgang voor de balk: opening, de delen en de conclusie. */
export function lectureProgress(lecture: Lecture): { done: number; total: number } {
  const main = lecture.segments.filter((s) => s.kind !== 'antwoord').length;
  return { done: main, total: partCount(lecture) + 2 };
}

/** Deel op het platform: het college gaat naar de moderatie (§7.5). */
export function submitLecture(lectureId: string, now = clock.now()): boolean {
  const lecture = findLecture(lectureId);
  if (!lecture || lecture.status !== 'afgerond') return false;
  if (lecture.share === 'ingediend' || lecture.share === 'goedgekeurd') return false;
  useLectureStore.getState().update(lectureId, {
    share: 'ingediend',
    submittedAt: new Date(now).toISOString(),
    moderationNote: undefined,
  });
  return true;
}

/* ---------- Lezen en terugkijken ---------- */

/** Alleen echte werken uit het profiel: geldige, unieke indexen, hooguit drie. */
export function furtherReadingWorks(figure: Pick<Figure, 'keyWorks'>, indexes: readonly number[]) {
  const seen = new Set<number>();
  const works: KeyWork[] = [];
  for (const index of indexes) {
    if (!Number.isInteger(index) || seen.has(index)) continue;
    const work = figure.keyWorks[index];
    if (!work) continue;
    seen.add(index);
    works.push(work);
    if (works.length === 3) break;
  }
  return works;
}

/** Nummers (1-gebaseerd, zoals in de prompt) omzetten naar geldige indexen. */
export function readingIndexes(numbers: readonly number[], workCount: number): number[] {
  return [...new Set(numbers.map((n) => Math.round(n) - 1))]
    .filter((i) => i >= 0 && i < workCount)
    .slice(0, 3);
}

/** Eén vorm voor terugkijken: voorbeeldcolleges en je eigen colleges. */
export interface LectureView {
  id: string;
  figureId: string;
  title: string;
  topic: string;
  mainQuestion: string;
  segments: Pick<LectureSegment, 'index' | 'kind' | 'heading' | 'text' | 'figureId'>[];
  questions: { afterSegment: number; text: string }[];
  furtherReading: number[];
  isExample: boolean;
  /** Gastdocenten (een college uit een onderzoek). */
  guestIds?: string[];
  /** Publicatie- of afrondingsdatum (ISO). */
  date: string;
}

export function viewOfExample(lecture: ExampleLecture): LectureView {
  return {
    id: lecture.id,
    figureId: lecture.figureId,
    title: lecture.title,
    topic: lecture.topic,
    mainQuestion: lecture.mainQuestion,
    segments: lecture.segments.map((segment, index) => ({ ...segment, index })),
    questions: [],
    furtherReading: lecture.furtherReading,
    isExample: true,
    date: lecture.publishedAt,
  };
}

export function viewOfLecture(lecture: Lecture): LectureView {
  return {
    id: lecture.id,
    figureId: lecture.figureId,
    title: lecture.plan?.title ?? lecture.topic,
    topic: lecture.topic,
    mainQuestion: lecture.mainQuestion,
    segments: lecture.segments,
    questions: lecture.questions,
    furtherReading: lecture.furtherReading ?? [],
    isExample: false,
    date: lecture.completedAt ?? lecture.createdAt,
    ...(lecture.guestIds?.length ? { guestIds: lecture.guestIds } : {}),
  };
}

export interface Chapter {
  index: number;
  kind: LectureSegment['kind'];
  label: string;
}

/** Waar elk onderdeel begint, in woorden vanaf het begin van het college (voor de afspeelmodus). */
export function wordStarts(counts: readonly number[]): number[] {
  const starts: number[] = [];
  let sum = 0;
  for (const count of counts) {
    starts.push(sum);
    sum += count;
  }
  return starts;
}

/** Het nummer van elk deel (1, 2, 3); `undefined` voor opening, antwoorden en conclusie. */
export function partNumbers(
  segments: readonly Pick<LectureSegment, 'kind'>[],
): (number | undefined)[] {
  let part = 0;
  return segments.map((segment) => (segment.kind === 'deel' ? ++part : undefined));
}

/** Hoofdstukken voor de navigatie: opening, delen, antwoorden op je vragen en de conclusie. */
export function chaptersOf(
  segments: readonly Pick<LectureSegment, 'kind' | 'heading'>[],
): Chapter[] {
  const parts = partNumbers(segments);
  return segments.map((segment, index) => {
    const label =
      segment.kind === 'deel'
        ? `${parts[index]}. ${segment.heading}`
        : segment.kind === 'antwoord'
          ? 'Antwoord op je vraag'
          : segment.heading;
    return { index, kind: segment.kind, label };
  });
}
