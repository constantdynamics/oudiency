import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { CORE_IDS, findMeta } from '@/data/figures';
import { DiscoverPage } from '@/features/discover/DiscoverPage';
import { clock } from '@/lib/clock';
import { localDateTime } from '@/lib/dates';
import { useCacheStore, useLibraryStore } from '@/store/miscStores';
import { usePostStore } from '@/store/postStore';
import { initialProfile, useProfileStore } from '@/store/profileStore';
import { useSettingsStore } from '@/store/settingsStore';

const NOW = localDateTime('2026-10-19', '12:00');

function renderAt(path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/" element={<DiscoverPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  useLibraryStore.setState({ likes: {}, watched: {} });
  useCacheStore.setState({ thoughts: {}, figureOfTheDay: undefined });
  usePostStore.setState({ posts: [] });
  useProfileStore.setState({ profile: initialProfile() });
  useSettingsStore.getState().update({ devInstantReactions: true, aiSource: 'demo' });
  clock.travelTo(NOW);
});

afterEach(() => {
  clock.setOffset(0);
});

describe('ontdekken', () => {
  it('de homepage: denker van de dag, topcolleges, onderwerpen en vragen', () => {
    renderAt();
    expect(
      screen.getByRole('heading', { level: 1, name: 'Waar wil je vandaag over nadenken?' }),
    ).toBeInTheDocument();
    const day = useCacheStore.getState().figureOfTheDay!;
    expect(day.dateKey).toBe('2026-10-19');
    expect(screen.getByRole('link', { name: findMeta(day.figureId)!.name })).toHaveAttribute(
      'href',
      `/denkers/${day.figureId}`,
    );
    expect(screen.getByText('Nog niet ontdekt')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Topcolleges' })).toBeInTheDocument();
    expect(screen.getByText(/Nog niets trending/)).toBeInTheDocument();
    expect(screen.getByText(/Volg een denker/)).toBeInTheDocument();
    const topics = screen
      .getByRole('heading', { name: 'Trending onderwerpen' })
      .closest('section')!;
    expect(within(topics).getAllByRole('link').length).toBeGreaterThan(3);
  });

  it('de denker van de dag blijft dezelfde, ook als je hem ontdekt', () => {
    const first = renderAt();
    const day = useCacheStore.getState().figureOfTheDay!;
    first.unmount();
    useProfileStore.getState().discover(day.figureId);
    renderAt();
    expect(useCacheStore.getState().figureOfTheDay?.figureId).toBe(day.figureId);
    expect(screen.queryByText('Nog niet ontdekt')).not.toBeInTheDocument();
  });

  it('zoeken en filteren (ook via een onderwerp in de link)', async () => {
    const user = userEvent.setup();
    renderAt('/?thema=dialoog');
    expect(screen.getByText('1 college gevonden')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Is sociale media een agora?' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Wis zoekopdracht' }));
    await user.type(screen.getByRole('searchbox'), 'liegen');
    expect(screen.getByText('1 college gevonden')).toBeInTheDocument();
    await user.clear(screen.getByRole('searchbox'));
    await user.type(screen.getByRole('searchbox'), 'xyzzy');
    expect(screen.getByText('Geen colleges gevonden. Vraag er zelf een aan!')).toBeInTheDocument();
  });

  it('een like maakt een college top en trending', async () => {
    useLibraryStore.setState({
      likes: { 'vb-kant-liegen': new Date(NOW - 3_600_000).toISOString() },
    });
    renderAt();
    const trending = screen.getByRole('heading', { name: 'Trending' }).closest('section')!;
    expect(
      within(trending).getByRole('link', { name: 'Mag je liegen om iemand te beschermen?' }),
    ).toBeInTheDocument();
  });

  it('wie kan mij helpen: drie denkers met een reden en vervolgstappen', async () => {
    const user = userEvent.setup();
    renderAt();
    await user.type(
      screen.getByLabelText('Waar zit je mee?'),
      'Ik ben bang om fouten te maken op mijn werk.',
    );
    await user.click(screen.getByRole('button', { name: 'Zoek denkers' }));
    const results = await screen.findByRole('heading', { name: /Deze denkers kunnen meedenken/ });
    const list = results.parentElement!.querySelector('ul')!;
    const items = within(list).getAllByRole('listitem');
    expect(items).toHaveLength(3);
    for (const item of items) {
      expect(within(item).getByRole('link', { name: 'Plan een sessie' })).toBeInTheDocument();
      expect(within(item).getByRole('link', { name: 'Vraag een college aan' })).toBeInTheDocument();
    }
    // Netwerkdenkers die je nog niet kende, heb je nu ontdekt.
    const discovered = useProfileStore.getState().profile.discovered;
    expect(discovered.every((id) => !CORE_IDS.includes(id))).toBe(true);
  });

  it('wie kan mij helpen bij een crisissignaal: de hulpkaart, geen denkers', async () => {
    const user = userEvent.setup();
    renderAt();
    await user.type(screen.getByLabelText('Waar zit je mee?'), 'Ik wil dood.');
    await user.click(screen.getByRole('button', { name: 'Zoek denkers' }));
    expect(
      screen.getByRole('note', { name: 'Je hoeft dit niet alleen te dragen' }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Deze denkers kunnen meedenken/)).not.toBeInTheDocument();
  });
});
