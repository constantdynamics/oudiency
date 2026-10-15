import * as z from 'zod/mini';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { persistOptions, registerStore } from './persist';
import { LectureSchema, type Lecture, type LectureSegment } from './schemas';

interface LectureState {
  lectures: Lecture[];
  add: (lecture: Lecture) => void;
  update: (id: string, patch: Partial<Lecture>) => void;
  appendSegment: (id: string, segment: LectureSegment) => void;
  remove: (id: string) => void;
}

const Persisted = z.object({ lectures: z.array(LectureSchema) });

export const useLectureStore = create<LectureState>()(
  persist(
    (set) => ({
      lectures: [],
      add: (lecture) => set((s) => ({ lectures: [...s.lectures, lecture] })),
      update: (id, patch) =>
        set((s) => ({ lectures: s.lectures.map((l) => (l.id === id ? { ...l, ...patch } : l)) })),
      appendSegment: (id, segment) =>
        set((s) => ({
          lectures: s.lectures.map((l) =>
            l.id === id ? { ...l, segments: [...l.segments, segment] } : l,
          ),
        })),
      remove: (id) => set((s) => ({ lectures: s.lectures.filter((l) => l.id !== id) })),
    }),
    persistOptions<LectureState, { lectures: Lecture[] }>({
      name: 'lectures',
      version: 1,
      schema: Persisted,
      partialize: (s) => ({ lectures: s.lectures }),
    }),
  ),
);

registerStore({
  name: 'lectures',
  version: 1,
  schema: Persisted,
  rehydrate: () => useLectureStore.persist.rehydrate(),
});
