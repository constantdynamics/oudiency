import { AlertTriangle, Headphones, Mic, MicOff, Phone, PhoneOff } from 'lucide-react';
import { type ReactNode, useEffect, useRef } from 'react';
import { AiLabel } from '@/components/Badges';
import { Avatar, type AvatarState } from '@/components/Avatar';
import { Button, ButtonLink } from '@/components/Button';
import { Card } from '@/components/Card';
import { CrisisCard } from '@/components/CrisisCard';
import { SessionClock } from '@/components/SessionClock';
import { VOICE } from '@/config/voice';
import type { FigureMeta } from '@/data/figures';
import type { Figure } from '@/data/types';
import { tv } from '@/i18n/voice';
import { cx } from '@/lib/cx';
import type { TrialCall } from '@/store/schemas';
import type { CallErrorKind, CallState, TranscriptLine } from '@/voice/callSession';
import { formatDuration } from '@/voice/format';
import { CostLine } from './settingsParts';

function CallHeader({ eyebrow = tv.call.eyebrow }: { eyebrow?: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <p className="text-sm font-medium tracking-wide text-gold uppercase">{eyebrow}</p>
      <AiLabel />
    </div>
  );
}

export function CallErrorNote({ kind, message }: { kind: CallErrorKind; message?: string }) {
  const showDetail = ['permission', 'invalid', 'other', 'quota', 'verbinding'].includes(kind);
  return (
    <div
      role="alert"
      className="flex gap-2 rounded-xl border border-danger-soft bg-danger-soft p-3 text-left text-ink"
    >
      <AlertTriangle aria-hidden className="mt-0.5 size-5 shrink-0 text-danger" />
      <div>
        <p>{tv.errors[kind]}</p>
        {showDetail && message && <p className="mt-1 text-sm text-ink-2">{message}</p>}
      </div>
    </div>
  );
}

/** Voor het bellen: wie je spreekt, wat er met je stem gebeurt, en de belknop. */
export function CallLobby({
  meta,
  error,
  onStart,
  eyebrow,
  subtitle,
  backTo = '/profiel/stem',
  backLabel = tv.call.toSettings,
  onBack,
}: {
  meta: FigureMeta;
  error?: CallState['error'];
  onStart: () => void;
  eyebrow?: string;
  subtitle?: string;
  backTo?: string;
  backLabel?: string;
  /** Terug zonder te navigeren (bijvoorbeeld van bellen naar typen). */
  onBack?: () => void;
}) {
  const name = meta.shortName ?? meta.name;
  return (
    <div className="mx-auto max-w-xl">
      <CallHeader eyebrow={eyebrow} />
      <div className="mt-6 flex flex-col items-center text-center">
        <Avatar figure={meta} size={160} decorative={false} />
        <h1 className="mt-4 font-fig text-5xl leading-none text-fig">{meta.name}</h1>
        <p className="mt-2 text-ink-2">
          {subtitle ?? `${tv.call.eyebrow} · hooguit ${VOICE.trialMinutes} minuten`}
        </p>
        <p className="mt-4 max-w-prose text-sm text-ink-2">{tv.call.lobbyNote(meta.name)}</p>
        <p className="mt-2 max-w-sm text-sm text-ink-2">
          <Headphones aria-hidden className="mr-1.5 inline size-4 align-[-3px] text-fig" />
          {tv.call.earphones}
        </p>
        {error && (
          <div className="mt-4 w-full">
            <CallErrorNote kind={error.kind} message={error.message} />
          </div>
        )}
        <Button
          className="mt-6"
          variant="figure"
          size="lg"
          icon={<Phone aria-hidden className="size-5" />}
          onClick={onStart}
        >
          {error ? tv.call.retry : tv.call.start(name)}
        </Button>
        {onBack ? (
          <Button className="mt-3" variant="ghost" size="sm" onClick={onBack}>
            {backLabel}
          </Button>
        ) : (
          <ButtonLink className="mt-3" variant="ghost" size="sm" to={backTo}>
            {backLabel}
          </ButtonLink>
        )}
      </div>
    </div>
  );
}

export function CallTranscript({
  lines,
  name,
  follow = false,
}: {
  lines: readonly TranscriptLine[];
  name: string;
  /** Meescrollen met nieuwe regels (tijdens het gesprek). */
  follow?: boolean;
}) {
  const containerRef = useRef<HTMLOListElement>(null);
  useEffect(() => {
    const list = containerRef.current;
    if (!follow || !list) return;
    list.scrollTop = list.scrollHeight;
  }, [follow, lines.length]);
  if (lines.length === 0) return null;
  return (
    <section aria-labelledby="transcript" className="mt-8">
      <h2 id="transcript" className="mb-2 text-xl">
        {tv.call.transcript}
      </h2>
      {/* Bewust niet live voorgelezen: de stem spreekt al. */}
      <ol
        ref={containerRef}
        role="log"
        aria-live="off"
        className="max-h-80 space-y-2 overflow-y-auto rounded-2xl border border-line bg-card p-3.5"
      >
        {lines.map((line) => (
          <li
            key={line.id}
            className={cx(
              line.role === 'system' && 'text-sm text-ink-3 italic',
              line.role === 'user' && 'text-ink-2',
            )}
          >
            <span className={cx('font-semibold', line.role === 'figure' && 'text-fig')}>
              {line.role === 'user' ? tv.call.you : line.role === 'figure' ? name : tv.call.app}:
            </span>{' '}
            {line.text}
          </li>
        ))}
      </ol>
    </section>
  );
}

