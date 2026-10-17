/**
 * Inbellen tijdens een aflevering (keuzes 7a en 7e): live via dezelfde ElevenLabs-agent als
 * bellen in een sessie, met de stem die de spreker in de aflevering heeft. Bij één denker bel je
 * die denker; bij een gesprek tussen twee denkers bel je Sophie. Altijd vanuit een tik gestart.
 */
import {
  buildHostCallPrompt,
  buildPodcastCallPrompt,
  hostCallFirstMessage,
  podcastCallFirstMessage,
  podcastCallKeywords,
} from '@/ai/prompts/podcastCall';
import { PODCAST } from '@/config/podcast';
import { loadFigures } from '@/data/figures';
import { tp } from '@/i18n/podcast';
import { MINUTE } from '@/lib/dates';
import { usePodcastStore } from '@/store/podcastStore';
import { useProfileStore } from '@/store/profileStore';
import type { PodcastEpisode } from '@/store/schemas';
import { elevenLabsKeyStorage } from '@/store/settingsStore';
import { useVoiceStore } from '@/store/voiceStore';
import { createElevenLabsApi, type ElevenLabsApi, VoiceApiError } from '@/voice/api';
import { CallSession, type CallState } from '@/voice/callSession';
import { elevenLabsStarter } from '@/voice/elevenlabsCall';
import { ensureAgent } from '@/voice/setup';
import { calleeOf, speakerName } from './episodeInfo';
import { currentIndex } from './listenerQuestion';
import { listenerMemory } from './memory';
import { loadLibrary } from './speech';
import { assignVoices, type SpeakerVoice } from './voices';

/** Dezelfde stem als in de aflevering (eigen ontwerp, anders een kant-en-klare stem). */
async function calleeVoice(
  api: ElevenLabsApi,
  key: string,
  episode: PodcastEpisode,
  calleeId: string,
): Promise<SpeakerVoice> {
  const speakers = [...new Set([...episode.segments.map((s) => s.speaker), calleeId])];
  const designed = useVoiceStore.getState().voices;
  const library = speakers.some((s) => !designed[s]) ? await loadLibrary(api, key) : [];
  const voice = assignVoices(speakers, designed, library)[calleeId];
  if (!voice) throw new VoiceApiError('not_found', tp.player.noVoice);
  return voice;
}

export function createPodcastCall(
  episodeId: string,
  onEnded?: (state: CallState) => void,
): CallSession | null {
  const key = elevenLabsKeyStorage.get();
  const episode = usePodcastStore.getState().episodes.find((e) => e.id === episodeId);
  if (!key || !episode) return null;
  const api = createElevenLabsApi(key);
  const calleeId = calleeOf(episode);
  const at = currentIndex(episode);
  const heard = episode.segments
    .slice(Math.max(0, at - 3), at + 1)
    .map((segment, offset, list) => ({
      speaker: speakerName(episode, at - list.length + 1 + offset) ?? segment.speaker,
      text: segment.text,
    }));

  return new CallSession({
    durationMs: PODCAST.callMinutes * MINUTE,
    start: elevenLabsStarter(async () => {
      const [agentId, voice, figures] = await Promise.all([
        ensureAgent(api),
        calleeVoice(api, key, episode, calleeId),
        loadFigures(episode.figureIds),
      ]);
      const ordered = episode.figureIds
        .map((id) => figures.find((f) => f.id === id))
        .filter((f) => f !== undefined);
      const context = {
        episode: { title: episode.title, topic: episode.topic, format: episode.format },
        figures: ordered,
        heard,
        minutes: PODCAST.callMinutes,
        listenerName: useProfileStore.getState().profile.displayName,
        memory: listenerMemory(episode.figureIds),
      };
      const figure = ordered.find((f) => f.id === calleeId);
      return {
        signedUrl: await api.signedUrl(agentId),
        prompt: figure
          ? buildPodcastCallPrompt({ ...context, figure })
          : buildHostCallPrompt(context),
        firstMessage: figure
          ? podcastCallFirstMessage(figure, episode.topic)
          : hostCallFirstMessage(),
        voiceId: voice.voiceId,
        speed: voice.speed ?? 1,
        stability: voice.stability ?? 0.5,
        keywords: podcastCallKeywords(ordered),
      };
    }),
    onEnded,
  });
}
