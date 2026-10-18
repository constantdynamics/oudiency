/**
 * De AI-kant van het onderzoek (lazy geladen; alleen met je eigen Claude-sleutel):
 * 1. Haiku bedenkt Engelse zoektermen (en weigert een schadelijke vraag);
 * 2. de app leest Wikipedia en Wikisource en kiest de passende stukken;
 * 3. Sonnet schrijft de onderzoeksnotitie; citaten blijven alleen staan als ze letterlijk kloppen;
 * 4. daarna de gekozen vorm(en).
 */
import { activeProviderId, AiError, describeAiError, getProvider } from '@/ai';
import {
  essayRequest,
  researchBriefRequest,
  researchPlanRequest,
  type ResearchContext,
} from '@/ai/prompts/research';
import { EssaySchema, ResearchBriefOutputSchema, ResearchPlanSchema } from '@/ai/schemas';
import { findMeta, type FigureMeta, loadFigures } from '@/data/figures';
import { LIMITS } from '@/config/limits';
import { PODCAST } from '@/config/podcast';
import { tr } from '@/i18n/research';
import { clock } from '@/lib/clock';
import { uid } from '@/lib/ids';
import { writeEpisode } from '@/podcast/podcastAi';
import { readingIndexes } from '@/services/lecture.service';
import { newEpisode, TOPIC_MAX } from '@/services/podcast.service';
import { useLectureStore } from '@/store/lectureStore';
import { useNotificationStore } from '@/store/miscStores';
import { usePodcastStore } from '@/store/podcastStore';
import { useProfileStore } from '@/store/profileStore';
import type { Research, ResearchOutput } from '@/store/researchSchemas';
import type { Lecture } from '@/store/schemas';
import { findResearch, useResearchStore } from '@/store/researchStore';
import { toBrief } from './brief';
import { researchContextOf } from './context';
import { gatherSources, liveWiki, type WikiClient } from './gather';
import { markActive, outputKey } from './researchState';

function requireKey(): void {
  if (activeProviderId() !== 'anthropic-browser') throw new AiError('auth', tr.problems.sleutel);
}

function metasOf(ids: readonly string[]): FigureMeta[] {
  return ids.map((id) => findMeta(id)).filter((meta) => meta !== undefined);
}

/** Geweigerd: geen onderzoek, en de dagplek komt terug. */
function refuse(research: Research, reason: string): void {
  useResearchStore.getState().update(research.id, {
    status: 'fout',
    refused: true,
    error: reason,
    updatedAt: clock.iso(),
    outputs: research.outputs.map((o) => ({ ...o, status: 'fout' as const })),
  });
  useProfileStore.getState().releaseUsage('research', research.day);
}

const running = new Map<string, Promise<void>>();

/** Zoek het onderwerp uit (als dat nog niet gebeurd is) en maak de vormen die nog wachten. */
export function runResearch(researchId: string, client: WikiClient = liveWiki): Promise<void> {
  const pending = running.get(researchId);
  if (pending) return pending;
  markActive(researchId, true);
  const promise = investigate(researchId, client).finally(() => {
    running.delete(researchId);
    markActive(researchId, false);
  });
  running.set(researchId, promise);
  return promise;
}

async function investigate(researchId: string, client: WikiClient): Promise<void> {
  const research = findResearch(researchId);
  if (!research || research.refused) return;
  const store = useResearchStore.getState();
  if (research.status !== 'klaar' || !research.brief) {
    store.update(researchId, { status: 'zoeken', error: undefined, updatedAt: clock.iso() });
    try {
      requireKey();
      const figures = metasOf(research.figureIds);
      const plan = await getProvider().structured({
        ...researchPlanRequest(research.question, figures, researchId),
        schema: ResearchPlanSchema,
      });
      if (!plan.suitable) {
        refuse(research, plan.reason.trim() || tr.refused);
        return;
      }
      const sources = await gatherSources(
        plan,
        figures.map((f) => f.name),
        client,
      );
      const output = await getProvider().structured({
        ...researchBriefRequest(research.question, figures, sources, researchId),
        schema: ResearchBriefOutputSchema,
      });
      const brief = toBrief(output, sources, research.figureIds);
      if (!brief.summary) throw new AiError('invalid', tr.failed);
      useResearchStore.getState().update(researchId, {
        status: 'klaar',
        title:
          plan.title
            .trim()
            .replace(/^["“”]+|["“”]+$/g, '')
            .slice(0, 80) || undefined,
        brief,
        sources: sources.map(({ text: _text, ...source }) => source),
        updatedAt: clock.iso(),
      });
    } catch (error) {
      if (error instanceof AiError && error.kind === 'refusal') {
        refuse(research, tr.refused);
        return;
      }
      useResearchStore.getState().update(researchId, {
        status: 'fout',
        error: describeAiError(error).message,
        updatedAt: clock.iso(),
      });
      return;
    }
  }
  const waiting = findResearch(researchId)?.outputs.filter((o) => o.status !== 'klaar') ?? [];
  for (const output of waiting) await makeOutput(researchId, output.id);
  notifyDone(researchId);
}

function notifyDone(researchId: string): void {
  const research = findResearch(researchId);
  if (!research || research.status !== 'klaar') return;
  useNotificationStore.getState().add({
    id: uid('melding'),
    kind: 'systeem',
    text: tr.ready(research.title ?? research.question),
    link: `/onderzoek/${research.id}`,
    figureId: research.figureIds[0],
    visibleAt: clock.iso(),
    read: false,
    sourceId: `onderzoek:${research.id}`,
  });
}

