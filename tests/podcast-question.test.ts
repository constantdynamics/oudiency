import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  LISTENER_RULES,
  listenerQuestionInstruction,
  listenerQuestionRequest,
  podcastInstruction,
  podcastRequest,
} from '@/ai/prompts/podcast';
import {
  buildHostCallPrompt,
  buildPodcastCallPrompt,
  hostCallFirstMessage,
  podcastCallFirstMessage,
} from '@/ai/prompts/podcastCall';
import { CRISIS_RESOURCES } from '@/config/app';
import { ALL_FIGURES } from '@/data/figures/all';
import { HOST_THEME } from '@/data/podcastHost';
import type { Figure } from '@/data/types';
import { contrastRatio } from '@/lib/contrast';
import { calleeOf } from '@/podcast/episodeInfo';
import { askQuestion, submitQuestion, toAnswerSegments } from '@/podcast/listenerQuestion';
import { listenerMemory } from '@/podcast/memory';
import { initialPlayerState, usePlayer } from '@/podcast/playerState';
import { useQuestion } from '@/podcast/questionState';
import { initialPodcastState, usePodcastStore } from '@/store/podcastStore';
import { usePostStore } from '@/store/postStore';
import { initialProfile, useProfileStore } from '@/store/profileStore';
import type { PodcastEpisode, Post, Session } from '@/store/schemas';
import { useSessionStore } from '@/store/sessionStore';
import { apiKeyStorage, initialSettings, useSettingsStore } from '@/store/settingsStore';

const engine = vi.hoisted(() => ({ playFrom: vi.fn(async () => {}), warmUp: vi.fn() }));
vi.mock('@/podcast/player', () => engine);

const figure = (id: string) => ALL_FIGURES.find((f) => f.id === id) as Figure;

function episode(patch: Partial<PodcastEpisode> = {}): PodcastEpisode {
  return {
    id: 'e1',
    createdAt: '2026-10-16T10:00:00.000Z',
    title: 'Wat is moed?',
    topic: 'Moed',
    format: 'monoloog',
    figureIds: ['socrates'],
    minutes: 10,
    source: 'aanvraag',
    status: 'klaar',
    segments: [
      { id: 's0', speaker: 'sophie', text: 'Welkom, dit is een AI-simulatie.', kind: 'intro' },
      { id: 's1', speaker: 'socrates', text: 'Wat is moed eigenlijk?', kind: 'deel' },
      { id: 's2', speaker: 'socrates', text: 'Laten we het onderzoeken.', kind: 'deel' },
      { id: 's3', speaker: 'sophie', text: 'Tot de volgende keer.', kind: 'outro' },
    ],
    ...patch,
  };
}

const answer = {
  segments: [
    { speaker: 'sophie', text: 'We hebben een luistervraag van Sanne: is moed aangeleerd?' },
    { speaker: 'socrates', text: 'Een mooie vraag, Sanne. Wat denk je zelf?' },
    { speaker: 'socrates', text: 'Maar laten we teruggaan naar ons onderwerp.' },
  ],
};

function messageResponse(json: unknown): Response {
  return new Response(
    JSON.stringify({
      id: 'msg_test',
      type: 'message',
      role: 'assistant',
      model: 'claude-sonnet-5-5',
      content: [{ type: 'text', text: JSON.stringify(json) }],
      stop_reason: 'end_turn',
      stop_sequence: null,
      usage: { input_tokens: 100, output_tokens: 200 },
    }),
    { status: 200, headers: { 'content-type': 'application/json' } },
  );
}

/** Per test een eigen key: de provider (en zijn fetch) wordt per key bewaard. */
function useOwnKey(name: string) {
  apiKeyStorage.set(`sk-ant-test-vraag-${name}`);
  useSettingsStore.getState().update({ aiSource: 'anthropic-browser' });
}

function session(id: string, figureId: string, summary: string, startedAt: string): Session {
  return {
    id,
    figureId,
    status: 'afgerond',
    summary,
    startedAt,
    endsAt: startedAt,
  } as unknown as Session;
}

beforeEach(() => {
  vi.clearAllMocks();
  usePodcastStore.setState({ ...initialPodcastState(), episodes: [episode()], queue: ['e1'] });
  usePlayer.setState(initialPlayerState(), true);
  useQuestion.setState({ status: 'stil' });
  useProfileStore.setState({ profile: { ...initialProfile(), displayName: 'Sanne' } });
  useSettingsStore.setState({ settings: initialSettings() });
  useSessionStore.setState({ sessions: [] });
  usePostStore.setState({ posts: [] });
});

afterEach(() => {
  vi.unstubAllGlobals();
  apiKeyStorage.clear();
});

