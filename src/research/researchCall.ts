/**
 * Bellen over een onderzoek (keuzes 2c en 2d): tien minuten met één denker uit het panel, met de
 * onderzoeksnotitie als achtergrond. Via dezelfde ElevenLabs-agent als elk gesprek; een denker
 * zonder eigen ontworpen stem krijgt een passende kant-en-klare stem (of de met "andere stem"
 * gekozen stem).
 */
import { asrKeywords, buildCallPrompt, researchFirstMessage } from '@/ai/prompts/voice';
import { RESEARCH } from '@/config/research';
import { loadFigures } from '@/data/figures';
import { voiceSpecFor } from '@/data/voices';
import { tr } from '@/i18n/research';
import { MINUTE } from '@/lib/dates';
import { uid } from '@/lib/ids';
import { loadLibrary } from '@/podcast/speech';
import { assignVoices, type SpeakerVoice } from '@/podcast/voices';
import { useProfileStore } from '@/store/profileStore';
import { findResearch } from '@/store/researchStore';
import { elevenLabsKeyStorage } from '@/store/settingsStore';
import { useVoiceStore } from '@/store/voiceStore';
import { createElevenLabsApi, type ElevenLabsApi, VoiceApiError } from '@/voice/api';
import { CallSession } from '@/voice/callSession';
import { elevenLabsStarter } from '@/voice/elevenlabsCall';
import { ensureAgent, lookUpCallCost, verifyVoice } from '@/voice/setup';
import { researchBlockFor } from './context';

/** Gekozen stem, anders de ontworpen stem (als die nog bestaat), anders een kant-en-klare. */
export async function researchCallVoice(
  api: ElevenLabsApi,
  key: string,
  figureId: string,
): Promise<SpeakerVoice> {
  const { overrides = {} } = useVoiceStore.getState();
  const designed = overrides[figureId] ? undefined : await verifyVoice(api, figureId);
  const own = designed ? { [figureId]: { voiceId: designed } } : {};
  const library = overrides[figureId] || designed ? [] : await loadLibrary(api, key);
  const voice = assignVoices([figureId], own, library, overrides)[figureId];
  if (!voice) throw new VoiceApiError('not_found', tr.call.noVoice);
  return voice;
}

export interface ResearchCallCallbacks {
  /** Het gesprek is bewaard (in de gesprekken bij Stem & bellen). */
  onSaved: (callId: string) => void;
  /** De kosten zijn opgezocht (of niet te vinden). */
  onCostDone: () => void;
}

export function createResearchCall(
  researchId: string,
  figureId: string,
  callbacks: ResearchCallCallbacks,
): CallSession | null {
  const key = elevenLabsKeyStorage.get();
  const research = findResearch(researchId);
  if (!key || !research?.brief || !research.figureIds.includes(figureId)) return null;
  const api = createElevenLabsApi(key);
  const topic = research.title ?? research.question;
  let creditsBefore: number | undefined;
  const iso = (ms: number | undefined) => new Date(ms ?? 0).toISOString();

  return new CallSession({
    durationMs: RESEARCH.callMinutes * MINUTE,
    start: elevenLabsStarter(async () => {
      const [agentId, before, voice, figures] = await Promise.all([
        ensureAgent(api),
        api.subscription().then(
          (info) => info.creditsUsed,
          () => undefined,
        ),
        researchCallVoice(api, key, figureId),
        loadFigures([figureId]),
      ]);
      creditsBefore = before;
      const figure = figures[0];
      if (!figure) throw new VoiceApiError('not_found', tr.call.noVoice);
      const spec = voiceSpecFor(figureId);
      return {
        signedUrl: await api.signedUrl(agentId),
        prompt: buildCallPrompt({
          figure,
          minutes: RESEARCH.callMinutes,
          studentName: useProfileStore.getState().profile.displayName,
          topic,
          research: researchBlockFor(researchId),
        }),
        firstMessage: researchFirstMessage(figure, spec, topic),
        voiceId: voice.voiceId,
        speed: voice.speed ?? spec?.speed ?? 1,
        stability: voice.stability ?? spec?.stability ?? 0.5,
        keywords: asrKeywords(figure),
      };
    }),
    onEnded: (state) => {
      const id = uid('proef');
      useVoiceStore.getState().addTrial({
        id,
        figureId,
        startedAt: iso(state.startedAt),
        endedAt: iso(state.endedAt),
        endReason: state.endReason ?? 'gebruiker',
        conversationId: state.conversationId,
        transcript: state.transcript.map((line) => ({
          role: line.role,
          text: line.text,
          at: iso(line.at),
        })),
      });
      callbacks.onSaved(id);
      void lookUpCallCost(api, state.conversationId, creditsBefore)
        .then((cost) => {
          if (cost) useVoiceStore.getState().setTrialCost(id, cost);
        })
        .finally(callbacks.onCostDone);
    },
  });
}
