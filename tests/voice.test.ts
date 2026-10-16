import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FRAME } from '@/ai/prompts/frame';
import { asrKeywords, buildCallPrompt, buildFirstMessage, TIME_CUES } from '@/ai/prompts/voice';
import { VOICE } from '@/config/voice';
import { ALL_FIGURES } from '@/data/figures/all';
import type { Figure } from '@/data/types';
import { validateVoiceSpecs } from '@/data/validation';
import { CORE_VOICES } from '@/data/voices';
import { exportData, wipeAllData } from '@/store/dataPortability';
import { storageKey } from '@/store/persist';
import { apiKeyStorage, elevenLabsKeyStorage } from '@/store/settingsStore';
import { initialVoiceState, useVoiceStore } from '@/store/voiceStore';
import { agentPayload } from '@/voice/agentConfig';
import { classifyError, createElevenLabsApi, VoiceApiError } from '@/voice/api';
import {
  CallSession,
  type CallConnection,
  type CallEvents,
  classifyStartError,
} from '@/voice/callSession';
import { createResampler } from '@/voice/resampler';
import { designPreviews, ensureAgent, lookUpCallCost, saveVoice, seedFor } from '@/voice/setup';

const MIN = 60_000;
/** Laat alle openstaande beloftes (ophangen is asynchroon) eerst afronden. */
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));
const figure = (id: string) => ALL_FIGURES.find((f) => f.id === id) as Figure;
const socrates = figure('socrates');

beforeEach(() => {
  useVoiceStore.setState(initialVoiceState());
});

/* ---------- Agent ---------- */

describe('agentconfiguratie', () => {
  it('speelt alle denkers met Claude, in het Nederlands, met strakke privacy', () => {
    const payload = agentPayload();
    const { agent, tts } = payload.conversation_config;
    expect(agent.prompt.llm).toBe('claude-sonnet-5-5');
    expect(payload.conversation_config.agent.prompt).toMatchObject({
      backup_llm_config: { preference: 'override', order: ['claude-haiku-5-5'] },
    });
    expect(agent.language).toBe('nl');
    expect(tts.model_id).toBe('eleven_v4_turbo');
    expect(payload.platform_settings.privacy).toEqual({
      record_voice: false,
      retention_days: 0,
      delete_audio: true,
      delete_transcript_and_pii: true,
    });
    expect(payload.platform_settings.auth.enable_auth).toBe(true);
    expect(payload.conversation_config.conversation.max_duration_seconds).toBeGreaterThanOrEqual(
      (15 + 2 * 5) * 60,
    );
    expect(payload.platform_settings.call_limits.bursting_enabled).toBe(false);
  });

  it('staat per gesprek precies de rol, openingszin, taal, stem en trefwoorden toe', () => {
    expect(agentPayload().platform_settings.overrides.conversation_config_override).toEqual({
      agent: { first_message: true, language: true, prompt: { prompt: true } },
      tts: { voice_id: true, speed: true, stability: true },
      asr: { keywords: true },
    });
  });

  it('de minimale terugval houdt privacy, rol en Claude gelijk', () => {
    const full = agentPayload();
    const minimal = agentPayload({ minimal: true });
    expect(minimal.platform_settings).toEqual(full.platform_settings);
    expect(minimal.conversation_config.agent.prompt.llm).toBe(VOICE.llm);
    expect(minimal.conversation_config.tts.model_id).toBe(VOICE.ttsFallbackModel);
    expect(JSON.stringify(minimal)).not.toContain('soft_timeout_config');
  });
});

/* ---------- Prompt ---------- */

