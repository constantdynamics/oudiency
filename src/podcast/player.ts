/**
 * De podcastspeler: fragment voor fragment op één audio-element, met de volgende fragmenten
 * alvast klaar, snelheid, 15 seconden terug of vooruit, hervatten waar je was, vanzelf door naar
 * de volgende in de wachtrij, een slaaptimer en bediening op je vergrendelscherm (Media Session).
 * Lazy geladen zodra je iets afspeelt; de toestand staat in playerState.ts.
 */
import { PODCAST } from '@/config/podcast';
import { findMeta } from '@/data/figures';
import { HOST } from '@/data/podcastHost';
import { clock } from '@/lib/clock';
import { usePodcastStore } from '@/store/podcastStore';
import type { PodcastEpisode } from '@/store/schemas';
import { elevenLabsKeyStorage } from '@/store/settingsStore';
import { useVoiceStore } from '@/store/voiceStore';
import { createElevenLabsApi, type ElevenLabsApi, toVoiceError } from '@/voice/api';
import { tp } from '@/i18n/podcast';
import { getAudioElement, type PlayerError, usePlayer } from './playerState';
import { deleteEpisodeAudio } from './audioCache';
import { loadLibrary, segmentAudio } from './speech';
import { assignVoices, type SpeakerVoice } from './voices';

/** Wat de speler van een audio-element gebruikt (in tests een nep-element). */
export interface AudioLike {
  src: string;
  currentTime: number;
  readonly duration: number;
  readonly readyState: number;
  playbackRate: number;
  readonly paused: boolean;
  play(): Promise<void>;
  pause(): void;
  addEventListener(type: string, listener: () => void): void;
  removeEventListener(type: string, listener: () => void): void;
}

interface Deps {
  audio: () => AudioLike;
  apiKey: () => string | null;
  createApi: (key: string) => ElevenLabsApi;
  objectUrl: (blob: Blob) => string;
  revokeUrl: (url: string) => void;
  now: () => number;
  setTimer: (run: () => void, ms: number) => ReturnType<typeof setTimeout>;
  clearTimer: (timer: ReturnType<typeof setTimeout>) => void;
}

let deps: Deps = {
  audio: getAudioElement,
  apiKey: () => elevenLabsKeyStorage.get(),
  createApi: (key) => createElevenLabsApi(key),
  objectUrl: (blob) => URL.createObjectURL(blob),
  revokeUrl: (url) => URL.revokeObjectURL(url),
  now: () => clock.now(),
  setTimer: (run, ms) => setTimeout(run, ms),
  clearTimer: (timer) => clearTimeout(timer),
};

/** Alleen voor tests: vervang het audio-element, de sleutel of de klok. */
export function configurePlayer(overrides: Partial<Deps>): void {
  deps = { ...deps, ...overrides };
  attached = null;
}

let loadToken = 0;
let currentUrl: string | null = null;
let attached: AudioLike | null = null;
let lastSaved = 0;
let sleepTimer: ReturnType<typeof setTimeout> | null = null;
let prepared: {
  episodeId: string;
  key: string;
  api: ElevenLabsApi;
  voices: Record<string, SpeakerVoice>;
} | null = null;
/** Bekende lengtes van fragmenten (voor terugspoelen over een fragmentgrens). */
const durations = new Map<string, number>();

const set = usePlayer.setState;
const get = usePlayer.getState;

/** Het stemmodel dat je na het vergelijken koos (anders het goedkoopste). */
function currentModel(): string {
  return usePodcastStore.getState().settings.ttsModel ?? PODCAST.defaultTtsModel;
}

function episodeById(id: string | undefined): PodcastEpisode | undefined {
  return id ? usePodcastStore.getState().episodes.find((e) => e.id === id) : undefined;
}

function audio(): AudioLike {
  const element = deps.audio();
  if (attached !== element) attach(element);
  return element;
}

function attach(element: AudioLike): void {
  attached = element;
  element.addEventListener('timeupdate', onTimeUpdate);
  element.addEventListener('ended', () => void onSegmentEnded());
  element.addEventListener('pause', onExternalPause);
  element.addEventListener('play', onExternalPlay);
  setupMediaSession();
}

