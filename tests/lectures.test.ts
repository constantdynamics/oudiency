import { beforeEach, describe, expect, it } from 'vitest';
import { FRAME } from '@/ai/prompts/frame';
import {
  lecturePlanRequest,
  lectureSegmentRequest,
  readingList,
  recap,
  segmentInstruction,
  segmentWordRange,
} from '@/ai/prompts/lecture';
import { ALL_FIGURES } from '@/data/figures/all';
import { ALL_EXAMPLE_LECTURES } from '@/data/seed/lectures/all';
import type { Figure } from '@/data/types';
import { visibleWords } from '@/features/lectures/usePlayback';
import { localDateKey, localDateTime } from '@/lib/dates';
import { takeWords, wordCount } from '@/lib/text';
import {
  addSegment,
  askQuestion,
  canAsk,
  chaptersOf,
  findLecture,
  furtherReadingWorks,
  LectureRequestError,
  lectureProgress,
  nextStep,
  partNumbers,
  questionsLeft,
  readingIndexes,
  requestLecture,
  requestProblem,
  submitLecture,
  viewOfExample,
  wordStarts,
} from '@/services/lecture.service';
import { generateNextSegment, generatePlan } from '@/services/lectureAi';
import { LimitError } from '@/services/limits.service';
import { useLectureStore } from '@/store/lectureStore';
import { initialProfile, useProfileStore } from '@/store/profileStore';
import { useSettingsStore } from '@/store/settingsStore';

const socrates = ALL_FIGURES.find((f) => f.id === 'socrates') as Figure;
const NOW = localDateTime('2026-10-19', '10:00');
const REQUEST = {
  figureId: 'socrates',
  topic: 'Moed in het dagelijks leven',
  mainQuestion: 'Wat is moed, als je geen soldaat bent?',
};

beforeEach(() => {
  useLectureStore.setState({ lectures: [] });
  useProfileStore.setState({ profile: initialProfile() });
  useSettingsStore.getState().update({ devInstantReactions: true, aiSource: 'demo' });
});

/** Een college met plan en de gegeven onderdelen (zonder AI). */
function lectureWith(kinds: ('opening' | 'deel' | 'antwoord' | 'conclusie')[]) {
  useProfileStore.getState().resetUsageDay(localDateKey(NOW));
  const lecture = requestLecture(REQUEST, 'demo', NOW);
  useLectureStore.getState().update(lecture.id, {
    plan: {
      title: 'Moed',
      segments: [1, 2, 3].map((n) => ({ heading: `Kop ${n}`, keyPoints: [`Punt ${n}`] })),
    },
  });
  for (const kind of kinds) addSegment(lecture.id, { kind, heading: kind, text: `${kind} tekst` });
  return findLecture(lecture.id)!;
}

/* ---------- Aanvragen ---------- */

describe('aanvraag', () => {
  it('onderwerp en hoofdvraag zijn verplicht en begrensd', () => {
    expect(requestProblem({ topic: '', mainQuestion: 'x' })).toMatch(/onderwerp/);
    expect(requestProblem({ topic: 'x'.repeat(81), mainQuestion: 'x' })).toMatch(/80/);
    expect(requestProblem({ topic: 'x', mainQuestion: ' ' })).toMatch(/hoofdvraag/);
    expect(requestProblem({ topic: 'x', mainQuestion: 'x'.repeat(201) })).toMatch(/200/);
    expect(requestProblem(REQUEST)).toBeUndefined();
    expect(() => requestLecture({ ...REQUEST, topic: '' }, 'demo', NOW)).toThrow(
      LectureRequestError,
    );
  });

  it('één college per dag (Premium 3), en het telt op de dag van de aanvraag', () => {
    const lecture = requestLecture(REQUEST, 'demo', NOW);
    expect(lecture).toMatchObject({ status: 'bezig', share: 'privé', segments: [] });
    expect(useProfileStore.getState().profile.usageByDate[localDateKey(NOW)]?.lectures).toBe(1);
    expect(() => requestLecture(REQUEST, 'demo', NOW)).toThrow(LimitError);
    useProfileStore.setState((s) => ({ profile: { ...s.profile, tier: 'premium' } }));
    requestLecture(REQUEST, 'demo', NOW);
    requestLecture(REQUEST, 'demo', NOW);
    expect(() => requestLecture(REQUEST, 'demo', NOW)).toThrow(LimitError);
  });
});

