/**
 * Luistervragen (keuzes 7c, 7e en 8d): je vraag (getypt, of via Sophie aan de telefoon) wordt
 * een paar fragmenten in de aflevering. Sophie leest de vraag voor, de denker(s) antwoorden en
 * gaan terug naar het onderwerp. Het klinkt direct na het fragment dat nu speelt. Lazy geladen;
 * alleen met je eigen Claude-sleutel.
 */
import { activeProviderId, AiError, describeAiError, getProvider } from '@/ai';
import { type HeardSegment, listenerQuestionRequest } from '@/ai/prompts/podcast';
import { ListenerAnswerSchema, type ListenerAnswerOutput } from '@/ai/schemas';
import { PODCAST } from '@/config/podcast';
import { loadFigures } from '@/data/figures';
import { HOST_ID } from '@/data/podcastHost';
import { tp } from '@/i18n/podcast';
import { uid } from '@/lib/ids';
import { usePodcastStore } from '@/store/podcastStore';
import { useProfileStore } from '@/store/profileStore';
import type { PodcastEpisode, PodcastSegment } from '@/store/schemas';
import { speakerName } from './episodeInfo';
import { listenerMemory } from './memory';
import { usePlayer } from './playerState';
import { useQuestion } from './questionState';
import { cleanSpokenText, resolveSpeaker } from './script';

export interface CallLine {
  role: 'user' | 'host';
  text: string;
}

export interface QuestionInput {
  /** De getypte vraag. */
  question?: string;
  /** Of het gesprek met Sophie (inbellen bij een gesprek tussen twee denkers). */
  call?: readonly CallLine[];
}

/** Van het antwoord naar fragmenten: Sophie met de vraag vooraan, dan het antwoord en terug. */
export function toAnswerSegments(
  output: ListenerAnswerOutput,
  figureIds: readonly string[],
  question?: string,
): PodcastSegment[] {
  const parts = output.segments
    .map((segment) => ({
      speaker: resolveSpeaker(segment.speaker, figureIds),
      text: cleanSpokenText(segment.text),
    }))
    .filter((part): part is { speaker: string; text: string } =>
      Boolean(part.speaker && part.text),
    );
  // Zonder antwoord van een denker is het geen antwoord.
  if (!parts.some((part) => part.speaker !== HOST_ID)) return [];
  if (parts[0]?.speaker !== HOST_ID) {
    parts.unshift({
      speaker: HOST_ID,
      text: question ? `We hebben een luistervraag: ${question.trim()}` : tp.question.fallbackIntro,
    });
  }
  return parts.map((part, index) => ({
    id: uid('fragment'),
    speaker: part.speaker,
    text: part.text,
    kind:
      index === 0
        ? 'luistervraag'
        : index === parts.length - 1 && parts.length > 2
          ? 'terug'
          : 'antwoord',
  }));
}

function episodeById(id: string): PodcastEpisode | undefined {
  return usePodcastStore.getState().episodes.find((e) => e.id === id);
}

/** Het fragment waar je nu bent: in de speler, anders waar je gebleven was. */
export function currentIndex(episode: PodcastEpisode): number {
  const player = usePlayer.getState();
  const last = Math.max(0, episode.segments.length - 1);
  if (player.episodeId === episode.id) return Math.min(player.segment, last);
  if (episode.finishedAt) return last;
  return Math.min(episode.position?.segment ?? 0, last);
}

function heardBefore(episode: PodcastEpisode, index: number): HeardSegment[] {
  const from = Math.max(0, index - PODCAST.contextSegments + 1);
  return episode.segments.slice(from, index + 1).map((segment, offset) => ({
    speaker: speakerName(episode, from + offset) ?? segment.speaker,
    text: segment.text,
  }));
}

/** Schrijf het antwoord en zet het in de aflevering; speelt meteen als de speler stilstaat. */
export async function askQuestion(episodeId: string, input: QuestionInput): Promise<void> {
  const episode = episodeById(episodeId);
  if (!episode) return;
  if (activeProviderId() !== 'anthropic-browser') {
    throw new AiError('auth', tp.problems.sleutel);
  }
  const at = currentIndex(episode);
  const next = episode.segments[at + 1];
  const figures = await loadFigures(episode.figureIds);
  const ordered = episode.figureIds
    .map((id) => figures.find((f) => f.id === id))
    .filter((f) => f !== undefined);
  const displayName = useProfileStore.getState().profile.displayName.trim();
  const request = listenerQuestionRequest(
    {
      format: episode.format,
      figures: ordered,
      topic: episode.topic,
      minutes: episode.minutes,
      listenerName: displayName || undefined,
      heard: heardBefore(episode, at),
      next: next
        ? { speaker: speakerName(episode, at + 1) ?? next.speaker, text: next.text }
        : undefined,
      question: input.question,
      call: input.call,
      memory: listenerMemory(episode.figureIds),
    },
    episode.id,
  );
  const output = await getProvider().structured({ ...request, schema: ListenerAnswerSchema });
  const segments = toAnswerSegments(output, episode.figureIds, input.question);
  if (segments.length === 0) throw new AiError('invalid', tp.question.failed);

  // Intussen kan de speler verder zijn: het antwoord komt na wat nu speelt.
  const fresh = episodeById(episodeId);
  if (!fresh) return;
  const player = usePlayer.getState();
  const active = player.episodeId === episodeId;
  const after = active ? player.segment : currentIndex(fresh);
  usePodcastStore.getState().insertSegments(episodeId, after, segments);
  const playing = active && (player.status === 'speelt' || player.status === 'laden');
  const engine = await import('./player');
  if (playing) engine.warmUp(episodeId, after + 1);
  else await engine.playFrom(episodeId, after + 1);
}

/** Voor de interface: vraag stellen met zichtbare status (schrijven, klaar of fout). */
export async function submitQuestion(episodeId: string, input: QuestionInput): Promise<void> {
  useQuestion.setState({ episodeId, status: 'schrijven', error: undefined });
  try {
    await askQuestion(episodeId, input);
    useQuestion.setState({ episodeId, status: 'klaar' });
  } catch (error) {
    useQuestion.setState({ episodeId, status: 'fout', error: describeAiError(error).message });
  }
}
