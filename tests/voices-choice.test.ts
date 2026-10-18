import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PODCAST, TTS_MODELS, ttsModelInfo } from '@/config/podcast';
import { hasTag, keepOneTag, stripTags } from '@/podcast/audioTags';
import { clearAudio } from '@/podcast/audioCache';
import { charsForMinutes, formatEur, scriptEur, ttsEur } from '@/podcast/costs';
import { segmentAudio, speakableText } from '@/podcast/speech';
import { chooseAnotherVoice, currentVoiceOf, resetVoice } from '@/podcast/voiceChoice';
import { assignVoices, type LibraryVoice, nextVoice } from '@/podcast/voices';
import { elevenLabsKeyStorage } from '@/store/settingsStore';
import { initialVoiceState, useVoiceStore } from '@/store/voiceStore';
import { createElevenLabsApi } from '@/voice/api';
import { callVoice, hasCallVoice } from '@/voice/setup';

const library: LibraryVoice[] = [
  { voiceId: 'a-oud', name: 'Arthur', gender: 'man', age: 'oud' },
  { voiceId: 'b-oud', name: 'Bernard', gender: 'man', age: 'oud' },
  { voiceId: 'c-midden', name: 'Cas', gender: 'man', age: 'midden' },
  { voiceId: 'd-vrouw', name: 'Daphne', gender: 'vrouw', age: 'midden' },
];

const rawLibrary = {
  voices: library.map((v) => ({
    voice_id: v.voiceId,
    name: v.name,
    category: 'premade',
    labels: {
      gender: v.gender === 'vrouw' ? 'female' : 'male',
      age: v.age === 'oud' ? 'old' : v.age === 'jong' ? 'young' : 'middle_aged',
    },
  })),
};

beforeEach(async () => {
  useVoiceStore.setState(initialVoiceState());
  await clearAudio();
});

afterEach(() => {
  vi.unstubAllGlobals();
  elevenLabsKeyStorage.clear();
});

describe('emotie-aanwijzingen', () => {
  it('één aanwijzing blijft, de rest verdwijnt; onzichtbaar in de tekst', () => {
    expect(keepOneTag('[sighs] Tja. [laughs] Nou [noot 3] ja.')).toBe('[sighs] Tja. Nou ja.');
    expect(stripTags('[sighs] Tja, [laughs] nou ja.')).toBe('Tja, nou ja.');
    expect(hasTag('Gewoon tekst.')).toBe(false);
    expect(hasTag('[whispers] Stil.')).toBe(true);
  });

  it('alleen uitgesproken door een model dat ze begrijpt', () => {
    const text = '[laughs] Wat een *vraag*!';
    expect(speakableText(text, 'eleven_flash_v2_5')).toBe('Wat een vraag!');
    expect(speakableText(text, 'eleven_v4')).toBe('[laughs] Wat een vraag!');
    expect(speakableText(text, 'eleven_v4_turbo')).toBe('[laughs] Wat een vraag!');
    expect(ttsModelInfo('onbekend').id).toBe(PODCAST.defaultTtsModel);
  });

  it('het gekozen model gaat mee naar ElevenLabs; v4 regelt tempo en stabiliteit zelf', async () => {
    const fetchMock = vi.fn(
      async (_url: URL | RequestInfo, _init?: RequestInit) =>
        new Response(new Uint8Array([1]), { headers: { 'content-type': 'audio/mpeg' } }),
    );
    const api = createElevenLabsApi('sk_test', fetchMock as typeof fetch);
    const voice = { voiceId: 'v1', source: 'eigen' as const, stability: 0.4, speed: 0.95 };
    await segmentAudio(api, 'e1', { id: 's1', text: '[sighs] Ja.' }, voice, 'eleven_v4');
    await segmentAudio(api, 'e1', { id: 's1', text: '[sighs] Ja.' }, voice, 'eleven_flash_v2_5');
    const bodies = fetchMock.mock.calls.map(([, init]) => JSON.parse(String(init?.body)));
    expect(bodies[0]).toMatchObject({ model_id: 'eleven_v4', text: '[sighs] Ja.' });
    expect(bodies[0].voice_settings).toBeUndefined();
    expect(bodies[1]).toMatchObject({ model_id: 'eleven_flash_v2_5', text: 'Ja.' });
    expect(bodies[1].voice_settings).toMatchObject({ stability: 0.4, speed: 0.95 });
  });
});

