import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getProvider } from '@/ai';
import { AboutPage } from '@/features/about/AboutPage';
import { ProfilePage } from '@/features/profile/ProfilePage';
import { canSpeak, speak, stopSpeaking } from '@/lib/speech';
import { exportData } from '@/store/dataPortability';
import { useUsageStore } from '@/store/miscStores';
import { initialProfile, useProfileStore } from '@/store/profileStore';
import { apiKeyStorage, initialSettings, useSettingsStore } from '@/store/settingsStore';

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/profiel" element={<ProfilePage />} />
        <Route path="/over" element={<AboutPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  useProfileStore.setState({ profile: initialProfile() });
  useSettingsStore.setState({ settings: initialSettings() });
  useUsageStore.setState({ entries: [] });
  apiKeyStorage.clear();
});

afterEach(() => {
  vi.unstubAllGlobals();
  apiKeyStorage.clear();
});

describe('profiel', () => {
  it('naam, Premium simuleren en de stand van vandaag', async () => {
    const user = userEvent.setup();
    renderAt('/profiel');
    await user.type(screen.getByLabelText('Weergavenaam'), 'Sanne');
    await user.click(screen.getByRole('button', { name: 'Opslaan' }));
    expect(useProfileStore.getState().profile.displayName).toBe('Sanne');
    expect(screen.getByText('Sessies: 0 van 1')).toBeInTheDocument();
    await user.click(screen.getByRole('switch', { name: 'Premium simuleren' }));
    expect(useProfileStore.getState().profile.tier).toBe('premium');
    expect(screen.getByText('Sessies: 0 van 3')).toBeInTheDocument();
    expect(screen.getByText('Colleges: 0 van 3')).toBeInTheDocument();
    expect(screen.getByText('8 / 73')).toBeInTheDocument();
  });

  it('eigen API-key: opslaan, testen (fout netjes gemeld), gemaskeerd tonen en wissen', async () => {
    const user = userEvent.setup();
    // Geen echt netwerk in tests: de API weigert de sleutel.
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(
            JSON.stringify({
              type: 'error',
              error: { type: 'authentication_error', message: 'invalid x-api-key' },
            }),
            { status: 401, headers: { 'content-type': 'application/json' } },
          ),
      ),
    );
    renderAt('/profiel');
    await user.click(screen.getByRole('radio', { name: /Eigen API-key/ }));
    expect(
      screen.getByRole('link', { name: 'Open de API-sleutels bij Anthropic' }),
    ).toHaveAttribute('href', 'https://console.anthropic.com/settings/keys');
    await user.type(screen.getByLabelText('Anthropic API-key'), 'sk-ant-test-0123456789abcd');
    await user.click(screen.getByRole('button', { name: 'Opslaan en testen' }));
    expect(
      await screen.findByText(/Je API-key wordt niet geaccepteerd/, undefined, { timeout: 8000 }),
    ).toBeInTheDocument();
    expect(apiKeyStorage.get()).toBe('sk-ant-test-0123456789abcd');
    expect(screen.getByText('sk-ant-…abcd')).toBeInTheDocument();
    expect(screen.getByLabelText('Anthropic API-key')).toHaveValue('');
    // Modellen per taak staan onder geavanceerd.
    expect(screen.getByText('Geavanceerd: modellen per taak')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Sleutel wissen' }));
    expect(apiKeyStorage.get()).toBeNull();
    expect(useSettingsStore.getState().settings.aiSource).toBe('demo');
  });

  it('mijn data: sleutels en de moderatorpincode gaan nooit mee in een export', () => {
    apiKeyStorage.set('sk-ant-geheim-1234567890');
    useSettingsStore.getState().update({ moderatorMode: true, moderatorPinHash: 'abc123' });
    useProfileStore.getState().setDisplayName('Sanne');
    const json = JSON.stringify(exportData());
    expect(json).toContain('Sanne');
    expect(json).not.toContain('sk-ant-geheim');
    expect(json).not.toContain('abc123');
    expect(json).not.toContain('moderatorPinHash');
  });

  it('alles wissen vraagt eerst om bevestiging', async () => {
    const user = userEvent.setup();
    renderAt('/profiel');
    await user.click(screen.getByRole('button', { name: 'Alles wissen' }));
    const dialog = await screen.findByRole('dialog', { name: 'Alles wissen' });
    expect(within(dialog).getByLabelText('Ook mijn API-sleutels wissen')).not.toBeChecked();
    await user.click(within(dialog).getByRole('button', { name: 'Annuleren' }));
  });
});

describe('AI-laag', () => {
  it('de provider laadt pas bij de eerste aanroep, en kiest de demomodus zonder sleutel', async () => {
    const provider = getProvider();
    expect(provider.id).toBe('demo');
    const result = await provider.streamText(
      { task: 'dailyQuestion', system: [], messages: [], demo: { kind: 'test' } },
      () => {},
    );
    expect(result.text).toBe('ok');
  });
});

describe('voorlezen', () => {
  it('met de browserstem in het Nederlands, en stil als die er niet is', () => {
    expect(canSpeak()).toBe(false);
    expect(() => speak('Hallo')).not.toThrow();
    const spoken: SpeechSynthesisUtterance[] = [];
    vi.stubGlobal('speechSynthesis', {
      getVoices: () => [{ lang: 'nl-NL', name: 'Nederlands' }],
      cancel: vi.fn(),
      speak: (u: SpeechSynthesisUtterance) => spoken.push(u),
    });
    vi.stubGlobal(
      'SpeechSynthesisUtterance',
      class {
        text: string;
        lang = '';
        voice: unknown = null;
        rate = 1;
        constructor(text: string) {
          this.text = text;
        }
      },
    );
    expect(canSpeak()).toBe(true);
    speak('Goedemorgen, mijn vriend.');
    expect(spoken[0]?.lang).toBe('nl-NL');
    expect(spoken[0]?.text).toBe('Goedemorgen, mijn vriend.');
    stopSpeaking();
  });
});

describe('over & privacy', () => {
  it('AI-simulatie, privacy, sleutels en de hulpkaart', () => {
    renderAt('/over');
    expect(screen.getByRole('heading', { name: 'Alles is een AI-simulatie' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Privacy' })).toBeInTheDocument();
    expect(
      screen.getByRole('note', { name: 'Je hoeft dit niet alleen te dragen' }),
    ).toBeInTheDocument();
  });
});