/* ---------- Voorbereiden: sleutel en stemmen ---------- */

async function prepare(episode: PodcastEpisode) {
  const key = deps.apiKey();
  if (!key) throw new PlayerFailure({ message: tp.player.needsKey });
  if (prepared?.episodeId === episode.id && prepared.key === key) return prepared;
  const api = deps.createApi(key);
  const speakers = [...new Set(episode.segments.map((s) => s.speaker))];
  const { voices: designed, overrides = {} } = useVoiceStore.getState();
  const needsLibrary = speakers.some((speaker) => !overrides[speaker] && !designed[speaker]);
  const library = needsLibrary ? await loadLibrary(api, key) : [];
  const voices = assignVoices(speakers, designed, library, overrides);
  if (speakers.some((speaker) => !voices[speaker])) {
    throw new PlayerFailure({ message: tp.player.noVoice });
  }
  prepared = { episodeId: episode.id, key, api, voices };
  return prepared;
}

class PlayerFailure extends Error {
  readonly info: PlayerError;
  constructor(info: PlayerError) {
    super(info.message);
    this.info = info;
  }
}

function errorOf(error: unknown): PlayerError {
  if (error instanceof PlayerFailure) return error.info;
  const voice = toVoiceError(error);
  return { message: tp.player.failed, voice };
}

/* ---------- Laden en spelen ---------- */

function segmentKey(episodeId: string, segmentId: string): string {
  return `${episodeId}/${segmentId}`;
}

function waitForMetadata(element: AudioLike): Promise<void> {
  if (element.readyState >= 1) return Promise.resolve();
  return new Promise((resolve) => {
    const done = () => {
      element.removeEventListener('loadedmetadata', done);
      element.removeEventListener('error', done);
      resolve();
    };
    element.addEventListener('loadedmetadata', done);
    element.addEventListener('error', done);
  });
}

async function load(episode: PodcastEpisode, index: number, startAt: number, autoplay: boolean) {
  const token = ++loadToken;
  const segment = episode.segments[index];
  if (!segment) return;
  set({
    episodeId: episode.id,
    segment: index,
    seconds: startAt,
    duration: durations.get(segmentKey(episode.id, segment.id)) ?? 0,
    status: 'laden',
    error: undefined,
  });
  savePosition(episode.id, index, startAt);
  try {
    const { api, voices } = await prepare(episode);
    const voice = voices[segment.speaker];
    if (!voice) throw new PlayerFailure({ message: tp.player.noVoice });
    const blob = await segmentAudio(api, episode.id, segment, voice, currentModel());
    if (token !== loadToken) return;
    const element = audio();
    if (currentUrl) deps.revokeUrl(currentUrl);
    currentUrl = deps.objectUrl(blob);
    element.src = currentUrl;
    await waitForMetadata(element);
    if (token !== loadToken) return;
    const duration = Number.isFinite(element.duration) ? element.duration : 0;
    if (duration > 0) durations.set(segmentKey(episode.id, segment.id), duration);
    element.currentTime = duration > 0 ? Math.min(startAt, Math.max(0, duration - 0.25)) : 0;
    element.playbackRate = usePodcastStore.getState().settings.speed;
    set({ duration, seconds: element.currentTime });
    updateMediaSession(episode);
    if (autoplay) {
      try {
        await element.play();
        if (token === loadToken) set({ status: 'speelt' });
      } catch {
        // De browser wil eerst een tik (autoplay-beleid): dan staat hij klaar op pauze.
        if (token === loadToken) set({ status: 'pauze' });
      }
    } else {
      set({ status: 'pauze' });
    }
    prefetch(api, episode, voices, index + 1);
  } catch (error) {
    if (token !== loadToken) return;
    set({ status: 'fout', error: errorOf(error) });
  }
}

/** De volgende fragmenten alvast maken (fouten komen vanzelf als je daar bent). */
function prefetch(
  api: ElevenLabsApi,
  episode: PodcastEpisode,
  voices: Record<string, SpeakerVoice>,
  from: number,
): void {
  for (const segment of episode.segments.slice(from, from + PODCAST.prefetchSegments)) {
    const voice = voices[segment.speaker];
    if (voice) segmentAudio(api, episode.id, segment, voice, currentModel()).catch(() => undefined);
  }
}

