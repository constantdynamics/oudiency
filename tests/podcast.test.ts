import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PODCAST } from '@/config/podcast';
import { findMeta } from '@/data/figures';
import { HOST } from '@/data/podcastHost';
import { validateAllContent } from '@/data/validateContent';
import { voiceAge, voiceTypeOf } from '@/data/voiceTypes';
import {
  audioKey,
  audioUsage,
  clearAudio,
  deleteEpisodeAudio,
  getAudio,
  putAudio,
} from '@/podcast/audioCache';
import { estimateCredits, segmentAudio, speakableText } from '@/podcast/speech';
import {
  assignVoices,
  type LibraryVoice,
  libraryVoicesFrom,
  pickLibraryVoice,
} from '@/podcast/voices';
import { initialPodcastState, moveItem, placeInQueue, usePodcastStore } from '@/store/podcastStore';
import type { PodcastEpisode, PodcastSegment } from '@/store/schemas';
import { createElevenLabsApi } from '@/voice/api';

function episode(id: string, segments: PodcastSegment[] = []): PodcastEpisode {
  return {
    id,
    createdAt: '2026-10-16T10:00:00.000Z',
    title: `Aflevering ${id}`,
    topic: 'Moed',
    format: 'monoloog',
    figureIds: ['socrates'],
    minutes: 10,
    source: 'aanvraag',
    status: 'klaar',
    segments,
  };
}

const segment = (id: string, text = 'Goedemiddag.'): PodcastSegment => ({
  id,
  speaker: 'socrates',
  text,
  kind: 'deel',
});

beforeEach(async () => {
  usePodcastStore.setState(initialPodcastState());
  await clearAudio();
});

/* ---------- Wachtrij en afleveringen ---------- */

describe('wachtrij', () => {
  it('nu, hierna of achteraan, en nooit dubbel', () => {
    expect(placeInQueue(['a', 'b', 'c'], 'x', 'nu')).toEqual(['x', 'a', 'b', 'c']);
    expect(placeInQueue(['a', 'b', 'c'], 'x', 'hierna')).toEqual(['a', 'x', 'b', 'c']);
    expect(placeInQueue(['a', 'b', 'c'], 'x', 'achteraan')).toEqual(['a', 'b', 'c', 'x']);
    expect(placeInQueue(['a', 'b', 'c'], 'c', 'hierna')).toEqual(['a', 'c', 'b']);
    expect(placeInQueue([], 'x', 'hierna')).toEqual(['x']);
  });

  it('verplaatsen binnen de grenzen', () => {
    expect(moveItem(['a', 'b', 'c'], 'c', 0)).toEqual(['c', 'a', 'b']);
    expect(moveItem(['a', 'b', 'c'], 'a', 99)).toEqual(['b', 'c', 'a']);
    expect(moveItem(['a', 'b', 'c'], 'onbekend', 0)).toEqual(['a', 'b', 'c']);
  });

  it('een aflevering verwijderen haalt hem ook uit de wachtrij', () => {
    const store = usePodcastStore.getState();
    store.addEpisode(episode('e1'));
    store.addEpisode(episode('e2'));
    store.enqueue('e1', 'achteraan');
    store.enqueue('e2', 'achteraan');
    usePodcastStore.getState().removeEpisode('e1');
    expect(usePodcastStore.getState().queue).toEqual(['e2']);
    expect(usePodcastStore.getState().episodes.map((e) => e.id)).toEqual(['e2']);
  });

  it('luistervraag invoegen na een fragment en de plek onthouden', () => {
    const store = usePodcastStore.getState();
    store.addEpisode(episode('e1', [segment('s1'), segment('s2')]));
    store.insertSegments('e1', 0, [segment('v1'), segment('a1')]);
    store.setPosition('e1', 2, 12.5);
    const saved = usePodcastStore.getState().episodes[0]!;
    expect(saved.segments.map((s) => s.id)).toEqual(['s1', 'v1', 'a1', 's2']);
    expect(saved.position).toEqual({ segment: 2, seconds: 12.5 });
  });
});

/* ---------- Stemmen ---------- */

describe('stemtypes', () => {
  it('leeftijd uit de levensjaren', () => {
    expect(voiceAge(226, 249)).toBe('jong');
    expect(voiceAge(1632, 1677)).toBe('midden');
    expect(voiceAge(-470, -399)).toBe('oud');
  });

  it('per denker geslacht en leeftijd; alle denkers hebben een stemtype', () => {
    expect(voiceTypeOf(findMeta('wollstonecraft')!)).toEqual({ gender: 'vrouw', age: 'midden' });
    expect(voiceTypeOf(findMeta('besant')!)).toEqual({ gender: 'vrouw', age: 'oud' });
    expect(voiceTypeOf(findMeta('wangbi')!)).toEqual({ gender: 'man', age: 'jong' });
    expect(validateAllContent().filter((i) => i.scope === 'stemtypes')).toEqual([]);
    expect(validateAllContent().filter((i) => i.scope === 'presentator')).toEqual([]);
    expect(HOST.voice.sample).toContain('AI-presentator');
  });
});

const raw = (id: string, gender: string, age: string, category = 'premade') => ({
  voice_id: id,
  name: id,
  category,
  labels: { gender, age },
});

