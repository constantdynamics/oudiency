import { beforeEach, describe, expect, it } from 'vitest';
import { FRAME } from '@/ai/prompts/frame';
import { candidateLine, timelineReactionsRequest } from '@/ai/prompts/timeline';
import { CORE_IDS, findMeta } from '@/data/figures';
import { DAILY_QUESTIONS } from '@/data/prompts/daily-questions';
import { clock } from '@/lib/clock';
import { addDaysToKey, localDateKey, localDateTime, MINUTE } from '@/lib/dates';
import {
  canReroll,
  currentQuestion,
  ensureToday,
  followUpTime,
  markAnswered,
  openFollowUp,
  pickAsker,
  recentQuestionIds,
  rerollToday,
} from '@/services/dailyQuestion.service';
import {
  candidatesFor,
  createPost,
  deletePost,
  editPost,
  PostError,
  reactionDelays,
  scheduleReactions,
  togglePostLike,
  trimWords,
  validateReactions,
  visibleReactions,
} from '@/services/timeline.service';
import { generateReactions } from '@/services/timelineAi';
import { useDailyQuestionStore, useNotificationStore } from '@/store/miscStores';
import { usePostStore } from '@/store/postStore';
import { initialProfile, useProfileStore } from '@/store/profileStore';
import { useSettingsStore } from '@/store/settingsStore';

const NOW = localDateTime('2026-10-19', '09:00');
const DAY = '2026-10-19';

beforeEach(() => {
  usePostStore.setState({ posts: [] });
  useDailyQuestionStore.setState({ days: {} });
  useNotificationStore.setState({ notifications: [] });
  useProfileStore.setState({ profile: initialProfile() });
  useSettingsStore.getState().update({ devInstantReactions: false, aiSource: 'demo' });
  clock.freeze(NOW);
});

/* ---------- Vraag van de dag ---------- */

describe('vraag van de dag', () => {
  it('een pool van minstens 60 vragen in zeven soorten', () => {
    expect(DAILY_QUESTIONS.length).toBeGreaterThanOrEqual(60);
    expect(new Set(DAILY_QUESTIONS.map((q) => q.kind)).size).toBe(7);
  });

  it('elke dag een vraag, zonder herhaling binnen 30 dagen, en de hele dag dezelfde', () => {
    const seen: string[] = [];
    for (let i = 0; i < 30; i++) {
      const at = localDateTime(addDaysToKey(DAY, i), '09:00');
      const day = ensureToday(at);
      expect(ensureToday(at + 5 * 3_600_000)).toBe(day);
      seen.push(day.shown[0]!);
    }
    expect(new Set(seen).size).toBe(30);
    const days = useDailyQuestionStore.getState().days;
    expect(recentQuestionIds(days, addDaysToKey(DAY, 30)).size).toBe(30);
    // Na 30 dagen mag een vraag terugkomen: dag 0 valt buiten het venster van dag 31.
    expect(recentQuestionIds(days, addDaysToKey(DAY, 31)).has(seen[0]!)).toBe(false);
  });

  it('de vrager: liefst een gevolgde denker, anders een bekende', () => {
    const question = DAILY_QUESTIONS.find((q) => q.askers.includes('aurelius'))!;
    const known = new Set(CORE_IDS);
    const followed = question.askers.find((id) => findMeta(id))!;
    expect(pickAsker(question, known, [followed], DAY)).toBe(followed);
    const asker = pickAsker(question, known, [], DAY);
    expect(question.askers.filter((id) => known.has(id))).toContain(asker);
    // Geen enkele vrager bekend: een kerndenker.
    expect(CORE_IDS).toContain(
      pickAsker({ ...question, askers: ['bestaat-niet'] }, known, [], DAY),
    );
  });

  it('één keer "andere vraag" per dag, en niet meer na het beantwoorden', () => {
    const first = ensureToday(NOW);
    const second = rerollToday(NOW)!;
    expect(second.shown).toHaveLength(2);
    expect(second.shown[1]).not.toBe(second.shown[0]);
    expect(currentQuestion(second)?.id).toBe(second.shown[1]);
    expect(canReroll(second)).toBe(false);
    expect(rerollToday(NOW)).toBeUndefined();
    expect(first.rerolls).toBe(0);
  });

  it('na het antwoord later die dag één vervolgvraag, met een melding', () => {
    const day = ensureToday(NOW);
    const question = currentQuestion(day)!;
    const post = createPost('Ik veranderde van mening over werk.', {
      promptId: question.id,
      promptText: question.text,
      promptFigureId: day.askerId,
    });
    const answered = useDailyQuestionStore.getState().days[DAY]!;
    expect(answered.answeredPostId).toBe(post.id);
    expect(canReroll(answered)).toBe(false);
    const visibleAt = Date.parse(answered.followUp!.visibleAt);
    expect(visibleAt - NOW).toBeGreaterThanOrEqual(2 * 3_600_000);
    expect(visibleAt - NOW).toBeLessThanOrEqual(4 * 3_600_000);
    expect(openFollowUp(answered, NOW)).toBeUndefined();
    expect(openFollowUp(answered, visibleAt)?.text).toBe(question.followUp);
    const notification = useNotificationStore.getState().notifications[0];
    expect(notification).toMatchObject({
      kind: 'vervolgvraag',
      visibleAt: answered.followUp!.visibleAt,
    });

    createPost('Mijn vervolg.', {
      promptId: question.id,
      promptText: question.followUp,
      promptFigureId: day.askerId,
      isFollowUp: true,
    });
    expect(openFollowUp(useDailyQuestionStore.getState().days[DAY], visibleAt)).toBeUndefined();
  });

  it('geen vervolgvraag meer als die pas na middernacht zou komen', () => {
    const late = localDateTime(DAY, '22:30');
    expect(followUpTime(DAY, late, false)).toBeUndefined();
    expect(followUpTime(DAY, late, true)).toBe(late);
  });

  it('markAnswered zonder dagrecord doet niets', () => {
    expect(() => markAnswered('2020-01-01', 'x', false, NOW)).not.toThrow();
  });
});