/* ---------- De vormen ---------- */

function contextOf(research: Research): ResearchContext {
  const context = researchContextOf(research);
  if (!context) throw new AiError('invalid', tr.failed);
  return context;
}

async function writeEssay(research: Research, output: ResearchOutput): Promise<void> {
  const figureId = output.figureIds[0];
  const [figure] = await loadFigures(figureId ? [figureId] : []);
  if (!figure) throw new AiError('invalid', tr.failed);
  const context = contextOf(research);
  const others = research.figureIds
    .filter((id) => id !== figure.id)
    .map((id) => context.names[id])
    .filter((name) => name !== undefined);
  const essay = await getProvider().structured({
    ...essayRequest(
      {
        ...context,
        figure,
        length: output.length ?? 'kort',
        others,
        readerName: useProfileStore.getState().profile.displayName,
      },
      research.id,
    ),
    schema: EssaySchema,
  });
  const text = essay.text.trim();
  if (!text) throw new AiError('invalid', tr.failed);
  useResearchStore.getState().updateOutput(research.id, output.id, {
    status: 'klaar',
    title: essay.title.trim().slice(0, 90) || research.title,
    text,
    furtherReading: readingIndexes(essay.furtherReading, figure.keyWorks.length),
  });
}

/**
 * Een podcast uit het onderzoek: een aflevering (achteraan in de wachtrij) met de notitie als
 * achtergrond. Mislukte het schrijven eerder, dan probeert dezelfde aflevering het opnieuw.
 */
async function writePodcast(research: Research, output: ResearchOutput): Promise<void> {
  const podcasts = usePodcastStore.getState();
  let episode = podcasts.episodes.find((e) => e.id === output.refId);
  if (!episode) {
    episode = {
      ...newEpisode(
        {
          format: output.podcastFormat ?? 'gesprek',
          figureIds: output.figureIds,
          topic: (research.title ?? research.question).slice(0, TOPIC_MAX),
          minutes: output.minutes ?? PODCAST.defaultMinutes,
        },
        'aanvraag',
        clock.iso(),
      ),
      researchId: research.id,
    };
    podcasts.addEpisode(episode);
    podcasts.enqueue(episode.id, 'achteraan');
    useResearchStore.getState().updateOutput(research.id, output.id, { refId: episode.id });
  }
  await writeEpisode(episode.id);
  const written = usePodcastStore.getState().episodes.find((e) => e.id === episode.id);
  if (written?.status !== 'klaar') throw new AiError('invalid', written?.error ?? tr.failed);
  useResearchStore
    .getState()
    .updateOutput(research.id, output.id, { status: 'klaar', title: written.title });
}

/**
 * Een college uit het onderzoek (keuze 1c): de eerste denker is de docent, de anderen zijn
 * gastdocent en geven elk een deel. Het college zelf ontstaat op de collegepagina, deel voor deel
 * terwijl je leest; het telt niet mee voor de daglimiet van colleges.
 */
function createLecture(research: Research, output: ResearchOutput): void {
  const [figureId, ...guestIds] = output.figureIds;
  if (!figureId) throw new AiError('invalid', tr.failed);
  const lecture: Lecture = {
    id: uid('college'),
    figureId,
    ...(guestIds.length > 0 ? { guestIds } : {}),
    researchId: research.id,
    topic: (research.title ?? research.question).slice(0, LIMITS.lecture.topicMaxLength),
    mainQuestion: research.question.slice(0, LIMITS.lecture.mainQuestionMaxLength),
    segments: [],
    questions: [],
    status: 'bezig',
    share: 'privé',
    likedByMe: false,
    createdAt: clock.iso(),
    provider: 'anthropic-browser',
  };
  useLectureStore.getState().add(lecture);
  useResearchStore.getState().updateOutput(research.id, output.id, {
    status: 'klaar',
    refId: lecture.id,
    title: lecture.topic,
  });
}

const making = new Map<string, Promise<void>>();

/** Maak één vorm uit een afgerond onderzoek; bij een fout staat de reden erbij (opnieuw kan). */
export function makeOutput(researchId: string, outputId: string): Promise<void> {
  const key = outputKey(researchId, outputId);
  const pending = making.get(key);
  if (pending) return pending;
  markActive(key, true);
  const promise = make(researchId, outputId).finally(() => {
    making.delete(key);
    markActive(key, false);
  });
  making.set(key, promise);
  return promise;
}

async function make(researchId: string, outputId: string): Promise<void> {
  const research = findResearch(researchId);
  const output = research?.outputs.find((o) => o.id === outputId);
  if (!research || !output || output.status === 'klaar') return;
  const store = useResearchStore.getState();
  store.updateOutput(researchId, outputId, { status: 'maken', error: undefined });
  try {
    requireKey();
    if (output.form === 'tekst') await writeEssay(research, output);
    else if (output.form === 'podcast') await writePodcast(research, output);
    else if (output.form === 'college') createLecture(research, output);
    else store.updateOutput(researchId, outputId, { status: 'klaar' });
  } catch (error) {
    useResearchStore.getState().updateOutput(researchId, outputId, {
      status: 'fout',
      error: describeAiError(error).message,
    });
  }
}
