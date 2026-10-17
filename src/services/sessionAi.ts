/**
 * De AI-kant van een getypte sessie: de begroeting, het antwoord per beurt en de samenvatting.
 * Lazy geladen (sessiescherm en achtergrondtaak), zodat de AI-code niet in de startbundel zit.
 */
import { getProvider } from '@/ai';
import type { DemoHistoryItem } from '@/ai/demoContext';
import { FRAME } from '@/ai/prompts/frame';
import { buildPersona } from '@/ai/prompts/persona';
import { detectCrisisSignals } from '@/ai/prompts/safety';
import {
  arrivalText,
  type SessionContext,
  sessionRequest,
  SUMMARY_TASK,
  transcriptText,
} from '@/ai/prompts/session';
import { SessionSummarySchema } from '@/ai/schemas';
import type { Figure } from '@/data/types';
import { clock } from '@/lib/clock';
import type { Message, Session } from '@/store/schemas';
import { useSessionStore } from '@/store/sessionStore';
import { newMessage } from './session.service';
import { timerState, turnContext } from './session-timer';

function history(messages: readonly Message[]): DemoHistoryItem[] {
  return messages
    .filter((m) => !m.hidden && !m.error && (m.role === 'user' || m.role === 'figure'))
    .map((m) => ({ role: m.role === 'user' ? 'user' : 'figure', text: m.text }));
}

function current(sessionId: string): Session {
  const session = useSessionStore.getState().sessions.find((s) => s.id === sessionId);
  if (!session) throw new Error('Sessie niet gevonden');
  return session;
}

export interface TurnContext {
  figure: Figure;
  studentName: string;
  memory: string[];
}

function promptContext(session: Session, ctx: TurnContext): SessionContext {
  return {
    figure: ctx.figure,
    studentName: ctx.studentName,
    topicHint: session.topicHint,
    memory: ctx.memory,
  };
}

/**
 * De denker begroet de student. Het verborgen binnenkomst-bericht wordt bewaard, zodat het
 * gesprek voor het model na herladen hetzelfde begint.
 */
export async function generateOpening(
  sessionId: string,
  ctx: TurnContext,
  onDelta: (chunk: string) => void,
  signal?: AbortSignal,
): Promise<string> {
  let session = current(sessionId);
  if (!session.messages.some((m) => m.hidden)) {
    useSessionStore.getState().appendMessage(
      session.id,
      newMessage('system', arrivalText(ctx.memory.length > 0, session.topicHint), {
        hidden: true,
      }),
    );
    session = current(sessionId);
  }
  const result = await getProvider().streamText(
    sessionRequest(promptContext(session, ctx), session.messages, {
      kind: 'session-opening',
      figureId: session.figureId,
      sessionId: session.id,
      displayName: ctx.studentName,
      topicHint: session.topicHint,
      memory: ctx.memory,
    }),
    onDelta,
    signal,
  );
  return result.text.trim();
}

/** Voeg het bericht van de student toe, met de tijdregel die meegaat naar het model. */
export function addUserMessage(sessionId: string, text: string, now = clock.now()): Message {
  const session = current(sessionId);
  const turn = session.messages.filter((m) => m.role === 'user').length + 1;
  const { elapsedMs, remainingMs } = timerState(
    Date.parse(session.startedAt),
    Date.parse(session.endsAt),
    now,
  );
  const message = newMessage(
    'user',
    text.trim(),
    { timeContext: turnContext(turn, elapsedMs, remainingMs) },
    now,
  );
  useSessionStore.getState().appendMessage(session.id, message);
  if (detectCrisisSignals(text)) useSessionStore.getState().update(session.id, { crisis: true });
  return message;
}

/** Het antwoord van de denker op het laatste bericht van de student. */
export async function generateReply(
  sessionId: string,
  ctx: TurnContext,
  onDelta: (chunk: string) => void,
  signal?: AbortSignal,
  now = clock.now(),
): Promise<string> {
  const session = current(sessionId);
  const lastUser = [...session.messages].reverse().find((m) => m.role === 'user');
  const turn = session.messages.filter((m) => m.role === 'user').length;
  const { remainingMs } = timerState(
    Date.parse(session.startedAt),
    Date.parse(session.endsAt),
    now,
  );
  const result = await getProvider().streamText(
    sessionRequest(promptContext(session, ctx), session.messages, {
      kind: 'session-turn',
      figureId: session.figureId,
      sessionId: session.id,
      displayName: ctx.studentName,
      turn,
      remainingMs,
      userText: lastUser?.text ?? '',
      topicHint: session.topicHint,
      history: history(session.messages.filter((m) => m.id !== lastUser?.id)),
      crisis: Boolean(lastUser && detectCrisisSignals(lastUser.text)),
    }),
    onDelta,
    signal,
  );
  return result.text.trim();
}

const summarizing = new Map<string, Promise<boolean>>();

/**
 * Maak de samenvatting en de reflectievraag (licht model). Lukt dat niet, dan wordt het gesprek
 * toch afgerond, zodat het niet blijft hangen. Na een crisissignaal geen samenvatting.
 */
export function summarizeSession(sessionId: string, figure: Figure): Promise<boolean> {
  const running = summarizing.get(sessionId);
  if (running) return running;
  const job = (async () => {
    const session = current(sessionId);
    if (session.status === 'afgerond') return Boolean(session.summary);
    const store = useSessionStore.getState();
    const spoken = history(session.messages);
    if (session.crisis || !spoken.some((h) => h.role === 'user')) {
      store.update(session.id, { status: 'afgerond' });
      return false;
    }
    try {
      const name = figure.shortName ?? figure.name;
      const result = await getProvider().structured({
        task: 'summary',
        system: [
          { text: FRAME, cache: true },
          { text: buildPersona(figure), cache: true },
          { text: SUMMARY_TASK },
        ],
        messages: [{ role: 'user', content: transcriptText(session.messages, name) }],
        demo: {
          kind: 'session-summary',
          figureId: session.figureId,
          sessionId: session.id,
          history: spoken,
          topicHint: session.topicHint,
        },
        schema: SessionSummarySchema,
      });
      store.update(session.id, {
        status: 'afgerond',
        summary: result.summary.trim(),
        reflectionQuestion: result.reflectionQuestion.trim(),
        topics: result.topics.slice(0, 3),
      });
      return true;
    } catch (error) {
      console.warn('[sessie] samenvatting mislukt', error);
      store.update(session.id, { status: 'afgerond' });
      return false;
    }
  })().finally(() => summarizing.delete(sessionId));
  summarizing.set(sessionId, job);
  return job;
}