/* ---------- Berichten ---------- */

describe('berichten', () => {
  it('plaatsen met hashtags, bewerken, liken en verwijderen', () => {
    expect(() => createPost('   ')).toThrow(PostError);
    expect(() => createPost('x'.repeat(501))).toThrow(/500/);
    const post = createPost('Vandaag geoefend met #geduld en #Rust.');
    expect(post.tags).toEqual(['geduld', 'rust']);
    editPost(post.id, 'Nu over #moed.', NOW + MINUTE);
    let stored = usePostStore.getState().posts[0]!;
    expect(stored).toMatchObject({ text: 'Nu over #moed.', tags: ['moed'] });
    expect(stored.editedAt).toBeDefined();
    togglePostLike(post.id);
    stored = usePostStore.getState().posts[0]!;
    expect(stored.likedByMe).toBe(true);
    deletePost(post.id);
    expect(usePostStore.getState().posts).toHaveLength(0);
  });

  it('crisissignalen: geen reacties, wel de hulpkaart', async () => {
    const post = createPost('Ik wil er niet meer zijn.');
    expect(post.crisis).toBe(true);
    expect(await generateReactions(post.id)).toBe(0);
    expect(
      scheduleReactions(post.id, [{ figureId: 'kant', type: 'like', discovery: false }], NOW, true),
    ).toEqual([]);
  });
});

/* ---------- Reacties ---------- */