/* ---------- Verloop ---------- */

describe('verloop', () => {
  it('plan → opening → drie delen → conclusie → klaar', () => {
    const lecture = requestLecture(REQUEST, 'demo', NOW);
    expect(nextStep(lecture)).toEqual({ kind: 'plan' });
    expect(nextStep(lectureWith([]))).toEqual({ kind: 'opening' });
    expect(nextStep(lectureWith(['opening']))).toEqual({ kind: 'deel', part: 1 });
    expect(nextStep(lectureWith(['opening', 'deel', 'deel']))).toEqual({ kind: 'deel', part: 3 });
    expect(nextStep(lectureWith(['opening', 'deel', 'deel', 'deel']))).toEqual({
      kind: 'conclusie',
    });
    const done = lectureWith(['opening', 'deel', 'deel', 'deel', 'conclusie']);
    expect(done.status).toBe('afgerond');
    expect(done.completedAt).toBeDefined();
    expect(nextStep(done)).toEqual({ kind: 'klaar' });
    expect(lectureProgress(done)).toEqual({ done: 5, total: 5 });
  });

  it('vragen na een deel, max. drie, en elke vraag krijgt eerst een antwoord', () => {
    const lecture = lectureWith(['opening']);
    expect(canAsk(lecture)).toBe(false); // na de opening nog niet
    addSegment(lecture.id, { kind: 'deel', heading: 'Kop 1', text: 'deel 1' });
    expect(askQuestion(lecture.id, '  ')).toBe('leeg');
    expect(askQuestion(lecture.id, 'Is moed hetzelfde als durf?')).toBe('ok');
    let current = findLecture(lecture.id)!;
    expect(current.questions).toEqual([{ afterSegment: 1, text: 'Is moed hetzelfde als durf?' }]);
    expect(nextStep(current)).toEqual({
      kind: 'antwoord',
      question: 'Is moed hetzelfde als durf?',
    });
    expect(canAsk(current)).toBe(false); // eerst het antwoord
    addSegment(lecture.id, { kind: 'antwoord', heading: 'Antwoord', text: 'antwoord' });
    current = findLecture(lecture.id)!;
    expect(nextStep(current)).toEqual({ kind: 'deel', part: 2 });
    expect(askQuestion(lecture.id, 'Tweede vraag')).toBe('ok');
    addSegment(lecture.id, { kind: 'antwoord', heading: 'Antwoord', text: 'antwoord' });
    expect(askQuestion(lecture.id, 'Derde vraag')).toBe('ok');
    addSegment(lecture.id, { kind: 'antwoord', heading: 'Antwoord', text: 'antwoord' });
    current = findLecture(lecture.id)!;
    expect(questionsLeft(current)).toBe(0);
    expect(askQuestion(lecture.id, 'Vierde vraag')).toBe('niet-nu');
    // Antwoorden tellen niet mee in de voortgang.
    expect(lectureProgress(current)).toEqual({ done: 2, total: 5 });
  });

  it('een vraag met een crisissignaal gaat niet naar de docent', () => {
    const lecture = lectureWith(['opening', 'deel']);
    expect(askQuestion(lecture.id, 'Ik wil niet meer leven')).toBe('crisis');
    expect(findLecture(lecture.id)?.questions).toEqual([]);
  });

  it('hoofdstukken nummeren de delen; antwoorden staan ertussen', () => {
    const segments = [
      { kind: 'opening' as const, heading: 'Opening' },
      { kind: 'deel' as const, heading: 'Wat is moed?' },
      { kind: 'antwoord' as const, heading: 'Antwoord op je vraag' },
      { kind: 'deel' as const, heading: 'Moed en angst' },
      { kind: 'conclusie' as const, heading: 'Conclusie' },
    ];
    expect(partNumbers(segments)).toEqual([undefined, 1, undefined, 2, undefined]);
    expect(chaptersOf(segments).map((c) => c.label)).toEqual([
      'Opening',
      '1. Wat is moed?',
      'Antwoord op je vraag',
      '2. Moed en angst',
      'Conclusie',
    ]);
  });

  it('delen op het platform kan alleen met een afgerond college', () => {
    const open = lectureWith(['opening']);
    expect(submitLecture(open.id, NOW)).toBe(false);
    const done = lectureWith(['opening', 'deel', 'deel', 'deel', 'conclusie']);
    expect(submitLecture(done.id, NOW)).toBe(true);
    expect(findLecture(done.id)).toMatchObject({ share: 'ingediend' });
    expect(submitLecture(done.id, NOW)).toBe(false);
  });
});