describe('de opdracht voor een luistervraag', () => {
  it('wat je net hoorde, wat er hierna komt, de vraag en de regels', () => {
    const text = listenerQuestionInstruction({
      format: 'monoloog',
      figures: [figure('socrates')],
      topic: 'Moed',
      minutes: 10,
      listenerName: 'Sanne',
      heard: [{ speaker: 'Socrates', text: 'Wat is moed eigenlijk?' }],
      next: { speaker: 'Socrates', text: 'Laten we het onderzoeken.' },
      question: 'Is moed aangeleerd?',
    });
    expect(text).toContain('LUISTERAAR: Sanne');
    expect(text).toContain('Socrates: Wat is moed eigenlijk?');
    expect(text).toContain(
      'HIERNA GAAT DE AFLEVERING ZO VERDER: Socrates: Laten we het onderzoeken.',
    );
    expect(text).toContain('DE VRAAG: "Is moed aangeleerd?"');
    expect(text).toContain(LISTENER_RULES);
  });

  it('na inbellen bij Sophie: het gesprek in plaats van een getypte vraag; aan het eind sluit Sophie af', () => {
    const text = listenerQuestionInstruction({
      format: 'gesprek',
      figures: [figure('socrates'), figure('kant')],
      topic: 'Liegen',
      minutes: 10,
      heard: [],
      call: [
        { role: 'host', text: 'Wat wil je de denkers vragen?' },
        { role: 'user', text: 'Mag je liegen om iemand te redden?' },
      ],
    });
    expect(text).toContain('DE LUISTERAAR BELDE IN BIJ SOPHIE');
    expect(text).toContain('Luisteraar: Mag je liegen om iemand te redden?');
    expect(text).toContain('DE AFLEVERING IS HIERNA AFGELOPEN.');
    expect(text).not.toContain('DE VRAAG:');
  });

  it('zelfde systeemprompt als de aflevering (cache), eigen taak', () => {
    const ctx = {
      format: 'monoloog' as const,
      figures: [figure('socrates')],
      topic: 'Moed',
      minutes: 10,
      heard: [],
      question: 'Is moed aangeleerd?',
    };
    const request = listenerQuestionRequest(ctx, 'e1');
    expect(request.system).toEqual(podcastRequest(ctx, 'e1').system);
    expect(request.task).toBe('podcastQuestion');
  });

  it('geheugen (keuze 8c): eerdere sessies en je timeline, ook bij het schrijven van een aflevering', () => {
    useSessionStore.setState({
      sessions: [
        session('a', 'socrates', 'Je sprak over moed op je werk.', '2026-10-10T10:00:00.000Z'),
        session('b', 'kant', 'Over plicht.', '2026-10-11T10:00:00.000Z'),
      ],
    });
    usePostStore.setState({
      posts: [
        {
          id: 'p1',
          text: 'Vandaag nee gezegd tegen mijn baas.',
          tags: [],
          createdAt: '2026-10-15T08:00:00.000Z',
          reactions: [],
        } as Post,
        {
          id: 'p2',
          text: 'Iets zwaars',
          tags: [],
          createdAt: '2026-10-15T09:00:00.000Z',
          reactions: [],
          crisis: true,
        } as Post,
      ],
    });
    const memory = listenerMemory(['socrates']);
    expect(memory.sessions).toEqual([
      { figureId: 'socrates', summaries: ['Je sprak over moed op je werk.'] },
    ]);
    expect(memory.posts).toEqual(['Vandaag nee gezegd tegen mijn baas.']);
    const text = podcastInstruction({
      format: 'monoloog',
      figures: [figure('socrates')],
      topic: 'Moed',
      minutes: 10,
      memory,
    });
    expect(text).toContain('EERDERE SESSIES van de luisteraar met Socrates');
    expect(text).toContain('- Je sprak over moed op je werk.');
    expect(text).toContain('- Vandaag nee gezegd tegen mijn baas.');
    expect(text).not.toContain('Iets zwaars');
  });
});

describe('het antwoord als fragmenten', () => {
  it('vraag, antwoord en terug; onbekende sprekers vallen weg', () => {
    const segments = toAnswerSegments(
      { segments: [...answer.segments, { speaker: 'hegel', text: 'Ik meng me erin.' }] },
      ['socrates'],
    );
    expect(segments.map((s) => [s.speaker, s.kind])).toEqual([
      ['sophie', 'luistervraag'],
      ['socrates', 'antwoord'],
      ['socrates', 'terug'],
    ]);
  });

  it('zonder Sophie vooraan leest zij de vraag toch voor; zonder denker geen antwoord', () => {
    const segments = toAnswerSegments(
      { segments: [{ speaker: 'socrates', text: 'Dat is aangeleerd.' }] },
      ['socrates'],
      'Is moed aangeleerd?',
    );
    expect(segments[0]).toMatchObject({
      speaker: 'sophie',
      text: 'We hebben een luistervraag: Is moed aangeleerd?',
      kind: 'luistervraag',
    });
    expect(segments[1]).toMatchObject({ speaker: 'socrates', kind: 'antwoord' });
    expect(
      toAnswerSegments({ segments: [{ speaker: 'sophie', text: 'Goede vraag!' }] }, ['socrates']),
    ).toEqual([]);
  });
});

