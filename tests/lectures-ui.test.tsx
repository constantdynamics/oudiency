import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ALL_FIGURES } from '@/data/figures/all';
import type { Figure } from '@/data/types';
import { LecturePage } from '@/features/lectures/LecturePage';
import { LectureRequestPage } from '@/features/lectures/LectureRequestPage';
import { LecturesPage } from '@/features/lectures/LecturesPage';
import { useLectureRun } from '@/features/lectures/liveLecture';
import { clock } from '@/lib/clock';
import { localDateKey, localDateTime } from '@/lib/dates';
import { useLectureStore } from '@/store/lectureStore';
import { useLibraryStore } from '@/store/miscStores';
import { initialProfile, useProfileStore } from '@/store/profileStore';
import { useSettingsStore } from '@/store/settingsStore';

const socrates = ALL_FIGURES.find((f) => f.id === 'socrates') as Figure;
const NOW = localDateTime('2026-10-19', '10:00');

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/colleges" element={<LecturesPage />} />
        <Route path="/colleges/aanvragen/:figureId?" element={<LectureRequestPage />} />
        <Route path="/colleges/:id" element={<LecturePage />} />
      </Routes>
    </MemoryRouter>,
  );
}

async function waitUntil(check: () => boolean, timeout = 4000) {
  const start = Date.now();
  while (!check()) {
    if (Date.now() - start > timeout) throw new Error('timeout');
    await act(() => new Promise((resolve) => setTimeout(resolve, 20)));
  }
}

/** Wacht tot het lopende onderdeel klaar is (de demo is direct, maar laadt lazy). */
async function settle() {
  await waitUntil(() => {
    const { status } = useLectureRun.getState();
    return status === 'stil' || status === 'fout';
  });
}

beforeEach(() => {
  useLectureStore.setState({ lectures: [] });
  useLibraryStore.setState({ likes: {}, watched: {} });
  useLectureRun.setState({ status: 'stil', text: '', lectureId: undefined });
  useProfileStore.setState({ profile: { ...initialProfile(), displayName: 'Sanne' } });
  useSettingsStore.getState().update({ devInstantReactions: true, aiSource: 'demo' });
  clock.travelTo(NOW);
});

afterEach(() => {
  clock.setOffset(0);
});

describe('college aanvragen', () => {
  it('zonder docent: kies eerst wie je kent', () => {
    renderAt('/colleges/aanvragen');
    expect(screen.getByRole('heading', { name: 'Kies een docent' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Socrates/ })).toHaveAttribute(
      'href',
      '/colleges/aanvragen/socrates',
    );
  });

  it('daglimiet bereikt: geen formulier, wel de uitleg', () => {
    useProfileStore.getState().consumeUsage('lectures', localDateKey(NOW));
    renderAt('/colleges/aanvragen/socrates');
    expect(screen.getByText('Je hebt vandaag al een college aangevraagd.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Begin het college' })).not.toBeInTheDocument();
  });
});

