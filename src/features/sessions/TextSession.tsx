import { LogOut, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAiMode } from '@/ai';
import { Button } from '@/components/Button';
import { CrisisCard } from '@/components/CrisisCard';
import { Dialog } from '@/components/Dialog';
import { toast } from '@/components/toastStore';
import type { FigureMeta } from '@/data/figures';
import type { Figure } from '@/data/types';
import { useNow } from '@/hooks/useNow';
import { t } from '@/i18n/nl';
import { extendSession, finishSession } from '@/services/session.service';
import { addUserMessage, type TurnContext } from '@/services/sessionAi';
import { timerState } from '@/services/session-timer';
import { useProfileStore } from '@/store/profileStore';
import type { Session } from '@/store/schemas';
import { clearTurnError, isBusy, runTurn, stopTurn, useLiveTurn } from './liveTurn';
import { Composer, MessageList, SessionHeader, TimeWarning } from './sessionParts';

const EXTEND_ERRORS = {
  'geen-credits': t.sessions.noCredits,
  maximum: t.sessions.maxExtensions,
  'te-vroeg': t.sessions.warning,
  'niet-actief': t.sessions.ended,
} as const;

/** Een lopend, getypt gesprek: begroeting, beurten, tijd, verlengen en afronden. */
export function TextSession({
  session,
  meta,
  figure,
  turn,
}: {
  session: Session;
  meta: FigureMeta;
  figure: Figure;
  turn: TurnContext;
}) {
  const now = useNow(500);
  const live = useLiveTurn();
  const credits = useProfileStore((s) => s.profile.credits);
  const demo = useAiMode() === 'demo';
  const [confirmEnd, setConfirmEnd] = useState(false);
  const busy = isBusy(live, session.id);
  const failed = live.sessionId === session.id && live.status === 'fout';
  const startedAt = Date.parse(session.startedAt);
  const endsAt = Date.parse(session.endsAt);
  const { phase } = timerState(startedAt, endsAt, now);
  const greeted = session.messages.some((m) => m.role === 'figure');

  // De denker begint: een korte begroeting (één keer per sessie).
  useEffect(() => {
    if (session.status !== 'actief' || greeted || failed) return;
    void runTurn(session.id, 'opening', turn);
  }, [session.id, session.status, greeted, failed, turn]);

  // De tijd is om: de lopende zin mag af, daarna het afscheid en de samenvatting.
  const timeUp = phase === 'voorbij';
  useEffect(() => {
    if (timeUp && !busy && session.status === 'actief') finishSession(session.id, figure, 'tijd');
  }, [timeUp, busy, session.id, session.status, figure]);

  const name = meta.shortName ?? meta.name;
  const avatar = busy ? (live.status === 'typt' ? 'speaking' : 'thinking') : 'listening';
  const status =
    live.sessionId === session.id && live.status === 'denkt'
      ? figure.microcopy.thinking
      : `${name} ${busy ? t.sessions.states.speaking : t.sessions.states.listening}`;

  const send = (text: string) => {
    addUserMessage(session.id, text);
    void runTurn(session.id, 'antwoord', turn);
  };

  const retry = () => {
    const kind = live.kind ?? 'antwoord';
    clearTurnError();
    void runTurn(session.id, kind, turn);
  };

  const extend = () => {
    const result = extendSession(session.id);
    toast(
      result.ok ? t.sessions.extended : EXTEND_ERRORS[result.reason],
      result.ok ? 'ok' : 'warn',
    );
  };

  const end = () => {
    setConfirmEnd(false);
    stopTurn();
    finishSession(session.id, figure, 'gebruiker');
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col">
      <SessionHeader
        meta={meta}
        state={avatar}
        status={status}
        startedAt={startedAt}
        endsAt={endsAt}
        demo={demo}
        actions={
          <Button
            variant="ghost"
            size="sm"
            icon={<LogOut aria-hidden className="size-4" />}
            onClick={() => setConfirmEnd(true)}
          >
            {t.sessions.endConversation}
          </Button>
        }
      />
      {turn.memory.length > 0 && (
        <p className="mt-3 text-center text-sm text-ink-3">
          {t.sessions.memoryNote(turn.memory.length)}
        </p>
      )}
      <MessageList
        messages={session.messages}
        meta={meta}
        live={busy ? { text: live.text, thinking: figure.microcopy.thinking } : null}
        follow
      />
      {/* Vast boven de tabbalk (mobiel) of onderaan het scherm (desktop). */}
      <div className="sticky bottom-[calc(4rem_+_env(safe-area-inset-bottom))] z-10 -mx-4 space-y-2 max-md:-mb-12 border-t border-line bg-paper/95 px-4 pt-3 pb-3 backdrop-blur sm:-mx-6 sm:px-6 md:bottom-0">
        {session.crisis && <CrisisCard />}
        {failed && (
          <div
            role="alert"
            className="flex flex-wrap items-center gap-3 rounded-2xl border border-danger-soft bg-danger-soft px-4 py-3"
          >
            <p className="flex-1">{t.sessions.aiError}</p>
            <Button
              size="sm"
              variant="secondary"
              icon={<RefreshCw aria-hidden className="size-4" />}
              onClick={retry}
            >
              {t.sessions.retry}
            </Button>
          </div>
        )}
        {(phase === 'afronden' || phase === 'slot') && (
          <TimeWarning credits={credits} extensions={session.extensions} onExtend={extend} />
        )}
        <Composer
          disabled={session.status !== 'actief' || !greeted || failed}
          busy={busy}
          onSend={send}
          onStop={stopTurn}
        />
      </div>
      <Dialog
        open={confirmEnd}
        onClose={() => setConfirmEnd(false)}
        title={t.sessions.endConversation}
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmEnd(false)}>
              {t.app.cancel}
            </Button>
            <Button variant="danger" onClick={end}>
              {t.sessions.endConversation}
            </Button>
          </>
        }
      >
        <p>{t.sessions.endConfirm}</p>
      </Dialog>
    </div>
  );
}
