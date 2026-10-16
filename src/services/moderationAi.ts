/**
 * Automatische pre-check (lazy): advies van het lichte model; lukt dat niet, dan de vaste regels.
 * Het advies is nooit het oordeel: dat geeft de moderator.
 */
import { getProvider } from '@/ai';
import { moderationRequest, ruleCheck } from '@/ai/prompts/moderation';
import { ModerationSchema } from '@/ai/schemas';
import { clock } from '@/lib/clock';
import { useLectureStore } from '@/store/lectureStore';
import type { Precheck } from '@/store/schemas';
import { lectureText } from './moderation.service';

export async function precheckLecture(
  id: string,
  now = clock.now(),
): Promise<Precheck | undefined> {
  const lecture = useLectureStore.getState().lectures.find((l) => l.id === id);
  if (!lecture) return undefined;
  const text = lectureText(lecture);
  let precheck: Precheck;
  try {
    const result = await getProvider().structured({
      ...moderationRequest(text),
      schema: ModerationSchema,
    });
    precheck = {
      verdict: result.verdict,
      reasons: result.reasons
        .map((r) => r.trim())
        .filter(Boolean)
        .slice(0, 6),
      checkedAt: new Date(now).toISOString(),
      source: getProvider().id === 'demo' ? 'regels' : 'ai',
    };
  } catch (error) {
    console.warn('[moderatie] pre-check via AI mislukt; de regels nemen het over', error);
    precheck = { ...ruleCheck(text), checkedAt: new Date(now).toISOString(), source: 'regels' };
  }
  useLectureStore.getState().update(id, { precheck });
  return precheck;
}