function avatarStateFor(state: CallState): AvatarState {
  if (state.status === 'verbinden') return 'thinking';
  if (state.mode === 'spreekt') return 'speaking';
  if (state.mode === 'denkt') return 'thinking';
  return 'listening';
}

function statusText(state: CallState, name: string, figure: Figure): string {
  if (state.status === 'verbinden') return tv.call.connecting(name);
  if (state.status === 'afscheid') return tv.call.farewell(name);
  if (state.muted) return tv.call.muted;
  if (state.mode === 'spreekt') return tv.call.speaking(name);
  if (state.mode === 'denkt') return figure.microcopy.thinking;
  return tv.call.listening(name);
}

/** Tijdens het gesprek: de denker, de status, de tijd, dempen en ophangen. */
export function LiveCall({
  meta,
  figure,
  state,
  onToggleMute,
  onHangUp,
  eyebrow,
  children,
}: {
  meta: FigureMeta;
  figure: Figure;
  state: CallState;
  onToggleMute: () => void;
  onHangUp: () => void;
  eyebrow?: string;
  /** Extra inhoud onder de knoppen (bijvoorbeeld verlengen in een sessie). */
  children?: ReactNode;
}) {
  const name = meta.shortName ?? meta.name;
  const connected = state.status === 'live' || state.status === 'afscheid';
  return (
    <div className="mx-auto max-w-xl">
      <CallHeader eyebrow={eyebrow} />
      <div className="mt-6 flex flex-col items-center text-center">
        <Avatar figure={meta} size={160} state={avatarStateFor(state)} decorative={false} />
        <h1 className="mt-4 font-fig text-5xl leading-none text-fig">{meta.name}</h1>
        <p className="mt-2 min-h-6 text-ink-2" aria-live="polite">
          {statusText(state, name, figure)}
        </p>
        {state.startedAt !== undefined && state.endsAt !== undefined && (
          <SessionClock
            className="mt-3 text-3xl"
            startedAt={state.startedAt}
            endsAt={state.endsAt}
            label={tv.call.remaining}
          />
        )}
      </div>
      <div className="mt-6 flex items-start justify-center gap-8">
        <div className="flex flex-col items-center gap-1.5">
          <button
            type="button"
            aria-pressed={state.muted}
            aria-label={tv.call.mute}
            disabled={!connected}
            onClick={onToggleMute}
            className={cx(
              'inline-flex size-16 items-center justify-center rounded-full border-2 transition-colors disabled:opacity-50',
              state.muted
                ? 'border-ink bg-ink text-paper'
                : 'border-line-strong bg-card text-ink hover:bg-paper-2',
            )}
          >
            {state.muted ? (
              <MicOff aria-hidden className="size-7" />
            ) : (
              <Mic aria-hidden className="size-7" />
            )}
          </button>
          <span aria-hidden className="text-sm text-ink-2">
            {tv.call.muteCaption}
          </span>
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <button
            type="button"
            aria-label={tv.call.hangUp}
            onClick={onHangUp}
            className="inline-flex size-16 items-center justify-center rounded-full bg-danger text-white shadow-card transition-opacity hover:opacity-90"
          >
            <PhoneOff aria-hidden className="size-7" />
          </button>
          <span aria-hidden className="text-sm text-ink-2">
            {tv.call.hangUp}
          </span>
        </div>
      </div>
      {children && <div className="mt-6">{children}</div>}
      <CallTranscript lines={state.transcript} name={name} follow />
    </div>
  );
}

/** Na het gesprek: waarom het stopte, hoe lang het duurde, wat het kostte en het transcript. */
export function CallEnded({
  meta,
  state,
  trial,
  costPending,
  onAgain,
}: {
  meta: FigureMeta;
  state: CallState;
  trial?: TrialCall;
  costPending: boolean;
  onAgain: () => void;
}) {
  const name = meta.shortName ?? meta.name;
  const duration =
    state.startedAt !== undefined && state.endedAt !== undefined
      ? state.endedAt - state.startedAt
      : 0;
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <CallHeader />
      {state.crisis && <CrisisCard />}
      <Card as="section" aria-labelledby="beeindigd">
        <h1 id="beeindigd" className="text-3xl">
          {tv.call.ended}
        </h1>
        <p className="mt-2 text-ink-2">{tv.endReasons[state.endReason ?? 'gebruiker']}</p>
        {state.error?.message && <p className="mt-1 text-sm text-ink-3">{state.error.message}</p>}
        <p className="mt-3">{tv.call.duration(formatDuration(duration))}</p>
        <p className="mt-1 text-ink-2" aria-live="polite">
          {trial?.cost ? (
            <CostLine trial={trial} />
          ) : costPending ? (
            tv.call.costLoading
          ) : (
            tv.call.costUnknown
          )}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            variant="figure"
            icon={<Phone aria-hidden className="size-4" />}
            onClick={onAgain}
          >
            {tv.call.again}
          </Button>
          <ButtonLink variant="secondary" to="/profiel/stem">
            {tv.call.toSettings}
          </ButtonLink>
        </div>
      </Card>
      <CallTranscript lines={state.transcript} name={name} />
    </div>
  );
}
