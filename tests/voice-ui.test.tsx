import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CallPage } from '@/features/voice/CallPage';
import { VoiceSettingsPage } from '@/features/voice/VoiceSettingsPage';
import { elevenLabsKeyStorage, maskApiKey } from '@/store/settingsStore';
import { initialVoiceState, useVoiceStore } from '@/store/voiceStore';
import type { CallConnection, CallEvents } from '@/voice/callSession';
import type * as SetupModule from '@/voice/setup';

/** De echte SDK-verbinding vervangen we door een nep-verbinding die de test bestuurt. */
const fake = vi.hoisted(() => ({
  events: undefined as CallEvents | undefined,
  ended: 0,
  muted: [] as boolean[],
}));

vi.mock('@/voice/elevenlabsCall', () => ({
  elevenLabsStarter: () => (events: CallEvents) => {
    fake.events = events;
    const connection: CallConnection = {
      end: () => {
        fake.ended += 1;
        return Promise.resolve();
      },
      setMuted: (muted) => fake.muted.push(muted),
      sendContext: () => undefined,
      sendText: () => undefined,
    };
    return Promise.resolve(connection);
  },
}));

vi.mock('@/voice/setup', async (importOriginal) => ({
  ...(await importOriginal<typeof SetupModule>()),
  lookUpCallCost: () => Promise.resolve({ credits: 1234, fiat: 0.42, source: 'gesprek' }),
}));

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/profiel/stem" element={<VoiceSettingsPage />} />
        <Route path="/bellen/:figureId" element={<CallPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  useVoiceStore.setState(initialVoiceState());
  fake.events = undefined;
  fake.ended = 0;
  fake.muted = [];
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Stem & bellen (instellingen)', () => {
  it('zonder sleutel: uitleg, sleutelveld en een uitgeschakelde belknop', () => {
    renderAt('/profiel/stem');
    expect(screen.getByRole('heading', { name: 'Stem & bellen' })).toBeInTheDocument();
    expect(screen.getByLabelText('ElevenLabs-sleutel')).toHaveAttribute('type', 'password');
    expect(screen.getByRole('link', { name: /API-sleutels bij ElevenLabs/ })).toHaveAttribute(
      'href',
      'https://elevenlabs.io/app/developers/api-keys',
    );
    expect(screen.getByRole('button', { name: 'Bel Socrates' })).toBeDisabled();
  });

  it('bewaart een sleutel pas als hij werkt, en toont het tegoed', async () => {
    const fetchMock = vi.fn((input: URL | RequestInfo) =>
      Promise.resolve(
        String(input).includes('/v1/convai/agents')
          ? jsonResponse(200, { agents: [] })
          : jsonResponse(200, { tier: 'creator', character_count: 2500, character_limit: 100000 }),
      ),
    );
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();
    renderAt('/profiel/stem');
    const key = 'sk_werkt0123456789abcdef';
    await user.type(screen.getByLabelText('ElevenLabs-sleutel'), key);
    await user.click(screen.getByRole('button', { name: 'Opslaan en testen' }));
    expect(await screen.findByText(/2\.500 van 100\.000 credits/)).toBeInTheDocument();
    expect(elevenLabsKeyStorage.get()).toBe(key);
    // Alleen gemaskeerd zichtbaar.
    expect(screen.getByText(maskApiKey(key))).toBeInTheDocument();
    expect(screen.queryByText(key)).not.toBeInTheDocument();
  });

  it('een verkeerde sleutel wordt niet bewaard en geeft een duidelijke melding', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve(
          jsonResponse(401, { detail: { status: 'invalid_api_key', message: 'Invalid API key' } }),
        ),
      ),
    );
    const user = userEvent.setup();
    renderAt('/profiel/stem');
    await user.type(screen.getByLabelText('ElevenLabs-sleutel'), 'sk_fout');
    await user.click(screen.getByRole('button', { name: 'Opslaan en testen' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'ElevenLabs herkent deze sleutel niet',
    );
    expect(elevenLabsKeyStorage.get()).toBeNull();
  });

  it('mist de sleutel toegang, dan staat in één keer alles wat aan moet', async () => {
    const refuse = (scope: string) =>
      jsonResponse(401, {
        detail: {
          status: 'missing_permissions',
          message: `The API key you used is missing the permission ${scope} to execute this operation.`,
        },
      });
    vi.stubGlobal(
      'fetch',
      vi.fn((input: URL | RequestInfo) =>
        Promise.resolve(
          String(input).includes('/v1/convai/agents') ? refuse('convai_read') : refuse('user_read'),
        ),
      ),
    );
    const user = userEvent.setup();
    renderAt('/profiel/stem');
    await user.type(screen.getByLabelText('ElevenLabs-sleutel'), 'sk_beperkt0123456789');
    await user.click(screen.getByRole('button', { name: 'Opslaan en testen' }));
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Deze sleutel mist toegang bij ElevenLabs.');
    const list = within(alert).getByRole('list', { name: 'Toegang die de sleutel nodig heeft' });
    const items = within(list).getAllByRole('listitem');
    expect(items.map((item) => item.textContent?.includes('ontbreekt'))).toEqual([
      true, // ElevenLabs Agents
      false, // Voices
      false, // Text to Voice
      false, // Text to Speech
      true, // User
    ]);
    expect(items[0]).toHaveTextContent(
      'ElevenLabs Agents (heette eerder Conversational AI): Write',
    );
    expect(
      within(alert).getByRole('link', { name: 'Open de API-sleutels bij ElevenLabs' }),
    ).toHaveAttribute('href', 'https://elevenlabs.io/app/developers/api-keys');
    // Niet bewaard, maar wel nog in het veld: na het aanpassen kun je meteen opnieuw testen.
    expect(elevenLabsKeyStorage.get()).toBeNull();
    expect(screen.getByLabelText('ElevenLabs-sleutel')).toHaveValue('sk_beperkt0123456789');
  });

  it('met sleutel en stem kun je Socrates bellen', () => {
    elevenLabsKeyStorage.set('sk_klaar');
    useVoiceStore.getState().setVoice('socrates', 'voice_1');
    renderAt('/profiel/stem');
    expect(screen.getByRole('link', { name: 'Bel Socrates' })).toHaveAttribute(
      'href',
      '/bellen/socrates',
    );
  });
});

