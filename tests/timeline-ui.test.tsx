import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { figureName } from '@/data/figures';
import { TimelinePage } from '@/features/timeline/TimelinePage';
import { useReactionJobs } from '@/features/timeline/reactionJobs';
import { clock } from '@/lib/clock';
import { localDateTime } from '@/lib/dates';
import { useDailyQuestionStore, useNotificationStore } from '@/store/miscStores';
import { usePostStore } from '@/store/postStore';
import { initialProfile, useProfileStore } from '@/store/profileStore';
import { useSettingsStore } from '@/store/settingsStore';

const NOW = localDateTime('2026-10-19', '09:00');

function renderTimeline() {
  return render(
    <MemoryRouter initialEntries={['/timeline']}>
      <Routes>
        <Route path="/timeline" element={<TimelinePage />} />
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

beforeEach(() => {
  usePostStore.setState({ posts: [] });
  useDailyQuestionStore.setState({ days: {} });
  useNotificationStore.setState({ notifications: [] });
  useReactionJobs.setState({ pending: {}, lastRunAt: 0 });
  useProfileStore.setState({ profile: initialProfile() });
  useSettingsStore.getState().update({ devInstantReactions: true, aiSource: 'demo' });
  clock.travelTo(NOW);
});

afterEach(() => {
  clock.setOffset(0);
});

describe('timeline', () => {
  it('de vraag van de dag: gesteld door een denker, één keer een andere vraag', async () => {
    const user = userEvent.setup();
    renderTimeline();
    const card = await screen.findByText('Vraag van de dag');
    const day = Object.values(useDailyQuestionStore.getState().days)[0]!;
    expect(screen.getByText(`${figureName(day.askerId)} vraagt:`)).toBeInTheDocument();
    expect(card).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Andere vraag' }));
    expect(Object.values(useDailyQuestionStore.getState().days)[0]?.shown).toHaveLength(2);
    expect(screen.queryByRole('button', { name: 'Andere vraag' })).not.toBeInTheDocument();
  });

  it('beantwoorden: het antwoord krijgt de vraag als context', async () => {
    const user = userEvent.setup();
    renderTimeline();
    await user.click(await screen.findByRole('button', { name: 'Beantwoorden' }));
    const day = Object.values(useDailyQuestionStore.getState().days)[0]!;
    const asker = figureName(day.askerId);
    expect(screen.getByText(`Antwoord op de vraag van ${asker}:`)).toBeInTheDocument();
    await user.type(screen.getByLabelText('Jouw antwoord'), 'Over mijn werk, eerlijk gezegd.');
    await user.click(screen.getByRole('button', { name: 'Plaatsen' }));
    expect(await screen.findByText('Beantwoord')).toBeInTheDocument();
    const post = usePostStore.getState().posts[0]!;
    expect(post.promptFigureId).toBe(day.askerId);
    expect(screen.getByText(`Vraag van ${asker}:`)).toBeInTheDocument();
    // Daarna weer een gewoon bericht.
    expect(screen.getByLabelText('Wat houdt je bezig?')).toBeInTheDocument();
  });

  it('een bericht plaatsen; reacties van denkers verschijnen (dev: direct)', async () => {
    const user = userEvent.setup();
    renderTimeline();
    await user.type(
      screen.getByLabelText('Wat houdt je bezig?'),
      'Hoe blijf ik kalm bij al het nieuws over #oorlog en onrecht?',
    );
    await user.click(screen.getByRole('button', { name: 'Plaatsen' }));
    expect(await screen.findByText('#oorlog')).toBeInTheDocument();
    await waitUntil(() => Object.keys(useReactionJobs.getState().pending).length === 0);
    const post = usePostStore.getState().posts[0]!;
    const article = document.getElementById(`bericht-${post.id}`)!;
    for (const reaction of post.reactions) {
      const name = figureName(reaction.figureId);
      if (reaction.type === 'comment') {
        expect(within(article).getByText(reaction.text!)).toBeInTheDocument();
        expect(
          within(article).getByText(`Hier dieper op ingaan? Plan een sessie met ${name}`),
        ).toBeInTheDocument();
      } else {
        expect(within(article).getByText(new RegExp(`${name}.*dit mooi`))).toBeInTheDocument();
      }
    }
    expect(useNotificationStore.getState().notifications).toHaveLength(post.reactions.length);
  });

  it('bewerken, liken en verwijderen van je eigen bericht', async () => {
    const user = userEvent.setup();
    renderTimeline();
    await user.type(screen.getByLabelText('Wat houdt je bezig?'), 'Eerste versie.');
    await user.click(screen.getByRole('button', { name: 'Plaatsen' }));
    await screen.findByText('Eerste versie.');
    await user.click(screen.getByRole('button', { name: 'Bewerken' }));
    const field = screen.getByDisplayValue('Eerste versie.');
    await user.clear(field);
    await user.type(field, 'Tweede versie.');
    await user.click(screen.getByRole('button', { name: 'Opslaan' }));
    expect(screen.getByText('Tweede versie.')).toBeInTheDocument();
    expect(screen.getByText('· bewerkt')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Vind ik leuk' }));
    expect(screen.getByRole('button', { name: 'Leuk gevonden' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await user.click(screen.getByRole('button', { name: 'Verwijderen' }));
    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Verwijderen' }));
    expect(usePostStore.getState().posts).toHaveLength(0);
  });

  it('crisissignalen: geen reacties, wel de hulpkaart', async () => {
    const user = userEvent.setup();
    renderTimeline();
    await user.type(screen.getByLabelText('Wat houdt je bezig?'), 'Ik wil niet meer leven.');
    await user.click(screen.getByRole('button', { name: 'Plaatsen' }));
    expect(
      await screen.findByText(
        'Op dit bericht reageren de denkers niet. Lees hieronder waar je terechtkunt.',
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('note', { name: 'Je hoeft dit niet alleen te dragen' }),
    ).toBeInTheDocument();
    expect(usePostStore.getState().posts[0]?.reactions).toEqual([]);
  });
});
