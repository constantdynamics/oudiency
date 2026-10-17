import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { clearAudio } from '@/podcast/audioCache';
import {
  type AudioLike,
  configurePlayer,
  pause,
  play,
  refillQueue,
  setSleep,
  setSpeed,
  skip,
  stop,
} from '@/podcast/player';
import { initialPlayerState, usePlayer } from '@/podcast/playerState';
import { initialPodcastState, usePodcastStore } from '@/store/podcastStore';
import type { PodcastEpisode } from '@/store/schemas';
import { initialVoiceState, useVoiceStore } from '@/store/voiceStore';
import { type ElevenLabsApi, VoiceApiError } from '@/voice/api';

/** Een nep-audio-element: elk fragment duurt 30 seconden. */
class FakeAudio implements AudioLike {
  src = '';
  currentTime = 0;
  duration = Number.NaN;
  readyState = 0;
  playbackRate = 1;
  paused = true;
  private listeners = new Map<string, Set<() => void>>();

  addEventListener(type: string, listener: () => void) {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type)!.add(listener);
  }
  removeEventListener(type: string, listener: () => void) {
    this.listeners.get(type)?.delete(listener);
  }
  emit(type: string) {
    for (const listener of [...(this.listeners.get(type) ?? [])]) listener();
  }
  play() {
    this.paused = false;
    this.emit('play');
    return Promise.resolve();
  }
  pause() {
    this.paused = true;
    this.emit('pause');
  }
  /** Laadt de bron: na een tik is de lengte bekend. */
  load() {
    this.readyState = 0;
    queueMicrotask(() => {
      this.duration = 30;
      this.readyState = 1;
      this.emit('loadedmetadata');
    });
  }
}

let fake: FakeAudio;
let spoken: string[];
let calls: { text: string; voiceId: string; model: string }[];
let speechError: Error | null;

const fakeApi = {
  speech: vi.fn(async (input: { text: string; voiceId: string; model: string }) => {
    if (speechError) throw speechError;
    spoken.push(input.text);
    calls.push({ text: input.text, voiceId: input.voiceId, model: input.model });
    return new Blob([input.text], { type: 'audio/mpeg' });
  }),
  libraryVoices: vi.fn(async () => [
    {
      voice_id: 'oud-man',
      name: 'Oud',
      category: 'premade',
      labels: { gender: 'male', age: 'old' },
    },
    {
      voice_id: 'vrouw',
      name: 'Vrouw',
      category: 'premade',
      labels: { gender: 'female', age: 'middle_aged' },
    },
    {
      voice_id: 'man',
      name: 'Man',
      category: 'premade',
      labels: { gender: 'male', age: 'middle_aged' },
    },
  ]),
} as unknown as ElevenLabsApi;

function episode(id: string, texts: string[]): PodcastEpisode {
  return {
    id,
    createdAt: `2026-10-16T10:0${texts.length}:00.000Z`,
    title: `Aflevering ${id}`,
    topic: 'Moed',
    format: 'monoloog',
    figureIds: ['socrates'],
    minutes: 5,
    source: 'aanvraag',
    status: 'klaar',
    segments: texts.map((text, i) => ({
      id: `${id}-s${i}`,
      speaker: i === 0 ? 'sophie' : 'socrates',
      text,
      kind: i === 0 ? 'intro' : 'deel',
    })),
  };
}

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));
let timers: { run: () => void; ms: number }[];
let now: number;
let key: string | null;

beforeEach(async () => {
  fake = new FakeAudio();
  spoken = [];
  calls = [];
  speechError = null;
  timers = [];
  now = 1_000_000;
  key = 'sk_test';
  await clearAudio();
  usePodcastStore.setState(initialPodcastState());
  useVoiceStore.setState(initialVoiceState());
  usePlayer.setState(initialPlayerState(), true);
  let n = 0;
  configurePlayer({
    audio: () => fake,
    apiKey: () => key,
    createApi: () => fakeApi,
    objectUrl: () => {
      n += 1;
      fake.load();
      return `blob:fragment-${n}`;
    },
    revokeUrl: () => {},
    now: () => now,
    setTimer: (run, ms) => {
      timers.push({ run, ms });
      return timers.length as unknown as ReturnType<typeof setTimeout>;
    },
    clearTimer: () => {
      timers = [];
    },
  });
});

afterEach(() => {
  stop();
  setSleep(null);
});

function add(...episodes: PodcastEpisode[]) {
  for (const e of [...episodes].reverse()) usePodcastStore.getState().addEpisode(e);
  for (const e of episodes) usePodcastStore.getState().enqueue(e.id, 'achteraan');
}

