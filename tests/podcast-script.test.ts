import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FRAME } from '@/ai/prompts/frame';
import {
  PODCAST_RULES,
  podcastInstruction,
  podcastRequest,
  targetWords,
} from '@/ai/prompts/podcast';
import { CORE_IDS } from '@/data/figures';
import { ALL_FIGURES } from '@/data/figures/all';
import type { Figure } from '@/data/types';
import { clock } from '@/lib/clock';
import { dailyEpisodeDue } from '@/podcast/daily';
import { ensureDailyEpisode, writeEpisode } from '@/podcast/podcastAi';
import { cleanSpokenText, FIXED_INTRO, resolveSpeaker, toSegments } from '@/podcast/script';
import { dailyPlan, episodeProblem, newEpisode } from '@/services/podcast.service';
import { useNotificationStore } from '@/store/miscStores';
import { initialPodcastState, usePodcastStore } from '@/store/podcastStore';
import { initialProfile, useProfileStore } from '@/store/profileStore';
import { apiKeyStorage, initialSettings, useSettingsStore } from '@/store/settingsStore';

const figure = (id: string) => ALL_FIGURES.find((f) => f.id === id) as Figure;
const known = new Set(CORE_IDS);
const NOW = new Date(2026, 9, 16, 9, 0).getTime();

beforeEach(() => {
  usePodcastStore.setState(initialPodcastState());
  useProfileStore.setState({ profile: { ...initialProfile(), displayName: 'Sanne' } });
  useSettingsStore.setState({ settings: initialSettings() });
  apiKeyStorage.clear();
  clock.freeze(NOW);
});

afterEach(() => {
  vi.unstubAllGlobals();
  apiKeyStorage.clear();
  clock.setOffset(0);
});

/* ---------- Schrijfopdracht ---------- */

describe('schrijfopdracht', () => {
  it('kader, persona per denker en de vaste podcastregels vooraan (gecachet)', () => {
    const request = podcastRequest(
      {
        format: 'gesprek',
        figures: [figure('socrates'), figure('kant')],
        topic: 'Is liegen ooit goed?',
        minutes: 15,
      },
      'e1',
    );
    expect(request.task).toBe('podcast');
    expect(request.system).toHaveLength(4);
    expect(request.system[0]).toEqual({ text: FRAME, cache: true });
    expect(request.system[3]).toEqual({ text: PODCAST_RULES, cache: true });
    expect(request.system.every((block) => block.cache)).toBe(true);
    expect(request.demo).toEqual({ kind: 'podcast', episodeId: 'e1' });
  });

  it('per aflevering: vorm, onderwerp, lengte in woorden en de toegestane sprekers', () => {
    const text = podcastInstruction({
      format: 'interview',
      figures: [figure('spinoza')],
      topic: 'Vrijheid',
      minutes: 10,
      listenerName: 'Sanne',
      interests: ['vrijheid', 'werk'],
    });
    expect(targetWords(10)).toBe(1500);
    expect(text).toContain('interview (Sophie interviewt de denker)');
    expect(text).toContain('ONDERWERP: Vrijheid');
    expect(text).toContain('rond 1500 woorden');
    expect(text).toContain('sophie (Sophie, presentator), spinoza (Baruch de Spinoza)');
    expect(text).toContain('LUISTERAAR: Sanne');
    expect(text).toContain('vrijheid, werk');
    expect(PODCAST_RULES).toContain('AI-simulatie');
  });
});

/* ---------- Van antwoord naar fragmenten ---------- */

