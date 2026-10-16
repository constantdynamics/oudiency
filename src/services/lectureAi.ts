/**
 * De AI-kant van een college: het onzichtbare plan (structured output) en de gestreamde
 * onderdelen. Lazy geladen vanaf de collegepagina, zodat de AI-code niet in de startbundel zit.
 */
import { getProvider } from '@/ai';
import { crisisReply, detectCrisisSignals } from '@/ai/prompts/safety';
import {
  type LectureContext,
  lecturePlanRequest,
  lectureSegmentRequest,
  type SegmentStep,
} from '@/ai/prompts/lecture';
import { LecturePlanOutputSchema } from '@/ai/schemas';
import type { Figure } from '@/data/types';
import { useLectureStore } from '@/store/lectureStore';
import type { Lecture, LectureSegment } from '@/store/schemas';
import { addSegment, findLecture, nextStep, readingIndexes, stepHeading } from './lecture.service';

function current(lectureId: string): Lecture {
  const lecture = findLecture(lectureId);
  if (!lecture) throw new Error('College niet gevonden');
  return lecture;
}

function contextOf(lecture: Lecture, figure: Figure, studentName?: string): LectureContext {
  return {
    figure,
    topic: lecture.topic,
    mainQuestion: lecture.mainQuestion,
    plan: lecture.plan,
    studentName,
  };
}

/** Maak het collegeplan (één keer per college). */
export async function generatePlan(
  lectureId: string,
  figure: Figure,
  studentName?: string,
): Promise<void> {
  const lecture = current(lectureId);
  if (lecture.plan) return;
  const request = lecturePlanRequest(contextOf(lecture, figure, studentName), {
    kind: 'lecture-plan',
    figureId: lecture.figureId,
    lectureId: lecture.id,
    topic: lecture.topic,
    mainQuestion: lecture.mainQuestion,
  });
  const plan = await getProvider().structured({ ...request, schema: LecturePlanOutputSchema });
  const segments = plan.segments
    .filter((s) => s.heading.trim())
    .slice(0, 3)
    .map((s) => ({
      heading: s.heading.trim().slice(0, 80),
      keyPoints: s.keyPoints
        .map((p) => p.trim())
        .filter(Boolean)
        .slice(0, 4),
    }));
  if (segments.length === 0) throw new Error('Het plan bevatte geen delen');
  useLectureStore.getState().update(lectureId, {
    plan: { title: plan.title.trim().slice(0, 90) || lecture.topic, segments },
    furtherReading: readingIndexes(plan.furtherReading, figure.keyWorks.length),
    tags: [...new Set(plan.tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean))].slice(
      0,
      4,
    ),
  });
}

/** Index van het onderdeel in de demo (0 = opening, 1–3 = delen, 4 = conclusie). */
function partIndex(lecture: Lecture, step: SegmentStep): number {
  if (step.kind === 'opening') return 0;
  if (step.kind === 'conclusie') return 4;
  if (step.kind === 'deel') return step.part;
  return lecture.segments.filter((s) => s.kind === 'deel').length;
}

/**
 * Schrijf het volgende onderdeel (opening, deel, antwoord of conclusie) en voeg het toe aan het
 * college. Geeft het toegevoegde onderdeel terug, of `undefined` als er niets meer te doen is.
 */
export async function generateNextSegment(
  lectureId: string,
  figure: Figure,
  onDelta: (chunk: string) => void,
  signal?: AbortSignal,
  studentName?: string,
): Promise<Omit<LectureSegment, 'index'> | undefined> {
  const lecture = current(lectureId);
  const next = nextStep(lecture);
  if (next.kind === 'plan' || next.kind === 'klaar') return undefined;
  const step: SegmentStep = next;
  const heading = stepHeading(lecture, step);
  let text: string;
  if (step.kind === 'antwoord' && detectCrisisSignals(step.question)) {
    // Vangnet: vragen met een crisissignaal worden normaal al niet bewaard.
    text = crisisReply(figure.shortName ?? figure.name);
  } else {
    const last = lecture.segments.length - 1;
    const request = lectureSegmentRequest(
      contextOf(lecture, figure, studentName),
      step,
      {
        segments: lecture.segments,
        // De vraag die nu beantwoord wordt, staat al in de opdracht.
        questions: lecture.questions.filter((q) => q.afterSegment < last),
      },
      {
        kind: 'lecture-segment',
        figureId: lecture.figureId,
        lectureId: lecture.id,
        topic: lecture.topic,
        mainQuestion: lecture.mainQuestion,
        segmentKind: step.kind,
        partIndex: partIndex(lecture, step),
        heading,
        question: step.kind === 'antwoord' ? step.question : undefined,
        blockIds: lecture.plan?.segments.map((s) => s.heading),
      },
    );
    const result = await getProvider().streamText(request, onDelta, signal);
    text = result.text.trim();
  }
  if (!text) throw new Error('Leeg onderdeel');
  const segment = { kind: step.kind, heading, text };
  addSegment(lectureId, segment);
  return segment;
}
