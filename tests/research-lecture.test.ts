import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type * as AiModule from '@/ai';
import type { StructuredRequest, TextRequest } from '@/ai/provider';
import { lectureContextBlock, planInstruction } from '@/ai/prompts/lecture';
import { ALL_FIGURES } from '@/data/figures/all';
import type { Figure } from '@/data/types';
import { clock } from '@/lib/clock';
import { makeOutput } from '@/research/researchAi';
import { guestParts, nextStep, speakerOf } from '@/services/lecture.service';
import { generateNextSegment, generatePlan } from '@/services/lectureAi';
import { newOutput } from '@/services/research.service';
import { useLectureStore } from '@/store/lectureStore';
import { initialProfile, useProfileStore } from '@/store/profileStore';
import type { Research } from '@/store/researchSchemas';
import { initialResearchState, useResearchStore } from '@/store/researchStore';
import { apiKeyStorage, useSettingsStore } from '@/store/settingsStore';

/** Nep-Claude: onthoudt elke aanvraag; een plan als structured output, anders een stukje tekst. */
const fake = vi.hoisted(() => {
  const requests: { system: string; user: string }[] = [];
  const flatten = (req: { system: { text: string }[]; messages: { content: unknown }[] }) => ({
    system: req.system.map((b) => b.text).join('\n'),
    user: String(req.messages[0]?.content),
  });
  return {
    requests,
    provider: {
      id: 'anthropic-browser' as const,
      async streamText(req: TextRequest, onDelta: (chunk: string) => void) {
        requests.push(flatten(req));
        const who = /Je bent ([^,(]+?)(?: \(|,)/.exec(req.system[1]!.text)?.[1] ?? '?';
        const text = `Dit onderdeel komt van ${who}.`;
        onDelta(text);
        return { text, stopReason: 'end_turn' as const };
      },
      async structured<T>(req: StructuredRequest<T>): Promise<T> {
        requests.push(flatten(req));
        return req.schema.parse({
          title: 'Woede en wijsheid',
          segments: [
            { heading: 'Wat woede is', keyPoints: ['Een oordeel'] },
            { heading: 'De vraag achter de woede', keyPoints: ['Doorvragen'] },
            { heading: 'De plicht', keyPoints: ['Redelijkheid'] },
          ],
          furtherReading: [1],
          tags: ['woede'],
        });
      },
    },
  };
});
vi.mock('@/ai', async (importOriginal) => ({
  ...(await importOriginal<typeof AiModule>()),
  getProvider: () => fake.provider,
  activeProviderId: () => 'anthropic-browser',
}));

const figure = (id: string) => ALL_FIGURES.find((f) => f.id === id) as Figure;
const NOW = new Date(2026, 9, 18, 10, 0).getTime();
const DAY = '2026-10-18';

const RESEARCH: Research = {
  id: 'o1',
  createdAt: '2026-10-18T08:00:00.000Z',
  updatedAt: '2026-10-18T08:01:00.000Z',
  day: DAY,
  question: 'Hoe ga je om met woede?',
  title: 'Omgaan met woede',
  figureIds: ['aurelius', 'socrates', 'kant'],
  status: 'klaar',
  brief: {
    basis: 'bronnen',
    summary: 'Woede is volgens de Stoa een oordeel dat je kunt uitstellen.',
    facts: [{ text: 'Seneca schreef De Ira.', sources: [] }],
    perspectives: [],
    quotes: [],
    caveats: [],
  },
  sources: [],
  outputs: [],
};

beforeEach(() => {
  fake.requests.length = 0;
  clock.freeze(NOW);
  useResearchStore.setState({ ...initialResearchState(), researches: [RESEARCH] });
  useLectureStore.setState({ lectures: [] });
  useProfileStore.setState({ profile: { ...initialProfile(), displayName: 'Sanne' } });
  apiKeyStorage.set('sk-ant-test-college');
  useSettingsStore.getState().update({ aiSource: 'anthropic-browser' });
});

afterEach(() => {
  apiKeyStorage.clear();
  clock.setOffset(0);
});

describe('gastdocenten', () => {
  it('één gast geeft deel 2; twee gasten geven deel 2 en 3; de rest is van de docent', () => {
    const one = { figureId: 'aurelius', guestIds: ['socrates'] };
    expect(guestParts(one)).toEqual([{ part: 2, figureId: 'socrates' }]);
    expect(speakerOf(one, { kind: 'deel', part: 2 })).toBe('socrates');
    expect(speakerOf(one, { kind: 'deel', part: 3 })).toBe('aurelius');
    const two = { figureId: 'aurelius', guestIds: ['socrates', 'kant'] };
    expect(speakerOf(two, { kind: 'deel', part: 1 })).toBe('aurelius');
    expect(speakerOf(two, { kind: 'deel', part: 3 })).toBe('kant');
    expect(speakerOf(two, { kind: 'opening' })).toBe('aurelius');
    expect(speakerOf(two, { kind: 'antwoord', question: 'Waarom?' })).toBe('aurelius');
    expect(speakerOf(two, { kind: 'conclusie' })).toBe('aurelius');
    expect(speakerOf({ figureId: 'kant' }, { kind: 'deel', part: 2 })).toBe('kant');
  });

  it('de opdracht: de docent kondigt de gasten aan, een gast weet wiens college het is', () => {
    const guests = [
      { part: 2, name: 'Socrates' },
      { part: 3, name: 'Immanuel Kant' },
    ];
    const base = { topic: 'Woede', mainQuestion: 'Hoe ga je om met woede?', guests };
    const host = lectureContextBlock({ ...base, figure: figure('aurelius') });
    expect(host).toContain('Gastdocenten: Socrates (deel 2) en Immanuel Kant (deel 3).');
    expect(host).toContain('Kondig ze in de opening kort aan');
    const guest = lectureContextBlock({
      ...base,
      figure: figure('socrates'),
      hostName: 'Marcus Aurelius',
    });
    expect(guest).toContain('Je bent gastdocent in het college van Marcus Aurelius.');
    expect(planInstruction(figure('aurelius'), guests)).toContain(
      'Deel 2 geeft gastdocent Socrates; Deel 3 geeft gastdocent Immanuel Kant',
    );
    expect(
      lectureContextBlock({ ...base, guests: undefined, figure: figure('kant') }),
    ).not.toContain('gastdocent');
  });
});

describe('college uit een onderzoek', () => {
  it('aanmaken: docent en gastdocenten, zonder de daglimiet van colleges', async () => {
    const output = newOutput(
      { form: 'college', figureIds: ['aurelius', 'socrates', 'kant'] },
      clock.iso(),
    );
    useResearchStore.getState().addOutput('o1', output);
    await makeOutput('o1', output.id);
    const lecture = useLectureStore.getState().lectures[0]!;
    expect(lecture).toMatchObject({
      figureId: 'aurelius',
      guestIds: ['socrates', 'kant'],
      researchId: 'o1',
      topic: 'Omgaan met woede',
      mainQuestion: 'Hoe ga je om met woede?',
      status: 'bezig',
      provider: 'anthropic-browser',
    });
    expect(useResearchStore.getState().researches[0]!.outputs[0]).toMatchObject({
      status: 'klaar',
      refId: lecture.id,
    });
    expect(useProfileStore.getState().profile.usageByDate[DAY]?.lectures ?? 0).toBe(0);
    // Uit een onderzoek: geen extra AI-aanroep nodig om het college klaar te zetten.
    expect(fake.requests).toHaveLength(0);
  });

  it('deel voor deel: elke spreker in eigen persona, met de notitie als achtergrond', async () => {
    const output = newOutput(
      { form: 'college', figureIds: ['aurelius', 'socrates', 'kant'] },
      clock.iso(),
    );
    useResearchStore.getState().addOutput('o1', output);
    await makeOutput('o1', output.id);
    const id = useLectureStore.getState().lectures[0]!.id;
    const figures = [figure('aurelius'), figure('socrates'), figure('kant')];

    await generatePlan(id, figures);
    expect(fake.requests[0]!.user).toContain('Deel 2 geeft gastdocent Socrates');
    expect(fake.requests[0]!.system).toContain('ONDERZOEK OP AANVRAAG');

    const speakers: (string | undefined)[] = [];
    while (nextStep(useLectureStore.getState().lectures[0]!).kind !== 'klaar') {
      const segment = await generateNextSegment(id, figures, () => {});
      speakers.push(segment?.figureId);
    }
    // Opening, deel 1–3 en de conclusie: de gasten geven deel 2 en 3.
    expect(speakers).toEqual([undefined, undefined, 'socrates', 'kant', undefined]);
    const segments = useLectureStore.getState().lectures[0]!.segments;
    expect(segments[2]!.text).toBe('Dit onderdeel komt van Socrates.');
    expect(segments[3]!.text).toBe('Dit onderdeel komt van Immanuel Kant.');
    expect(segments[4]!.text).toBe('Dit onderdeel komt van Marcus Aurelius.');

    const guestPrompt = fake.requests[3]!.system;
    expect(guestPrompt).toContain('Je bent gastdocent in het college van Marcus Aurelius.');
    expect(guestPrompt).toContain('ONDERZOEK OP AANVRAAG');
    expect(fake.requests[1]!.system).toContain('Kondig ze in de opening kort aan');
  });
});
