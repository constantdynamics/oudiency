import { beforeEach, describe, expect, it } from 'vitest';
import { moderationRequest, ruleCheck } from '@/ai/prompts/moderation';
import {
  collapse,
  comparable,
  fitText,
  highlightProblem,
  plainSource,
  sentences,
  suggestHighlight,
  wrapText,
} from '@/lib/quoteCard';
import { localDateTime } from '@/lib/dates';
import { addSegment, requestLecture, submitLecture } from '@/services/lecture.service';
import {
  approveLecture,
  disableModerator,
  enableModerator,
  hashPin,
  lectureText,
  moderationQueue,
  pinProblem,
  rejectLecture,
  unlockModerator,
  useModeratorSession,
} from '@/services/moderation.service';
import { precheckLecture } from '@/services/moderationAi';
import { useLectureStore } from '@/store/lectureStore';
import { useNotificationStore } from '@/store/miscStores';
import { initialProfile, useProfileStore } from '@/store/profileStore';
import { useSettingsStore } from '@/store/settingsStore';

const NOW = localDateTime('2026-10-19', '10:00');

function finishedLecture(topic = 'Moed') {
  useProfileStore.getState().resetUsageDay('2026-10-19');
  const lecture = requestLecture(
    { figureId: 'socrates', topic, mainQuestion: 'Wat is moed?' },
    'demo',
    NOW,
  );
  useLectureStore.getState().update(lecture.id, {
    plan: { title: topic, segments: [{ heading: 'Een', keyPoints: [] }] },
  });
  for (const kind of ['opening', 'deel', 'conclusie'] as const) {
    addSegment(lecture.id, { kind, heading: kind, text: `Tekst van ${kind}.` }, NOW);
  }
  return lecture.id;
}

beforeEach(() => {
  useLectureStore.setState({ lectures: [] });
  useNotificationStore.setState({ notifications: [] });
  useProfileStore.setState({ profile: initialProfile() });
  useSettingsStore
    .getState()
    .update({ aiSource: 'demo', moderatorMode: false, moderatorPinHash: undefined });
  useModeratorSession.setState({ unlocked: false });
});

describe('pre-check', () => {
  it('regels: persoonsgegevens, links, grof taalgebruik en crisissignalen', () => {
    expect(ruleCheck('Een rustig college over moed.')).toEqual({ verdict: 'ok', reasons: [] });
    expect(ruleCheck('Mail me op jan@example.nl').verdict).toBe('twijfel');
    expect(ruleCheck('Bel 06-12345678 voor meer').reasons[0]).toMatch(/telefoonnummer/);
    expect(ruleCheck('Zie https://example.nl').verdict).toBe('twijfel');
    expect(ruleCheck('Wat een klootzak was hij.').verdict).toBe('afwijzen');
    expect(ruleCheck('Ik wil niet meer leven.').reasons).toContain(
      'Bevat signalen van een persoonlijke crisis.',
    );
    expect(moderationRequest('x').task).toBe('moderation');
  });

  it('beoordeelt het hele college, begrensd; in de demomodus op regels', async () => {
    const id = finishedLecture();
    const lecture = useLectureStore.getState().lectures[0]!;
    expect(lectureText(lecture)).toContain('Hoofdvraag: Wat is moed?');
    expect(lectureText(lecture, 40).length).toBeLessThanOrEqual(42);
    const precheck = await precheckLecture(id, NOW);
    expect(precheck).toMatchObject({ verdict: 'ok', source: 'regels' });
    expect(useLectureStore.getState().lectures[0]?.precheck?.verdict).toBe('ok');
  });
});

