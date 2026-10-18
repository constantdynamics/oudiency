import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { clock } from '@/lib/clock';
import type { WikiClient } from '@/research/gather';
import { makeOutput, runResearch } from '@/research/researchAi';
import { isActive } from '@/research/researchState';
import { pageUrl, WikiError } from '@/research/wiki';
import { newOutput, newResearch } from '@/services/research.service';
import { useNotificationStore } from '@/store/miscStores';
import { initialProfile, useProfileStore } from '@/store/profileStore';
import { initialResearchState, useResearchStore } from '@/store/researchStore';
import { apiKeyStorage, initialSettings, useSettingsStore } from '@/store/settingsStore';

const NOW = new Date(2026, 9, 18, 10, 0).getTime();
const DAY = '2026-10-18';

beforeEach(() => {
  useResearchStore.setState(initialResearchState());
  useNotificationStore.setState({ notifications: [] });
  useProfileStore.setState({
    profile: {
      ...initialProfile(),
      displayName: 'Sanne',
      usageByDate: { [DAY]: { sessions: 0, lectures: 0, research: 1 } },
    },
  });
  useSettingsStore.setState({ settings: initialSettings() });
  apiKeyStorage.clear();
  clock.freeze(NOW);
});

afterEach(() => {
  vi.unstubAllGlobals();
  apiKeyStorage.clear();
  clock.setOffset(0);
});

/** Per test een eigen key: de provider (en zijn fetch) wordt per key bewaard. */
function useOwnKey(name: string) {
  apiKeyStorage.set(`sk-ant-test-onderzoek-${name}`);
  useSettingsStore.getState().update({ aiSource: 'anthropic-browser' });
}

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

const QUOTE = 'The best plan is to reject at once the first incentives to anger';

const PLAN = {
  suitable: true,
  reason: '',
  title: '“Omgaan met woede”',
  wikipedia: ['anger', 'Stoicism emotions'],
  wikisource: ['Seneca anger'],
};

const BRIEF = {
  summary: 'Woede is volgens de Stoa een oordeel dat je kunt uitstellen.',
  facts: [{ text: 'Seneca schreef De Ira.', sources: [2] }],
  perspectives: [{ figureId: 'aurelius', angle: 'Kijk naar wat in je macht ligt.' }],
  quotes: [
    { text: QUOTE, source: 2, translation: 'Wijs de eerste prikkels tot woede meteen af' },
    { text: 'Anger is a short madness, said nobody here.', source: 2, translation: 'Verzonnen' },
  ],
  caveats: [],
};

const ESSAY = {
  title: 'Over woede',
  text: 'Ik schreef dit voor mezelf.\n\nWoede vraagt om uitstel.',
  furtherReading: [1, 1, 99],
};

interface Call {
  system: string;
  user: string;
}

/** Nep-Claude: kiest het antwoord bij de taak in de systeemprompt en onthoudt elke aanvraag. */
function stubClaude(overrides: { plan?: unknown; brief?: unknown; essay?: unknown } = {}) {
  const calls: Call[] = [];
  vi.stubGlobal(
    'fetch',
    vi.fn(async (_input: unknown, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body)) as {
        system: { text: string }[];
        messages: { content: string | { text: string }[] }[];
      };
      const system = body.system.map((block) => block.text).join('\n');
      const content = body.messages[0]!.content;
      const user = typeof content === 'string' ? content : content.map((c) => c.text).join('\n');
      calls.push({ system, user });
      if (system.includes('TAAK: ONDERZOEKSPLAN')) return messageResponse(overrides.plan ?? PLAN);
      if (system.includes('TAAK: ONDERZOEKSNOTITIE'))
        return messageResponse(overrides.brief ?? BRIEF);
      return messageResponse(overrides.essay ?? ESSAY);
    }),
  );
  return calls;
}

const wiki: WikiClient = {
  search: async (site) =>
    site === 'wikipedia' ? [{ title: 'Anger' }] : [{ title: 'Of Anger/Book I' }],
  page: async (site, title) => ({
    site,
    title,
    url: pageUrl(site, title),
    ...(site === 'wikisource' ? { author: 'Lucius Annaeus Seneca' } : {}),
    paragraphs: [
      {
        section: '',
        text:
          site === 'wikipedia'
            ? 'Anger is an intense emotional state; the Stoics and Seneca saw it as a judgement.'
            : `${QUOTE}, and to resist its very beginnings.`,
      },
    ],
  }),
};

function addResearch(form: 'tekst' = 'tekst') {
  const research = newResearch(
    {
      question: 'Hoe ga je om met woede?',
      figureIds: ['aurelius', 'socrates'],
      first: { form, figureId: 'aurelius', length: 'kort' },
    },
    NOW,
  );
  useResearchStore.getState().add(research);
  return research;
}

const current = (id: string) => useResearchStore.getState().researches.find((r) => r.id === id)!;

