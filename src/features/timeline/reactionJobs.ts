/**
 * Lopende reactierondes (niet bewaard): zolang de lichte AI-call loopt, toont het bericht
 * "De denkers lezen mee …". De reacties zelf verschijnen pas later (1–20 minuten).
 */
import { create } from 'zustand';
import { clock } from '@/lib/clock';

interface ReactionJobs {
  pending: Record<string, true>;
  /** Wanneer de laatste ronde klaar was: zo verschijnen directe reacties zonder te wachten. */
  lastRunAt: number;
}

export const useReactionJobs = create<ReactionJobs>(() => ({ pending: {}, lastRunAt: 0 }));

export async function requestReactions(postId: string): Promise<void> {
  useReactionJobs.setState((s) => ({ pending: { ...s.pending, [postId]: true } }));
  try {
    const { generateReactions } = await import('@/services/timelineAi');
    await generateReactions(postId);
  } finally {
    useReactionJobs.setState((s) => {
      const pending = { ...s.pending };
      delete pending[postId];
      return { pending, lastRunAt: clock.now() };
    });
  }
}
