/**
 * Gedachte van vandaag (§6.5): max. één per dag per denker, lokaal gecachet. In de demomodus
 * komt hij uit de eigen gedachten van de denker; met een eigen key schrijft het lichte model hem.
 */
import { useCallback, useEffect, useState } from 'react';
import { AiError, getProvider, useAiMode } from '@/ai';
import { thoughtRequest } from '@/ai/prompts/thought';
import type { Figure } from '@/data/types';
import { clock } from '@/lib/clock';
import { localDateKey } from '@/lib/dates';
import { useCacheStore } from '@/store/miscStores';

export interface Thought {
  text: string;
  provider: string;
}

export function thoughtKey(figureId: string, dateKey: string): string {
  return `${figureId}|${dateKey}`;
}

/** Ruimt modeluitvoer op: geen aanhalingstekens rondom, geen witruimte. */
export function cleanThought(text: string): string {
  return text
    .trim()
    .replace(/^["“‘']+|["”’']+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const inFlight = new Map<string, Promise<Thought>>();

export function fetchThought(figure: Figure): Promise<Thought> {
  const now = clock.now();
  const dateKey = localDateKey(now);
  const key = thoughtKey(figure.id, dateKey);
  const cached = useCacheStore.getState().thoughts[key];
  if (cached) return Promise.resolve(cached);
  const pending = inFlight.get(key);
  if (pending) return pending;
  const provider = getProvider();
  const promise = provider
    .streamText(thoughtRequest(figure, dateKey, now), () => {})
    .then((result) => {
      const text = cleanThought(result.text);
      if (result.stopReason === 'refusal' || !text) {
        throw new AiError('refusal', 'Geen gedachte vandaag.');
      }
      const thought = { text, provider: provider.id };
      useCacheStore.getState().setThought(key, thought);
      return thought;
    })
    .finally(() => inFlight.delete(key));
  inFlight.set(key, promise);
  return promise;
}

export type ThoughtStatus = 'idle' | 'loading' | 'ready' | 'error';

/**
 * Hook voor het profiel. In de demomodus laadt de gedachte meteen (gratis); met een eigen key
 * pas na een klik, zodat een profielbezoek nooit ongevraagd tokens kost.
 */
export function useThoughtOfTheDay(figure: Figure | undefined): {
  thought: Thought | undefined;
  status: ThoughtStatus;
  load: () => void;
  automatic: boolean;
} {
  const mode = useAiMode();
  const key = figure ? thoughtKey(figure.id, localDateKey(clock.now())) : '';
  const cached = useCacheStore((s) => (key ? s.thoughts[key] : undefined));
  const [manual, setManual] = useState<'idle' | 'loading' | 'error'>('idle');
  const [failedKey, setFailedKey] = useState<string | null>(null);
  const automatic = mode === 'demo';

  useEffect(() => {
    if (!automatic || !figure || cached) return;
    let active = true;
    fetchThought(figure).catch(() => {
      if (active) setFailedKey(key);
    });
    return () => {
      active = false;
    };
  }, [automatic, figure, cached, key]);

  const load = useCallback(() => {
    if (!figure) return;
    setManual('loading');
    fetchThought(figure).then(
      () => setManual('idle'),
      () => setManual('error'),
    );
  }, [figure]);

  let status: ThoughtStatus;
  if (cached) status = 'ready';
  else if (automatic) status = failedKey === key ? 'error' : 'loading';
  else status = manual;

  return { thought: cached, status, load, automatic };
}
