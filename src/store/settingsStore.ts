import { useSyncExternalStore } from 'react';
import * as z from 'zod/mini';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type AiTask, DEFAULT_TASK_MODELS, type TaskModelConfig } from '@/config/models';
import { persistOptions, registerStore, storageKey, type SecretName } from './persist';
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

/* ---------- API-sleutels (BYOK) ----------
 * Alleen in localStorage van deze browser, en alleen verstuurd naar de API van de leverancier
 * zelf: de Anthropic-sleutel naar api.anthropic.com, de ElevenLabs-sleutel naar api.elevenlabs.io.
 * Bewust NIET in de export van "Mijn data" en niet in een store die gesynchroniseerd wordt.
 */

export interface SecretStorage {
  get(): string | null;
  set(key: string): void;
  clear(): void;
  subscribe(listener: () => void): () => void;
}

function createSecretStorage(name: SecretName): SecretStorage {
  const storageName = storageKey(name);
  const listeners = new Set<() => void>();
  const notify = () => {
    for (const listener of listeners) listener();
  };
  return {
    get() {
      try {
        return localStorage.getItem(storageName);
      } catch {
        return null;
      }
    },
    set(key) {
      localStorage.setItem(storageName, key.trim());
      notify();
    },
    clear() {
      try {
        localStorage.removeItem(storageName);
      } finally {
        notify();
      }
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

/** Anthropic-sleutel (tekst-AI via de eigen key). */
export const apiKeyStorage = createSecretStorage('apikey');
/** ElevenLabs-sleutel (bellen met de denkers). */
export const elevenLabsKeyStorage = createSecretStorage('elevenlabs-key');

export const subscribeApiKey = apiKeyStorage.subscribe;

/** Hook: is er een sleutel opgeslagen? Reageert op opslaan en wissen. */
export function useHasSecret(storage: SecretStorage): boolean {
  return useSyncExternalStore(
    storage.subscribe,
    () => Boolean(storage.get()),
    () => false,
  );
}

/** Laat alleen het begin en de laatste vier tekens zien. */
export function maskApiKey(key: string): string {
  return key.length <= 8 ? '••••' : `${key.slice(0, 7)}…${key.slice(-4)}`;
}
