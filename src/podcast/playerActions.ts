/**
 * Speleracties vanuit de interface: de speler laadt pas bij de eerste tik, en het audio-element
 * wordt in de tik zelf vrijgegeven (anders weigeren sommige browsers het afspelen).
 */
import type * as Player from './player';
import { unlockAudio, usePlayer } from './playerState';

export function withPlayer(action: (player: typeof Player) => unknown): void {
  unlockAudio();
  void import('./player').then(action);
}

/** Pauzeer de podcast als je gaat bellen (zonder de speler te laden als er niets speelt). */
export function pausePodcast(): void {
  const { status } = usePlayer.getState();
  if (status === 'speelt' || status === 'laden') void import('./player').then((p) => p.pause());
}