describe('onderzoek uitvoeren', () => {
  it('plan → bronnen → notitie → tekst; citaten gecontroleerd, melding als het klaar is', async () => {
    useOwnKey('alles');
    const calls = stubClaude();
    const research = addResearch();
    await runResearch(research.id, wiki);

    const done = current(research.id);
    expect(done.status).toBe('klaar');
    expect(done.title).toBe('Omgaan met woede');
    expect(done.sources).toEqual([
      { kind: 'wikipedia', title: 'Anger', url: 'https://en.wikipedia.org/wiki/Anger' },
      {
        kind: 'wikisource',
        title: 'Of Anger/Book I',
        url: 'https://en.wikisource.org/wiki/Of_Anger/Book_I',
        author: 'Lucius Annaeus Seneca',
      },
    ]);
    // De brontekst zelf wordt niet bewaard.
    expect(JSON.stringify(done)).not.toContain('resist its very beginnings');
    expect(done.brief?.basis).toBe('bronnen');
    expect(done.brief?.quotes).toEqual([
      { text: QUOTE, translation: 'Wijs de eerste prikkels tot woede meteen af', source: 1 },
    ]);
    expect(done.brief?.facts[0]!.sources).toEqual([1]);

    const essay = done.outputs[0]!;
    expect(essay).toMatchObject({ form: 'tekst', status: 'klaar', title: 'Over woede' });
    expect(essay.furtherReading).toEqual([0]);

    // Drie aanroepen: plan (met de vraag), notitie (met de fragmenten), essay (met de notitie).
    expect(calls).toHaveLength(3);
    expect(calls[0]!.user).toContain('VRAAG: Hoe ga je om met woede?');
    expect(calls[1]!.user).toContain('[2] Wikisource: "Of Anger/Book I"');
    expect(calls[2]!.system).toContain('ESSAY');
    expect(calls[2]!.user).toContain('GECONTROLEERDE CITATEN');
    expect(calls[2]!.user).toContain('Ook Socrates dachten mee');
    expect(calls[2]!.user).not.toContain('said nobody here');

    expect(useNotificationStore.getState().notifications[0]).toMatchObject({
      text: 'Je onderzoek is klaar: “Omgaan met woede”.',
      link: `/onderzoek/${research.id}`,
    });
    expect(isActive(research.id)).toBe(false);
    // Uitzoeken telde al mee bij de aanvraag; uitvoeren telt niet nog eens.
    expect(useProfileStore.getState().profile.usageByDate[DAY]!.research).toBe(1);
  });

  it('Wikipedia en Wikisource niet bereikbaar: verder met wat Claude zelf weet', async () => {
    useOwnKey('offline');
    const calls = stubClaude({ brief: { ...BRIEF, quotes: [] } });
    const offline: WikiClient = {
      search: async () => {
        throw new WikiError('offline');
      },
      page: async () => undefined,
    };
    const research = addResearch();
    await runResearch(research.id, offline);
    expect(current(research.id).status).toBe('klaar');
    expect(current(research.id).brief?.basis).toBe('kennis');
    expect(calls[1]!.user).toContain('Geen fragmenten');
    expect(calls[2]!.user).toContain('alleen algemene kennis');
  });

  it('een ongeschikte vraag: geweigerd, geen notitie, en de dagplek komt terug', async () => {
    useOwnKey('weigeren');
    const calls = stubClaude({
      plan: { ...PLAN, suitable: false, reason: 'Dit gaat over een privépersoon.' },
    });
    const research = addResearch();
    await runResearch(research.id, wiki);
    expect(current(research.id)).toMatchObject({
      status: 'fout',
      refused: true,
      error: 'Dit gaat over een privépersoon.',
    });
    expect(current(research.id).outputs[0]!.status).toBe('fout');
    expect(calls).toHaveLength(1);
    expect(useProfileStore.getState().profile.usageByDate[DAY]!.research).toBe(0);
    // Opnieuw proberen doet dan niets meer.
    await runResearch(research.id, wiki);
    expect(calls).toHaveLength(1);
  });

  it('zonder eigen sleutel of zonder tegoed: fout met de reden; opnieuw proberen kan', async () => {
    const research = addResearch();
    await runResearch(research.id, wiki);
    expect(current(research.id)).toMatchObject({
      status: 'fout',
      error: 'Onderzoek werkt alleen met je eigen Claude-sleutel (Profiel → Instellingen).',
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
    await runResearch(research.id, wiki);
    expect(current(research.id)).toMatchObject({
      status: 'fout',
      error: 'Je tegoed bij Anthropic is op, dus Claude kan nu niet antwoorden.',
    });

    useOwnKey('tegoed-aangevuld');
    stubClaude();
    await runResearch(research.id, wiki);
    expect(current(research.id).status).toBe('klaar');
    expect(current(research.id).outputs[0]!.status).toBe('klaar');
    expect(useProfileStore.getState().profile.usageByDate[DAY]!.research).toBe(1);
  });

  it('nog een vorm uit hetzelfde onderzoek: zonder opnieuw te zoeken', async () => {
    useOwnKey('extra');
    const calls = stubClaude();
    const research = addResearch();
    await runResearch(research.id, wiki);
    expect(calls).toHaveLength(3);

    const extra = newOutput({ form: 'tekst', figureId: 'socrates', length: 'lang' }, clock.iso());
    useResearchStore.getState().addOutput(research.id, extra);
    await makeOutput(research.id, extra.id);
    expect(calls).toHaveLength(4);
    expect(calls[3]!.system).toContain('ESSAY');
    expect(calls[3]!.user).toContain('ongeveer 1500 woorden');
    expect(calls[3]!.user).toContain('Ook Marcus Aurelius dachten mee');
    expect(current(research.id).outputs[1]).toMatchObject({
      status: 'klaar',
      figureIds: ['socrates'],
      length: 'lang',
    });
    expect(useProfileStore.getState().profile.usageByDate[DAY]!.research).toBe(1);
  });
});
