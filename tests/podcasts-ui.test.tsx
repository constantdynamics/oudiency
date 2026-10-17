import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EpisodePage } from '@/features/podcasts/EpisodePage';
import { NewEpisodePage } from '@/features/podcasts/NewEpisodePage';
import { PodcastsPage } from '@/features/podcasts/PodcastsPage';
import { MiniPlayer } from '@/podcast/MiniPlayer';
import { pausePodcast } from '@/podcast/playerActions';
import { initialPlayerState, usePlayer } from '@/podcast/playerState';
import { initialPodcastState, usePodcastStore } from '@/store/podcastStore';
import type { PodcastEpisode } from '@/store/schemas';
import { initialProfile, useProfileStore } from '@/store/profileStore';
import { apiKeyStorage, elevenLabsKeyStorage, useSettingsStore } from '@/store/settingsStore';

const player = vi.hoisted(() => ({
  play: vi.fn(),
  pause: vi.fn(),
  playFrom: vi.fn(),
  skipBackward: vi.fn(),
  skipForward: vi.fn(),
  deleteEpisode: vi.fn(async (_id: string) => {}),
  setSpeed: vi.fn(),
  setSleep: vi.fn(),
}));
vi.mock('@/podcast/player', () => player);

const writer = vi.hoisted(() => ({ writeEpisode: vi.fn(async (_id: string) => {}) }));
vi.mock('@/podcast/podcastAi', () => writer);

function episode(id: string, patch: Partial<PodcastEpisode> = {}): PodcastEpisode {
  return {
    id,
    createdAt: '2026-10-16T10:00:00.000Z',
    title: `Aflevering ${id}`,
    topic: 'Moed',
    format: 'monoloog',
    figureIds: ['socrates'],
    minutes: 10,
    source: 'aanvraag',
    status: 'klaar',
    segments: [
      { id: `${id}-0`, speaker: 'sophie', text: 'Welkom, dit is een AI-simulatie.', kind: 'intro' },
      { id: `${id}-1`, speaker: 'socrates', text: 'Wat is moed?', kind: 'deel' },
      { id: `${id}-2`, speaker: 'socrates', text: 'Laten we het onderzoeken.', kind: 'deel' },
    ],
    ...patch,
  };
}

function setEpisodes(episodes: PodcastEpisode[], queue: string[]) {
  usePodcastStore.setState({ ...initialPodcastState(), episodes, queue });
}

function Where() {
  return <p data-testid="pad">{useLocation().pathname}</p>;
}

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/podcasts" element={<PodcastsPage />} />
        <Route path="/podcasts/nieuw" element={<NewEpisodePage />} />
        <Route path="/podcasts/:id" element={<EpisodePage />} />
        <Route path="*" element={<p>Andere pagina</p>} />
      </Routes>
      <MiniPlayer />
      <Where />
    </MemoryRouter>,
  );
}

function withKeys({ claude = true, elevenLabs = true } = {}) {
  if (claude) {
    apiKeyStorage.set('sk-ant-test');
    useSettingsStore.getState().update({ aiSource: 'anthropic-browser' });
  }
  if (elevenLabs) elevenLabsKeyStorage.set('sk_test');
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
  usePlayer.setState(initialPlayerState());
  setEpisodes([], []);
  useProfileStore.setState({ profile: { ...initialProfile(), displayName: 'Sanne' } });
  useSettingsStore.getState().update({ aiSource: 'demo' });
});

afterEach(() => {
  apiKeyStorage.clear();
  elevenLabsKeyStorage.clear();
  document.documentElement.style.removeProperty('--player-h');
});

describe('miniplayer', () => {
  it('verschijnt pas als er iets klaarstaat, en houdt ruimte vrij', () => {
    renderAt('/ergens');
    expect(screen.queryByRole('region', { name: 'Podcastspeler' })).not.toBeInTheDocument();

    act(() => setEpisodes([episode('e1')], ['e1']));
    const mini = screen.getByRole('region', { name: 'Podcastspeler' });
    expect(within(mini).getByText('Klaar om te luisteren')).toBeInTheDocument();
    expect(
      within(mini).getByRole('link', { name: /Aflevering e1.*open de podcastspeler/ }),
    ).toHaveAttribute('href', '/podcasts');
    expect(document.documentElement.style.getPropertyValue('--player-h')).toBe('4rem');
  });

  it('afspelen, en tijdens het spelen: wie er spreekt en hoe ver je bent', async () => {
    const user = userEvent.setup();
    setEpisodes([episode('e1')], ['e1']);
    renderAt('/ergens');
    await user.click(screen.getByRole('button', { name: 'Afspelen' }));
    await vi.waitFor(() => expect(player.play).toHaveBeenCalledWith('e1'));

    act(() =>
      usePlayer.setState({
        episodeId: 'e1',
        segment: 1,
        seconds: 15,
        duration: 30,
        status: 'speelt',
      }),
    );
    expect(screen.getByText('Socrates spreekt')).toBeInTheDocument();
    expect(
      screen.getByRole('progressbar', { name: 'Voortgang van de aflevering' }),
    ).toHaveAttribute('aria-valuenow', '50');
    await user.click(screen.getByRole('button', { name: 'Pauze' }));
    await vi.waitFor(() => expect(player.pause).toHaveBeenCalled());
    await user.click(screen.getByRole('button', { name: '15 seconden vooruit' }));
    await vi.waitFor(() => expect(player.skipForward).toHaveBeenCalled());
  });

  it('op de Podcasts-pagina zelf niet (daar staat de grote speler)', () => {
    setEpisodes([episode('e1')], ['e1']);
    renderAt('/podcasts');
    expect(screen.queryByRole('region', { name: 'Podcastspeler' })).not.toBeInTheDocument();
    expect(document.documentElement.style.getPropertyValue('--player-h')).toBe('0px');
  });

  it('een fout wordt voorgelezen', () => {
    setEpisodes([episode('e1')], ['e1']);
    usePlayer.setState({ episodeId: 'e1', status: 'fout', error: { message: 'Mis' } });
    renderAt('/ergens');
    expect(screen.getByRole('status')).toHaveTextContent('Het voorlezen lukte niet');
  });
});

