/**
 * Kleinere stores: dagvragen, meldingen, bibliotheek (likes/terugkijken), verbruik en cache.
 */
import { z } from 'zod';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { clock } from '@/lib/clock';
import { persistOptions, registerStore } from './persist';
import {
  ContentCacheSchema,
  DailyQuestionDaySchema,
  LibraryStateSchema,
  NotificationSchema,
  UsageEntrySchema,
  type AppNotification,
  type ContentCache,
  type DailyQuestionDay,
  type LibraryState,
  type UsageEntry,
} from './schemas';

/* ---------- Dagvragen ---------- */

interface DailyQuestionState {
  days: Record<string, DailyQuestionDay>;
  setDay: (dateKey: string, day: DailyQuestionDay) => void;
  patchDay: (dateKey: string, patch: Partial<DailyQuestionDay>) => void;
}

const PersistedDaily = z.object({ days: z.record(z.string(), DailyQuestionDaySchema) });

export const useDailyQuestionStore = create<DailyQuestionState>()(
  persist(
    (set) => ({
      days: {},
      setDay: (dateKey, day) => set((s) => ({ days: { ...s.days, [dateKey]: day } })),
      patchDay: (dateKey, patch) =>
        set((s) => {
          const current = s.days[dateKey];
          if (!current) return s;
          return { days: { ...s.days, [dateKey]: { ...current, ...patch } } };
        }),
    }),
    persistOptions<DailyQuestionState, { days: Record<string, DailyQuestionDay> }>({
      name: 'dailyQuestions',
      version: 1,
      schema: PersistedDaily,
      partialize: (s) => ({ days: s.days }),
    }),
  ),
);
registerStore({
  name: 'dailyQuestions',
  version: 1,
  schema: PersistedDaily,
  rehydrate: () => useDailyQuestionStore.persist.rehydrate(),
});

/* ---------- Meldingen ---------- */

interface NotificationState {
  notifications: AppNotification[];
  add: (notification: AppNotification) => void;
  markRead: (ids: string[]) => void;
  markAllRead: (now: number) => void;
  markPushed: (id: string) => void;
  removeBySource: (sourceId: string) => void;
}

const PersistedNotifications = z.object({ notifications: z.array(NotificationSchema) });

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      notifications: [],
      add: (notification) =>
        set((s) => {
          if (
            notification.sourceId &&
            s.notifications.some((n) => n.sourceId === notification.sourceId)
          ) {
            return s;
          }
          // Bewaar maximaal 200 meldingen.
          return { notifications: [notification, ...s.notifications].slice(0, 200) };
        }),
      markRead: (ids) => {
        const wanted = new Set(ids);
        set((s) => ({
          notifications: s.notifications.map((n) => (wanted.has(n.id) ? { ...n, read: true } : n)),
        }));
      },
      markAllRead: (now) =>
        set((s) => ({
          notifications: s.notifications.map((n) =>
            Date.parse(n.visibleAt) <= now ? { ...n, read: true } : n,
          ),
        })),
      markPushed: (id) =>
        set((s) => ({
          notifications: s.notifications.map((n) => (n.id === id ? { ...n, pushed: true } : n)),
        })),
      removeBySource: (sourceId) =>
        set((s) => ({ notifications: s.notifications.filter((n) => n.sourceId !== sourceId) })),
    }),
    persistOptions<NotificationState, { notifications: AppNotification[] }>({
      name: 'notifications',
      version: 1,
      schema: PersistedNotifications,
      partialize: (s) => ({ notifications: s.notifications }),
    }),
  ),
);
registerStore({
  name: 'notifications',
  version: 1,
  schema: PersistedNotifications,
  rehydrate: () => useNotificationStore.persist.rehydrate(),
});

/* ---------- Bibliotheek ---------- */

interface LibraryStoreState extends LibraryState {
  toggleLike: (lectureId: string) => boolean;
  markWatched: (lectureId: string, completed: boolean) => void;
}

const PersistedLibrary = LibraryStateSchema;

export const useLibraryStore = create<LibraryStoreState>()(
  persist(
    (set, get) => ({
      likes: {},
      watched: {},
      toggleLike: (lectureId) => {
        const liked = Boolean(get().likes[lectureId]);
        set((s) => {
          const likes = { ...s.likes };
          if (liked) delete likes[lectureId];
          else likes[lectureId] = clock.iso();
          return { likes };
        });
        return !liked;
      },
      markWatched: (lectureId, completed) =>
        set((s) => {
          const current = s.watched[lectureId];
          const startedAt = current?.startedAt ?? clock.iso();
          const completedAt = current?.completedAt ?? (completed ? clock.iso() : undefined);
          return {
            watched: {
              ...s.watched,
              [lectureId]: completedAt ? { startedAt, completedAt } : { startedAt },
            },
          };
        }),
    }),
    persistOptions<LibraryStoreState, LibraryState>({
      name: 'library',
      version: 1,
      schema: PersistedLibrary,
      partialize: (s) => ({ likes: s.likes, watched: s.watched }),
    }),
  ),
);
registerStore({
  name: 'library',
  version: 1,
  schema: PersistedLibrary,
  rehydrate: () => useLibraryStore.persist.rehydrate(),
});

/* ---------- Verbruik (alleen bij eigen API-key) ---------- */

interface UsageState {
  entries: UsageEntry[];
  log: (entry: UsageEntry) => void;
  clear: () => void;
}

const PersistedUsage = z.object({ entries: z.array(UsageEntrySchema) });

export const useUsageStore = create<UsageState>()(
  persist(
    (set) => ({
      entries: [],
      log: (entry) => set((s) => ({ entries: [...s.entries, entry].slice(-1000) })),
      clear: () => set({ entries: [] }),
    }),
    persistOptions<UsageState, { entries: UsageEntry[] }>({
      name: 'usage',
      version: 1,
      schema: PersistedUsage,
      partialize: (s) => ({ entries: s.entries }),
    }),
  ),
);
registerStore({
  name: 'usage',
  version: 1,
  schema: PersistedUsage,
  rehydrate: () => useUsageStore.persist.rehydrate(),
});

/* ---------- Cache (gedachte van vandaag) ---------- */

interface CacheState extends ContentCache {
  setThought: (key: string, value: { text: string; provider: string }) => void;
}

export const useCacheStore = create<CacheState>()(
  persist(
    (set) => ({
      thoughts: {},
      setThought: (key, value) =>
        set((s) => {
          // Houd de cache klein: maximaal 120 gedachten.
          const entries = Object.entries({ ...s.thoughts, [key]: value }).slice(-120);
          return { thoughts: Object.fromEntries(entries) };
        }),
    }),
    persistOptions<CacheState, ContentCache>({
      name: 'cache',
      version: 1,
      schema: ContentCacheSchema,
      partialize: (s) => ({ thoughts: s.thoughts }),
    }),
  ),
);
registerStore({
  name: 'cache',
  version: 1,
  schema: ContentCacheSchema,
  rehydrate: () => useCacheStore.persist.rehydrate(),
});
