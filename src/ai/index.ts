/**
 * Kiest de actieve AI-provider: eigen key (BYOK) als die is ingesteld, anders de demomodus.
 * De providers zelf (demo-inhoud, Anthropic-koppeling) laden pas bij de eerste aanroep, zodat ze
 * niet in de startbundel zitten.
 */
import { useSyncExternalStore } from 'react';
import { apiKeyStorage, subscribeApiKey, useSettingsStore } from '@/store/settingsStore';
import type { AIProvider, ProviderId } from './provider';

let demo: Promise<AIProvider> | null = null;
let anthropic: { key: string; provider: Promise<AIProvider> } | null = null;

export function activeProviderId(): ProviderId {
  const { aiSource } = useSettingsStore.getState().settings;
  return aiSource === 'anthropic-browser' && apiKeyStorage.get() ? 'anthropic-browser' : 'demo';
}

function loadDemo(): Promise<AIProvider> {
  demo ??= import('./demoProvider').then((m) => new m.DemoProvider());
  return demo;
}

function loadAnthropic(key: string): Promise<AIProvider> {
  if (!anthropic || anthropic.key !== key) {
    anthropic = {
      key,
      provider: import('./anthropicBrowserProvider').then(
        (m) => new m.AnthropicBrowserProvider(key),
      ),
    };
  }
  return anthropic.provider;
}

/** De provider voor deze aanroep (de keuze ligt vast op het moment van vragen). */
export function getProvider(): AIProvider {
  const id = activeProviderId();
  const key = id === 'anthropic-browser' ? apiKeyStorage.get() : null;
  const load = () => (key ? loadAnthropic(key) : loadDemo());
  return {
    id: key ? 'anthropic-browser' : 'demo',
    streamText: async (req, onDelta, signal) => (await load()).streamText(req, onDelta, signal),
    structured: async (req) => (await load()).structured(req),
  };
}

/** Hook: draait de app in demomodus? (reageert op instellingen én het wissen van de key) */
export function useAiMode(): ProviderId {
  const aiSource = useSettingsStore((s) => s.settings.aiSource);
  const hasKey = useSyncExternalStore(
    subscribeApiKey,
    () => Boolean(apiKeyStorage.get()),
    () => false,
  );
  return aiSource === 'anthropic-browser' && hasKey ? 'anthropic-browser' : 'demo';
}

export { AiError, isAbort } from './provider';
export type { AIProvider, ProviderId } from './provider';
