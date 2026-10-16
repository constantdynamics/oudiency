/**
 * De lopende beurt van een getypte sessie (niet bewaard): of de denker nadenkt of typt, de tekst
 * tot nu toe en eventuele fouten. Pas het complete antwoord gaat de sessie in; zo overleeft de
 * stroom een rerender en blijft de opslag schoon.
 */
import { create } from 'zustand';
import { AiError, isAbort } from '@/ai';
import { clock } from '@/lib/clock';
import { markdownToPlainText } from '@/lib/markdown';
import { speak } from '@/lib/speech';
import { compensateSession, newMessage } from '@/services/session.service';
import { generateOpening, generateReply, type TurnContext } from '@/services/sessionAi';
import { useSessionStore } from '@/store/sessionStore';
import { useSettingsStore } from '@/store/settingsStore';

export type LiveStatus = 'stil' | 'denkt' | 'typt' | 'fout';

interface LiveTurnState {
  sessionId?: string;
  kind?: 'opening' | 'antwoord';
  status: LiveStatus;
  text: string;
  error?: { kind: AiError['kind']; message: string };
  controller?: AbortController;
}

export const useLiveTurn = create<LiveTurnState>(() => ({ status: 'stil', text: '' }));

export function isBusy(state: LiveTurnState, sessionId: string): boolean {
  return state.sessionId === sessionId && (state.status === 'denkt' || state.status === 'typt');
}

/** Laat de denker beginnen (opening) of antwoorden. Eén beurt tegelijk. */
export async function runTurn(
  sessionId: string,
  kind: 'opening' | 'antwoord',
  ctx: TurnContext,
): Promise<void> {
  if (isBusy(useLiveTurn.getState(), sessionId)) return;
  const controller = new AbortController();
  useLiveTurn.setState({
    sessionId,
    kind,
    status: 'denkt',
    text: '',
    error: undefined,
    controller,
  });
  const startedAt = clock.now();
  const onDelta = (chunk: string) =>
    useLiveTurn.setState((s) => ({ status: 'typt', text: s.text + chunk }));
  try {
    const text =
      kind === 'opening'
        ? await generateOpening(sessionId, ctx, onDelta, controller.signal)
        : await generateReply(sessionId, ctx, onDelta, controller.signal);
    if (text) {
      useSessionStore.getState().appendMessage(sessionId, newMessage('figure', text));
      if (useSettingsStore.getState().settings.readingVoice) speak(markdownToPlainText(text));
    }
    useLiveTurn.setState({ status: 'stil', text: '', controller: undefined });
  } catch (error) {
    if (isAbort(error)) {
      const partial = useLiveTurn.getState().text.trim();
      if (partial) {
        useSessionStore.getState().appendMessage(sessionId, newMessage('figure', `${partial} …`));
      }
      useLiveTurn.setState({ status: 'stil', text: '', controller: undefined });
      return;
    }
    // Tijd die de storing kostte, krijg je terug (max. 2 minuten per sessie).
    compensateSession(sessionId, clock.now() - startedAt);
    const kindOf = error instanceof AiError ? error.kind : 'other';
    useLiveTurn.setState({
      status: 'fout',
      text: '',
      controller: undefined,
      error: { kind: kindOf, message: error instanceof Error ? error.message : String(error) },
    });
  }
}

export function stopTurn(): void {
  useLiveTurn.getState().controller?.abort();
}

export function clearTurnError(): void {
  useLiveTurn.setState({ status: 'stil', error: undefined, text: '' });
}
