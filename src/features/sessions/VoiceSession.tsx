import { Keyboard, Phone, Square } from 'lucide-react';
import { useCallback, useSyncExternalStore } from 'react';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { CrisisCard } from '@/components/CrisisCard';
import { toast } from '@/components/toastStore';
import { LIMITS } from '@/config/limits';
import type { FigureMeta } from '@/data/figures';
import type { Figure } from '@/data/types';
import { CallErrorNote, LiveCall } from '@/features/voice/callParts';
import { useNow } from '@/hooks/useNow';
import { t } from '@/i18n/nl';
import { MINUTE } from '@/lib/dates';
import { extendSession, finishSession } from '@/services/session.service';
import { timerState } from '@/services/session-timer';
import { useProfileStore } from '@/store/profileStore';
import type { Session } from '@/store/schemas';
import { useSessionStore } from '@/store/sessionStore';
import type { CallSession, CallState } from '@/voice/callSession';
import { TimeWarning } from './sessionParts';

const IDLE: CallState = {
  status: 'klaar',
  mode: 'luistert',
  muted: false,
  transcript: [],
  crisis: false,
};
const noop = () => () => undefined;

/**
 * Een gebelde sessie. De belpoging (`call`) beheert de pagina; deze weergave toont het gesprek,
 * verlengen, en bij een onderbreking: opnieuw bellen, verder typen of afronden.
 */
export function VoiceSession({
  session,
  meta,
  figure,
  call,
  onCallAgain,
}: {
  session: Session;
  meta: FigureMeta;
  figure: Figure;
  call: CallSession | null;
  onCallAgain: () => void;
}) {
  const credits = useProfileStore((s) => s.profile.credits);
  const now = useNow(1000);
  const subscribe = useCallback(
    (listener: () => void) => (call ? call.subscribe(listener) : noop()),
    [call],
  );
  const getSnapshot = useCallback(() => (call ? call.getSnapshot() : IDLE), [call]);
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const { phase } = timerState(Date.parse(session.startedAt), Date.parse(session.endsAt), now);
  const live = state.status === 'live' || state.status === 'afscheid';

  const extend = () => {
    const result = extendSession(session.id);
    if (result.ok) {
      call?.extend(LIMITS.session.extension.minutes * MINUTE);
      toast(t.sessions.extended, 'ok');
    } else {
      toast(
        result.reason === 'geen-credits' ? t.sessions.noCredits : t.sessions.maxExtensions,
        'warn',
      );
    }
  };

  if (state.status === 'verbinden' || live) {
    return (
      <LiveCall
        meta={meta}
        thinking={figure.microcopy.thinking}
        state={state}
        eyebrow={t.sessions.title}
        onToggleMute={() => call?.toggleMute()}
        onHangUp={() => void call?.hangUp('gebruiker')}
      >
        {live && (phase === 'afronden' || phase === 'slot') && (
          <TimeWarning credits={credits} extensions={session.extensions} onExtend={extend} />
        )}
      </LiveCall>
    );
  }

  // Mislukt of onderbroken, met nog tijd over.
  return (
    <div className="mx-auto max-w-xl space-y-4">
      {session.crisis && <CrisisCard />}
      {state.status === 'fout' && state.error && (
        <CallErrorNote kind={state.error.kind} message={state.error.message} />
      )}
      <Card as="section" aria-labelledby="onderbroken">
        <h1 id="onderbroken" className="text-2xl">
          {t.sessions.callInterrupted}
        </h1>
        <p className="mt-2 text-ink-2">{t.sessions.callInterruptedBody}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            variant="figure"
            icon={<Phone aria-hidden className="size-4" />}
            onClick={onCallAgain}
          >
            {t.sessions.callAgain}
          </Button>
          <Button
            variant="secondary"
            icon={<Keyboard aria-hidden className="size-4" />}
            onClick={() => useSessionStore.getState().update(session.id, { mode: 'tekst' })}
          >
            {t.sessions.continueTyping}
          </Button>
          <Button
            variant="ghost"
            icon={<Square aria-hidden className="size-4" />}
            onClick={() => finishSession(session.id, figure, 'gebruiker')}
          >
            {t.sessions.finishNow}
          </Button>
        </div>
      </Card>
    </div>
  );
}