describe('prompt voor bellen', () => {
  it('bouwt op kader en persona, met spraakregels en tijdsignalen', () => {
    const prompt = buildCallPrompt({ figure: socrates, minutes: 15 });
    expect(prompt.startsWith(FRAME)).toBe(true);
    expect(prompt).toContain('GESPROKEN GESPREK');
    expect(prompt).toContain(TIME_CUES.afronden);
    expect(prompt).toContain(TIME_CUES.voorbij);
    expect(prompt).toContain('15 minuten');
    expect(prompt).toContain(socrates.microcopy.farewells[0]);
    expect(prompt).not.toContain('{{');
    expect(prompt).not.toContain('noemd worden');
  });

  it('neemt naam, onderwerp en geheugen alleen op als ze er zijn', () => {
    const prompt = buildCallPrompt({
      figure: socrates,
      minutes: 15,
      studentName: 'Sanne',
      topic: 'moed',
      memory: ['We spraken over twijfel.'],
    });
    expect(prompt).toContain('Sanne genoemd worden');
    expect(prompt).toContain('Waarover de student wil praten: moed');
    expect(prompt).toContain('We spraken over twijfel.');
  });

  it('de openingszin meldt meteen dat het een AI-simulatie is, voor elke kerndenker', () => {
    for (const [id, spec] of Object.entries(CORE_VOICES)) {
      const f = figure(id);
      const first = buildFirstMessage(f, spec);
      const firstSentence = /^(.+?[.!?])\s/.exec(spec.greeting)?.[1] ?? '';
      expect(first.startsWith(firstSentence)).toBe(true);
      expect(first).toContain(`Ik ben een AI-simulatie van ${f.name}.`);
      expect(first.indexOf('AI-simulatie')).toBeLessThan(80);
    }
  });

  it('trefwoorden voor de spraakherkenning: naam en kernbegrippen, zonder dubbelingen', () => {
    const words = asrKeywords(socrates);
    expect(words[0]).toBe('Socrates');
    expect(words.length).toBeLessThanOrEqual(15);
    expect(new Set(words).size).toBe(words.length);
    expect(words).toContain(socrates.keyConcepts[0]?.term);
  });
});

/* ---------- Stemmen ---------- */

describe('stemmen van de kerndenkers', () => {
  it('elke kerndenker heeft een geldige stem', () => {
    expect(validateVoiceSpecs(CORE_VOICES, ALL_FIGURES)).toEqual([]);
  });

  it('vangt citaten, te korte proefteksten en onbekende denkers af', () => {
    const issues = validateVoiceSpecs(
      {
        ...CORE_VOICES,
        socrates: { ...CORE_VOICES.socrates!, sample: '“Kort.”', greeting: 'Hallo {{naam}}' },
        zeus: CORE_VOICES.socrates!,
      },
      ALL_FIGURES,
    );
    const messages = issues.map((i) => i.message).join(' | ');
    expect(messages).toContain('socrates: proeftekst moet 100–1000 tekens zijn');
    expect(messages).toContain('socrates: proeftekst bevat aanhalingstekens');
    expect(messages).toContain('socrates: begroeting bevat {{…}}');
    expect(messages).toContain('zeus: onbekende denker');
  });

  it('vaste seed per denker', () => {
    expect(seedFor('socrates')).toBe(seedFor('socrates'));
    expect(seedFor('socrates')).not.toBe(seedFor('kant'));
  });
});

/* ---------- Gesprek ---------- */

function fakeConnection() {
  const sent = { context: [] as string[], text: [] as string[], muted: [] as boolean[], ended: 0 };
  const connection: CallConnection = {
    end: () => {
      sent.ended += 1;
      return Promise.resolve();
    },
    setMuted: (m) => sent.muted.push(m),
    sendContext: (t) => sent.context.push(t),
    sendText: (t) => sent.text.push(t),
  };
  return { connection, sent };
}

async function liveSession(durationMs = 15 * MIN) {
  let now = 1_000_000;
  let events!: CallEvents;
  const { connection, sent } = fakeConnection();
  const onEnded = vi.fn();
  const session = new CallSession({
    durationMs,
    now: () => now,
    every: () => () => undefined,
    onEnded,
    start: (e) => {
      events = e;
      return Promise.resolve(connection);
    },
  });
  await session.start();
  events.connected('conv_1');
  return {
    session,
    events,
    sent,
    onEnded,
    advance: (ms: number) => {
      now += ms;
      session.tick();
    },
  };
}

