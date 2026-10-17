/**
 * De toestand van de podcastspeler en het ene audio-element (buiten React, zodat het doorspeelt
 * als je door de app bladert). Klein en in de startbundel; de speler zelf (player.ts) laadt pas
 * als je iets afspeelt.
 */
import { create } from 'zustand';
import type { VoiceApiError } from '@/voice/api';

export type PlayerStatus = 'stil' | 'laden' | 'speelt' | 'pauze' | 'fout';

export interface PlayerError {
  /** Uitleg in gewone taal. */
  message: string;
  /** Fout van ElevenLabs (toegang, tegoed, …), voor de uitgebreide melding. */
  voice?: VoiceApiError;
}

export interface PlayerState {
  episodeId?: string;
  /** Het fragment dat speelt, en de positie en lengte daarvan in seconden. */
  segment: number;
  seconds: number;
  duration: number;
  status: PlayerStatus;
  error?: PlayerError;
  /** Slaaptimer: tot een tijdstip, of tot het eind van de aflevering. */
  sleep?: { until?: number; endOfEpisode?: boolean };
}

export function initialPlayerState(): PlayerState {
  return { segment: 0, seconds: 0, duration: 0, status: 'stil' };
}

export const usePlayer = create<PlayerState>(() => initialPlayerState());

let element: HTMLAudioElement | null = null;
let unlocked = false;

export function getAudioElement(): HTMLAudioElement {
  if (!element) {
    element = new Audio();
    element.preload = 'auto';
  }
  return element;
}

/** Een fractie stilte (WAV), om het audio-element in een tik vrij te geven. */
function silentWav(): string {
  const samples = 80;
  const bytes = new Uint8Array(44 + samples);
  const view = new DataView(bytes.buffer);
  const text = (offset: number, value: string) => {
    for (let i = 0; i < value.length; i++) bytes[offset + i] = value.charCodeAt(i);
  };
  text(0, 'RIFF');
  view.setUint32(4, 36 + samples, true);
  text(8, 'WAVE');
  text(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, 8000, true);
  view.setUint32(28, 8000, true);
  view.setUint16(32, 1, true);
  view.setUint16(34, 8, true);
  text(36, 'data');
  view.setUint32(40, samples, true);
  bytes.fill(128, 44);
  return `data:audio/wav;base64,${btoa(String.fromCharCode(...bytes))}`;
}

/**
 * Moet in de tik zelf gebeuren (vóór iets dat wacht): sommige browsers, zoals Safari op iPhone,
 * laten audio alleen spelen als het element eerst door een tik van jou is gestart.
 */
export function unlockAudio(): void {
  if (unlocked || typeof Audio === 'undefined') return;
  unlocked = true;
  const audio = getAudioElement();
  if (audio.src) return;
  audio.src = silentWav();
  try {
    void audio.play()?.catch(() => {
      unlocked = false;
    });
  } catch {
    unlocked = false;
  }
}
