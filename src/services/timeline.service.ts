/**
 * De eigen timeline (§7.3): berichten plaatsen, bewerken, verwijderen en liken, en de reacties
 * van denkers controleren en inplannen (met vertraging en melding). De AI-call zelf staat in
 * timelineAi.ts (lazy).
 */
import { detectCrisisSignals } from '@/ai/prompts/safety';
import { LIMITS } from '@/config/limits';
import { CORE_IDS, FIGURES_META, figureName, findMeta, type FigureMeta } from '@/data/figures';
import { clock } from '@/lib/clock';
import { localDateKey, MINUTE } from '@/lib/dates';
import { uid } from '@/lib/ids';
import { seededRng } from '@/lib/seeded-rng';
import { extractHashtags, keywordScore } from '@/lib/text';
import { useNotificationStore } from '@/store/miscStores';
import { usePostStore } from '@/store/postStore';
import type { Post, Reaction } from '@/store/schemas';
import { markAnswered } from './dailyQuestion.service';

export class PostError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PostError';
  }
}

export function postProblem(text: string): string | undefined {
  const { postMaxLength } = LIMITS.timeline;
  if (!text.trim()) return 'Schrijf eerst iets.';
  if (text.trim().length > postMaxLength) return `Hooguit ${postMaxLength} tekens.`;
  return undefined;
}

export interface PostPrompt {
  promptId: string;
  promptText: string;
  promptFigureId: string;
  isFollowUp?: boolean;
}

/**
 * Plaats een bericht. Bij een antwoord op de vraag van de dag wordt die als beantwoord
 * gemarkeerd. Bij crisissignalen: geen reacties van denkers (de app toont hulpbronnen).
 */
export function createPost(text: string, prompt?: PostPrompt, now = clock.now()): Post {
  const problem = postProblem(text);
  if (problem) throw new PostError(problem);
  const clean = text.trim();
  const post: Post = {
    id: uid('bericht'),
    text: clean,
    tags: extractHashtags(clean),
    createdAt: new Date(now).toISOString(),
    reactions: [],
  };
  if (prompt) {
    post.promptId = prompt.promptId;
    post.promptText = prompt.promptText;
    post.promptFigureId = prompt.promptFigureId;
    if (prompt.isFollowUp) post.isFollowUp = true;
  }
  if (detectCrisisSignals(clean)) post.crisis = true;
  usePostStore.getState().add(post);
  if (prompt) markAnswered(localDateKey(now), post.id, Boolean(prompt.isFollowUp), now);
  return post;
}

export function editPost(id: string, text: string, now = clock.now()): void {
  const problem = postProblem(text);
  if (problem) throw new PostError(problem);
  const clean = text.trim();
  const patch: Partial<Post> = {
    text: clean,
    tags: extractHashtags(clean),
    editedAt: new Date(now).toISOString(),
  };
  // Een bewerking met een crisissignaal: geen nieuwe reacties en de hulpkaart erbij.
  if (detectCrisisSignals(clean)) patch.crisis = true;
  usePostStore.getState().update(id, patch);
}

export function deletePost(id: string): void {
  const post = usePostStore.getState().posts.find((p) => p.id === id);
  if (!post) return;
  usePostStore.getState().remove(id);
  const notifications = useNotificationStore.getState();
  for (const reaction of post.reactions)
    notifications.removeBySource(reactionSource(post.id, reaction));
}

export function togglePostLike(id: string): void {
  const post = usePostStore.getState().posts.find((p) => p.id === id);
  if (post) usePostStore.getState().update(id, { likedByMe: !post.likedByMe });
}

export function visibleReactions(post: Pick<Post, 'reactions'>, now: number): Reaction[] {
  return post.reactions
    .filter((r) => Date.parse(r.visibleAt) <= now)
    .sort((a, b) => Date.parse(a.visibleAt) - Date.parse(b.visibleAt));
}

/* ---------- Reacties ---------- */

/** Hooguit `max` woorden, met ellips als er is ingekort. */
export function trimWords(text: string, max: number = LIMITS.timeline.commentMaxWords): string {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length <= max) return words.join(' ');
  return `${words
    .slice(0, max)
    .join(' ')
    .replace(/[,;:.!?]+$/, '')} …`;
}

export interface Candidates {
  candidates: FigureMeta[];
  /** Nog niet ontdekte netwerkdenkers in de lijst. */
  undiscovered: string[];
}

/**
 * Kandidaten (§7.3): gevolgde denkers, de kerndenkers en een handvol nog niet ontdekte
 * netwerkdenkers met overlappende thema's.
 */
