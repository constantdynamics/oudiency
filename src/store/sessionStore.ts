import * as z from 'zod/mini';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { persistOptions, registerStore } from './persist';
import { SessionSchema, type Message, type Session } from './schemas';

interface SessionState {
  sessions: Session[];
  add: (session: Session) => void;
  update: (id: string, patch: Partial<Session>) => void;
  appendMessage: (id: string, message: Message) => void;
  remove: (id: string) => void;
}

const Persisted = z.object({ sessions: z.array(SessionSchema) });

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      sessions: [],
      add: (session) => set((s) => ({ sessions: [...s.sessions, session] })),
      update: (id, patch) =>
        set((s) => ({ sessions: s.sessions.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
      appendMessage: (id, message) =>
        set((s) => ({
          sessions: s.sessions.map((x) =>
            x.id === id ? { ...x, messages: [...x.messages, message] } : x,
          ),
        })),
      remove: (id) => set((s) => ({ sessions: s.sessions.filter((x) => x.id !== id) })),
    }),
    persistOptions<SessionState, { sessions: Session[] }>({
      name: 'sessions',
      version: 1,
      schema: Persisted,
      partialize: (s) => ({ sessions: s.sessions }),
    }),
  ),
);

registerStore({
  name: 'sessions',
  version: 1,
  schema: Persisted,
  rehydrate: () => useSessionStore.persist.rehydrate(),
});
