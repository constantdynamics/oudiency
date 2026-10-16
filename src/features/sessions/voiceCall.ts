/**
 * Een belpoging binnen een geboekte sessie. Wordt altijd vanuit een klik gemaakt en gestart
 * (nooit vanuit een effect), zodat iOS de audio vrijgeeft en StrictMode niets dubbel doet.
 */
import {
  asrKeywords,
  buildCallPrompt,
  buildFirstMessage,
  buildReturnMessage,
} from '@/ai/prompts/voice';
import { LIMITS } from '@/config/limits';
import type { Figure } from '@/data/types';
import { voiceSpecFor } from '@/data/voices';
import { clock } from '@/lib/clock';
import { MINUTE } from '@/lib/dates';
import { finishSession, newMessage } from '@/services/session.service';
import type { TurnContext } from '@/services/sessionAi';
import type { Message, Session } from '@/store/schemas';
import { useSessionStore } from '@/store/sessionStore';
import { elevenLabsKeyStorage } from '@/store/settingsStore';
import { useVoiceStore } from '@/store/voiceStore';
import { createElevenLabsApi, VoiceApiError } from '@/voice/api';
import { CallSession, type CallState } from '@/voice/callSession';
import { elevenLabsStarter } from '@/voice/elevenlabsCall';
import { ensureAgent, verifyVoice } from '@/voice/setup';

const REASON: Record<NonNullable<CallState['endReason']>, NonNullable<Session['endReason']>> = {
  tijd: 'tijd',
  gebruiker: 'gebruiker',
  crisis: 'crisis',
  verbinding: 'verbinding',
  stilte: 'verbinding',
  fout: 'fout',
};

/** Een onderbreking met minstens zoveel tijd over laat de sessie open (opnieuw bellen of typen). */
const RESUMABLE_MS = 30_000;

/** Kan er met deze denker gebeld worden? (sleutel en een ontworpen stem) */
export function canCallFigure(figureId: string): boolean {
  return (
    Boolean(elevenLabsKeyStorage.get()) &&
    Boolean(voiceSpecFor(figureId)) &&
    Boolean(useVoiceStore.getState().voices[figureId])
  );
}

function earlierLines(messages: readonly Message[]) {
  return messages
    .filter((m) => !m.hidden && (m.role === 'user' || m.role === 'figure'))
    .map((m) => ({
      role: m.role === 'user' ? ('user' as const) : ('figure' as const),
      text: m.text,
    }));
}

export function createSessionCall(
  sessionId: string,
  figure: Figure,
  turn: TurnContext,
): CallSession | null {
  const key = elevenLabsKeyStorage.get();
  const spec = voiceSpecFor(figure.id);
  const session = useSessionStore.getState().sessions.find((s) => s.id === sessionId);
  if (!key || !spec || !session) return null;
  const api = createElevenLabsApi(key);
  const earlier = earlierLines(session.messages);
  return new CallSession({
    durationMs: LIMITS.session.durationMinutes * MINUTE,
    endsAt: Date.parse(session.endsAt),
    start: elevenLabsStarter(async () => {
      const agentId = await ensureAgent(api);
      const voiceId = await verifyVoice(api, figure.id);
      if (!voiceId) {
        throw new VoiceApiError(
          'not_found',
          'De stem van deze denker staat niet meer in je ElevenLabs-account.',
        );
      }
      return {
        signedUrl: await api.signedUrl(agentId),
        prompt: buildCallPrompt({
          figure,
          minutes: LIMITS.session.durationMinutes,
          studentName: turn.studentName,
          topic: session.topicHint,
          memory: turn.memory,
          earlier,
        }),
        firstMessage:
          earlier.length > 0 ? buildReturnMessage(figure) : buildFirstMessage(figure, spec),
        voiceId,
        speed: spec.speed,
        stability: spec.stability,
        keywords: asrKeywords(figure),
      };
    }),
    onEnded: (state) => saveCall(sessionId, figure, state),
  });
}

/** Na het bellen: het transcript in de sessie, en afronden (tenzij er nog tijd is na een storing). */
export function saveCall(sessionId: string, figure: Figure, state: CallState): void {
  const store = useSessionStore.getState();
  for (const line of state.transcript) {
    store.appendMessage(sessionId, newMessage(line.role, line.text, {}, line.at));
  }
  if (state.crisis) store.update(sessionId, { crisis: true });
  const reason = REASON[state.endReason ?? 'gebruiker'];
  const session = useSessionStore.getState().sessions.find((s) => s.id === sessionId);
  const endedAt = state.endedAt ?? clock.now();
  const remaining = session ? Date.parse(session.endsAt) - endedAt : 0;
  if (reason === 'verbinding' && remaining > RESUMABLE_MS) return;
  finishSession(sessionId, figure, reason, endedAt);
}
