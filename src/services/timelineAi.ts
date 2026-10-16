/**
 * De AI-kant van de timeline (lazy): welke denkers reageren op een bericht, en de vraag van de
 * dag in de stijl van de denker. Fouten zijn stil (gelogd): dan geen reacties of de gewone vraag.
 */
import { getProvider } from '@/ai';
import { dailyQuestionRequest, timelineReactionsRequest } from '@/ai/prompts/timeline';
import { TimelineReactionsSchema } from '@/ai/schemas';
import { LIMITS } from '@/config/limits';
import type { Figure } from '@/data/types';
import { clock } from '@/lib/clock';
import { seededRng } from '@/lib/seeded-rng';
import { useDailyQuestionStore } from '@/store/miscStores';
import { usePostStore } from '@/store/postStore';
import { useProfileStore } from '@/store/profileStore';
import { useSettingsStore } from '@/store/settingsStore';
import { findQuestion } from './dailyQuestion.service';
import { candidatesFor, scheduleReactions, validateReactions } from './timeline.service';

const running = new Map<string, Promise<number>>();

/**
 * Bepaal en plan de reacties op een bericht (één keer per bericht). Geeft het aantal geplande
 * reacties terug. Bij ongeveer één op de drie berichten mag een nog onbekende denker reageren.
 */
export function generateReactions(postId: string, now = clock.now()): Promise<number> {
  const pending = running.get(postId);
  if (pending) return pending;
  const job = (async () => {
    const post = usePostStore.getState().posts.find((p) => p.id === postId);
    if (!post || post.crisis || post.reactions.length > 0) return 0;
    const { follows, discovered } = useProfileStore.getState().profile;
    const pool = candidatesFor(post.text, follows, discovered);
    const allowDiscovery =
      pool.undiscovered.length > 0 &&
      seededRng(`${postId}|ontdekken`)() < LIMITS.timeline.discoveryChance;
    try {
      const output = await getProvider().structured({
        ...timelineReactionsRequest({
          text: post.text,
          candidates: pool.candidates,
          undiscovered: pool.undiscovered,
          allowDiscovery,
          demo: {
            kind: 'timeline-reactions',
            postId,
            text: post.text,
            candidates: pool.candidates.map((c) => ({ id: c.id, name: c.name, tags: c.tags })),
            undiscovered: pool.undiscovered,
            allowDiscovery,
          },
        }),
        schema: TimelineReactionsSchema,
      });
      const reactions = validateReactions(output.reactions, pool, allowDiscovery);
      const instant = useSettingsStore.getState().settings.devInstantReactions;
      return scheduleReactions(postId, reactions, Date.parse(post.createdAt) || now, instant)
        .length;
    } catch (error) {
      console.warn('[timeline] reacties mislukt', error);
      return 0;
    }
  })().finally(() => running.delete(postId));
  running.set(postId, job);
  return job;
}

/** De vraag van vandaag in de stijl van de denker (één keer per vraag per dag, gecachet). */
export async function styleDailyQuestion(
  dateKey: string,
  questionId: string,
  figure: Figure,
): Promise<void> {
  const store = useDailyQuestionStore.getState();
  const day = store.days[dateKey];
  const question = findQuestion(questionId);
  if (!day || !question || day.styled?.[questionId]) return;
  try {
    const result = await getProvider().streamText(dailyQuestionRequest(figure, question), () => {});
    const text = result.text
      .trim()
      .replace(/^["“‘']+|["”’']+$/g, '')
      .trim();
    if (result.stopReason === 'refusal' || !text || text.length > 300) return;
    const current = useDailyQuestionStore.getState().days[dateKey];
    if (!current) return;
    store.patchDay(dateKey, { styled: { ...current.styled, [questionId]: text } });
  } catch (error) {
    console.warn('[timeline] dagvraag in stijl mislukt', error);
  }
}
