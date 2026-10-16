import { describe, expect, it } from 'vitest';
import { composeStructured, composeText } from '@/ai/demo/compose';
import type { DemoContext } from '@/ai/demoContext';
import { ALL_DEMO_CONTENT } from '@/data/demo/all';
import { ALL_FIGURES, CORE_FIGURES } from '@/data/figures/all';
import { DAILY_QUESTIONS } from '@/data/prompts/daily-questions';
import { ALL_EXAMPLE_LECTURES } from '@/data/seed/lectures/all';
import { EXAMPLE_LECTURES, loadExampleLecture } from '@/data/seed/lectures';
import type { Figure } from '@/data/types';
import { formatIssues, findUnverifiedQuotes } from '@/data/validation';
import { validateAllContent } from '@/data/validateContent';

function clean(text: string): void {
  expect(text.trim().length).toBeGreaterThan(0);
  expect(text).not.toMatch(/\{[a-z]+\}/);
  expect(text).not.toContain('undefined');
  expect(text).not.toMatch(/ {2,}/);
}

describe('vaste inhoud', () => {
  it('valideert zonder fouten (demomodus, voorbeeldcolleges, dagvragen)', () => {
    const errors = validateAllContent().filter((i) => i.level === 'error');
    expect(formatIssues(errors)).toBe('');
  });

  it('heeft demo-inhoud voor alle 8 kerndenkers', () => {
    expect(ALL_DEMO_CONTENT.map((d) => d.figureId).sort()).toEqual(
      CORE_FIGURES.map((f) => f.id).sort(),
    );
  });

  it('heeft ~12 voorbeeldcolleges, minstens één per kerndenker', () => {
    expect(ALL_EXAMPLE_LECTURES.length).toBeGreaterThanOrEqual(12);
    for (const figure of CORE_FIGURES) {
      expect(ALL_EXAMPLE_LECTURES.some((l) => l.figureId === figure.id)).toBe(true);
    }
    expect(EXAMPLE_LECTURES.map((l) => l.id)).toEqual(ALL_EXAMPLE_LECTURES.map((l) => l.id));
  });

  it('laadt een voorbeeldcollege lazy via de index', async () => {
    const lecture = await loadExampleLecture('vb-kant-liegen');
    expect(lecture?.title).toBe('Mag je liegen om iemand te beschermen?');
    expect(await loadExampleLecture('bestaat-niet')).toBeUndefined();
  });

  it('heeft minstens 60 dagvragen in 7 soorten, met bestaande vragenstellers', () => {
    expect(DAILY_QUESTIONS.length).toBeGreaterThanOrEqual(60);
    expect(new Set(DAILY_QUESTIONS.map((q) => q.kind)).size).toBe(7);
    const ids = new Set(ALL_FIGURES.map((f) => f.id));
    for (const q of DAILY_QUESTIONS) for (const a of q.askers) expect(ids.has(a)).toBe(true);
  });
});

describe('citatencontrole (§8.5)', () => {
  const figure = {
    id: 'test',
    quotes: [
      {
        text: 'Een leven zonder onderzoek is voor een mens het leven niet waard.',
        source: 'Plato, Apologie 38a',
        status: 'authentiek',
        translation: 'eigen',
        verified: true,
      },
      {
        text: 'Niet geverifieerd citaat.',
        source: 'Ergens',
        status: 'toegeschreven',
        translation: 'eigen',
        verified: false,
        note: 'twijfelachtig',
      },
    ],
  } as unknown as Figure;

  it('laat een geverifieerd citaat met bron door', () => {
    expect(
      findUnverifiedQuotes(
        'Ik zei: “Een leven zonder onderzoek is voor een mens het leven niet waard.” (Plato, Apologie 38a).',
        figure,
      ),
    ).toEqual([]);
  });

  it('herkent een verzonnen of aangepast citaat', () => {
    expect(
      findUnverifiedQuotes('“Een leven zonder twijfel is niets waard.” (Apologie)', figure),
    ).toHaveLength(1);
    expect(findUnverifiedQuotes('“Niet geverifieerd citaat.” (Ergens)', figure)).toHaveLength(1);
  });

  it('negeert aanhalingen zonder bronvermelding en plaatshouders', () => {
    expect(findUnverifiedQuotes('Je vraag luidt: “{hoofdvraag}” (zie boven)', figure)).toEqual([]);
    expect(findUnverifiedQuotes('Hij zei “hallo” tegen me.', figure)).toEqual([]);
  });
});