describe('belscherm', () => {
  it('niet klaar: verwijst naar de instellingen', () => {
    renderAt('/bellen/socrates');
    expect(screen.getByText('Nog niet klaar om te bellen')).toBeInTheDocument();
  });

  it('een onbekende denker kun je niet bellen', () => {
    renderAt('/bellen/zeus');
    expect(screen.getByText('Deze denker kun je nog niet bellen')).toBeInTheDocument();
  });

  it('bellen: AI-melding, live transcript, dempen, ophangen en een bewaard proefgesprek', async () => {
    elevenLabsKeyStorage.set('sk_klaar');
    useVoiceStore.getState().setVoice('socrates', 'voice_1');
    const user = userEvent.setup();
    renderAt('/bellen/socrates');

    expect(
      await screen.findByText(/Je spreekt zo met een AI-simulatie van Socrates/),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Bel Socrates' }));
    expect(screen.getByText('Verbinden met Socrates…')).toBeInTheDocument();

    act(() => {
      fake.events?.connected('conv_ui');
      fake.events?.message('agent', 'Wees gegroet, vriend! Ik ben een AI-simulatie van Socrates.');
      fake.events?.mode('speaking');
    });
    expect(screen.getByText('Socrates spreekt')).toBeInTheDocument();
    expect(screen.getByLabelText(/Resterende tijd: 1[45]:/)).toBeInTheDocument();
    const log = screen.getByRole('log');
    expect(within(log).getByText(/Wees gegroet, vriend!/)).toBeInTheDocument();

    const mute = screen.getByRole('button', { name: 'Microfoon dempen' });
    expect(mute).toHaveAttribute('aria-pressed', 'false');
    await user.click(mute);
    expect(fake.muted).toEqual([true]);
    expect(mute).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('Je microfoon staat uit')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Ophangen' }));
    expect(await screen.findByRole('heading', { name: 'Gesprek beëindigd' })).toBeInTheDocument();
    expect(screen.getByText('Je hebt opgehangen.')).toBeInTheDocument();
    expect(await screen.findByText(/Kosten: 1\.234 credits/)).toBeInTheDocument();
    expect(fake.ended).toBe(1);

    const [trial] = useVoiceStore.getState().trials;
    expect(trial).toMatchObject({
      figureId: 'socrates',
      endReason: 'gebruiker',
      conversationId: 'conv_ui',
    });
    expect(trial?.transcript[0]?.text).toContain('AI-simulatie van Socrates');
    expect(trial?.cost).toEqual({ credits: 1234, fiat: 0.42, source: 'gesprek' });
  });

  it('een crisissignaal stopt het gesprek en toont de hulpkaart', async () => {
    elevenLabsKeyStorage.set('sk_klaar');
    useVoiceStore.getState().setVoice('socrates', 'voice_1');
    const user = userEvent.setup();
    renderAt('/bellen/socrates');
    await user.click(await screen.findByRole('button', { name: 'Bel Socrates' }));
    act(() => {
      fake.events?.connected('conv_crisis');
      fake.events?.message('user', 'Ik zie het echt niet meer zitten.');
    });
    expect(
      await screen.findByRole('note', { name: 'Je hoeft dit niet alleen te dragen' }),
    ).toHaveTextContent('113');
    expect(screen.getByText(/omdat je iets zei waarbij hulp belangrijk is/)).toBeInTheDocument();
    expect(fake.ended).toBe(1);
  });
});
