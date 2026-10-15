import { z } from 'zod';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type AiTask, DEFAULT_TASK_MODELS, type TaskModelConfig } from '@/config/models';
import { persistOptions, registerStore, storageKey } from './persist';
import { SettingsSchema, type Settings } from './schemas';

interface SettingsState {
  settings: Settings;
  update: (patch: Partial<Settings>) => void;
  setTaskModel: (task: AiTask, config: TaskModelConfig) => void;
  resetTaskModels: () => void;
}

export function initialSettings(): Settings {
  return {
    aiSource: 'demo',
    taskModels: { ...DEFAULT_TASK_MODELS },
    serverFallback: true,
    browserNotifications: false,
    moderatorMode: false,
    readingVoice: false,
    demoBannerDismissed: false,
    devInstantReactions: false,
    devPanelEnabled: false,
  };
}

const PersistedSettings = z.object({ settings: SettingsSchema });

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: initialSettings(),
      update: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),
      setTaskModel: (task, config) =>
        set((s) => ({
          settings: { ...s.settings, taskModels: { ...s.settings.taskModels, [task]: config } },
        })),
      resetTaskModels: () =>
        set((s) => ({ settings: { ...s.settings, taskModels: { ...DEFAULT_TASK_MODELS } } })),
    }),
    persistOptions<SettingsState, { settings: Settings }>({
      name: 'settings',
      version: 1,
      schema: PersistedSettings,
      partialize: (s) => ({ settings: s.settings }),
    }),
  ),
);

registerStore({
  name: 'settings',
  version: 1,
  schema: PersistedSettings,
  rehydrate: () => useSettingsStore.persist.rehydrate(),
});

export function taskModel(task: AiTask): TaskModelConfig {
  return useSettingsStore.getState().settings.taskModels[task] ?? DEFAULT_TASK_MODELS[task];
}

/* ---------- API-key (BYOK) ----------
 * Alleen in localStorage van deze browser, alleen verstuurd naar api.anthropic.com.
 * Bewust NIET in de export van "Mijn data" en niet in een store die gesynchroniseerd wordt.
 */

const API_KEY_STORAGE = storageKey('apikey');

export const apiKeyStorage = {
  get(): string | null {
    try {
      return localStorage.getItem(API_KEY_STORAGE);
    } catch {
      return null;
    }
  },
  set(key: string): void {
    localStorage.setItem(API_KEY_STORAGE, key.trim());
    notifyApiKey();
  },
  clear(): void {
    try {
      localStorage.removeItem(API_KEY_STORAGE);
    } finally {
      notifyApiKey();
    }
  },
};

const apiKeyListeners = new Set<() => void>();
function notifyApiKey() {
  for (const listener of apiKeyListeners) listener();
}
export function subscribeApiKey(listener: () => void): () => void {
  apiKeyListeners.add(listener);
  return () => {
    apiKeyListeners.delete(listener);
  };
}

/** Laat alleen de laatste vier tekens zien. */
export function maskApiKey(key: string): string {
  return key.length <= 8 ? '••••' : `${key.slice(0, 7)}…${key.slice(-4)}`;
}