describe('script controleren', () => {
  it('sprekers: id, naam of presentator; onbekend valt weg', () => {
    expect(resolveSpeaker('Sophie', ['kant'])).toBe('sophie');
    expect(resolveSpeaker('presentator', ['kant'])).toBe('sophie');
    expect(resolveSpeaker('KANT', ['kant'])).toBe('kant');
    expect(resolveSpeaker('Immanuel Kant', ['kant'])).toBe('kant');
    expect(resolveSpeaker('Hegel', ['kant'])).toBeUndefined();
  });

  it('opmaak en regieaanwijzingen verdwijnen', () => {
    expect(cleanSpokenText('**Moed** is [lacht] een *deugd*.\n- echt')).toBe(
      'Moed is een deugd. echt',
    );
  });

  it('AI-melding vooraan, soorten fragmenten, en onbekende sprekers eruit', () => {
    const segments = toSegments(
      {
        title: 'Moed',
        segments: [
          { speaker: 'sophie', text: 'Welkom! Dit is een AI-simulatie met Socrates.' },
          { speaker: 'socrates', text: 'Wat is moed eigenlijk?' },
          { speaker: 'plato', text: 'Ik hoor hier niet.' },
          { speaker: 'sophie', text: 'Dank voor het luisteren.' },
        ],
      },
      ['socrates'],
    );
    expect(segments.map((s) => [s.speaker, s.kind])).toEqual([
      ['sophie', 'intro'],
      ['socrates', 'deel'],
      ['sophie', 'outro'],
    ]);
  });

  it('zonder AI-melding zegt Sophie hem toch; zonder denker geen aflevering', () => {
    const segments = toSegments(
      { title: 'x', segments: [{ speaker: 'socrates', text: 'Wat is moed?' }] },
      ['socrates'],
    );
    expect(segments[0]).toMatchObject({ speaker: 'sophie', kind: 'intro', text: FIXED_INTRO });
    expect(
      toSegments({ title: 'x', segments: [{ speaker: 'sophie', text: 'Hallo.' }] }, ['socrates']),
    ).toEqual([]);
  });
});

/* ---------- Aanvragen en de dagaflevering ---------- */

describe('aanvraag', () => {
  const ok = { format: 'monoloog' as const, figureIds: ['socrates'], topic: 'Moed', minutes: 10 };

  it('controleert sleutel, denkers, onderwerp, lengte en crisissignalen', () => {
    expect(episodeProblem(ok, known, true)).toBeUndefined();
    expect(episodeProblem(ok, known, false)).toBe('sleutel');
    expect(episodeProblem({ ...ok, figureIds: ['socrates', 'kant'] }, known, true)).toBe('denkers');
    expect(
      episodeProblem({ ...ok, format: 'gesprek', figureIds: ['kant', 'kant'] }, known, true),
    ).toBe('denkers');
    expect(episodeProblem({ ...ok, figureIds: ['plato'] }, known, true)).toBe('onbekend');
    expect(episodeProblem({ ...ok, topic: 'x' }, known, true)).toBe('onderwerp');
    expect(episodeProblem({ ...ok, minutes: 7 }, known, true)).toBe('lengte');
    expect(episodeProblem({ ...ok, topic: 'ik wil er niet meer zijn' }, known, true)).toBe(
      'crisis',
    );
  });

  it('dagplan: vast per dag, gevolgde denkers voor, gesprek met twee verschillende denkers', () => {
    const input = {
      follows: ['spinoza'],
      known,
      interests: new Map([
        ['vrijheid', 5],
        ['werk', 3],
      ]),
      minutes: 10,
    };
    const plan = dailyPlan('2026-10-16', input);
    expect(dailyPlan('2026-10-16', input)).toEqual(plan);
    expect(plan.figureIds[0]).toBe('spinoza');
    expect(['vrijheid', 'werk']).toContain(plan.topic);
    for (let day = 1; day <= 28; day++) {
      const p = dailyPlan(`2026-11-${String(day).padStart(2, '0')}`, input);
      expect(p.figureIds).toHaveLength(p.format === 'gesprek' ? 2 : 1);
      expect(new Set(p.figureIds).size).toBe(p.figureIds.length);
    }
  });

  it('dagplan zonder interesses: een onderwerp waar de denker bij helpt', () => {
    const plan = dailyPlan('2026-10-16', {
      follows: [],
      known,
      interests: new Map(),
      minutes: 5,
    });
    expect(CORE_IDS).toContain(plan.figureIds[0]);
    expect(plan.topic.length).toBeGreaterThan(2);
  });
});

/* ---------- Schrijven met je eigen sleutel ---------- */

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

const script = {
  title: 'Wat is moed?',
  segments: [
    { speaker: 'sophie', text: 'Welkom bij Oudiency. Dit is een AI-simulatie, met Socrates.' },
    { speaker: 'socrates', text: 'Moed is weten wat je echt moet vrezen.' },
    { speaker: 'sophie', text: 'Neem deze vraag mee: waar was jij laatst moedig?' },
  ],
};

/** Per test een eigen key: de provider (en zijn fetch) wordt per key bewaard. */
function useOwnKey(name: string) {
  apiKeyStorage.set(`sk-ant-test-podcast-${name}`);
  useSettingsStore.getState().update({ aiSource: 'anthropic-browser' });
}

