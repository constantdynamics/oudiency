/**
 * Afspeelmodus (§7.2): de tekst verschijnt in leestempo, pauzeerbaar. Gerekend vanaf een
 * ankerpunt (tijdstip + aantal woorden), nooit met een aftellende teller.
 */
import { useState } from 'react';
import { LIMITS } from '@/config/limits';
import { useNow } from '@/hooks/useNow';
import { clock } from '@/lib/clock';

interface Anchor {
  playing: boolean;
  at: number;
  words: number;
}

export interface Playback {
  playing: boolean;
  /** Zichtbare woorden. */
  words: number;
  finished: boolean;
  play: () => void;
  pause: () => void;
  restart: () => void;
  seek: (words: number) => void;
}

/** Hoeveel woorden er zichtbaar zijn op tijdstip `now`. */
export function visibleWords(anchor: Anchor, now: number, total: number, wpm: number): number {
  const elapsed = anchor.playing ? Math.max(0, now - anchor.at) : 0;
  return Math.min(total, Math.floor(anchor.words + (elapsed / 60_000) * wpm));
}

export function usePlayback(
  total: number,
  wordsPerMinute: number = LIMITS.lecture.playbackWordsPerMinute,
): Playback {
  const [anchor, setAnchor] = useState<Anchor>({ playing: false, at: 0, words: 0 });
  const now = useNow(anchor.playing ? 200 : 60_000);
  const words = visibleWords(anchor, now, total, wordsPerMinute);
  const finished = words >= total;
  return {
    playing: anchor.playing && !finished,
    words,
    finished,
    play: () => setAnchor({ playing: true, at: clock.now(), words: finished ? 0 : words }),
    pause: () => setAnchor({ playing: false, at: 0, words }),
    restart: () => setAnchor({ playing: true, at: clock.now(), words: 0 }),
    seek: (target) =>
      setAnchor((current) => ({
        playing: current.playing,
        at: clock.now(),
        words: Math.max(0, Math.min(total, target)),
      })),
  };
}