describe('belgesprek (CallSession)', () => {
  it('verbindt en rekent de eindtijd vanaf het moment van verbinden', async () => {
    const { session } = await liveSession();
    const state = session.getSnapshot();
    expect(state.status).toBe('live');
    expect(state.conversationId).toBe('conv_1');
    expect((state.endsAt ?? 0) - (state.startedAt ?? 0)).toBe(15 * MIN);
  });

  it('houdt het transcript en de toestand van de denker bij', async () => {
    const { session, events } = await liveSession();
    events.message('agent', 'Wees gegroet! Ik ben een AI-simulatie van Socrates.');
    events.message('user', 'Wat is moed?');
    expect(session.getSnapshot().mode).toBe('denkt');
    events.mode('speaking');
    expect(session.getSnapshot().mode).toBe('spreekt');
    events.message('agent', 'Een mooie vraag. Wat denk jij zelf dat moed is, mijn vriend?');
    events.corrected(
      'Een mooie vraag. Wat denk jij zelf dat moed is, mijn vriend?',
      'Een mooie vraag.',
    );
    events.mode('listening');
    const state = session.getSnapshot();
    expect(state.mode).toBe('luistert');
    expect(state.transcript.map((l) => [l.role, l.text])).toEqual([
      ['figure', 'Wees gegroet! Ik ben een AI-simulatie van Socrates.'],
      ['user', 'Wat is moed?'],
      ['figure', 'Een mooie vraag.'],
    ]);
  });

  it('stuurt tijdsignalen bij 3 en 1 minuut, elk één keer', async () => {
    const { sent, advance } = await liveSession();
    advance(11 * MIN);
    expect(sent.context).toEqual([]);
    advance(1 * MIN);
    expect(sent.context).toEqual([TIME_CUES.afronden]);
    advance(30_000);
    expect(sent.context).toEqual([TIME_CUES.afronden]);
    advance(90_000);
    expect(sent.context).toEqual([TIME_CUES.afronden, TIME_CUES.slot]);
  });

  it('springt de tijd verder (slapende tab), dan alleen het laatste signaal', async () => {
    const { sent, advance } = await liveSession();
    advance(14 * MIN + 30_000);
    expect(sent.context).toEqual([TIME_CUES.slot]);
  });

  it('vraagt aan het eind om een afscheid en hangt op als dat is uitgesproken', async () => {
    const { session, events, sent, advance, onEnded } = await liveSession();
    advance(15 * MIN);
    expect(session.getSnapshot().status).toBe('afscheid');
    expect(sent.text).toEqual([TIME_CUES.voorbij]);
    events.mode('speaking');
    events.message('agent', 'Ik moet nu door naar een andere student.');
    events.mode('listening');
    advance(VOICE.farewellGraceMs);
    await flush();
    const state = session.getSnapshot();
    expect(state.status).toBe('beeindigd');
    expect(state.endReason).toBe('tijd');
    expect(sent.ended).toBe(1);
    expect(onEnded).toHaveBeenCalledTimes(1);
    expect(state.transcript.some((l) => l.role === 'system' && l.text === 'De tijd is om.')).toBe(
      true,
    );
  });

  it('hangt na het afscheid hoe dan ook op na de maximale tijd', async () => {
    const { session, advance } = await liveSession();
    advance(15 * MIN);
    advance(VOICE.farewellMaxMs);
    await flush();
    expect(session.getSnapshot().endReason).toBe('tijd');
  });

  it('stopt meteen bij een crisissignaal', async () => {
    const { session, events, sent, onEnded } = await liveSession();
    events.message('user', 'Eerlijk gezegd wil ik er niet meer zijn.');
    await flush();
    const state = session.getSnapshot();
    expect(state.crisis).toBe(true);
    expect(state.status).toBe('beeindigd');
    expect(state.endReason).toBe('crisis');
    expect(sent.ended).toBe(1);
    expect(onEnded).toHaveBeenCalledTimes(1);
  });

  it('negeert tijdsignalen die als gebruikersbericht terugkomen', async () => {
    const { session, events } = await liveSession();
    events.message('user', TIME_CUES.voorbij);
    expect(session.getSnapshot().transcript).toEqual([]);
  });

  it('dempen en ophangen', async () => {
    const { session, sent, onEnded } = await liveSession();
    session.toggleMute();
    expect(session.getSnapshot().muted).toBe(true);
    session.toggleMute();
    expect(sent.muted).toEqual([true, false]);
    await session.hangUp();
    expect(session.getSnapshot().endReason).toBe('gebruiker');
    expect(onEnded).toHaveBeenCalledTimes(1);
    await session.hangUp();
    expect(sent.ended).toBe(1);
  });

  it('verbinding weggevallen of door ElevenLabs beëindigd', async () => {
    const first = await liveSession();
    first.events.disconnected('error', 'socket dicht');
    expect(first.session.getSnapshot()).toMatchObject({
      status: 'beeindigd',
      endReason: 'verbinding',
      error: { kind: 'verbinding', message: 'socket dicht' },
    });
    const second = await liveSession();
    second.advance(15 * MIN);
    second.events.disconnected('agent');
    expect(second.session.getSnapshot().endReason).toBe('tijd');
  });

  it('ophangen tijdens het verbinden: geen gesprek bewaard, late verbinding wordt gesloten', async () => {
    const { connection, sent } = fakeConnection();
    let resolve!: (c: CallConnection) => void;
    const onEnded = vi.fn();
    const session = new CallSession({
      durationMs: 15 * MIN,
      every: () => () => undefined,
      onEnded,
      start: () => new Promise((r) => (resolve = r)),
    });
    const started = session.start();
    await session.hangUp();
    resolve(connection);
    await started;
    expect(session.getSnapshot().status).toBe('klaar');
    expect(sent.ended).toBe(1);
    expect(onEnded).not.toHaveBeenCalled();
  });

  it('fouten bij het starten worden begrijpelijk', async () => {
    expect(classifyStartError(new DOMException('nee', 'NotAllowedError')).kind).toBe('microfoon');
    expect(classifyStartError(new VoiceApiError('quota', 'op')).kind).toBe('quota');
    expect(classifyStartError(new Error('Permission denied')).kind).toBe('microfoon');
    expect(classifyStartError(new Error('boem')).kind).toBe('verbinding');
    const session = new CallSession({
      durationMs: MIN,
      start: () => Promise.reject(new DOMException('nee', 'NotAllowedError')),
    });
    await session.start();
    expect(session.getSnapshot()).toMatchObject({ status: 'fout', error: { kind: 'microfoon' } });
  });
});

