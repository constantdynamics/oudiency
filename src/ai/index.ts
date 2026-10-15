/**
 * Kiest de actieve AI-provider: eigen key (BYOK) als die is ingesteld, anders de demomodus.
 */
import { useSyncExternalStore } from 'react';
import { apiKeyStorage, subscribeApiKey, useSettingsStore } from '@/store/settingsStore';
import { AnthropicBrowserProvider } from './anthropicBrowserProvider';
import { DemoProvider } from './demoProvider';
import type { AIProvider, ProviderId } from './provider';

let demo: DemoProvider | null = null;
let anthropic: { key: string; provider: AnthropicBrowserProvider } | null = null;

export function activeProviderId(): ProviderId {
  const { aiSource } = useSettingsStore.getState().settings;
  return aiSource === 'anthropic-browser' && apiKeyStorage.get() ? 'anthropic-browser' : 'demo';
}

export function getProvider(): AIProvider {
  if (activeProviderId() === 'anthropic-browser') {
    const key = apiKeyStorage.get();
    if (key) {
      if (!anthropic || anthropic.key !== key) {
        anthropic = { key, provider: new AnthropicBrowserProvider(key) };
      }
      return anthropic.provider;
    }
  }
  demo ??= new DemoProvider();
  return demo;
}

export function getDemoProvider(): DemoProvider {
  demo ??= new DemoProvider();
  return demo;
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