describe("kosten in euro's", () => {
  it('per model, per 10 minuten, en nooit "€ 0,00"', () => {
    expect(charsForMinutes(10)).toBe(9000);
    expect(ttsEur(9000, 'eleven_v4')).toBeCloseTo(9 * 0.08 * PODCAST.usdToEur, 6);
    expect(ttsEur(9000, 'eleven_v4_turbo')).toBeLessThan(ttsEur(9000, 'eleven_v4'));
    expect(formatEur(0.001)).toMatch(/€\s?0,01/);
    expect(scriptEur(10, 1)).toBeGreaterThan(0);
    expect(TTS_MODELS.map((m) => m.id)).toEqual([
      'eleven_flash_v2_5',
      'eleven_v4_turbo',
      'eleven_v4',
    ]);
  });
});

describe('andere stem', () => {
  it('rond en rond door de passende stemmen (eerst zelfde leeftijd, nooit een ander geslacht)', () => {
    const old = { gender: 'man', age: 'oud' } as const;
    expect(nextVoice(old, library, undefined)?.voiceId).toBe('a-oud');
    expect(nextVoice(old, library, 'a-oud')?.voiceId).toBe('b-oud');
    expect(nextVoice(old, library, 'b-oud')?.voiceId).toBe('c-midden');
    expect(nextVoice(old, library, 'c-midden')?.voiceId).toBe('a-oud');
    expect(nextVoice({ gender: 'vrouw', age: 'oud' }, library, 'd-vrouw')?.voiceId).toBe('d-vrouw');
  });

  it('een gekozen stem gaat overal voor, ook boven een ontworpen stem', () => {
    const voices = assignVoices(
      ['socrates', 'kant'],
      { socrates: { voiceId: 'socrates-ontwerp' } },
      library,
      { socrates: { voiceId: 'b-oud' } },
    );
    expect(voices.socrates).toEqual({ voiceId: 'b-oud', source: 'gekozen' });
    expect(voices.kant?.voiceId).not.toBe('b-oud');
  });

  it('kiezen, terug naar automatisch, en een nieuw ontwerp gaat weer voor', async () => {
    elevenLabsKeyStorage.set('sk_test_stemmen');
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify(rawLibrary), { status: 200 })),
    );
    const first = await chooseAnotherVoice('kant');
    expect(first).toMatchObject({ source: 'gekozen' });
    expect(useVoiceStore.getState().overrides?.kant?.voiceId).toBe(first!.voiceId);
    expect(currentVoiceOf('kant', library)).toMatchObject({
      voiceId: first!.voiceId,
      source: 'gekozen',
      name: first!.name,
    });
    const second = await chooseAnotherVoice('kant');
    expect(second!.voiceId).not.toBe(first!.voiceId);
    resetVoice('kant');
    expect(useVoiceStore.getState().overrides?.kant).toBeUndefined();

    useVoiceStore.getState().setOverride('socrates', 'a-oud', 'Arthur');
    useVoiceStore.getState().setVoice('socrates', 'socrates-ontwerp');
    expect(useVoiceStore.getState().overrides?.socrates).toBeUndefined();
  });

  it('bij bellen telt de gekozen stem ook (zonder dat de app het account hoeft te vragen)', async () => {
    useVoiceStore.getState().setOverride('kant', 'c-midden', 'Cas');
    const api = createElevenLabsApi('sk_test', vi.fn() as unknown as typeof fetch);
    expect(await callVoice(api, 'kant')).toBe('c-midden');
    expect(hasCallVoice(useVoiceStore.getState(), 'kant')).toBe(true);
    expect(hasCallVoice(useVoiceStore.getState(), 'hegel')).toBe(false);
  });
});