/* ---------- API ---------- */

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('ElevenLabs-API', () => {
  it('herkent de soorten fouten', () => {
    expect(classifyError(401, 'invalid_api_key')).toBe('auth');
    expect(classifyError(401, 'missing_permissions', 'missing the permission user_read')).toBe(
      'permission',
    );
    expect(classifyError(401, 'quota_exceeded')).toBe('quota');
    expect(classifyError(404)).toBe('not_found');
    expect(classifyError(422)).toBe('invalid');
    expect(classifyError(429)).toBe('rate');
    expect(classifyError(503)).toBe('server');
  });

  it('stuurt de sleutel alleen in de header naar api.elevenlabs.io', async () => {
    const fetchMock = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
      void input;
      void init;
      return Promise.resolve(
        jsonResponse(200, {
          tier: 'creator',
          character_count: 1200,
          character_limit: 100000,
          next_character_count_reset_unix: 1_800_000_000,
          currency: 'usd',
        }),
      );
    });
    const api = createElevenLabsApi('sk_test', fetchMock as typeof fetch);
    const info = await api.subscription();
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(String(url)).toBe('https://api.elevenlabs.io/v1/user/subscription');
    expect((init?.headers as Record<string, string>)['xi-api-key']).toBe('sk_test');
    expect(String(url)).not.toContain('sk_test');
    expect(info).toMatchObject({ tier: 'creator', creditsUsed: 1200, creditLimit: 100000 });
    expect(info.resetsAt).toBe(1_800_000_000_000);
  });

  it('stemontwerp: beschrijving, proeftekst, model en compacte voorbeelden', async () => {
    const fetchMock = vi.fn((_input: RequestInfo | URL, _init?: RequestInit) =>
      Promise.resolve(
        jsonResponse(200, {
          previews: [{ audio_base_64: 'AAA', generated_voice_id: 'g1', media_type: 'audio/mpeg' }],
          text: 'x',
        }),
      ),
    );
    const api = createElevenLabsApi('sk_test', fetchMock as typeof fetch);
    const previews = await api.designVoice({ description: 'oud', text: 'tekst', seed: 7 });
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(String(url)).toContain('/v1/text-to-voice/design?output_format=mp3_22050_32');
    expect(JSON.parse(String(init?.body))).toEqual({
      voice_description: 'oud',
      model_id: 'eleven_ttv_v3',
      text: 'tekst',
      seed: 7,
    });
    expect(previews).toEqual([
      {
        generatedVoiceId: 'g1',
        audioBase64: 'AAA',
        mediaType: 'audio/mpeg',
        durationSecs: undefined,
      },
    ]);
  });

  it('netwerkfouten en foutmeldingen van ElevenLabs', async () => {
    const offline = createElevenLabsApi('k', (() =>
      Promise.reject(new TypeError('Failed to fetch'))) as typeof fetch);
    await expect(offline.subscription()).rejects.toMatchObject({ kind: 'network' });
    const denied = createElevenLabsApi('k', (() =>
      Promise.resolve(
        jsonResponse(401, {
          detail: { status: 'missing_permissions', message: 'missing the permission convai_write' },
        }),
      )) as typeof fetch);
    await expect(denied.signedUrl('a')).rejects.toMatchObject({
      kind: 'permission',
      message: 'missing the permission convai_write',
    });
  });
});