function startPosition(episode: PodcastEpisode): { segment: number; seconds: number } {
  const position = episode.position;
  if (!position || episode.finishedAt || position.segment >= episode.segments.length) {
    return { segment: 0, seconds: 0 };
  }
  return position;
}

/** Speel een aflevering (of hervat de huidige); hij komt vooraan in de wachtrij. */
export async function play(episodeId?: string): Promise<void> {
  const state = get();
  const targetId = episodeId ?? state.episodeId ?? firstReady();
  const episode = episodeById(targetId);
  if (!episode || episode.status !== 'klaar') return;
  usePodcastStore.getState().enqueue(episode.id, 'nu');
  const element = audio();
  const sameEpisode = state.episodeId === episode.id && state.status !== 'fout';
  if (sameEpisode && currentUrl && state.status === 'pauze') {
    try {
      await element.play();
      set({ status: 'speelt' });
    } catch {
      set({ status: 'pauze' });
    }
    return;
  }
  if (sameEpisode && (state.status === 'speelt' || state.status === 'laden')) return;
  if (state.episodeId && state.episodeId !== episode.id) persistNow();
  const start =
    state.episodeId === episode.id && state.status === 'fout'
      ? { segment: state.segment, seconds: state.seconds }
      : startPosition(episode);
  if (episode.finishedAt)
    usePodcastStore.getState().updateEpisode(episode.id, { finishedAt: undefined });
  await load(episode, start.segment, start.seconds, true);
}

export function pause(): void {
  const element = audio();
  if (get().status === 'laden') loadToken++;
  element.pause();
  if (get().episodeId) set({ status: 'pauze' });
  persistNow();
}

export async function toggle(): Promise<void> {
  if (get().status === 'speelt' || get().status === 'laden') pause();
  else await play();
}

/** 15 seconden terug of vooruit, ook over de grens van een fragment heen. */
export async function skip(delta: number): Promise<void> {
  const state = get();
  const episode = episodeById(state.episodeId);
  if (!episode) return;
  const element = audio();
  const playing = state.status === 'speelt';
  const duration = state.duration || element.duration || 0;
  const target = element.currentTime + delta;
  if (target >= 0 && (duration === 0 || target < duration)) {
    element.currentTime = target;
    set({ seconds: target });
    savePosition(episode.id, state.segment, target);
    return;
  }
  if (target < 0) {
    if (state.segment === 0) {
      element.currentTime = 0;
      set({ seconds: 0 });
      return;
    }
    const previous = episode.segments[state.segment - 1]!;
    const previousDuration = durations.get(segmentKey(episode.id, previous.id)) ?? 0;
    await load(episode, state.segment - 1, Math.max(0, previousDuration + target), playing);
    return;
  }
  if (state.segment + 1 < episode.segments.length) {
    await load(episode, state.segment + 1, Math.max(0, target - duration), playing);
  } else {
    await finishEpisode(episode);
  }
}

export const skipBackward = () => skip(-PODCAST.skipSeconds);
export const skipForward = () => skip(PODCAST.skipSeconds);

export async function goToSegment(index: number): Promise<void> {
  const episodeId = get().episodeId;
  if (episodeId) await playFrom(episodeId, index);
}

/** Speel een aflevering vanaf een bepaald fragment (bijv. vanuit de tekst). */
export async function playFrom(episodeId: string, index: number): Promise<void> {
  const episode = episodeById(episodeId);
  if (!episode || episode.status !== 'klaar') return;
  if (index < 0 || index >= episode.segments.length) return;
  const state = get();
  if (state.episodeId && state.episodeId !== episodeId) persistNow();
  const store = usePodcastStore.getState();
  store.enqueue(episodeId, 'nu');
  if (episode.finishedAt) store.updateEpisode(episodeId, { finishedAt: undefined });
  await load(episode, index, 0, true);
}