describe('bellen', () => {
  it('pauzeert de podcast als die speelt, en laadt de speler anders niet', async () => {
    pausePodcast();
    await Promise.resolve();
    expect(player.pause).not.toHaveBeenCalled();
    usePlayer.setState({ episodeId: 'e1', status: 'speelt' });
    pausePodcast();
    await vi.waitFor(() => expect(player.pause).toHaveBeenCalled());
  });
});

describe('Podcasts-pagina', () => {
  it('zonder sleutels: wat er nog moet gebeuren (geen demomodus)', () => {
    renderAt('/podcasts');
    const setup = screen.getByRole('region', { name: 'Eerst je sleutels' });
    expect(within(setup).getByRole('link', { name: 'Naar Instellingen' })).toHaveAttribute(
      'href',
      '/profiel',
    );
    expect(within(setup).getByRole('link', { name: 'Naar Stem & bellen' })).toHaveAttribute(
      'href',
      '/profiel/stem',
    );
    expect(screen.getByText('Nog geen afleveringen')).toBeInTheDocument();
  });

  it('met sleutels: geen uitleg, wel de speler, de wachtrij en je afleveringen', () => {
    withKeys();
    setEpisodes(
      [episode('e1'), episode('e2', { status: 'fout', error: 'Tegoed op' }), episode('e3')],
      ['e1'],
    );
    renderAt('/podcasts');
    expect(screen.queryByRole('region', { name: 'Eerst je sleutels' })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Aflevering e1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Afspelen' })).toBeInTheDocument();
    expect(screen.getByText(/Tegoed op/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Opnieuw schrijven' })).toBeInTheDocument();
    // De stem van Sophie kun je hier ontwerpen.
    expect(screen.getByRole('heading', { name: 'Stem van Sophie' })).toBeInTheDocument();
  });

  it('wachtrij: hierna of achteraan, en verplaatsen met de knoppen', async () => {
    const user = userEvent.setup();
    withKeys();
    setEpisodes([episode('e1'), episode('e2'), episode('e3'), episode('e4')], ['e1', 'e2', 'e3']);
    renderAt('/podcasts');
    const row = screen
      .getAllByRole('listitem')
      .find(
        (li) =>
          li.textContent?.includes('Aflevering e4') &&
          within(li).queryByRole('button', { name: 'Speel hierna' }),
      );
    await user.click(within(row!).getByRole('button', { name: 'Speel hierna' }));
    expect(usePodcastStore.getState().queue).toEqual(['e1', 'e4', 'e2', 'e3']);

    const later = screen.getByRole('button', { name: 'Aflevering e1 later' });
    await user.click(later);
    expect(usePodcastStore.getState().queue).toEqual(['e4', 'e1', 'e2', 'e3']);
    expect(screen.getByText('Aflevering e1 staat nu op plek 2 van 4.')).toBeInTheDocument();
    expect(document.activeElement).toBe(
      screen.getByRole('button', { name: 'Aflevering e1 later' }),
    );

    await user.click(screen.getByRole('button', { name: 'Aflevering e3 uit de wachtrij' }));
    expect(usePodcastStore.getState().queue).toEqual(['e4', 'e1', 'e2']);
  });

  it('wachtrij: slepen aan het handvat', () => {
    withKeys();
    setEpisodes([episode('e1'), episode('e2'), episode('e3')], ['e1', 'e2', 'e3']);
    const { container } = renderAt('/podcasts');
    const handle = container.querySelector('ol[aria-label="Wachtrij"] li span[aria-hidden]')!;
    fireEvent.pointerDown(handle, { button: 0, clientY: 100, pointerId: 1 });
    fireEvent.pointerMove(handle, { clientY: 250, pointerId: 1 });
    fireEvent.pointerUp(handle, { clientY: 250, pointerId: 1 });
    expect(usePodcastStore.getState().queue).toEqual(['e2', 'e3', 'e1']);
  });

  it('verwijderen vraagt eerst om bevestiging', async () => {
    const user = userEvent.setup();
    withKeys();
    setEpisodes([episode('e1')], []);
    renderAt('/podcasts');
    await user.click(screen.getByRole('button', { name: 'Verwijderen: Aflevering e1' }));
    const dialog = screen.getByRole('dialog', { name: 'Aflevering verwijderen?' });
    await user.click(within(dialog).getByRole('button', { name: 'Verwijderen' }));
    await vi.waitFor(() => expect(player.deleteEpisode).toHaveBeenCalledWith('e1'));
  });

  it('aflevering van de dag aan of uit, met een eigen lengte', async () => {
    const user = userEvent.setup();
    renderAt('/podcasts');
    await user.click(screen.getByRole('button', { name: '20 min' }));
    expect(usePodcastStore.getState().settings.dailyMinutes).toBe(20);
    await user.click(screen.getByRole('switch', { name: 'Elke dag een nieuwe aflevering' }));
    expect(usePodcastStore.getState().settings.dailyEnabled).toBe(false);
  });

  it('een onderbroken aflevering kun je opnieuw laten schrijven', async () => {
    const user = userEvent.setup();
    withKeys();
    setEpisodes([episode('e1', { status: 'schrijven', segments: [] })], []);
    renderAt('/podcasts');
    expect(screen.getByText('Het schrijven werd onderbroken.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Opnieuw schrijven' }));
    await vi.waitFor(() => expect(writer.writeEpisode).toHaveBeenCalledWith('e1'));
    expect(screen.getByText('Wordt geschreven …')).toBeInTheDocument();
  });
});

describe('nieuwe aflevering', () => {
  it('zonder Claude-sleutel kun je niets laten schrijven', () => {
    renderAt('/podcasts/nieuw');
    expect(screen.getByRole('button', { name: 'Laat schrijven' })).toBeDisabled();
  });

  it('twee denkers in gesprek: kiezen, onderwerp, lengte en de schatting', async () => {
    const user = userEvent.setup();
    withKeys();
    renderAt('/podcasts/nieuw');
    await user.click(screen.getByRole('button', { name: 'Twee denkers in gesprek' }));
    await user.click(screen.getByRole('button', { name: /^Socrates/ }));
    await user.click(screen.getByRole('button', { name: /^Immanuel Kant/ }));
    expect(screen.getByText('Je hebt er al twee. Haal eerst iemand weg.')).toBeInTheDocument();
    await user.type(screen.getByLabelText('Onderwerp'), 'Mag je liegen om iemand te redden?');
    await user.click(screen.getByRole('button', { name: '15 min' }));
    expect(screen.getByText(/ongeveer 6\.750 ElevenLabs-credits/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Laat schrijven' }));

    const [created] = usePodcastStore.getState().episodes;
    expect(created).toMatchObject({
      format: 'gesprek',
      figureIds: ['socrates', 'kant'],
      topic: 'Mag je liegen om iemand te redden?',
      minutes: 15,
      source: 'aanvraag',
      status: 'schrijven',
    });
    expect(usePodcastStore.getState().queue).toEqual([created!.id]);
    await vi.waitFor(() => expect(writer.writeEpisode).toHaveBeenCalledWith(created!.id));
    expect(screen.getByTestId('pad')).toHaveTextContent('/podcasts');
  });

  it('bij signalen van crisis: geen aflevering, wel de hulpkaart', async () => {
    const user = userEvent.setup();
    withKeys();
    renderAt('/podcasts/nieuw');
    await user.click(screen.getByRole('button', { name: /^Socrates/ }));
    await user.type(screen.getByLabelText('Onderwerp'), 'Ik wil niet meer leven');
    await user.click(screen.getByRole('button', { name: 'Laat schrijven' }));
    expect(
      screen.getByRole('note', { name: 'Je hoeft dit niet alleen te dragen' }),
    ).toBeInTheDocument();
    expect(usePodcastStore.getState().episodes).toEqual([]);
  });
});

describe('tekst van een aflevering', () => {
  it('loopt mee met wat je hoort; vanaf elk fragment afspelen', async () => {
    const user = userEvent.setup();
    withKeys();
    setEpisodes([episode('e1')], ['e1']);
    usePlayer.setState({ episodeId: 'e1', segment: 1, seconds: 3, duration: 30, status: 'pauze' });
    renderAt('/podcasts/e1');
    expect(screen.getByRole('heading', { level: 1, name: 'Aflevering e1' })).toBeInTheDocument();
    const current = document.querySelector('[aria-current="true"]');
    expect(current).toHaveTextContent('Wat is moed?');
    // Hier staat de grote speler, dus geen miniplayer.
    expect(screen.queryByRole('region', { name: 'Podcastspeler' })).not.toBeInTheDocument();
    const playFrom = screen.getAllByRole('button', { name: 'Speel vanaf hier (Socrates)' });
    await user.click(playFrom[1]!);
    await vi.waitFor(() => expect(player.playFrom).toHaveBeenCalledWith('e1', 2));
  });

  it('een onbekende aflevering', () => {
    renderAt('/podcasts/bestaat-niet');
    expect(
      screen.getByText('Deze aflevering staat niet (meer) op dit apparaat.'),
    ).toBeInTheDocument();
  });
});
