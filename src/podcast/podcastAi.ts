/**
 * De AI-kant van de podcasts: het script laten schrijven (Claude, structured output) en de
 * aflevering van vandaag klaarzetten. Lazy geladen; alleen met je eigen Claude-sleutel.
 */
import { activeProviderId, AiError, describeAiError, getProvider } from '@/ai';
import { podcastRequest } from '@/ai/prompts/podcast';
import { PodcastScriptSchema } from '@/ai/schemas';
import { loadFigures } from '@/data/figures';
import { EXAMPLE_LECTURES } from '@/data/seed/lectures';
import { discoveredSet } from '@/features/figures/discovery';
import { clock } from '@/lib/clock';
import { localDateKey } from '@/lib/dates';
import { uid } from '@/lib/ids';
import { interestsFrom } from '@/services/discover.service';
import { dailyPlan, newEpisode } from '@/services/podcast.service';
import { useLectureStore } from '@/store/lectureStore';
import { useLibraryStore, useNotificationStore } from '@/store/miscStores';
import { usePodcastStore } from '@/store/podcastStore';
import { usePostStore } from '@/store/postStore';
import { useProfileStore } from '@/store/profileStore';
import { useSessionStore } from '@/store/sessionStore';
import { tp } from '@/i18n/podcast';
import { dailyEpisodeDue } from './daily';
import { listenerMemory } from './memory';
import { toSegments } from './script';
import { markWriting } from './writingState';

/** Waar je je mee bezighoudt, uit je colleges, likes, timeline en sessies. */
export function currentInterests(): Map<string, number> {
  const lectures = useLectureStore.getState().lectures;
  const likes = useLibraryStore.getState().likes;
  return interestsFrom({
    ownTags: lectures.flatMap((l) => l.tags ?? []),
    likedTags: [
      ...lectures.filter((l) => likes[l.id]).flatMap((l) => l.tags ?? []),
      ...EXAMPLE_LECTURES.filter((l) => likes[l.id]).flatMap((l) => l.tags),
    ],
    postTags: usePostStore.getState().posts.flatMap((p) => p.tags),
    sessionTopics: useSessionStore.getState().sessions.flatMap((s) => s.topics ?? []),
  });
}

function topInterests(limit = 5): string[] {
  return [...currentInterests().entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([term]) => term);
}

const writing = new Map<string, Promise<void>>();

/** Laat het script schrijven; bij een fout staat de reden bij de aflevering (opnieuw kan). */
export function writeEpisode(episodeId: string): Promise<void> {
  const pending = writing.get(episodeId);
  if (pending) return pending;
  markWriting(episodeId, true);
  const promise = write(episodeId).finally(() => {
    writing.delete(episodeId);
    markWriting(episodeId, false);
  });
  writing.set(episodeId, promise);
  return promise;
}

async function write(episodeId: string): Promise<void> {
  const store = usePodcastStore.getState();
  const episode = store.episodes.find((e) => e.id === episodeId);
  if (!episode || episode.status === 'klaar') return;
  store.updateEpisode(episodeId, { status: 'schrijven', error: undefined });
  try {
    if (activeProviderId() !== 'anthropic-browser') {
      throw new AiError('auth', tp.problems.sleutel);
    }
    const figures = await loadFigures(episode.figureIds);
    const ordered = episode.figureIds
      .map((id) => figures.find((f) => f.id === id))
      .filter((f) => f !== undefined);
    const displayName = useProfileStore.getState().profile.displayName.trim();
    const request = podcastRequest(
      {
        format: episode.format,
        figures: ordered,
        topic: episode.topic,
        minutes: episode.minutes,
        listenerName: displayName || undefined,
        interests: episode.source === 'dagelijks' ? topInterests() : undefined,
        memory: listenerMemory(episode.figureIds),
      },
      episode.id,
    );
    const output = await getProvider().structured({ ...request, schema: PodcastScriptSchema });
    const segments = toSegments(output, episode.figureIds);
    if (segments.length === 0) throw new AiError('invalid', tp.writeFailed);
    usePodcastStore.getState().updateEpisode(episodeId, {
      title: output.title.trim().slice(0, 90) || episode.topic,
      segments,
      status: 'klaar',
    });
  } catch (error) {
    usePodcastStore
      .getState()
      .updateEpisode(episodeId, { status: 'fout', error: describeAiError(error).message });
  }
}

/**
 * De aflevering van vandaag (keuzes 2d en 5a): de tekst staat klaar als je de app opent en komt
 * achteraan in je wachtrij; de stemmen worden pas gemaakt als je hem afspeelt. Mislukt het
 * schrijven, dan probeert de app het niet vanzelf opnieuw (dat kost tegoed).
 */
export async function ensureDailyEpisode(now: number): Promise<void> {
  if (!dailyEpisodeDue(now)) return;
  const day = localDateKey(now);
  const store = usePodcastStore.getState();
  const profile = useProfileStore.getState().profile;
  const request = dailyPlan(day, {
    follows: profile.follows,
    known: discoveredSet(profile.discovered),
    interests: currentInterests(),
    minutes: store.settings.dailyMinutes,
  });
  const episode = newEpisode(request, 'dagelijks', clock.iso(), day);
  store.addEpisode(episode);
  store.enqueue(episode.id, 'achteraan');
  await writeEpisode(episode.id);
  const written = usePodcastStore.getState().episodes.find((e) => e.id === episode.id);
  if (written?.status === 'klaar') {
    useNotificationStore.getState().add({
      id: uid('melding'),
      kind: 'systeem',
      text: tp.dailyReady(written.title),
      link: `/podcasts/${written.id}`,
      figureId: written.figureIds[0],
      visibleAt: clock.iso(),
      read: false,
      sourceId: `podcast:${day}`,
    });
  }
}