describe('reacties van denkers', () => {
  it('kandidaten: gevolgd, kern en een handvol onbekende netwerkdenkers met overlap', () => {
    const { candidates, undiscovered } = candidatesFor(
      'Ik ben bang voor de dood en wil kalm blijven.',
      ['spinoza'],
      [],
    );
    const ids = candidates.map((c) => c.id);
    for (const id of CORE_IDS) expect(ids).toContain(id);
    expect(undiscovered.length).toBeGreaterThan(0);
    expect(undiscovered.length).toBeLessThanOrEqual(4);
    for (const id of undiscovered) expect(findMeta(id)?.tier).toBe('netwerk');
  });

  it('controle: alleen kandidaten, uniek, max. 3, één ontdekking en ingekorte reacties', () => {
    const pool = candidatesFor('Over de dood en kalmte.', [], []);
    const newcomer = pool.undiscovered[0]!;
    const long = Array.from({ length: 90 }, (_, i) => `woord${i}`).join(' ');
    const result = validateReactions(
      [
        { figureId: 'onbekend', type: 'like' },
        { figureId: 'kant', type: 'comment', text: long },
        { figureId: 'kant', type: 'like' },
        { figureId: newcomer, type: 'comment', text: 'Hallo.' },
        { figureId: pool.undiscovered[1] ?? 'spinoza', type: 'like' },
        { figureId: 'spinoza', type: 'comment', text: '   ' },
        { figureId: 'socrates', type: 'like' },
      ],
      pool,
      true,
    );
    expect(result.length).toBeLessThanOrEqual(3);
    expect(result[0]).toMatchObject({ figureId: 'kant', type: 'comment', discovery: false });
    expect(result[0]!.text!.split(' ').length).toBeLessThanOrEqual(61);
    expect(result.filter((r) => r.discovery)).toHaveLength(1);
    expect(result.some((r) => r.figureId === 'onbekend')).toBe(false);
    // Zonder toestemming geen ontdekking.
    expect(validateReactions([{ figureId: newcomer, type: 'like' }], pool, false)).toEqual([]);
    expect(trimWords('een twee drie', 2)).toBe('een twee …');
  });

  it('verschijnen 1–20 minuten na plaatsen, met een melding op dat moment', () => {
    const delays = reactionDelays('bericht_x', 3, false);
    expect(delays).toEqual([...delays].sort((a, b) => a - b));
    for (const delay of delays) {
      expect(delay).toBeGreaterThanOrEqual(MINUTE);
      expect(delay).toBeLessThanOrEqual(20 * MINUTE);
    }
    expect(reactionDelays('bericht_x', 3, false)).toEqual(delays);
    expect(reactionDelays('bericht_x', 2, true)).toEqual([0, 0]);

    const post = createPost('Over vriendschap en trouw.');
    const scheduled = scheduleReactions(
      post.id,
      [
        { figureId: 'aurelius', type: 'like', discovery: false },
        { figureId: 'seneca', type: 'comment', text: 'Mooi.', discovery: true },
      ],
      NOW,
      false,
    );
    expect(scheduled).toHaveLength(2);
    expect(visibleReactions(usePostStore.getState().posts[0]!, NOW)).toHaveLength(0);
    expect(visibleReactions(usePostStore.getState().posts[0]!, NOW + 21 * MINUTE)).toHaveLength(2);
    const notifications = useNotificationStore.getState().notifications;
    expect(notifications.map((n) => n.kind).sort()).toEqual(['ontdekt', 'reactie']);
    expect(notifications.find((n) => n.kind === 'ontdekt')?.link).toBe('/denkers/seneca');
    deletePost(post.id);
    expect(useNotificationStore.getState().notifications).toHaveLength(0);
  });

  it('prompt: kader, taak en de kandidaten met [nieuw]', () => {
    const pool = candidatesFor('Over de dood.', [], []);
    const request = timelineReactionsRequest({
      text: 'Over de dood.',
      candidates: pool.candidates,
      undiscovered: pool.undiscovered,
      allowDiscovery: true,
      demo: {
        kind: 'timeline-reactions',
        postId: 'p',
        text: 'Over de dood.',
        candidates: [],
        undiscovered: [],
        allowDiscovery: true,
      },
    });
    expect(request.task).toBe('timelineReactions');
    expect(request.system[0]?.text).toBe(FRAME);
    const content = (request.messages[0]?.content as string[]).join('\n');
    expect(content).toContain('[nieuw]');
    expect(content).toContain('BERICHT VAN DE STUDENT\nOver de dood.');
    expect(candidateLine(findMeta('kant')!, false)).toMatch(/^- kant: /);
    const closed = timelineReactionsRequest({
      text: 'x',
      candidates: pool.candidates,
      undiscovered: pool.undiscovered,
      allowDiscovery: false,
      demo: request.demo as never,
    });
    expect((closed.messages[0]?.content as string[]).join('\n')).not.toContain('[nieuw]');
  });

  it('demomodus: 0–3 geldige reacties, één keer per bericht', async () => {
    useSettingsStore.getState().update({ devInstantReactions: true });
    let total = 0;
    for (const text of [
      'Ik ben bang voor de dood.',
      'Vandaag lekker gefietst.',
      'Hoe blijf ik kalm bij al het nieuws over oorlog en onrecht?',
      'Wat is eigenlijk vrijheid, als je voor een baas werkt?',
    ]) {
      const post = createPost(text);
      const count = await generateReactions(post.id);
      expect(count).toBeLessThanOrEqual(3);
      expect(await generateReactions(post.id)).toBe(0);
      const stored = usePostStore.getState().posts.find((p) => p.id === post.id)!;
      expect(stored.reactions).toHaveLength(count);
      for (const reaction of stored.reactions) {
        expect(findMeta(reaction.figureId)).toBeDefined();
        if (reaction.type === 'comment') expect(reaction.text?.length).toBeGreaterThan(0);
      }
      total += count;
    }
    expect(total).toBeGreaterThan(0);
    expect(localDateKey(NOW)).toBe(DAY);
  });
});