describe('een college volgen (demomodus)', () => {
  it('aanvraag → plan en opening → delen met een vraag → conclusie → terugkijken', async () => {
    const user = userEvent.setup();
    renderAt('/colleges/aanvragen/socrates');
    await user.type(screen.getByLabelText('Onderwerp'), 'Moed in het dagelijks leven');
    await user.type(screen.getByLabelText('Hoofdvraag'), 'Wat is moed, als je geen soldaat bent?');
    const begin = screen.getByRole('button', { name: 'Begin het college' });
    await waitUntil(() => !(begin as HTMLButtonElement).disabled);
    await user.click(begin);

    // Plan en opening komen vanzelf; daarna wacht het college.
    await settle();
    expect(await screen.findByRole('heading', { name: 'Opening' })).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: 'Voortgang van het college' })).toHaveAttribute(
      'aria-valuenow',
      '1',
    );
    expect(screen.queryByRole('button', { name: 'Vraag stellen' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Ga verder' }));
    await settle();
    expect(await screen.findByText('Deel 1')).toBeInTheDocument();

    // Een vraag na deel 1.
    await user.click(screen.getByRole('button', { name: 'Vraag stellen' }));
    expect(screen.getByText('Nog 3 van 3 vragen over')).toBeInTheDocument();
    await user.type(screen.getByLabelText('Jouw vraag'), 'Is moed hetzelfde als roekeloosheid?');
    await user.click(screen.getByRole('button', { name: 'Stel je vraag' }));
    await settle();
    expect(
      await screen.findByRole('heading', { name: 'Antwoord op je vraag' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Is moed hetzelfde als roekeloosheid?')).toBeInTheDocument();
    expect(screen.getByText('Nog 2 van 3 vragen over')).toBeInTheDocument();

    for (let i = 0; i < 3; i++) {
      await user.click(screen.getByRole('button', { name: 'Ga verder' }));
      await settle();
    }

    // Afgerond: het college staat nu in terugkijkweergave.
    expect(await screen.findByRole('heading', { name: 'Verder lezen' })).toBeInTheDocument();
    const lecture = useLectureStore.getState().lectures[0]!;
    expect(lecture.status).toBe('afgerond');
    const reading = screen.getByRole('heading', { name: 'Verder lezen' }).closest('section')!;
    const titles = within(reading)
      .getAllByRole('listitem')
      .map((li) => li.querySelector('span')?.textContent);
    const real = new Set(socrates.keyWorks.map((w) => w.title));
    expect(titles.length).toBeGreaterThan(0);
    expect(titles.every((title) => title && real.has(title))).toBe(true);
    // Hoofdstuknavigatie (mobiel en desktop), met het antwoord op je vraag ertussen.
    expect(screen.getAllByRole('button', { name: 'Conclusie' })).toHaveLength(2);
    expect(screen.getAllByRole('button', { name: 'Antwoord op je vraag' })).toHaveLength(2);
    expect(useLibraryStore.getState().watched[lecture.id]?.completedAt).toBeDefined();

    // Delen op het platform → ingediend voor moderatie.
    await user.click(screen.getByRole('button', { name: 'Deel op het platform' }));
    expect(useLectureStore.getState().lectures[0]?.share).toBe('ingediend');
    expect(screen.getByText('Ingediend voor moderatie')).toBeInTheDocument();
  });
});

describe('terugkijken', () => {
  it('een voorbeeldcollege met hoofdstukken, afspeelmodus en vind-ik-leuk', async () => {
    const user = userEvent.setup();
    renderAt('/colleges/vb-socrates-agora');
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Is sociale media een agora?' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Voorbeeld')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: '1. Wat was de agora eigenlijk?' }).length).toBe(
      2,
    );
    expect(screen.getByRole('heading', { name: 'Verder lezen' })).toBeInTheDocument();

    const like = screen.getByRole('button', { name: 'Vind ik leuk' });
    await user.click(like);
    expect(screen.getByRole('button', { name: 'Leuk gevonden' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(useLibraryStore.getState().likes['vb-socrates-agora']).toBeDefined();
    expect(screen.queryByRole('button', { name: 'Deel op het platform' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Afspeelmodus' }));
    expect(screen.getByRole('button', { name: 'Pauze' })).toBeInTheDocument();
    expect(
      screen.getByRole('progressbar', { name: 'Voortgang van het afspelen' }),
    ).toBeInTheDocument();
    // De conclusie is nog niet verschenen.
    expect(screen.queryByRole('heading', { name: 'Conclusie' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Pauze' }));
    expect(screen.getByRole('button', { name: 'Afspelen' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Stop afspeelmodus' }));
    expect(screen.getByRole('heading', { name: 'Conclusie' })).toBeInTheDocument();
  });

  it('een onbekend college', () => {
    renderAt('/colleges/bestaat-niet');
    expect(screen.getByText('College niet gevonden')).toBeInTheDocument();
  });
});

describe('overzicht', () => {
  it('de bibliotheek met voorbeeldcolleges en je eigen colleges', () => {
    renderAt('/colleges');
    expect(screen.getByText('Colleges vandaag: 0 van 1')).toBeInTheDocument();
    expect(screen.getByText('Je hebt nog geen colleges aangevraagd.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Is sociale media een agora?' })).toHaveAttribute(
      'href',
      '/colleges/vb-socrates-agora',
    );
  });
});
