import { beforeEach, describe, expect, it, vi } from 'vitest';
import { loadDemoContent } from '@/data/demo';
import { clock } from '@/lib/clock';
import { localDateKey } from '@/lib/dates';
import { prefetchThought, thoughtKey } from '@/services/thought.service';
import { useCacheStore } from '@/store/miscStores';
import { apiKeyStorage, initialSettings, useSettingsStore } from '@/store/settingsStore';

vi.mock('@/data/demo', () => ({ loadDemoContent: vi.fn(async () => undefined) }));

beforeEach(() => {
  vi.mocked(loadDemoContent).mockClear();
  useSettingsStore.setState({ settings: initialSettings() });
  useCacheStore.setState({ thoughts: {} });
  apiKeyStorage.clear();
});

describe('gedachte van vandaag vooraf ophalen', () => {
  it('in de demomodus: de demotekst laadt tegelijk met het profiel', () => {
    prefetchThought('socrates');
    expect(loadDemoContent).toHaveBeenCalledWith('socrates');
  });

  it('niet als de gedachte van vandaag er al is', () => {
    const key = thoughtKey('socrates', localDateKey(clock.now()));
    useCacheStore.getState().setThought(key, { text: 'Vraag door.', provider: 'demo' });
    prefetchThought('socrates');
    expect(loadDemoContent).not.toHaveBeenCalled();
  });

  it('niet met een eigen key: daar komt de gedachte pas na een klik', () => {
    apiKeyStorage.set('sk-ant-test-0123456789abcd');
    useSettingsStore.getState().update({ aiSource: 'anthropic-browser' });
    prefetchThought('socrates');
    expect(loadDemoContent).not.toHaveBeenCalled();
  });
});