/* ---------- Verder lezen ---------- */

describe('verder lezen', () => {
  it('alleen echte werken uit het profiel', () => {
    expect(readingIndexes([2, 2, 99, 0, -1, 1, 5], 8)).toEqual([1, 0, 4]);
    const works = furtherReadingWorks(socrates, [0, 0, 42, 4]);
    expect(works.map((w) => w.title)).toEqual(['Plato, Apologie', 'Plato, Gorgias']);
  });

  it('de voorbeeldcolleges verwijzen naar bestaande werken', () => {
    for (const lecture of ALL_EXAMPLE_LECTURES) {
      const figure = ALL_FIGURES.find((f) => f.id === lecture.figureId) as Figure;
      expect(furtherReadingWorks(figure, lecture.furtherReading).length).toBe(
        lecture.furtherReading.length,
      );
    }
  });
});

/* ---------- Prompts ---------- */

describe('collegeprompts', () => {
  const context = { figure: socrates, topic: REQUEST.topic, mainQuestion: REQUEST.mainQuestion };

  it('plan: kader en persona cachebaar, genummerde leestips uit WERKEN', () => {
    const request = lecturePlanRequest(context, {
      kind: 'lecture-plan',
      figureId: 'socrates',
      lectureId: 'c1',
      topic: REQUEST.topic,
      mainQuestion: REQUEST.mainQuestion,
    });
    expect(request.task).toBe('lecture');
    expect(request.system[0]?.text).toBe(FRAME);
    expect(request.system.every((b) => b.cache)).toBe(true);
    expect(request.system[2]?.text).toContain(REQUEST.mainQuestion);
    expect(readingList(socrates)).toMatch(/^1\. Plato, Apologie/);
    expect(String(request.messages[0]?.content)).toContain('LEESTIPS');
  });

  it('per onderdeel een opdracht met lengte; de conclusie heeft een vaste opbouw', () => {
    expect(segmentWordRange('opening')).toEqual([210, 260]);
    expect(segmentWordRange('deel')).toEqual([630, 790]);
    expect(segmentWordRange('conclusie')).toEqual([320, 400]);
    const plan = { title: 'Moed', segments: [{ heading: 'Wat is moed?', keyPoints: ['a', 'b'] }] };
    expect(segmentInstruction({ kind: 'deel', part: 1 }, plan, '')).toContain('“Wat is moed?”');
    const conclusion = segmentInstruction({ kind: 'conclusie' }, plan, '');
    expect(conclusion).toContain('**Kernlessen**');
    expect(conclusion).toContain('**Denkvraag**');
    expect(conclusion).toContain('Geen leestips');
    expect(segmentInstruction({ kind: 'antwoord', question: 'Waarom?' }, plan, '')).toContain(
      '“Waarom?”',
    );
  });

  it('de terugblik noemt wat al behandeld is en het slot van het vorige onderdeel', () => {
    const plan = {
      title: 'Moed',
      segments: [
        { heading: 'Een', keyPoints: [] },
        { heading: 'Twee', keyPoints: [] },
      ],
    };
    const text = recap(
      plan,
      [
        { kind: 'opening', heading: 'Opening', text: 'Welkom.' },
        { kind: 'deel', heading: 'Een', text: 'Eerste alinea.\n\nLaatste alinea.' },
      ],
      [{ afterSegment: 1, text: 'Hoezo?' }],
    );
    expect(text).toContain('Al behandeld: “Een”.');
    expect(text).toContain('De student vroeg na “Een”: “Hoezo?”');
    expect(text).toContain('«Laatste alinea.»');
    expect(text).not.toContain('Eerste alinea');
    const request = lectureSegmentRequest(
      { ...context, plan },
      { kind: 'deel', part: 2 },
      { segments: [], questions: [] },
      {
        kind: 'lecture-segment',
        figureId: 'socrates',
        lectureId: 'c1',
        topic: REQUEST.topic,
        mainQuestion: REQUEST.mainQuestion,
        segmentKind: 'deel',
        partIndex: 2,
        heading: 'Twee',
      },
    );
    expect(request.system[2]?.text).toContain('COLLEGEPLAN');
  });
});

