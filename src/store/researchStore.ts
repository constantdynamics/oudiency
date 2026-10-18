/**
 * Onderzoeken: je vraag, de denkers, de (onzichtbare) onderzoeksnotitie en wat ervan gemaakt is.
 * Lazy geladen met het onderzoek; bij exporteren via allStores.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { persistOptions, registerStore } from './persist';
import {
  type Research,
  type ResearchOutput,
  type ResearchState,
  ResearchStateSchema,
} from './researchSchemas';

interface ResearchStore extends ResearchState {
  add: (research: Research) => void;
  update: (id: string, patch: Partial<Research>) => void;
  addOutput: (id: string, output: ResearchOutput) => void;
  updateOutput: (id: string, outputId: string, patch: Partial<ResearchOutput>) => void;
  remove: (id: string) => void;
}

export function initialResearchState(): ResearchState {
  return { researches: [] };
}

const mapResearch = (
  researches: Research[],
  id: string,
  change: (research: Research) => Research,
): Research[] => researches.map((r) => (r.id === id ? change(r) : r));

export const useResearchStore = create<ResearchStore>()(
  persist(
    (set) => ({
      ...initialResearchState(),
      add: (research) => set((s) => ({ researches: [research, ...s.researches] })),
      update: (id, patch) =>
        set((s) => ({ researches: mapResearch(s.researches, id, (r) => ({ ...r, ...patch })) })),
      addOutput: (id, output) =>
        set((s) => ({
          researches: mapResearch(s.researches, id, (r) => ({
            ...r,
            outputs: [...r.outputs, output],
          })),
        })),
      updateOutput: (id, outputId, patch) =>
        set((s) => ({
          researches: mapResearch(s.researches, id, (r) => ({
            ...r,
            outputs: r.outputs.map((o) => (o.id === outputId ? { ...o, ...patch } : o)),
          })),
        })),
      remove: (id) => set((s) => ({ researches: s.researches.filter((r) => r.id !== id) })),
    }),
    persistOptions<ResearchStore, ResearchState>({
      name: 'research',
      version: 1,
      schema: ResearchStateSchema,
      partialize: (s) => ({ researches: s.researches }),
    }),
  ),
);

registerStore({
  name: 'research',
  version: 1,
  schema: ResearchStateSchema,
  rehydrate: () => useResearchStore.persist.rehydrate(),
});

export function findResearch(id: string | undefined): Research | undefined {
  return id ? useResearchStore.getState().researches.find((r) => r.id === id) : undefined;
}
