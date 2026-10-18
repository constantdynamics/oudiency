import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ALL_FIGURES } from '@/data/figures/all';
import type { Figure } from '@/data/types';
import { ResearchTeaser } from '@/features/discover/discoverParts';
import { NewResearchPage } from '@/features/research/NewResearchPage';
import { ResearchCallPage } from '@/features/research/ResearchCallPage';
import { ResearchLibraryPage } from '@/features/research/ResearchLibraryPage';
import { ResearchPage } from '@/features/research/ResearchPage';
import { clock } from '@/lib/clock';
import { markActive } from '@/research/researchState';
import { initialProfile, useProfileStore } from '@/store/profileStore';
import type { Research } from '@/store/researchSchemas';
import { initialResearchState, useResearchStore } from '@/store/researchStore';
import { useLectureStore } from '@/store/lectureStore';
import { initialPodcastState, usePodcastStore } from '@/store/podcastStore';
import { apiKeyStorage, elevenLabsKeyStorage, useSettingsStore } from '@/store/settingsStore';

const ai = vi.hoisted(() => ({
  runResearch: vi.fn(async (_id: string) => {}),
  makeOutput: vi.fn(async (_id: string, _outputId: string) => {}),
}));
vi.mock('@/research/researchAi', () => ai);

const player = vi.hoisted(() => ({ play: vi.fn() }));
vi.mock('@/podcast/player', () => player);

const calls = vi.hoisted(() => ({ createResearchCall: vi.fn((..._args: unknown[]) => null) }));
vi.mock('@/research/researchCall', () => calls);

const NOW = new Date(2026, 9, 18, 10, 0).getTime();
const aurelius = ALL_FIGURES.find((f) => f.id === 'aurelius') as Figure;
const DAY = '2026-10-18';

function research(patch: Partial<Research> = {}): Research {
  return {
    id: 'o1',
    createdAt: '2026-10-18T08:00:00.000Z',
    updatedAt: '2026-10-18T08:01:00.000Z',
    day: DAY,
    question: 'Hoe ga je om met woede?',
    title: 'Omgaan met woede',
    figureIds: ['aurelius', 'socrates'],
    status: 'klaar',
    brief: {
      basis: 'bronnen',
      summary: 'Kern.',
      facts: [],
      perspectives: [],
      quotes: [],
      caveats: [],
    },
    sources: [],
    outputs: [
      {
        id: 'v1',
        form: 'tekst',
        createdAt: '2026-10-18T08:01:00.000Z',
        status: 'klaar',
        figureIds: ['aurelius'],
        length: 'kort',
        title: 'Over woede',
        text: 'Ik schreef dit voor mezelf.\n\nWoede vraagt om **uitstel**.',
        furtherReading: [0],
      },
    ],
    ...patch,
  };
}

function Where() {
  const location = useLocation();
  return <p data-testid="pad">{location.pathname}</p>;
}

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/onderzoek" element={<ResearchLibraryPage />} />
        <Route path="/onderzoek/nieuw" element={<NewResearchPage />} />
        <Route path="/onderzoek/:id" element={<ResearchPage />} />
        <Route path="/onderzoek/:id/bellen/:figureId" element={<ResearchCallPage />} />
        <Route path="*" element={<ResearchTeaser />} />
      </Routes>
      <Where />
    </MemoryRouter>,
  );
}

function withKey() {
  apiKeyStorage.set('sk-ant-test');
  useSettingsStore.getState().update({ aiSource: 'anthropic-browser' });
}

beforeEach(() => {
  vi.clearAllMocks();
  clock.freeze(NOW);
  useResearchStore.setState(initialResearchState());
  usePodcastStore.setState(initialPodcastState());
  useProfileStore.setState({ profile: { ...initialProfile(), displayName: 'Sanne' } });
  useSettingsStore.getState().update({ aiSource: 'demo' });
});

afterEach(() => {
  apiKeyStorage.clear();
  elevenLabsKeyStorage.clear();
  clock.setOffset(0);
  markActive('o1', false);
});