describe('moderatie', () => {
  it('de wachtrij: ingediende colleges, oudste eerst', () => {
    const first = finishedLecture('Eerst');
    const second = finishedLecture('Daarna');
    submitLecture(second, NOW + 1000);
    submitLecture(first, NOW + 2000);
    expect(moderationQueue(useLectureStore.getState().lectures).map((l) => l.id)).toEqual([
      second,
      first,
    ]);
  });

  it('goedkeuren zet het college in de bibliotheek; afkeuren vraagt een reden', () => {
    const a = finishedLecture('Goed');
    const b = finishedLecture('Niet goed');
    expect(approveLecture(a, NOW)).toBe(false); // nog niet ingediend
    submitLecture(a, NOW);
    submitLecture(b, NOW);
    expect(approveLecture(a, NOW)).toBe(true);
    expect(rejectLecture(b, '   ', NOW)).toBe(false);
    expect(rejectLecture(b, 'Bevat een telefoonnummer.', NOW)).toBe(true);
    const [first, second] = useLectureStore.getState().lectures;
    expect(first).toMatchObject({ share: 'goedgekeurd' });
    expect(first?.publishedAt).toBeDefined();
    expect(second).toMatchObject({
      share: 'afgekeurd',
      moderationNote: 'Bevat een telefoonnummer.',
    });
    const texts = useNotificationStore.getState().notifications.map((n) => n.text);
    expect(texts.some((text) => text.includes('staat nu in de bibliotheek'))).toBe(true);
    expect(texts.some((text) => text.includes('Reden: Bevat een telefoonnummer.'))).toBe(true);
    // Opnieuw indienen na afkeuren kan.
    expect(submitLecture(b, NOW)).toBe(true);
    expect(useLectureStore.getState().lectures[1]?.moderationNote).toBeUndefined();
  });

  it('pincode: alleen de hash wordt bewaard; ontgrendelen per sessie', async () => {
    expect(pinProblem('12')).toBeDefined();
    expect(pinProblem('12a4')).toBeDefined();
    expect(pinProblem('1234')).toBeUndefined();
    await enableModerator('2468');
    const { settings } = useSettingsStore.getState();
    expect(settings.moderatorMode).toBe(true);
    expect(settings.moderatorPinHash).toBe(await hashPin('2468'));
    expect(settings.moderatorPinHash).not.toContain('2468');
    useModeratorSession.setState({ unlocked: false });
    expect(await unlockModerator('1111')).toBe(false);
    expect(useModeratorSession.getState().unlocked).toBe(false);
    expect(await unlockModerator('2468')).toBe(true);
    expect(useModeratorSession.getState().unlocked).toBe(true);
    disableModerator();
    expect(useSettingsStore.getState().settings).toMatchObject({ moderatorMode: false });
    expect(useSettingsStore.getState().settings.moderatorPinHash).toBeUndefined();
  });
});

describe('citaatkaart', () => {
  const source = plainSource(
    'Welkom, mijn vriend. Ga zitten op de trede; de steen is warm van de zon.\n\n**Kernlessen**\n1. Een geschreven woord kan zich niet verdedigen; stel daarom zelf de vraag.\n2. Wie bijval zoekt, wordt luider.',
  );

  it('het fragment komt letterlijk uit de tekst (inkorten mag, aanvullen niet)', () => {
    expect(source).toContain('Kernlessen');
    expect(source).not.toContain('**');
    expect(highlightProblem('Ga zitten op de trede;', source)).toBeUndefined();
    expect(highlightProblem('Ga  zitten\nop de trede', source)).toBeUndefined();
    expect(highlightProblem('Ga zitten op de bank', source)).toMatch(/letterlijk/);
    expect(highlightProblem('', source)).toMatch(/Kies/);
    expect(highlightProblem('x'.repeat(201), 'x'.repeat(300))).toMatch(/200/);
    expect(comparable('‘Hallo’ “daar”')).toBe(`'Hallo' "daar"`);
    expect(collapse('‘Hallo’\n  daar')).toBe('‘Hallo’ daar');
  });

  it('een voorstel: de eerste kernles, anders een passende zin', () => {
    expect(suggestHighlight(source)).toBe(
      'Een geschreven woord kan zich niet verdedigen; stel daarom zelf de vraag.',
    );
    const plain =
      'Kort. Dit is een zin die lang genoeg is om als fragment te dienen, denk ik. Nog één.';
    expect(suggestHighlight(plain)).toBe(
      'Dit is een zin die lang genoeg is om als fragment te dienen, denk ik.',
    );
    expect(sentences('Een. Twee! Drie?')).toEqual(['Een.', 'Twee!', 'Drie?']);
    for (const text of [source, plain]) {
      expect(highlightProblem(suggestHighlight(text), text)).toBeUndefined();
    }
  });

  it('opmaak: woorden over regels, de grootste letter die past', () => {
    const measure = (text: string) => text.length * 10;
    expect(wrapText(measure, 'aa bb cc dd', 50)).toEqual(['aa bb', 'cc dd']);
    const fitted = fitText(
      (text, size) => text.length * size * 0.5,
      'een twee drie vier vijf zes zeven acht',
      { width: 200, height: 160 },
      [40, 30, 20],
    );
    expect(fitted.size).toBe(30);
    expect(fitted.lines.length * 30 * 1.25).toBeLessThanOrEqual(160);
  });
});
