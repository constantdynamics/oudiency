import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it } from 'vitest';
import { LecturePage } from '@/features/lectures/LecturePage';
import { ModerationPage } from '@/features/moderation/ModerationPage';
import { localDateTime } from '@/lib/dates';
import { addSegment, requestLecture, submitLecture } from '@/services/lecture.service';
import { useModeratorSession } from '@/services/moderation.service';
import { useLectureStore } from '@/store/lectureStore';
import { useLibraryStore, useNotificationStore } from '@/store/miscStores';
import { initialProfile, useProfileStore } from '@/store/profileStore';
import { useSettingsStore } from '@/store/settingsStore';

const NOW = localDateTime('2026-10-19', '10:00');

function submitted(topic: string) {
  useProfileStore.getState().resetUsageDay('2026-10-19');
  const lecture = requestLecture(
    { figureId: 'socrates', topic, mainQuestion: 'Wat is moed?' },
    'demo',
    NOW,
  );
  useLectureStore.getState().update(lecture.id, {
    plan: { title: topic, segments: [{ heading: 'Een', keyPoints: [] }] },
    precheck: {
      verdict: 'twijfel',
      reasons: ['Bevat een link.'],
      checkedAt: new Date(NOW).toISOString(),
      source: 'regels',
    },
  });
  for (const kind of ['opening', 'deel', 'conclusie'] as const) {
    addSegment(lecture.id, { kind, heading: kind, text: `Tekst van ${kind}.` }, NOW);
  }
  submitLecture(lecture.id, NOW);
  return lecture.id;
}

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/moderatie" element={<ModerationPage />} />
        <Route path="/colleges/:id" element={<LecturePage />} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  useLectureStore.setState({ lectures: [] });
  useLibraryStore.setState({ likes: {}, watched: {} });
  useNotificationStore.setState({ notifications: [] });
  useProfileStore.setState({ profile: initialProfile() });
  useSettingsStore
    .getState()
    .update({ aiSource: 'demo', moderatorMode: false, moderatorPinHash: undefined });
  useModeratorSession.setState({ unlocked: false });
});

describe('moderatormodus', () => {
  it('pincode kiezen, de wachtrij met advies, afkeuren met reden en goedkeuren', async () => {
    const user = userEvent.setup();
    const keep = submitted('Goed college');
    const drop = submitted('Twijfelachtig college');
    renderAt('/moderatie');
    await user.type(screen.getByLabelText('Pincode'), '2468');
    await user.type(screen.getByLabelText('Herhaal de pincode'), '1357');
    await user.click(screen.getByRole('button', { name: 'Moderatormodus aanzetten' }));
    expect(screen.getByText('De pincodes zijn niet gelijk.')).toBeInTheDocument();
    await user.clear(screen.getByLabelText('Herhaal de pincode'));
    await user.type(screen.getByLabelText('Herhaal de pincode'), '2468');
    await user.click(screen.getByRole('button', { name: 'Moderatormodus aanzetten' }));

    expect(await screen.findByRole('heading', { name: 'Wachtrij' })).toBeInTheDocument();
    const item = screen.getByRole('article', { name: 'Twijfelachtig college' });
    expect(within(item).getByText('Twijfel: kijk goed')).toBeInTheDocument();
    expect(within(item).getByText('Bevat een link.')).toBeInTheDocument();

    await user.click(within(item).getByRole('button', { name: 'Afkeuren' }));
    const reject = within(item).getAllByRole('button', { name: 'Afkeuren' }).at(-1)!;
    await user.click(reject);
    expect(within(item).getByText('Geef een reden; de maker ziet die.')).toBeInTheDocument();
    await user.type(within(item).getByLabelText('Reden'), 'Bevat een link naar een privésite.');
    await user.click(reject);
    expect(useLectureStore.getState().lectures.find((l) => l.id === drop)).toMatchObject({
      share: 'afgekeurd',
      moderationNote: 'Bevat een link naar een privésite.',
    });

    const good = screen.getByRole('article', { name: 'Goed college' });
    await user.click(within(good).getByRole('button', { name: 'Goedkeuren' }));
    expect(useLectureStore.getState().lectures.find((l) => l.id === keep)?.share).toBe(
      'goedgekeurd',
    );
    expect(screen.getByText('Er wacht niets op moderatie.')).toBeInTheDocument();
    expect(screen.getByText('1 gedeeld college in de bibliotheek')).toBeInTheDocument();
  });

  it('na herladen eerst ontgrendelen met de pincode', async () => {
    const user = userEvent.setup();
    const { enableModerator } = await import('@/services/moderation.service');
    await enableModerator('2468');
    useModeratorSession.setState({ unlocked: false });
    renderAt('/moderatie');
    await user.type(screen.getByLabelText('Pincode'), '0000');
    await user.click(screen.getByRole('button', { name: 'Ontgrendelen' }));
    expect(await screen.findByText('Deze pincode klopt niet.')).toBeInTheDocument();
    await user.type(screen.getByLabelText('Pincode'), '2468');
    await user.click(screen.getByRole('button', { name: 'Ontgrendelen' }));
    expect(await screen.findByRole('heading', { name: 'Wachtrij' })).toBeInTheDocument();
  });
});

describe('delen', () => {
  it('een afgekeurd college toont de reden en kan opnieuw ingediend worden', async () => {
    const user = userEvent.setup();
    const id = submitted('Mijn college');
    const { rejectLecture } = await import('@/services/moderation.service');
    rejectLecture(id, 'Te persoonlijk.', NOW);
    renderAt(`/colleges/${id}`);
    expect(await screen.findByText(/Reden: Te persoonlijk\./)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Opnieuw indienen' }));
    expect(useLectureStore.getState().lectures[0]?.share).toBe('ingediend');
  });

  it('deel een highlight: een voorstel uit de tekst, en alleen letterlijke fragmenten', async () => {
    const user = userEvent.setup();
    renderAt('/colleges/vb-socrates-agora');
    await user.click(await screen.findByRole('button', { name: 'Deel een highlight' }));
    const dialog = await screen.findByRole('dialog', { name: 'Deel een fragment' });
    const field = within(dialog).getByLabelText('Fragment');
    expect((field as HTMLTextAreaElement).value).toBe(
      'Een geschreven woord kan zich niet verdedigen; stel daarom zelf de vraag ‘wat bedoel je, en hoe weet je dat?’.',
    );
    await user.clear(field);
    await user.type(field, 'Een geschreven woord kan alles.');
    expect(
      within(dialog).getByText('Het fragment moet letterlijk uit het gesprek of college komen.'),
    ).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'Afbeelding downloaden' })).toBeDisabled();
  });
});
