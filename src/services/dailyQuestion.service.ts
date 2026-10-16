/**
 * Reflectievraag van de dag (§7.3): elke dag anders (seed op datum), geen herhaling binnen 30
 * dagen, gesteld door een (gevolgde) denker, max. één keer per dag "andere vraag" en na het
 * beantwoorden later die dag één vervolgvraag.
 */
import { LIMITS } from '@/config/limits';
import { CORE_IDS, figureName, findMeta } from '@/data/figures';
import { DAILY_QUESTIONS } from '@/data/prompts/daily-questions';
import type { DailyQuestion } from '@/data/types';
import { clock } from '@/lib/clock';
import { addDaysToKey, HOUR, localDateKey, startOfLocalDay } from '@/lib/dates';
import { pick, seededRng } from '@/lib/seeded-rng';
import { keywordScore } from '@/lib/text';
import { useDailyQuestionStore, useNotificationStore } from '@/store/miscStores';
import { useProfileStore } from '@/store/profileStore';
import type { DailyQuestionDay } from '@/store/schemas';
import { useSettingsStore } from '@/store/settingsStore';

const BY_ID = new Map(DAILY_QUESTIONS.map((q) => [q.id, q]));

export function findQuestion(id: string | undefined): DailyQuestion | undefined {
  return id ? BY_ID.get(id) : undefined;
}

/** Vragen die in de afgelopen 30 dagen (vóór vandaag) al getoond zijn. */
export function recentQuestionIds(
  days: Readonly<Record<string, DailyQuestionDay>>,
  todayKey: string,
  windowDays: number = LIMITS.timeline.dailyQuestionNoRepeatDays,
): Set<string> {
  const from = addDaysToKey(todayKey, -windowDays);
  const ids = new Set<string>();
  for (const [dateKey, day] of Object.entries(days)) {
    if (dateKey >= from && dateKey < todayKey) for (const id of day.shown) ids.add(id);
  }
  return ids;
}

/** Kies de vraag voor een dag (deterministisch per datum en per "andere vraag"). */
export function pickQuestion(dateKey: string, exclude: ReadonlySet<string>, salt = 0) {
  const pool = DAILY_QUESTIONS.filter((q) => !exclude.has(q.id));
  const rng = seededRng(`${dateKey}|dagvraag|${salt}`);
  return pick(rng, pool.length ? pool : DAILY_QUESTIONS) as DailyQuestion;
}

/**
 * Wie stelt de vraag? Bij voorkeur een denker die je volgt, anders een die je kent; past geen
 * enkele vrager, dan de kerndenker die thematisch het dichtst bij de vraag ligt.
 */
export function pickAsker(
  question: DailyQuestion,
  known: ReadonlySet<string>,
  follows: readonly string[],
  dateKey: string,
): string {
  const askers = question.askers.filter((id) => findMeta(id));
  const followed = askers.filter((id) => follows.includes(id));
  const familiar = askers.filter((id) => known.has(id));
  const rng = seededRng(`${dateKey}|${question.id}|vrager`);
  if (followed.length) return pick(rng, followed) as string;
  if (familiar.length) return pick(rng, familiar) as string;
  const scored = CORE_IDS.map((id) => ({
    id,
    score: keywordScore(`${question.text} ${question.tags.join(' ')}`, findMeta(id)?.tags ?? []),
  })).sort((a, b) => b.score - a.score);
  return scored[0]?.id ?? 'socrates';
}

function knownFigures(): Set<string> {
  const { discovered } = useProfileStore.getState().profile;
  return new Set([...CORE_IDS, ...discovered]);
}

/** De vraag van vandaag (maakt het dagrecord aan als dat er nog niet is). */
export function ensureToday(now = clock.now()): DailyQuestionDay {
  const dateKey = localDateKey(now);
  const store = useDailyQuestionStore.getState();
  const existing = store.days[dateKey];
  if (existing) return existing;
  const question = pickQuestion(dateKey, recentQuestionIds(store.days, dateKey));
  const { follows } = useProfileStore.getState().profile;
  const day: DailyQuestionDay = {
    shown: [question.id],
    rerolls: 0,
    askerId: pickAsker(question, knownFigures(), follows, dateKey),
  };
  store.setDay(dateKey, day);
  return day;
}