describe('een vraag stellen', () => {
  it('terwijl de aflevering speelt: het antwoord komt na het fragment dat nu speelt', async () => {
    useOwnKey('speelt');
    const fetchMock = vi.fn(async () => messageResponse(answer));
    vi.stubGlobal('fetch', fetchMock);
    usePlayer.setState({ episodeId: 'e1', segment: 1, status: 'speelt' });
    await askQuestion('e1', { question: 'Is moed aangeleerd?' });
    const segments = usePodcastStore.getState().episodes[0]!.segments;
    expect(segments.map((s) => s.kind)).toEqual([
      'intro',
      'deel',
      'luistervraag',
      'antwoord',
      'terug',
      'deel',
      'outro',
    ]);
    expect(engine.warmUp).toHaveBeenCalledWith('e1', 2);
    expect(engine.playFrom).not.toHaveBeenCalled();
    const body = JSON.parse(
      String((fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1].body),
    );
    const prompt = body.messages[0].content as string;
    expect(prompt).toContain('DE VRAAG: "Is moed aangeleerd?"');
    expect(prompt).toContain('Socrates: Wat is moed eigenlijk?');
    expect(body.model).toBe('claude-sonnet-5-5');
  });

  it('staat de speler stil, dan speelt het antwoord meteen', async () => {
    useOwnKey('stil');
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => messageResponse(answer)),
    );
    usePodcastStore.getState().setPosition('e1', 2, 4);
    await askQuestion('e1', { question: 'Is moed aangeleerd?' });
    expect(usePodcastStore.getState().episodes[0]!.segments[3]!.kind).toBe('luistervraag');
    expect(engine.playFrom).toHaveBeenCalledWith('e1', 3);
  });

  it('een fout staat zichtbaar bij de vraag; zonder eigen sleutel gaat er niets naar Claude', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    await submitQuestion('e1', { question: 'Is moed aangeleerd?' });
    expect(useQuestion.getState()).toMatchObject({ episodeId: 'e1', status: 'fout' });
    expect(useQuestion.getState().error).toContain('Claude-sleutel');
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('inbellen', () => {
  it('bij één denker bel je die denker, bij een gesprek Sophie', () => {
    expect(calleeOf({ format: 'monoloog', figureIds: ['socrates'] })).toBe('socrates');
    expect(calleeOf({ format: 'interview', figureIds: ['kant'] })).toBe('kant');
    expect(calleeOf({ format: 'gesprek', figureIds: ['socrates', 'kant'] })).toBe('sophie');
  });

  it('de denker aan de lijn: in karakter, met de aflevering als achtergrond en meteen de AI-melding', () => {
    const prompt = buildPodcastCallPrompt({
      figure: figure('socrates'),
      episode: { title: 'Wat is moed?', topic: 'Moed', format: 'monoloog' },
      figures: [figure('socrates')],
      heard: [{ speaker: 'Socrates', text: 'Wat is moed eigenlijk?' }],
      minutes: 5,
      listenerName: 'Sanne',
    });
    expect(prompt).toContain('INBELLEN TIJDENS DE PODCAST');
    expect(prompt).toContain('"Wat is moed?"');
    expect(prompt).toContain('Socrates: Wat is moed eigenlijk?');
    expect(prompt).toContain('De luisteraar heet Sanne');
    expect(podcastCallFirstMessage(figure('socrates'), 'moed')).toContain(
      'AI-simulatie van Socrates',
    );
  });

  it('Sophie neemt de vraag aan en geeft hem door; bij nood de hulplijnen', () => {
    const prompt = buildHostCallPrompt({
      episode: { title: 'Liegen', topic: 'Liegen', format: 'gesprek' },
      figures: [figure('socrates'), figure('kant')],
      heard: [],
      minutes: 5,
    });
    expect(prompt).toContain('Beantwoord de vraag niet zelf');
    expect(prompt).toContain('doorgeeft aan Socrates en Immanuel Kant');
    expect(prompt).toContain(CRISIS_RESOURCES.phone);
    expect(prompt).toContain(CRISIS_RESOURCES.freePhone);
    expect(prompt).toContain(CRISIS_RESOURCES.emergency);
    expect(hostCallFirstMessage()).toContain('AI-presentator');
  });

  it('Sophies medaillon haalt AA-contrast', () => {
    expect(contrastRatio(HOST_THEME.primary, HOST_THEME.surface)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio('#ffffff', HOST_THEME.primary)).toBeGreaterThanOrEqual(4.5);
  });
});