/* ---------- Klaarzetten ---------- */

function fakeApi(overrides: Partial<ReturnType<typeof createElevenLabsApi>> = {}) {
  return {
    agentExists: vi.fn(() => Promise.resolve(true)),
    findAgentId: vi.fn(() => Promise.resolve<string | undefined>(undefined)),
    createAgent: vi.fn((_payload: object) => Promise.resolve('agent_nieuw')),
    updateAgent: vi.fn((_id: string, _payload: object) => Promise.resolve()),
    createVoice: vi.fn(() => Promise.resolve('voice_nieuw')),
    deleteVoice: vi.fn(() => Promise.resolve()),
    conversationCost: vi.fn(() => Promise.resolve({})),
    subscription: vi.fn(() =>
      Promise.resolve({ tier: 'creator', creditsUsed: 5000, creditLimit: 100000 }),
    ),
    ...overrides,
  } as unknown as ReturnType<typeof createElevenLabsApi>;
}

describe('klaarzetten', () => {
  it('maakt de agent aan als er nog geen is', async () => {
    const api = fakeApi();
    expect(await ensureAgent(api)).toBe('agent_nieuw');
    expect(api.createAgent).toHaveBeenCalledWith(agentPayload());
    expect(useVoiceStore.getState().agent).toMatchObject({
      id: 'agent_nieuw',
      configVersion: VOICE.agentConfigVersion,
      minimal: false,
    });
  });

  it('valt terug op de minimale configuratie als ElevenLabs de volledige weigert', async () => {
    const createAgent = vi
      .fn()
      .mockRejectedValueOnce(new VoiceApiError('invalid', 'onbekend veld'))
      .mockResolvedValueOnce('agent_simpel');
    const api = fakeApi({ createAgent });
    expect(await ensureAgent(api)).toBe('agent_simpel');
    expect(createAgent).toHaveBeenLastCalledWith(agentPayload({ minimal: true }));
    expect(useVoiceStore.getState().agent?.minimal).toBe(true);
  });

  it('werkt een verouderde agent bij en laat een actuele met rust', async () => {
    useVoiceStore.getState().setAgent({ id: 'agent_oud', configVersion: 0 });
    const api = fakeApi();
    expect(await ensureAgent(api)).toBe('agent_oud');
    expect(api.updateAgent).toHaveBeenCalledWith('agent_oud', agentPayload());
    expect(api.createAgent).not.toHaveBeenCalled();
    const again = fakeApi();
    await ensureAgent(again);
    expect(again.updateAgent).not.toHaveBeenCalled();
  });

  it('een verdwenen agent wordt teruggevonden of opnieuw gemaakt', async () => {
    useVoiceStore.getState().setAgent({ id: 'weg', configVersion: VOICE.agentConfigVersion });
    const api = fakeApi({
      agentExists: vi.fn(() => Promise.resolve(false)),
      findAgentId: vi.fn(() => Promise.resolve('agent_gevonden')),
    });
    expect(await ensureAgent(api)).toBe('agent_gevonden');
    expect(api.updateAgent).toHaveBeenCalledWith('agent_gevonden', agentPayload());
  });

  it('stemontwerp valt terug op het oudere model als v3 wordt geweigerd', async () => {
    const designVoice = vi
      .fn()
      .mockRejectedValueOnce(new VoiceApiError('invalid', 'model niet beschikbaar'))
      .mockResolvedValueOnce([]);
    const api = fakeApi({ designVoice });
    await designPreviews(api, socrates, CORE_VOICES.socrates!, 0);
    expect(designVoice).toHaveBeenLastCalledWith(
      expect.objectContaining({ model: 'eleven_multilingual_ttv_v2', seed: seedFor('socrates') }),
    );
  });

  it('een nieuwe stem vervangt de vorige (die wordt uit het account verwijderd)', async () => {
    useVoiceStore.getState().setVoice('socrates', 'voice_oud');
    const api = fakeApi();
    const previews = [
      { generatedVoiceId: 'g1', audioBase64: '', mediaType: 'audio/mpeg' },
      { generatedVoiceId: 'g2', audioBase64: '', mediaType: 'audio/mpeg' },
    ];
    await saveVoice(api, socrates, CORE_VOICES.socrates!, previews[1]!, previews);
    expect(api.createVoice).toHaveBeenCalledWith({
      name: 'Oudiency · Socrates',
      description: CORE_VOICES.socrates!.design,
      generatedVoiceId: 'g2',
      notSelected: ['g1'],
    });
    expect(useVoiceStore.getState().voices.socrates?.voiceId).toBe('voice_nieuw');
    expect(api.deleteVoice).toHaveBeenCalledWith('voice_oud');
  });

  it('kosten: eerst wat ElevenLabs opgeeft, anders het verschil in tegoed', async () => {
    const sleep = () => Promise.resolve();
    const reported = fakeApi({
      conversationCost: vi
        .fn()
        .mockResolvedValueOnce({ status: 'processing' })
        .mockResolvedValueOnce({ status: 'done', credits: 1840, fiat: 0.42 }),
    });
    expect(await lookUpCallCost(reported, 'c1', 5000, [0, 0, 0], sleep)).toEqual({
      credits: 1840,
      fiat: 0.42,
      source: 'gesprek',
    });
    const deleted = fakeApi({
      conversationCost: vi.fn(() => Promise.reject(new VoiceApiError('not_found', 'weg'))),
      subscription: vi.fn(() =>
        Promise.resolve({ tier: 'creator', creditsUsed: 6500, creditLimit: 100000 }),
      ),
    });
    expect(await lookUpCallCost(deleted, 'c1', 5000, [0, 0], sleep)).toEqual({
      credits: 1500,
      source: 'tegoed',
    });
    expect(useVoiceStore.getState().account?.creditsUsed).toBe(6500);
  });
});