describe('ingang op Ontdekken', () => {
  it('"Laat het uitzoeken" met links naar aanvragen en je onderzoeken', () => {
    renderAt('/');
    const card = screen.getByRole('region', { name: 'Laat het uitzoeken' });
    expect(within(card).getByRole('link', { name: 'Onderwerp aanvragen' })).toHaveAttribute(
      'href',
      '/onderzoek/nieuw',
    );
    expect(within(card).getByRole('link', { name: 'Je onderzoeken' })).toHaveAttribute(
      'href',
      '/onderzoek',
    );
  });
});

describe('aanvragen', () => {
  it('zonder eigen Claude-sleutel: uitleg en geen knop', () => {
    renderAt('/onderzoek/nieuw');
    expect(
      screen.getByRole('heading', { name: /alleen met je eigen Claude-sleutel/ }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Bekijk en bevestig' })).toBeDisabled();
  });

  it('vraag en denkers uit de link, kosten in euro’s, bevestigen en dan pas uitzoeken', async () => {
    withKey();
    const user = userEvent.setup();
    renderAt(
      '/onderzoek/nieuw?vraag=Hoe%20ga%20je%20om%20met%20woede%3F&denkers=aurelius,socrates',
    );
    expect(screen.getByLabelText('Wat wil je laten uitzoeken?')).toHaveValue(
      'Hoe ga je om met woede?',
    );
    const chosen = screen.getByRole('list', { name: 'Gekozen' });
    expect(within(chosen).getAllByRole('listitem')).toHaveLength(2);

    // Wie schrijft (twee denkers) en hoe lang.
    await user.click(screen.getByRole('button', { name: 'Socrates' }));
    await user.click(screen.getByRole('button', { name: 'Lang (±1500 woorden)' }));
    expect(screen.getByText(/^Uitzoeken: € ?0,\d\d \(Claude\)$/)).toBeInTheDocument();
    expect(screen.getByText(/^Tekst schrijven: € ?0,\d\d \(Claude\)$/)).toBeInTheDocument();
    expect(screen.getByText(/^Samen ongeveer € ?0,\d\d$/)).toBeInTheDocument();
    expect(
      screen.getByText('Vandaag kun je nog 1 van de 1 onderwerp laten uitzoeken.'),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Bekijk en bevestig' }));
    const confirm = screen.getByRole('heading', { name: 'Klaar om uit te zoeken?' });
    expect(confirm).toHaveFocus();
    expect(useResearchStore.getState().researches).toHaveLength(0);

    await user.click(screen.getByRole('button', { name: 'Ja, zoek het uit' }));
    const [created] = useResearchStore.getState().researches;
    expect(created).toMatchObject({
      question: 'Hoe ga je om met woede?',
      figureIds: ['aurelius', 'socrates'],
      status: 'zoeken',
    });
    expect(created!.outputs[0]).toMatchObject({
      form: 'tekst',
      figureIds: ['socrates'],
      length: 'lang',
    });
    expect(useProfileStore.getState().profile.usageByDate[DAY]?.research).toBe(1);
    await vi.waitFor(() => expect(ai.runResearch).toHaveBeenCalledWith(created!.id));
    expect(screen.getByTestId('pad')).toHaveTextContent(`/onderzoek/${created!.id}`);
  });

  it('een te korte vraag, geen denker, of de daglimiet op: een duidelijke melding', async () => {
    withKey();
    const user = userEvent.setup();
    renderAt('/onderzoek/nieuw');
    await user.type(screen.getByLabelText('Wat wil je laten uitzoeken?'), 'Wat');
    await user.click(screen.getByRole('button', { name: 'Bekijk en bevestig' }));
    expect(screen.getByRole('alert')).toHaveTextContent('5 tot 200 tekens');

    await user.type(screen.getByLabelText('Wat wil je laten uitzoeken?'), ' is moed?');
    await user.click(screen.getByRole('button', { name: 'Bekijk en bevestig' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Kies één tot drie denkers.');

    useProfileStore.setState({
      profile: {
        ...initialProfile(),
        usageByDate: { [DAY]: { sessions: 0, lectures: 0, research: 1 } },
      },
    });
    await user.click(screen.getByRole('button', { name: /Marcus Aurelius/ }));
    await user.click(screen.getByRole('button', { name: 'Bekijk en bevestig' }));
    expect(screen.getByRole('alert')).toHaveTextContent('maximale aantal onderwerpen');
    expect(useResearchStore.getState().researches).toHaveLength(0);
  });
});

describe('een onderzoek', () => {
  it('klaar: de vraag, het panel, het essay met AI-label en leestips (de notitie niet)', async () => {
    useResearchStore.setState({ researches: [research()] });
    renderAt('/onderzoek/o1');
    expect(screen.getByRole('heading', { level: 1, name: 'Omgaan met woede' })).toBeInTheDocument();
    expect(screen.getByText('Hoe ga je om met woede?')).toBeInTheDocument();
    expect(screen.getByText('Met Marcus Aurelius en Socrates')).toBeInTheDocument();
    // Het essay verschijnt zodra het profiel van de schrijver geladen is.
    const essay = await screen.findByRole('article', { name: 'Over woede' });
    expect(within(essay).getByText('Door Marcus Aurelius')).toBeInTheDocument();
    expect(within(essay).getByText('AI-simulatie')).toBeInTheDocument();
    expect(within(essay).getByText('uitstel').tagName).toBe('STRONG');
    expect(within(essay).getByRole('heading', { name: 'Verder lezen' })).toBeInTheDocument();
    expect(within(essay).getByText(aurelius.keyWorks[0]!.title)).toBeInTheDocument();
    expect(screen.queryByText('Kern.')).not.toBeInTheDocument();
  });

  it('er nog iets van maken: zonder daglimiet, en het begint meteen', async () => {
    withKey();
    const user = userEvent.setup();
    useResearchStore.setState({ researches: [research()] });
    renderAt('/onderzoek/o1');
    const more = screen.getByRole('region', { name: 'Maak er nog iets van' });
    await user.click(within(more).getByRole('button', { name: 'Kort (±400 woorden)' }));
    expect(within(more).queryByText(/^Uitzoeken:/)).not.toBeInTheDocument();
    await user.click(within(more).getByRole('button', { name: 'Maak het' }));
    const outputs = useResearchStore.getState().researches[0]!.outputs;
    expect(outputs).toHaveLength(2);
    expect(outputs[1]).toMatchObject({ form: 'tekst', status: 'maken' });
    await vi.waitFor(() => expect(ai.makeOutput).toHaveBeenCalledWith('o1', outputs[1]!.id));
    expect(useProfileStore.getState().profile.usageByDate[DAY]?.research ?? 0).toBe(0);
  });

  it('bezig, onderbroken of geweigerd', async () => {
    const user = userEvent.setup();
    markActive('o1', true);
    useResearchStore.setState({
      researches: [research({ status: 'zoeken', brief: undefined, title: undefined })],
    });
    const { unmount } = renderAt('/onderzoek/o1');
    expect(screen.getByText('We zoeken het uit …')).toBeInTheDocument();
    unmount();

    markActive('o1', false);
    renderAt('/onderzoek/o1');
    expect(screen.getByRole('alert')).toHaveTextContent('onderbroken');
    await user.click(screen.getByRole('button', { name: 'Opnieuw proberen' }));
    await vi.waitFor(() => expect(ai.runResearch).toHaveBeenCalledWith('o1'));

    useResearchStore.setState({
      researches: [research({ status: 'fout', refused: true, error: 'Dit zoeken we niet uit.' })],
    });
    expect(await screen.findByText('Dit zoeken we niet uit.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Opnieuw proberen' })).not.toBeInTheDocument();
  });

  it('verwijderen na bevestigen', async () => {
    const user = userEvent.setup();
    useResearchStore.setState({ researches: [research()] });
    renderAt('/onderzoek/o1');
    await user.click(screen.getByRole('button', { name: 'Verwijder onderzoek' }));
    await user.click(screen.getByRole('button', { name: 'Ja, verwijder' }));
    expect(useResearchStore.getState().researches).toHaveLength(0);
    expect(screen.getByTestId('pad')).toHaveTextContent(/^\/onderzoek$/);
  });
});

describe('je onderzoeken', () => {
  it('leeg: uitleg en een knop', () => {
    withKey();
    renderAt('/onderzoek');
    expect(screen.getByText('Je hebt nog niets laten uitzoeken.')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'Nieuw onderzoek' })[0]).toHaveAttribute(
      'href',
      '/onderzoek/nieuw',
    );
  });

  it('een lijst, nieuwste eerst, met wat er gemaakt is en de status', () => {
    useResearchStore.setState({
      researches: [
        research({ id: 'o2', title: undefined, question: 'Wat is tijd?', status: 'zoeken' }),
        research(),
      ],
    });
    renderAt('/onderzoek');
    const links = screen.getAllByRole('link', { name: /woede|tijd/ });
    expect(links[0]).toHaveAttribute('href', '/onderzoek/o2');
    expect(within(links[0]!).getByText('Onderbroken')).toBeInTheDocument();
    expect(within(links[1]!).getByText(/Gemaakt als tekst · kort/)).toBeInTheDocument();
  });
});

describe('podcast en gesprek uit een onderzoek', () => {
  const podcast = {
    id: 'v2',
    form: 'podcast' as const,
    createdAt: '2026-10-18T08:02:00.000Z',
    status: 'klaar' as const,
    figureIds: ['aurelius', 'socrates', 'kant'],
    podcastFormat: 'gesprek' as const,
    minutes: 10,
    refId: 'e1',
    title: 'Drie stemmen over woede',
  };
  const call = {
    id: 'v3',
    form: 'bellen' as const,
    createdAt: '2026-10-18T08:03:00.000Z',
    status: 'klaar' as const,
    figureIds: ['seneca'],
  };
  const withResearch = () =>
    useResearchStore.setState({
      researches: [
        research({
          figureIds: ['aurelius', 'socrates', 'kant', 'seneca'],
          outputs: [podcast, call],
        }),
      ],
    });
  const withEpisode = () =>
    usePodcastStore.setState({
      ...initialPodcastState(),
      episodes: [
        {
          id: 'e1',
          createdAt: '2026-10-18T08:02:00.000Z',
          title: 'Drie stemmen over woede',
          topic: 'Omgaan met woede',
          format: 'gesprek',
          figureIds: ['aurelius', 'socrates', 'kant'],
          minutes: 10,
          source: 'aanvraag',
          status: 'klaar',
          segments: [],
          researchId: 'o1',
        },
      ],
      queue: ['e1'],
    });

  it('de podcast: drie denkers in gesprek; luisteren kan met een ElevenLabs-sleutel', async () => {
    withResearch();
    withEpisode();
    const { unmount } = renderAt('/onderzoek/o1');
    const card = screen.getByRole('article', { name: 'Drie stemmen over woede' });
    expect(
      within(card).getByText(/Podcast · Drie denkers in gesprek · 10 min/),
    ).toBeInTheDocument();
    expect(within(card).getByRole('button', { name: 'Luister' })).toBeDisabled();
    expect(
      within(card).getByText(/om te luisteren heb je nog een ElevenLabs-sleutel/),
    ).toBeInTheDocument();
    unmount();

    elevenLabsKeyStorage.set('sk_test');
    const user = userEvent.setup();
    renderAt('/onderzoek/o1');
    await user.click(screen.getByRole('button', { name: 'Luister' }));
    await vi.waitFor(() => expect(player.play).toHaveBeenCalledWith('e1'));
    expect(screen.getByTestId('pad')).toHaveTextContent('/podcasts/e1');
  });

  it('de podcast wordt geschreven, of de aflevering is weg', () => {
    withResearch();
    useResearchStore.getState().updateOutput('o1', 'v2', { status: 'maken' });
    markActive('o1/v2', true);
    const { unmount } = renderAt('/onderzoek/o1');
    expect(screen.getByText('Sophie en de denkers schrijven je aflevering …')).toBeInTheDocument();
    unmount();
    markActive('o1/v2', false);

    useResearchStore.getState().updateOutput('o1', 'v2', { status: 'klaar' });
    renderAt('/onderzoek/o1');
    expect(
      screen.getByText('Deze aflevering staat niet meer op dit apparaat.'),
    ).toBeInTheDocument();
  });

  it('het gesprek: bellen kan met een ElevenLabs-sleutel, ook met een netwerkdenker', () => {
    withResearch();
    const { unmount } = renderAt('/onderzoek/o1');
    const card = screen.getByRole('article', { name: 'Gesprek met Seneca' });
    expect(
      within(card).getByText(/Bellen kan met je eigen ElevenLabs-sleutel/),
    ).toBeInTheDocument();
    unmount();

    elevenLabsKeyStorage.set('sk_test');
    renderAt('/onderzoek/o1');
    expect(screen.getByRole('link', { name: 'Bel Seneca' })).toHaveAttribute(
      'href',
      '/onderzoek/o1/bellen/seneca',
    );
  });

  it('de belpagina: tien minuten over je onderzoek, en bellen begint pas na een tik', async () => {
    withResearch();
    elevenLabsKeyStorage.set('sk_test');
    const user = userEvent.setup();
    renderAt('/onderzoek/o1/bellen/seneca');
    expect(
      await screen.findByText('Gesprek over je onderzoek · hooguit 10 minuten'),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Terug naar je onderzoek' })).toHaveAttribute(
      'href',
      '/onderzoek/o1',
    );
    expect(calls.createResearchCall).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Bel Seneca' }));
    expect(calls.createResearchCall).toHaveBeenCalledWith('o1', 'seneca', expect.anything());
  });

  it('de belpagina zonder sleutel, of voor iemand die niet bij het onderzoek hoort', () => {
    withResearch();
    const { unmount } = renderAt('/onderzoek/o1/bellen/seneca');
    expect(screen.getByText(/Bellen kan met je eigen ElevenLabs-sleutel/)).toBeInTheDocument();
    unmount();
    renderAt('/onderzoek/o1/bellen/laozi');
    expect(screen.getByText(/deze denker hoort er niet bij/)).toBeInTheDocument();
  });
});

describe('college uit een onderzoek', () => {
  it('de kaart: docent en gastdocenten, en een knop naar het college', () => {
    useResearchStore.setState({
      researches: [
        research({
          figureIds: ['aurelius', 'socrates', 'kant'],
          outputs: [
            {
              id: 'v4',
              form: 'college',
              createdAt: '2026-10-18T08:04:00.000Z',
              status: 'klaar',
              figureIds: ['aurelius', 'socrates', 'kant'],
              refId: 'c1',
              title: 'Omgaan met woede',
            },
          ],
        }),
      ],
    });
    useLectureStore.setState({
      lectures: [
        {
          id: 'c1',
          figureId: 'aurelius',
          guestIds: ['socrates', 'kant'],
          researchId: 'o1',
          topic: 'Omgaan met woede',
          mainQuestion: 'Hoe ga je om met woede?',
          segments: [],
          questions: [],
          status: 'bezig',
          share: 'privé',
          likedByMe: false,
          createdAt: '2026-10-18T08:04:00.000Z',
          provider: 'anthropic-browser',
        },
      ],
    });
    const { unmount } = renderAt('/onderzoek/o1');
    const card = screen.getByRole('article', { name: 'Omgaan met woede' });
    expect(
      within(card).getByText(
        /College · Marcus Aurelius, met gastdocenten Socrates en Immanuel Kant/,
      ),
    ).toBeInTheDocument();
    expect(within(card).getByRole('link', { name: 'Begin het college' })).toHaveAttribute(
      'href',
      '/colleges/c1',
    );
    unmount();

    useLectureStore.setState({ lectures: [] });
    renderAt('/onderzoek/o1');
    expect(screen.getByText('Dit college staat niet meer op dit apparaat.')).toBeInTheDocument();
  });
});