/** Ingevoegde fragmenten (een luistervraag) alvast laten inspreken. */
export function warmUp(episodeId: string, from: number): void {
  const episode = episodeById(episodeId);
  if (!episode || prepared?.episodeId !== episodeId) return;
  prefetch(prepared.api, episode, prepared.voices, from);
}

/**
 * Een andere stem of een ander stemmodel geldt meteen (keuze 8): het fragment dat speelt, begint
 * opnieuw op dezelfde plek met de nieuwe stem.
 */
export function refreshVoices(): void {
  prepared = null;
  const { episodeId, segment, status, seconds } = get();
  const episode = episodeById(episodeId);
  if (!episode || (status !== 'speelt' && status !== 'pauze')) return;
  void load(episode, segment, audio().currentTime || seconds, status === 'speelt');
}

useVoiceStore.subscribe((state, previous) => {
  if (state.overrides !== previous.overrides || state.voices !== previous.voices) refreshVoices();
});
usePodcastStore.subscribe((state, previous) => {
  if (state.settings.ttsModel !== previous.settings.ttsModel) refreshVoices();
});

/** Een aflevering weg: uit de speler, de wachtrij, de bibliotheek en de opslag. */
export async function deleteEpisode(episodeId: string): Promise<void> {
  if (get().episodeId === episodeId) stop();
  if (prepared?.episodeId === episodeId) prepared = null;
  usePodcastStore.getState().removeEpisode(episodeId);
  await deleteEpisodeAudio(episodeId);
}

export async function previousSegment(): Promise<void> {
  const { segment, seconds } = get();
  // Net begonnen? Dan het vorige fragment; anders terug naar het begin van dit fragment.
  await goToSegment(seconds > 3 ? segment : Math.max(0, segment - 1));
}

export async function nextSegment(): Promise<void> {
  const episode = episodeById(get().episodeId);
  if (!episode) return;
  const next = get().segment + 1;
  if (next < episode.segments.length) await goToSegment(next);
  else await finishEpisode(episode);
}

export function setSpeed(rate: number): void {
  usePodcastStore.getState().updateSettings({ speed: rate });
  audio().playbackRate = rate;
}

/** Slaaptimer: na zoveel minuten, aan het eind van de aflevering, of uit. */
export function setSleep(option: number | 'einde' | null): void {
  if (sleepTimer) deps.clearTimer(sleepTimer);
  sleepTimer = null;
  if (option === null) {
    set({ sleep: undefined });
  } else if (option === 'einde') {
    set({ sleep: { endOfEpisode: true } });
  } else {
    const ms = option * 60_000;
    set({ sleep: { until: deps.now() + ms } });
    sleepTimer = deps.setTimer(() => {
      sleepTimer = null;
      pause();
      set({ sleep: undefined });
    }, ms);
  }
}

/** Stoppen: niets meer in de speler (de plek in de aflevering blijft bewaard). */
export function stop(): void {
  pause();
  loadToken++;
  set({ episodeId: undefined, segment: 0, seconds: 0, duration: 0, status: 'stil' });
}

/* ---------- Gebeurtenissen van het audio-element ---------- */

function onTimeUpdate(): void {
  const element = audio();
  const { episodeId, segment, status } = get();
  if (!episodeId || status === 'laden') return;
  set({ seconds: element.currentTime });
  if (deps.now() - lastSaved > 5_000) savePosition(episodeId, segment, element.currentTime);
  updatePositionState(element);
}

function onExternalPause(): void {
  // Pauze van buitenaf (vergrendelscherm, oortjes uit): de speler volgt.
  if (get().status === 'speelt' && !audio().paused) return;
  if (get().status === 'speelt') {
    set({ status: 'pauze' });
    persistNow();
  }
}

function onExternalPlay(): void {
  if (get().status === 'pauze' && get().episodeId) set({ status: 'speelt' });
}

async function onSegmentEnded(): Promise<void> {
  const { episodeId, segment, status } = get();
  const episode = episodeById(episodeId);
  if (!episode || status === 'laden') return;
  if (segment + 1 < episode.segments.length) await load(episode, segment + 1, 0, true);
  else await finishEpisode(episode);
}