describe('de speler', () => {
  it('speelt fragment voor fragment, met de volgende alvast klaar', async () => {
    add(
      episode('e1', [
        'Welkom, dit is een AI-simulatie.',
        'Wat is moed?',
        'Nog een vraag.',
        'Slot.',
      ]),
    );
    await play('e1');
    expect(usePlayer.getState()).toMatchObject({ episodeId: 'e1', segment: 0, status: 'speelt' });
    await flush();
    // Het eerste fragment plus twee vooruit.
    expect(spoken).toEqual(['Welkom, dit is een AI-simulatie.', 'Wat is moed?', 'Nog een vraag.']);
    fake.emit('ended');
    await flush();
    await flush();
    expect(usePlayer.getState()).toMatchObject({ segment: 1, status: 'speelt' });
    // Sophie en Socrates hebben elk een andere, passende stem.
    expect(fakeApi.libraryVoices).toHaveBeenCalled();
  });

  it('onthoudt waar je was en hervat daar', async () => {
    add(episode('e1', ['Intro.', 'Deel één.', 'Deel twee.']));
    await play('e1');
    fake.emit('ended');
    await flush();
    await flush();
    fake.currentTime = 12;
    pause();
    expect(usePodcastStore.getState().episodes[0]!.position).toEqual({ segment: 1, seconds: 12 });
    stop();
    await play('e1');
    await flush();
    expect(usePlayer.getState()).toMatchObject({ segment: 1, status: 'speelt' });
    expect(fake.currentTime).toBe(12);
  });

  it('15 seconden terug, ook naar het vorige fragment', async () => {
    add(episode('e1', ['Intro.', 'Deel één.', 'Deel twee.']));
    await play('e1');
    fake.emit('ended');
    await flush();
    await flush();
    fake.currentTime = 5;
    await skip(-15);
    await flush();
    // Vorige fragment (30 s lang), 10 seconden voor het eind.
    expect(usePlayer.getState().segment).toBe(0);
    expect(fake.currentTime).toBe(20);
    // En 15 vooruit vanaf 20 s: over de grens, 5 seconden in het volgende fragment.
    await skip(15);
    await flush();
    expect(usePlayer.getState().segment).toBe(1);
    expect(fake.currentTime).toBe(5);
  });

  it('na de laatste aflevering door naar de volgende in de wachtrij', async () => {
    add(episode('e1', ['Intro.', 'Slot.']), episode('e2', ['Intro twee.', 'Slot twee.']));
    await play('e1');
    fake.emit('ended');
    await flush();
    await flush();
    fake.emit('ended');
    await flush();
    await flush();
    await flush();
    const store = usePodcastStore.getState();
    expect(store.episodes.find((e) => e.id === 'e1')!.finishedAt).toBeDefined();
    expect(store.queue).toEqual(['e2']);
    expect(usePlayer.getState()).toMatchObject({ episodeId: 'e2', segment: 0, status: 'speelt' });
  });

  it('slaaptimer: na het eind van de aflevering stoppen, of na zoveel minuten pauze', async () => {
    add(episode('e1', ['Intro.', 'Slot.']), episode('e2', ['Intro twee.']));
    await play('e1');
    setSleep('einde');
    fake.emit('ended');
    await flush();
    await flush();
    fake.emit('ended');
    await flush();
    await flush();
    expect(usePlayer.getState()).toMatchObject({ status: 'stil', sleep: undefined });

    await play('e2');
    setSleep(15);
    expect(usePlayer.getState().sleep?.until).toBe(now + 15 * 60_000);
    expect(timers[0]!.ms).toBe(15 * 60_000);
    timers[0]!.run();
    expect(usePlayer.getState().status).toBe('pauze');
    expect(fake.paused).toBe(true);
  });

  it('snelheid blijft bewaard', async () => {
    add(episode('e1', ['Intro.']));
    await play('e1');
    setSpeed(1.5);
    expect(fake.playbackRate).toBe(1.5);
    expect(usePodcastStore.getState().settings.speed).toBe(1.5);
  });

  it('zonder ElevenLabs-sleutel of bij een weigering: een duidelijke fout', async () => {
    add(episode('e1', ['Intro.', 'Deel.']));
    key = null;
    await play('e1');
    expect(usePlayer.getState().status).toBe('fout');
    expect(usePlayer.getState().error?.message).toContain('ElevenLabs-sleutel');

    key = 'sk_test';
    speechError = new VoiceApiError('permission', 'missing the permission text_to_speech', {
      missing: ['text_to_speech'],
    });
    await play('e1');
    expect(usePlayer.getState().status).toBe('fout');
    expect(usePlayer.getState().error?.voice?.missing).toEqual(['text_to_speech']);
  });

  it('een lege wachtrij vult zich met wat je nog niet hebt afgeluisterd', () => {
    usePodcastStore
      .getState()
      .addEpisode({ ...episode('oud', ['x']), finishedAt: '2026-10-15T10:00:00.000Z' });
    usePodcastStore.getState().addEpisode(episode('nieuw', ['x']));
    usePodcastStore.getState().addEpisode({ ...episode('bezig', ['x']), status: 'schrijven' });
    refillQueue();
    expect(usePodcastStore.getState().queue).toEqual(['nieuw']);
  });

  it('het gekozen stemmodel gaat mee; een andere stem geldt meteen (fragment opnieuw)', async () => {
    usePodcastStore.setState(initialPodcastState());
    add(episode('e1', ['Intro.', 'Wat is moed?', 'Slot.']));
    usePodcastStore.getState().updateSettings({ ttsModel: 'eleven_v4' });
    await play('e1');
    fake.emit('ended');
    await flush();
    await flush();
    expect(usePlayer.getState().segment).toBe(1);
    expect(calls.every((c) => c.model === 'eleven_v4')).toBe(true);
    const before = calls.find((c) => c.text === 'Wat is moed?')!.voiceId;

    fake.currentTime = 7;
    useVoiceStore.getState().setOverride('socrates', 'man', 'Man');
    await flush();
    await flush();
    const again = calls.filter((c) => c.text === 'Wat is moed?');
    expect(again.at(-1)!.voiceId).toBe('man');
    expect(before).not.toBe('man');
    expect(usePlayer.getState()).toMatchObject({ segment: 1, status: 'speelt' });
    expect(fake.currentTime).toBe(7);
  });
});