export function candidatesFor(
  text: string,
  follows: readonly string[],
  discovered: readonly string[],
  max = 4,
): Candidates {
  const known = new Set([...CORE_IDS, ...discovered]);
  const ids = new Set<string>([...follows, ...CORE_IDS]);
  // Ontdekte netwerkdenkers met overlap doen ook mee.
  for (const meta of FIGURES_META) {
    if (meta.tier === 'netwerk' && known.has(meta.id) && keywordScore(text, meta.tags) >= 1) {
      ids.add(meta.id);
    }
  }
  const newcomers = FIGURES_META.filter((m) => m.tier === 'netwerk' && !known.has(m.id))
    .map((meta) => ({ meta, score: keywordScore(text, [...meta.tags, ...meta.helpsWith]) }))
    .filter((entry) => entry.score >= 1)
    .sort((a, b) => b.score - a.score || a.meta.id.localeCompare(b.meta.id))
    .slice(0, max)
    .map((entry) => entry.meta);
  const candidates = [
    ...[...ids].map((id) => findMeta(id)).filter((m): m is FigureMeta => Boolean(m)),
    ...newcomers,
  ];
  return { candidates, undiscovered: newcomers.map((m) => m.id) };
}

export interface ProposedReaction {
  figureId: string;
  type: 'like' | 'comment';
  text?: string;
}

/**
 * Controleer de voorgestelde reacties (§8.6): alleen kandidaten, uniek, max. 3, hooguit één nieuwe
 * denker (en alleen als ontdekken mag), reacties ingekort tot ~60 woorden.
 */
export function validateReactions(
  proposed: readonly ProposedReaction[],
  { candidates, undiscovered }: Candidates,
  allowDiscovery: boolean,
): (ProposedReaction & { discovery: boolean })[] {
  const allowed = new Set(candidates.map((c) => c.id));
  const seen = new Set<string>();
  const result: (ProposedReaction & { discovery: boolean })[] = [];
  let newcomer = false;
  for (const reaction of proposed) {
    if (!allowed.has(reaction.figureId) || seen.has(reaction.figureId)) continue;
    const discovery = undiscovered.includes(reaction.figureId);
    if (discovery && (!allowDiscovery || newcomer)) continue;
    const text = reaction.type === 'comment' ? trimWords(reaction.text ?? '') : '';
    seen.add(reaction.figureId);
    if (discovery) newcomer = true;
    result.push({
      figureId: reaction.figureId,
      type: text ? 'comment' : 'like',
      text: text || undefined,
      discovery,
    });
    if (result.length === LIMITS.timeline.maxReactions) break;
  }
  return result;
}

/** Verschijntijden: 1–20 minuten na plaatsen (oplopend), of direct in de dev-stand. */
export function reactionDelays(postId: string, count: number, instant: boolean): number[] {
  if (instant) return Array.from({ length: count }, () => 0);
  const { min, max } = LIMITS.timeline.reactionDelayMinutes;
  const rng = seededRng(`${postId}|vertraging`);
  return Array.from({ length: count }, () => Math.round((min + rng() * (max - min)) * MINUTE)).sort(
    (a, b) => a - b,
  );
}

export function reactionSource(postId: string, reaction: Pick<Reaction, 'figureId'>): string {
  return `reactie:${postId}:${reaction.figureId}`;
}

/** Zet de reacties bij het bericht en plan de meldingen op hun verschijntijd. */
export function scheduleReactions(
  postId: string,
  reactions: readonly (ProposedReaction & { discovery: boolean })[],
  createdAt: number,
  instant: boolean,
): Reaction[] {
  const post = usePostStore.getState().posts.find((p) => p.id === postId);
  if (!post || post.crisis || reactions.length === 0) return [];
  const delays = reactionDelays(postId, reactions.length, instant);
  const scheduled: Reaction[] = reactions.map((reaction, i) => ({
    id: uid('reactie'),
    figureId: reaction.figureId,
    type: reaction.type,
    ...(reaction.text ? { text: reaction.text } : {}),
    visibleAt: new Date(createdAt + (delays[i] ?? 0)).toISOString(),
    seen: false,
    ...(reaction.discovery ? { discovery: true } : {}),
  }));
  usePostStore.getState().addReactions(postId, scheduled);
  const notifications = useNotificationStore.getState();
  for (const reaction of scheduled) {
    const name = figureName(reaction.figureId);
    notifications.add({
      id: uid('melding'),
      kind: reaction.discovery ? 'ontdekt' : 'reactie',
      text: reaction.discovery
        ? `Nieuw ontdekt: ${name} reageerde op je bericht.`
        : reaction.type === 'comment'
          ? `${name} reageerde op je bericht.`
          : `${name} vindt je bericht mooi.`,
      link: reaction.discovery ? `/denkers/${reaction.figureId}` : '/timeline',
      figureId: reaction.figureId,
      visibleAt: reaction.visibleAt,
      read: false,
      sourceId: reactionSource(postId, reaction),
    });
  }
  return scheduled;
}