export function currentQuestion(day: DailyQuestionDay): DailyQuestion | undefined {
  return findQuestion(day.shown[day.shown.length - 1]);
}

export function canReroll(day: DailyQuestionDay): boolean {
  return day.rerolls < LIMITS.timeline.dailyQuestionRerollsPerDay && !day.answeredPostId;
}

/** "Andere vraag": max. één keer per dag, en niet meer na het beantwoorden. */
export function rerollToday(now = clock.now()): DailyQuestionDay | undefined {
  const dateKey = localDateKey(now);
  const day = ensureToday(now);
  if (!canReroll(day)) return undefined;
  const store = useDailyQuestionStore.getState();
  const exclude = recentQuestionIds(store.days, dateKey);
  for (const id of day.shown) exclude.add(id);
  const question = pickQuestion(dateKey, exclude, day.rerolls + 1);
  const { follows } = useProfileStore.getState().profile;
  const next: DailyQuestionDay = {
    ...day,
    shown: [...day.shown, question.id],
    rerolls: day.rerolls + 1,
    askerId: pickAsker(question, knownFigures(), follows, dateKey),
  };
  store.setDay(dateKey, next);
  return next;
}

/** Wanneer de vervolgvraag verschijnt: 2–4 uur na het antwoord, maar wel dezelfde dag. */
export function followUpTime(dateKey: string, answeredAt: number, instant: boolean) {
  if (instant) return answeredAt;
  const { min, max } = LIMITS.timeline.followUpDelayHours;
  const rng = seededRng(`${dateKey}|vervolgvraag`);
  const at = answeredAt + (min + rng() * (max - min)) * HOUR;
  const endOfDay = startOfLocalDay(answeredAt) + 24 * HOUR - 1;
  return at <= endOfDay ? at : undefined;
}

/**
 * Het antwoord op de vraag (of de vervolgvraag) is geplaatst. Na de eerste vraag volgt later die
 * dag één vervolgvraag, met een melding.
 */
export function markAnswered(
  dateKey: string,
  postId: string,
  isFollowUp: boolean,
  now = clock.now(),
): void {
  const store = useDailyQuestionStore.getState();
  const day = store.days[dateKey];
  if (!day) return;
  if (isFollowUp) {
    if (day.followUp)
      store.patchDay(dateKey, { followUp: { ...day.followUp, answeredPostId: postId } });
    return;
  }
  if (day.answeredPostId) return;
  const question = currentQuestion(day);
  const instant = useSettingsStore.getState().settings.devInstantReactions;
  const at = question ? followUpTime(dateKey, now, instant) : undefined;
  store.patchDay(dateKey, {
    answeredPostId: postId,
    followUp:
      question && at !== undefined
        ? { questionId: question.id, visibleAt: new Date(at).toISOString() }
        : undefined,
  });
  if (question && at !== undefined) {
    useNotificationStore.getState().add({
      id: `melding-vervolg-${dateKey}`,
      kind: 'vervolgvraag',
      text: `${figureName(day.askerId)} heeft een vervolgvraag voor je.`,
      link: '/timeline',
      figureId: day.askerId,
      visibleAt: new Date(at).toISOString(),
      read: false,
      sourceId: `vervolg:${dateKey}`,
    });
  }
}

/** De vervolgvraag, als die al zichtbaar is en nog niet beantwoord. */
export function openFollowUp(day: DailyQuestionDay | undefined, now: number) {
  if (!day?.followUp || day.followUp.answeredPostId) return undefined;
  if (Date.parse(day.followUp.visibleAt) > now) return undefined;
  const question = findQuestion(day.followUp.questionId);
  return question ? { question, text: question.followUp } : undefined;
}