describe('stemmen per spreker', () => {
  const library: LibraryVoice[] = libraryVoicesFrom([
    raw('oud-man-1', 'male', 'old'),
    raw('oud-man-2', 'male', 'old'),
    raw('man-1', 'male', 'middle_aged'),
    raw('vrouw-1', 'female', 'middle aged'),
    raw('jong-man-1', 'male', 'young'),
    raw('eigen-1', 'male', 'old', 'generated'),
  ]);

  it('alleen kant-en-klare stemmen, met genormaliseerde labels', () => {
    expect(library.map((v) => v.voiceId)).not.toContain('eigen-1');
    expect(library.find((v) => v.voiceId === 'vrouw-1')).toMatchObject({
      gender: 'vrouw',
      age: 'midden',
    });
  });

  it('kiest op type, anders op geslacht, anders wat er is', () => {
    const old = pickLibraryVoice({ gender: 'man', age: 'oud' }, library, 'kant');
    expect(['oud-man-1', 'oud-man-2']).toContain(old);
    expect(pickLibraryVoice({ gender: 'vrouw', age: 'oud' }, library, 'besant', new Set())).toBe(
      'vrouw-1',
    );
    expect(pickLibraryVoice({ gender: 'man', age: 'oud' }, [], 'kant')).toBeUndefined();
  });

  it('eigen stem gaat voor; in één aflevering klinkt iedereen anders', () => {
    const voices = assignVoices(
      ['sophie', 'kant', 'hegel', 'socrates'],
      { socrates: { voiceId: 'socrates-eigen' } },
      library,
    );
    expect(voices.socrates).toMatchObject({ voiceId: 'socrates-eigen', source: 'eigen' });
    expect(voices.sophie).toMatchObject({ voiceId: 'vrouw-1', source: 'type' });
    expect(voices.kant?.voiceId).not.toBe(voices.hegel?.voiceId);
    expect(['oud-man-1', 'oud-man-2']).toContain(voices.kant?.voiceId);
    expect(['oud-man-1', 'oud-man-2']).toContain(voices.hegel?.voiceId);
  });

  it('de ontworpen stem van Sophie krijgt haar eigen tempo en stabiliteit', () => {
    const voices = assignVoices(['sophie'], { sophie: { voiceId: 'sophie-eigen' } }, library);
    expect(voices.sophie).toEqual({
      voiceId: 'sophie-eigen',
      source: 'eigen',
      stability: HOST.voice.stability,
      speed: HOST.voice.speed,
    });
  });
});

/* ---------- Spraak en opslag ---------- */

describe('gesproken fragmenten', () => {
  it('vraagt ElevenLabs om één MP3 per fragment, met het goedkope model en Nederlands', async () => {
    const fetchMock = vi.fn(
      async (_input: URL | RequestInfo, _init?: RequestInit) =>
        new Response(new Uint8Array([1, 2, 3]), { headers: { 'content-type': 'audio/mpeg' } }),
    );
    const api = createElevenLabsApi('sk_test', fetchMock as typeof fetch);
    const blob = await api.speech({
      voiceId: 'stem 1',
      text: 'Goedemiddag.',
      model: PODCAST.ttsModel,
      languageCode: 'nl',
      outputFormat: PODCAST.outputFormat,
      settings: { stability: 0.5, speed: 1 },
    });
    expect(blob.size).toBe(3);
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(String(url)).toBe(
      'https://api.elevenlabs.io/v1/text-to-speech/stem%201?output_format=mp3_44100_128',
    );
    expect((init?.headers as Record<string, string>)['xi-api-key']).toBe('sk_test');
    expect(JSON.parse(String(init?.body))).toEqual({
      text: 'Goedemiddag.',
      model_id: 'eleven_flash_v2_5',
      language_code: 'nl',
      voice_settings: { similarity_boost: 0.75, stability: 0.5, speed: 1 },
    });
  });

  it('maakt elk fragment één keer: daarna uit de opslag, en tegelijk gevraagd maar één keer', async () => {
    const fetchMock = vi.fn(
      async () =>
        new Response(new Uint8Array([9, 9]), { headers: { 'content-type': 'audio/mpeg' } }),
    );
    const api = createElevenLabsApi('sk_test', fetchMock as typeof fetch);
    const voice = { voiceId: 'v1', source: 'type' as const };
    const s = segment('s1', 'Wat is *moed*?');
    const [first, second] = await Promise.all([
      segmentAudio(api, 'e1', s, voice),
      segmentAudio(api, 'e1', s, voice),
    ]);
    expect(first.size).toBe(2);
    expect(second).toBe(first);
    await segmentAudio(api, 'e1', s, voice);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    // Zonder opmaak uitgesproken.
    const init = (fetchMock.mock.calls[0] as unknown as [unknown, RequestInit])[1];
    expect(JSON.parse(String(init.body)).text).toBe('Wat is moed?');
    expect(speakableText('Wat is *moed*?')).toBe('Wat is moed?');
  });

  it('schat de kosten in credits (Flash: een halve credit per teken)', () => {
    expect(estimateCredits([segment('s1', 'abcd'), segment('s2', 'ef')])).toBe(3);
  });

  it('opslag op het apparaat: bewaren, per aflevering wissen en alles wissen', async () => {
    await putAudio(audioKey('e1', 's1', 'v1'), new Blob([new Uint8Array(10)]));
    await putAudio(audioKey('e1', 's2', 'v1'), new Blob([new Uint8Array(5)]));
    await putAudio(audioKey('e2', 's1', 'v1'), new Blob([new Uint8Array(1)]));
    expect(await audioUsage()).toEqual({ fragments: 3, bytes: 16 });
    await deleteEpisodeAudio('e1');
    expect(await getAudio(audioKey('e1', 's1', 'v1'))).toBeUndefined();
    expect(await getAudio(audioKey('e2', 's1', 'v1'))).toBeDefined();
    await clearAudio();
    expect(await audioUsage()).toEqual({ fragments: 0, bytes: 0 });
  });
});
