/**
 * Wat de denkers van je weten in podcasts (keuze 8c): samenvattingen van je eerdere sessies met
 * hen en je recente berichten op de timeline. Gaat alleen naar Claude met je eigen sleutel.
 */
import type { ListenerMemory } from '@/ai/prompts/podcast';
import { memoryFor } from '@/services/session.service';
import { usePostStore } from '@/store/postStore';
import { useSessionStore } from '@/store/sessionStore';

export function listenerMemory(figureIds: readonly string[], maxPosts = 5): ListenerMemory {
  const sessions = useSessionStore.getState().sessions;
  return {
    sessions: figureIds
      .map((figureId) => ({ figureId, summaries: memoryFor(sessions, figureId) }))
      .filter((entry) => entry.summaries.length > 0),
    posts: usePostStore
      .getState()
      .posts.filter((post) => !post.crisis && post.text.trim())
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, maxPosts)
      .map((post) => post.text.trim().slice(0, 300)),
  };
}
