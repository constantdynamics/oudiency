/**
 * Wat er nu (in deze sessie) wordt uitgezocht of gemaakt. Staat een onderzoek op "zoeken" of een
 * vorm op "maken" maar niet hier, dan is het werk onderbroken (bijv. de app ging dicht); dan kan
 * het opnieuw, zonder dat het nog eens meetelt voor de daglimiet.
 */
import { useSyncExternalStore } from 'react';
import { describeAiError } from '@/ai';
import { useResearchStore } from '@/store/researchStore';

const active = new Set<string>();
const listeners = new Set<() => void>();
let version = 0;

function changed(): void {
  version += 1;
  for (const listener of listeners) listener();
}

export const outputKey = (researchId: string, outputId: string) => `${researchId}/${outputId}`;

export function markActive(key: string, on: boolean): void {
  if (on === active.has(key)) return;
  if (on) active.add(key);
  else active.delete(key);
  changed();
}

export function isActive(researchId: string, outputId?: string): boolean {
  return active.has(outputId ? outputKey(researchId, outputId) : researchId);
}

/** Hook: verandert mee als er werk begint of eindigt. */
export function useActiveWork(): number {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => version,
    () => version,
  );
}

/** Zoek het onderwerp uit en maak daarna de gekozen vorm (de AI-code laadt pas nu). */
export function startResearch(researchId: string): void {
  markActive(researchId, true);
  import('./researchAi').then(
    (ai) => ai.runResearch(researchId),
    (error: unknown) => {
      markActive(researchId, false);
      useResearchStore
        .getState()
        .update(researchId, { status: 'fout', error: describeAiError(error).message });
    },
  );
}

/** Maak (opnieuw) één vorm uit een afgerond onderzoek. */
export function startOutput(researchId: string, outputId: string): void {
  const key = outputKey(researchId, outputId);
  markActive(key, true);
  import('./researchAi').then(
    (ai) => ai.makeOutput(researchId, outputId),
    (error: unknown) => {
      markActive(key, false);
      useResearchStore.getState().updateOutput(researchId, outputId, {
        status: 'fout',
        error: describeAiError(error).message,
      });
    },
  );
}