describe('demo-engine met de echte teksten', () => {
  const ids = CORE_FIGURES.map((f) => f.id);

  it.each(ids)('%s: openingen, beurten en afronding zijn netjes ingevuld', async (figureId) => {
    const base = { figureId, sessionId: `s-${figureId}`, displayName: 'Anna' };
    clean(await composeText({ kind: 'session-opening', ...base, memory: [] }));
    clean(
      await composeText({
        kind: 'session-opening',
        ...base,
        memory: [],
        topicHint: 'Ik twijfel of ik van baan moet wisselen.',
      }),
    );
    clean(
      await composeText({
        kind: 'session-opening',
        ...base,
        memory: ['moed en twijfel'],
        topicHint: 'Mijn werk',
      }),
    );
    const history: { role: 'user' | 'figure'; text: string }[] = [];
    for (const [turn, remainingMs] of [
      [1, 14 * 60_000],
      [2, 12 * 60_000],
      [3, 9 * 60_000],
      [4, 6 * 60_000],
      [5, 2.5 * 60_000],
      [6, 40_000],
    ] as const) {
      const userText = 'Ik ben bang dat ik de verkeerde keuze maak in mijn werk.';
      const text = await composeText({
        kind: 'session-turn',
        ...base,
        turn,
        remainingMs,
        userText,
        history,
        crisis: false,
      });
      clean(text);
      history.push({ role: 'user', text: userText }, { role: 'figure', text });
    }
    // Geen enkel fragment twee keer achter elkaar in hetzelfde gesprek.
    const figureTexts = history.filter((h) => h.role === 'figure').map((h) => h.text);
    expect(new Set(figureTexts).size).toBe(figureTexts.length);

    const summary = (await composeStructured({
      kind: 'session-summary',
      figureId,
      sessionId: base.sessionId,
      history,
    })) as { summary: string; reflectionQuestion: string };
    clean(summary.summary);
    clean(summary.reflectionQuestion);
  });

  it.each(ids)('%s: een volledig college wordt opgebouwd zonder lege plekken', async (figureId) => {
    const common = {
      figureId,
      lectureId: `l-${figureId}`,
      topic: 'Is sociale media een agora?',
      mainQuestion: 'Maakt het ons wijzer of alleen luider?',
    };
    const plan = (await composeStructured({ kind: 'lecture-plan', ...common })) as {
      title: string;
      segments: { heading: string; keyPoints: string[] }[];
    };
    expect(plan.segments).toHaveLength(3);
    const segment = (ctx: Partial<Extract<DemoContext, { kind: 'lecture-segment' }>>) =>
      composeText({
        kind: 'lecture-segment',
        segmentKind: 'deel',
        partIndex: 1,
        heading: '',
        ...common,
        ...ctx,
      } as DemoContext);
    clean(await segment({ segmentKind: 'opening', partIndex: 0, heading: 'Opening' }));
    for (const [i, part] of plan.segments.entries()) {
      clean(await segment({ segmentKind: 'deel', partIndex: i + 1, heading: part.heading }));
    }
    clean(
      await segment({
        segmentKind: 'antwoord',
        partIndex: 1,
        heading: 'Vraag',
        question: 'Maar wat als iedereen alleen nog zijn eigen mening hoort?',
      }),
    );
    const conclusion = await segment({
      segmentKind: 'conclusie',
      partIndex: 4,
      heading: 'Conclusie',
      blockIds: plan.segments.map((s) => s.heading),
    });
    clean(conclusion);
    expect(conclusion).toContain('**Kernlessen**');
    expect(conclusion).toContain('**Denkvraag**');
  });

  it('timeline-reacties komen alleen van kandidaten, en een crisisbericht krijgt er geen', async () => {
    const candidates = CORE_FIGURES.map((f) => ({ id: f.id, name: f.name, tags: f.tags }));
    for (let i = 0; i < 12; i++) {
      const result = (await composeStructured({
        kind: 'timeline-reactions',
        postId: `p${i}`,
        text: 'Vandaag was ik boos op een collega en ik twijfel of ik eerlijk moet zijn.',
        candidates,
        undiscovered: [],
        allowDiscovery: false,
      })) as { reactions: { figureId: string; type: string; text: string }[] };
      expect(result.reactions.length).toBeLessThanOrEqual(3);
      for (const r of result.reactions) {
        expect(candidates.some((c) => c.id === r.figureId)).toBe(true);
        if (r.type === 'comment') clean(r.text);
      }
    }
    const crisis = (await composeStructured({
      kind: 'timeline-reactions',
      postId: 'crisis',
      text: 'Ik wil er niet meer zijn.',
      candidates,
      undiscovered: [],
      allowDiscovery: true,
    })) as { reactions: unknown[] };
    expect(crisis.reactions).toEqual([]);
  });

  it('de gedachte van de dag komt uit de eigen gedachten van de denker', async () => {
    for (const demo of ALL_DEMO_CONTENT) {
      const thought = await composeText({
        kind: 'thought',
        figureId: demo.figureId,
        dateKey: '2026-10-15',
      });
      expect(demo.thoughts).toContain(thought);
    }
  });
});
