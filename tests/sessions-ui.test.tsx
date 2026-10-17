import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ALL_FIGURES } from '@/data/figures/all';
import type { Figure } from '@/data/types';
import { BookingPage } from '@/features/sessions/BookingPage';
import { SessionPage } from '@/features/sessions/SessionPage';
import { SessionsPage } from '@/features/sessions/SessionsPage';
import { clock } from '@/lib/clock';
import { localDateTime, MINUTE } from '@/lib/dates';
import { daySlots } from '@/services/booking.service';
import { bookSession } from '@/services/session.service';
import { useBookingStore } from '@/store/bookingStore';
import { initialProfile, useProfileStore } from '@/store/profileStore';
import { useSessionStore } from '@/store/sessionStore';
import { apiKeyStorage, useSettingsStore } from '@/store/settingsStore';

const socrates = ALL_FIGURES.find((f) => f.id === 'socrates') as Figure;
const DAY = '2026-10-19';
const MORNING = localDateTime(DAY, '08:00');

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/sessies" element={<SessionsPage />} />
        <Route path="/sessies/boeken/:figureId?" element={<BookingPage />} />
        <Route path="/sessies/:id" element={<SessionPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

function firstFreeTime(): string {
  const slot = daySlots(socrates, DAY, MORNING, []).find((s) => s.status === 'vrij');
  if (!slot) throw new Error('geen vrij slot');
  return slot.time;
}

beforeEach(() => {
  useBookingStore.setState({ bookings: [] });
  useSessionStore.setState({ sessions: [] });
  useProfileStore.setState({ profile: { ...initialProfile(), displayName: 'Sanne' } });
  useSettingsStore.getState().update({ devInstantReactions: true, aiSource: 'demo' });
  clock.travelTo(MORNING);
});

afterEach(() => {
  clock.setOffset(0);
  vi.unstubAllGlobals();
  apiKeyStorage.clear();
});

describe('afspraak maken', () => {
  it('kies een slot, geef een onderwerp op en bevestig', async () => {
    const user = userEvent.setup();
    renderAt('/sessies/boeken/socrates');
    const time = firstFreeTime();
    const slot = await screen.findByRole('button', { name: new RegExp(`^${time}`) });
    expect(screen.getAllByText('Bezet — in gesprek met een andere student').length).toBeGreaterThan(
      0,
    );
    await user.click(slot);
    expect(slot).toHaveAttribute('aria-pressed', 'true');
    await user.type(screen.getByLabelText('Waarover wil je praten? (optioneel)'), 'Wat is moed?');
    await user.click(screen.getByRole('button', { name: 'Bevestig de afspraak' }));
    expect(await screen.findByRole('heading', { name: 'Afspraak bevestigd' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Zet in je agenda (.ics)' })).toBeInTheDocument();
    const [booking] = useBookingStore.getState().bookings;
    expect(booking).toMatchObject({
      figureId: 'socrates',
      date: DAY,
      time,
      topicHint: 'Wat is moed?',
    });
    expect(useProfileStore.getState().profile.usageByDate[DAY]?.sessions).toBe(1);
  });

  it('zonder denker: kies eerst wie je wilt spreken (alleen wie je kent)', async () => {
    renderAt('/sessies/boeken');
    expect(screen.getByRole('heading', { name: 'Kies een denker' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Socrates/ })).toHaveAttribute(
      'href',
      '/sessies/boeken/socrates',
    );
    expect(screen.queryByRole('link', { name: /Plato/ })).not.toBeInTheDocument();
  });
});

describe('het gesprek', () => {
  it('deur open → typen → begroeting, beurt, beëindigen en samenvatting', async () => {
    const user = userEvent.setup();
    const time = firstFreeTime();
    const booking = bookSession(socrates, { figureId: 'socrates', date: DAY, time }, MORNING);
    clock.travelTo(localDateTime(DAY, time) + MINUTE);
    renderAt(`/sessies/${booking.id}`);

    expect(await screen.findByText('Hoe wil je het gesprek voeren?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Bellen/ })).toBeDisabled();
    expect(
      screen.getByText(/Om te bellen met Socrates heb je een ElevenLabs-sleutel/),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Typen/ }));
    const input = await screen.findByLabelText('Jouw bericht');
    // De begroeting komt binnen; daarna kun je typen.
    await screen.findByText(
      (_, el) => el?.tagName === 'P' && /^SOCRATES$/i.test(el.textContent ?? ''),
    );
    await waitForEnabled(input);
    await user.type(input, 'Ik twijfel of ik van baan moet wisselen.{Enter}');
    expect(await screen.findByText('Ik twijfel of ik van baan moet wisselen.')).toBeInTheDocument();
    await waitUntil(() => {
      const figureTurns = useSessionStore
        .getState()
        .sessions[0]?.messages.filter((m) => m.role === 'figure');
      return (figureTurns?.length ?? 0) >= 2;
    });

    await user.click(screen.getByRole('button', { name: 'Gesprek beëindigen' }));
    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Gesprek beëindigen' }));
    expect(await screen.findByRole('heading', { name: 'Samenvatting' })).toBeInTheDocument();
    expect(screen.getByText('Om mee te nemen')).toBeInTheDocument();
    expect(useSessionStore.getState().sessions[0]).toMatchObject({
      status: 'afgerond',
      endReason: 'gebruiker',
    });
    expect(useBookingStore.getState().bookings[0]?.status).toBe('afgerond');
  });

  it('eigen key zonder tegoed: de echte reden, en verder in de demomodus', async () => {
    const user = userEvent.setup();
    apiKeyStorage.set('sk-ant-test-zonder-tegoed');
    useSettingsStore.getState().update({ aiSource: 'anthropic-browser' });
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(
            JSON.stringify({
              type: 'error',
              error: {
                type: 'invalid_request_error',
                message: 'Your credit balance is too low to access the Anthropic API.',
              },
            }),
            { status: 400, headers: { 'content-type': 'application/json' } },
          ),
      ),
    );
    const time = firstFreeTime();
    const booking = bookSession(socrates, { figureId: 'socrates', date: DAY, time }, MORNING);
    clock.travelTo(localDateTime(DAY, time) + MINUTE);
    renderAt(`/sessies/${booking.id}`);
    await user.click(await screen.findByRole('button', { name: /Typen/ }));

    const alert = await screen.findByRole('alert', undefined, { timeout: 8000 });
    expect(alert).toHaveTextContent('Je tegoed bij Anthropic is op');
    expect(alert).toHaveTextContent('Claude: Your credit balance is too low');
    expect(
      within(alert).getByRole('link', { name: 'Open Billing in de Claude Console' }),
    ).toHaveAttribute('href', 'https://platform.claude.com/settings/billing');

    await user.click(within(alert).getByRole('button', { name: 'Verder in de demomodus' }));
    expect(useSettingsStore.getState().settings.aiSource).toBe('demo');
    // De begroeting komt nu uit de demomodus; daarna kun je typen.
    await waitForEnabled(await screen.findByLabelText('Jouw bericht'));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('te vroeg: wanneer de deur opengaat, met agenda, verzetten en annuleren', async () => {
    const time = firstFreeTime();
    const booking = bookSession(socrates, { figureId: 'socrates', date: DAY, time }, MORNING);
    renderAt(`/sessies/${booking.id}`);
    expect(
      await screen.findByText(new RegExp(`^De deur gaat open om ${time} \\(over .+\\)\\.$`)),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Verzetten' })).toHaveAttribute(
      'href',
      `/sessies/boeken/socrates?verzet=${booking.id}`,
    );
    expect(screen.getByRole('button', { name: 'Afspraak annuleren' })).toBeInTheDocument();
  });

  it('gemist na het startvenster', async () => {
    const time = firstFreeTime();
    const booking = bookSession(socrates, { figureId: 'socrates', date: DAY, time }, MORNING);
    act(() => clock.travelTo(localDateTime(DAY, time) + 11 * MINUTE));
    renderAt(`/sessies/${booking.id}`);
    expect(
      await screen.findByText('Afspraak gemist — de dagplek is weer vrij.'),
    ).toBeInTheDocument();
  });
});

describe('overzicht', () => {
  it('komende afspraak en de stand van vandaag', () => {
    const time = firstFreeTime();
    bookSession(socrates, { figureId: 'socrates', date: DAY, time }, MORNING);
    renderAt('/sessies');
    expect(screen.getByText('Sessies vandaag: 1 van 1')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Socrates' })).toBeInTheDocument();
    expect(screen.getByText('Nog geen gesprekken gevoerd.')).toBeInTheDocument();
  });
});

/* Kleine hulpjes: wachten op een voorwaarde zonder vaste pauzes. */
async function waitUntil(check: () => boolean, timeout = 3000) {
  const start = Date.now();
  while (!check()) {
    if (Date.now() - start > timeout) throw new Error('timeout');
    await act(() => new Promise((resolve) => setTimeout(resolve, 20)));
  }
}

async function waitForEnabled(element: HTMLElement) {
  await waitUntil(() => !(element as HTMLTextAreaElement).disabled);
}