/* ---------- Sleutels en export ---------- */

describe('sleutels', () => {
  it('de ElevenLabs-sleutel gaat nooit mee in een export', () => {
    elevenLabsKeyStorage.set('sk_geheim');
    useVoiceStore.getState().setVoice('socrates', 'voice_1');
    const exported = JSON.stringify(exportData());
    expect(exported).not.toContain('sk_geheim');
    expect(exported).toContain('voice_1');
  });

  it('wissen spaart de sleutels, tenzij je ze ook wilt wissen', () => {
    elevenLabsKeyStorage.set('sk_eleven');
    apiKeyStorage.set('sk-ant');
    localStorage.setItem(storageKey('voice'), '{}');
    wipeAllData({ includeApiKeys: false });
    expect(elevenLabsKeyStorage.get()).toBe('sk_eleven');
    expect(apiKeyStorage.get()).toBe('sk-ant');
    expect(localStorage.getItem(storageKey('voice'))).toBeNull();
    wipeAllData({ includeApiKeys: true });
    expect(elevenLabsKeyStorage.get()).toBeNull();
    expect(apiKeyStorage.get()).toBeNull();
  });
});

/* ---------- Resampler ---------- */

const tone = (freq: number, rate: number, seconds = 0.5) =>
  Float32Array.from({ length: Math.round(rate * seconds) }, (_, i) =>
    Math.sin((2 * Math.PI * freq * i) / rate),
  );
const rms = (data: Float32Array, skip = 100) => {
  let sum = 0;
  let n = 0;
  for (let i = skip; i < data.length - skip; i++) {
    sum += (data[i] ?? 0) ** 2;
    n++;
  }
  return Math.sqrt(sum / n);
};

describe('resampler (microfoon naar 16 kHz)', () => {
  it('48 → 16 kHz: zelfde volume, juiste lengte, ook in kleine stukjes', () => {
    const input = tone(1000, 48_000);
    const whole = createResampler(48_000, 16_000).process(input);
    const streaming = createResampler(48_000, 16_000);
    const parts: number[] = [];
    for (let i = 0; i < input.length; i += 128)
      parts.push(...streaming.process(input.subarray(i, i + 128)));
    expect(parts.length).toBe(whole.length);
    expect(Math.abs(whole.length - 8000)).toBeLessThan(10);
    expect(rms(whole)).toBeCloseTo(Math.SQRT1_2, 2);
    for (let i = 0; i < whole.length; i += 97) expect(parts[i]).toBeCloseTo(whole[i] ?? 0, 5);
  });

  it('44,1 → 16 kHz werkt ook', () => {
    const out = createResampler(44_100, 16_000).process(tone(1000, 44_100));
    expect(Math.abs(out.length - 8000)).toBeLessThan(10);
    expect(rms(out)).toBeCloseTo(Math.SQRT1_2, 2);
  });

  it('onderdrukt tonen boven de nieuwe grens (geen aliasing)', () => {
    const out = createResampler(48_000, 16_000).process(tone(10_000, 48_000));
    expect(rms(out)).toBeLessThan(0.05);
  });
});