/** Een script met precies de sprekers die de opdracht noemt. */
function scriptFor(init: RequestInit | undefined): unknown {
  const body = JSON.parse(String(init?.body)) as { messages: { content: string }[] };
  const line = body.messages[0]!.content.split('\n').find((l) => l.startsWith('SPREKERS'))!;
  const ids = [...line.matchAll(/(\w+) \(/g)].map((m) => m[1]!).filter((id) => id !== 'sophie');
  return {
    title: 'Aflevering van vandaag',
    segments: [
      { speaker: 'sophie', text: 'Welkom. Dit is een AI-simulatie.' },
      ...ids.map((id) => ({ speaker: id, text: `Hier spreekt ${id}.` })),
      { speaker: 'sophie', text: 'Tot de volgende keer.' },
    ],
  };
}

describe('schrijven', () => {
  it('met je eigen key: titel en fragmenten, status klaar', async () => {
    useOwnKey('klaar');
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => messageResponse(script)),
    );
    const episode = newEpisode(
      { format: 'monoloog', figureIds: ['socrates'], topic: 'Moed', minutes: 5 },
      'aanvraag',
      clock.iso(),
    );
    usePodcastStore.getState().addEpisode(episode);
    await writeEpisode(episode.id);
    const saved = usePodcastStore.getState().episodes[0]!;
    expect(saved.status).toBe('klaar');
    expect(saved.title).toBe('Wat is moed?');
    expect(saved.segments.map((s) => s.kind)).toEqual(['intro', 'deel', 'outro']);
  });

  it('zonder eigen key, of als Claude weigert: status fout met de reden', async () => {
    const episode = newEpisode(
      { format: 'monoloog', figureIds: ['socrates'], topic: 'Moed', minutes: 5 },
      'aanvraag',
      clock.iso(),
    );
    usePodcastStore.getState().addEpisode(episode);
    await writeEpisode(episode.id);
    expect(usePodcastStore.getState().episodes[0]).toMatchObject({
      status: 'fout',
      error: 'Podcasts werken alleen met je eigen Claude-sleutel (Profiel → Instellingen).',
    });

    useOwnKey('tegoed');
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(
            JSON.stringify({
              type: 'error',
              error: { type: 'invalid_request_error', message: 'Your credit balance is too low' },
            }),
            { status: 400, headers: { 'content-type': 'application/json' } },
          ),
      ),
    );
    await writeEpisode(episode.id);
    expect(usePodcastStore.getState().episodes[0]).toMatchObject({
      status: 'fout',
      error: 'Je tegoed bij Anthropic is op, dus Claude kan nu niet antwoorden.',
    });
  });

  it('de aflevering van vandaag: één keer, achteraan in de wachtrij, alleen met eigen key', async () => {
    expect(dailyEpisodeDue(NOW)).toBe(false);
    useOwnKey('dag');
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_input: unknown, init?: RequestInit) => messageResponse(scriptFor(init))),
    );
    expect(dailyEpisodeDue(NOW)).toBe(true);
    usePodcastStore.getState().addEpisode({
      ...newEpisode(
        { format: 'monoloog', figureIds: ['kant'], topic: 'Plicht', minutes: 5 },
        'aanvraag',
        clock.iso(),
      ),
      status: 'klaar',
    });
    usePodcastStore.getState().enqueue(usePodcastStore.getState().episodes[0]!.id, 'nu');
    await ensureDailyEpisode(NOW);
    await ensureDailyEpisode(NOW);
    const { episodes, queue } = usePodcastStore.getState();
    const daily = episodes.filter((e) => e.source === 'dagelijks');
    expect(daily).toHaveLength(1);
    expect(daily[0]).toMatchObject({ day: '2026-10-16', status: 'klaar' });
    expect(queue.at(-1)).toBe(daily[0]!.id);
    expect(dailyEpisodeDue(NOW)).toBe(false);
    // Een melding dat hij klaarstaat (één keer), met een link naar de aflevering.
    const notices = useNotificationStore
      .getState()
      .notifications.filter((n) => n.sourceId === 'podcast:2026-10-16');
    expect(notices).toHaveLength(1);
    expect(notices[0]).toMatchObject({ link: `/podcasts/${daily[0]!.id}`, read: false });
    expect(notices[0]!.text).toContain('Je podcast van vandaag staat klaar');
  });
});