/** Klaar met een aflevering: uit de wachtrij, en door naar de volgende (of stoppen). */
async function finishEpisode(episode: PodcastEpisode): Promise<void> {
  const store = usePodcastStore.getState();
  store.updateEpisode(episode.id, { finishedAt: clock.iso(), position: undefined });
  store.dequeue(episode.id);
  refillQueue();
  const stopNow = Boolean(get().sleep?.endOfEpisode);
  if (stopNow) setSleep(null);
  const next = store.settings.autoplay && !stopNow ? firstReady() : undefined;
  if (next) {
    await play(next);
  } else {
    audio().pause();
    loadToken++;
    set({ episodeId: undefined, segment: 0, seconds: 0, duration: 0, status: 'stil' });
  }
}

/** De eerste aflevering in de wachtrij die klaar is om te spelen. */
export function firstReady(): string | undefined {
  const { queue, episodes } = usePodcastStore.getState();
  return queue.find((id) => episodes.some((e) => e.id === id && e.status === 'klaar'));
}

/** Een lege wachtrij vult zich met afleveringen die je nog niet (af)geluisterd hebt (keuze 5e). */
export function refillQueue(): void {
  const store = usePodcastStore.getState();
  if (store.queue.length > 0) return;
  const unheard = store.episodes
    .filter((e) => e.status === 'klaar' && !e.finishedAt)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  for (const episode of unheard.slice(0, 5)) store.enqueue(episode.id, 'achteraan');
}

/* ---------- Bewaren waar je was ---------- */

function savePosition(episodeId: string, segment: number, seconds: number): void {
  lastSaved = deps.now();
  usePodcastStore.getState().setPosition(episodeId, segment, seconds);
}

function persistNow(): void {
  const { episodeId, segment } = get();
  if (episodeId) savePosition(episodeId, segment, audio().currentTime || get().seconds);
}

/* ---------- Vergrendelscherm (Media Session) ---------- */

function speakerNames(episode: PodcastEpisode): string {
  return episode.figureIds.map((id) => findMeta(id)?.name ?? id).join(' & ');
}

function iconUrl(name: string): string {
  return new URL(name, document.baseURI).href;
}

function updateMediaSession(episode: PodcastEpisode): void {
  if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;
  if (typeof MediaMetadata === 'undefined') return;
  navigator.mediaSession.metadata = new MediaMetadata({
    title: episode.title,
    artist: `${speakerNames(episode)} · met ${HOST.name}`,
    album: tp.player.album,
    artwork: [
      { src: iconUrl('icon-192.png'), sizes: '192x192', type: 'image/png' },
      { src: iconUrl('icon-512.png'), sizes: '512x512', type: 'image/png' },
    ],
  });
}

function updatePositionState(element: AudioLike): void {
  if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;
  const duration = element.duration;
  if (!Number.isFinite(duration) || duration <= 0) return;
  try {
    navigator.mediaSession.setPositionState?.({
      duration,
      position: Math.min(element.currentTime, duration),
      playbackRate: element.playbackRate || 1,
    });
  } catch {
    // niet elke browser accepteert dit
  }
}

let mediaSessionReady = false;

function setupMediaSession(): void {
  if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;
  if (mediaSessionReady) return;
  mediaSessionReady = true;
  // Speelt of pauze, ook voor het vergrendelscherm.
  usePlayer.subscribe((state) => {
    navigator.mediaSession.playbackState =
      state.status === 'speelt' ? 'playing' : state.status === 'pauze' ? 'paused' : 'none';
  });
  const handlers: [MediaSessionAction, () => void][] = [
    ['play', () => void play()],
    ['pause', () => pause()],
    ['stop', () => pause()],
    ['seekbackward', () => void skipBackward()],
    ['seekforward', () => void skipForward()],
    ['previoustrack', () => void previousSegment()],
    ['nexttrack', () => void nextSegment()],
  ];
  for (const [action, handler] of handlers) {
    try {
      navigator.mediaSession.setActionHandler(action, handler);
    } catch {
      // actie niet ondersteund in deze browser
    }
  }
}