/* ---------- Demomodus: een heel college ---------- */

describe('college in de demomodus', () => {
  it('plan, opening, delen, een vraag met antwoord en een conclusie met kernlessen', async () => {
    const lecture = requestLecture(REQUEST, 'demo', NOW);
    await generatePlan(lecture.id, socrates);
    const planned = findLecture(lecture.id)!;
    expect(planned.plan?.segments).toHaveLength(3);
    expect(planned.furtherReading?.length).toBeGreaterThan(0);
    expect(planned.furtherReading?.every((i) => i >= 0 && i < socrates.keyWorks.length)).toBe(true);
    expect(planned.tags?.length).toBeGreaterThan(0);

    const deltas: string[] = [];
    const opening = await generateNextSegment(lecture.id, socrates, (d) => deltas.push(d));
    expect(opening?.kind).toBe('opening');
    expect(opening?.text).toContain(REQUEST.topic);
    expect(deltas.join('')).toBe(opening?.text);

    await generateNextSegment(lecture.id, socrates, () => {});
    expect(askQuestion(lecture.id, 'Is moed hetzelfde als roekeloosheid?')).toBe('ok');
    const answer = await generateNextSegment(lecture.id, socrates, () => {});
    expect(answer).toMatchObject({ kind: 'antwoord', heading: 'Antwoord op je vraag' });
    await generateNextSegment(lecture.id, socrates, () => {});
    await generateNextSegment(lecture.id, socrates, () => {});
    const conclusion = await generateNextSegment(lecture.id, socrates, () => {});
    expect(conclusion?.kind).toBe('conclusie');
    expect(conclusion?.text).toContain('**Kernlessen**');
    expect(conclusion?.text).toContain('**Denkvraag**');

    const done = findLecture(lecture.id)!;
    expect(done.status).toBe('afgerond');
    expect(done.segments.map((s) => s.kind)).toEqual([
      'opening',
      'deel',
      'antwoord',
      'deel',
      'deel',
      'conclusie',
    ]);
    expect(await generateNextSegment(lecture.id, socrates, () => {})).toBeUndefined();
  });
});

/* ---------- Terugkijken ---------- */

describe('terugkijken en afspelen', () => {
  it('voorbeeldcolleges krijgen een vaste weergave', () => {
    const example = ALL_EXAMPLE_LECTURES[0]!;
    const view = viewOfExample(example);
    expect(view).toMatchObject({ isExample: true, title: example.title, questions: [] });
    expect(view.segments.map((s) => s.index)).toEqual(example.segments.map((_, i) => i));
  });

  it('woorden tonen in leestempo, vanaf een ankerpunt', () => {
    expect(takeWords('Een twee\n\ndrie vier', 3)).toBe('Een twee\n\ndrie');
    expect(takeWords('Een twee', 0)).toBe('');
    expect(takeWords('Een twee', 9)).toBe('Een twee');
    expect(wordStarts([10, 0, 5])).toEqual([0, 10, 10]);
    const anchor = { playing: true, at: 1_000, words: 100 };
    expect(visibleWords(anchor, 1_000 + 30_000, 1_000, 220)).toBe(210);
    expect(visibleWords(anchor, 1_000 + 3_600_000, 1_000, 220)).toBe(1_000);
    expect(visibleWords({ ...anchor, playing: false }, 99_999, 1_000, 220)).toBe(100);
    expect(wordCount(ALL_EXAMPLE_LECTURES[0]!.segments[0]!.text)).toBeGreaterThan(50);
  });
});
