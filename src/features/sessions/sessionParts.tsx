import { Clock3, Keyboard, Phone, Send, Square, TimerReset } from 'lucide-react';
import {
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { Avatar, type AvatarState } from '@/components/Avatar';
import { AiLabel, DemoBadge } from '@/components/Badges';
import { Button, ButtonLink } from '@/components/Button';
import { Card } from '@/components/Card';
import { RichText } from '@/components/RichText';
import { SessionClock } from '@/components/SessionClock';
import { LIMITS } from '@/config/limits';
import type { FigureMeta } from '@/data/figures';
import { t } from '@/i18n/nl';
import { cx } from '@/lib/cx';
import type { Message, Session } from '@/store/schemas';

/** Kop van het sessiescherm: de denker (met staat), de tijd, het AI-label en eventuele acties. */
export function SessionHeader({
  meta,
  state,
  status,
  startedAt,
  endsAt,
  demo,
  actions,
}: {
  meta: FigureMeta;
  state: AvatarState;
  status?: string;
  startedAt?: number;
  endsAt?: number;
  demo?: boolean;
  actions?: ReactNode;
}) {
  return (
    <header className="sticky top-(--header-h) z-20 -mx-4 border-b border-line bg-paper/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
      <div className="flex items-center gap-3">
        <Avatar figure={meta} size={52} state={state} decorative={false} />
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-fig text-2xl leading-tight text-fig">{meta.name}</h1>
          <p className="truncate text-sm text-ink-2" aria-live="polite">
            {status}
          </p>
        </div>
        {startedAt !== undefined && endsAt !== undefined && (
          <SessionClock
            className="text-2xl"
            startedAt={startedAt}
            endsAt={endsAt}
            label={t.sessions.timerLabel}
          />
        )}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <AiLabel />
        {demo && <DemoBadge />}
        {actions && <div className="ml-auto">{actions}</div>}
      </div>
    </header>
  );
}

/** Eén bericht in het gesprek. Antwoorden van de denker gaan via de veilige RichText. */
export function MessageItem({
  message,
  meta,
  streaming = false,
}: {
  message: Pick<Message, 'role' | 'text'>;
  meta: FigureMeta;
  streaming?: boolean;
}) {
  if (message.role === 'system') {
    return <li className="text-center text-sm text-ink-3 italic">{message.text}</li>;
  }
  const own = message.role === 'user';
  return (
    <li className={cx('flex', own ? 'justify-end' : 'justify-start')}>
      <div
        className={cx(
          'max-w-[min(42rem,88%)] rounded-2xl px-4 py-3',
          own
            ? 'rounded-br-md bg-ink text-paper'
            : 'rounded-bl-md border border-line bg-card text-ink shadow-card',
        )}
      >
        <p
          className={cx(
            'mb-1 text-xs font-semibold tracking-wide uppercase',
            own ? 'text-paper/75' : 'text-fig',
          )}
        >
          {own ? t.sessions.you : (meta.shortName ?? meta.name)}
        </p>
        {own ? (
          <p className="whitespace-pre-wrap">{message.text}</p>
        ) : (
          <RichText text={message.text} streaming={streaming} className="leading-relaxed" />
        )}
      </div>
    </li>
  );
}

/**
 * Het gesprek. De lopende beurt wordt voor schermlezers rustig voorgelezen. Met `follow` blijft
 * het nieuwste bericht in beeld, boven de vaste invoer (de scroll-marge houdt daar rekening mee).
 */
export function MessageList({
  messages,
  meta,
  live,
  follow = false,
}: {
  messages: readonly Message[];
  meta: FigureMeta;
  live?: { text: string; thinking: string } | null;
  follow?: boolean;
}) {
  const endRef = useRef<HTMLLIElement>(null);
  // Meeschuiven zolang je onderaan leest; scroll je terug, dan blijft het beeld staan.
  const stickRef = useRef(true);
  const count = messages.length;
  const lastRole = messages[count - 1]?.role;
  const liveLength = live?.text.length ?? 0;
  useEffect(() => {
    if (!follow) return;
    const onScroll = () => {
      const { scrollHeight } = document.documentElement;
      stickRef.current = scrollHeight - (window.scrollY + window.innerHeight) < 160;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [follow]);
  useEffect(() => {
    // 'end' en niet 'nearest': Chrome negeert 'nearest' bij een leeg element met scroll-marge.
    if (follow && (stickRef.current || lastRole === 'user'))
      endRef.current?.scrollIntoView?.({ block: 'end' });
  }, [follow, count, lastRole, liveLength]);
  return (
    <ol className="space-y-4 py-4" aria-label={t.sessions.transcript}>
      {messages
        .filter((m) => !m.hidden && !m.error)
        .map((message) => (
          <MessageItem key={message.id} message={message} meta={meta} />
        ))}
      {live && (
        <li aria-live="polite" aria-atomic="false">
          {live.text ? (
            <ul>
              <MessageItem message={{ role: 'figure', text: live.text }} meta={meta} streaming />
            </ul>
          ) : (
            <p className="flex items-center gap-2 text-ink-2 italic">
              <span aria-hidden className="flex gap-1">
                <span className="size-1.5 animate-pulse rounded-full bg-fig motion-reduce:animate-none" />
                <span className="size-1.5 animate-pulse rounded-full bg-fig [animation-delay:0.2s] motion-reduce:animate-none" />
                <span className="size-1.5 animate-pulse rounded-full bg-fig [animation-delay:0.4s] motion-reduce:animate-none" />
              </span>
              {live.thinking}
            </p>
          )}
        </li>
      )}
      <li ref={endRef} aria-hidden className="scroll-mb-64 md:scroll-mb-48" />
    </ol>
  );
}

/** Invoer: Enter = versturen, Shift+Enter = nieuwe regel. */
export function Composer({
  disabled,
  busy,
  onSend,
  onStop,
}: {
  disabled: boolean;
  busy: boolean;
  onSend: (text: string) => void;
  onStop: () => void;
}) {
  const [text, setText] = useState('');
  const id = useId();
  const submit = (event?: FormEvent) => {
    event?.preventDefault();
    const value = text.trim();
    if (!value || disabled || busy) return;
    onSend(value);
    setText('');
  };
  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      submit();
    }
  };
  return (
    <form onSubmit={submit}>
      <div className="flex items-end gap-2">
        <label htmlFor={id} className="sr-only">
          {t.sessions.inputLabel}
        </label>
        <textarea
          id={id}
          rows={1}
          aria-describedby={`${id}-hint`}
          value={text}
          disabled={disabled}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder={t.sessions.inputPlaceholder}
          className="field-sizing-content max-h-48 min-h-12 flex-1 resize-y rounded-2xl border border-line-strong bg-card px-4 py-3 text-ink placeholder:text-ink-3 focus:border-ink-2 focus:outline-none focus-visible:outline-3 focus-visible:outline-info disabled:opacity-60"
        />
        {busy ? (
          <Button
            variant="secondary"
            className="min-h-12 max-sm:px-4"
            icon={<Square aria-hidden className="size-4" />}
            onClick={onStop}
          >
            <span className="max-sm:sr-only">{t.sessions.stop}</span>
          </Button>
        ) : (
          <Button
            type="submit"
            variant="figure"
            className="min-h-12 max-sm:px-4"
            disabled={disabled || !text.trim()}
            icon={<Send aria-hidden className="size-4" />}
          >
            <span className="max-sm:sr-only">{t.sessions.send}</span>
          </Button>
        )}
      </div>
      <p
        id={`${id}-hint`}
        className="sr-only md:not-sr-only md:mt-1.5 md:block md:text-xs md:text-ink-3"
      >
        {t.sessions.inputHint}
      </p>
    </form>
  );
}

/** Waarschuwing vanaf 3 minuten resterend, met de knop om te verlengen. */
export function TimeWarning({
  credits,
  extensions,
  onExtend,
}: {
  credits: number;
  extensions: number;
  onExtend: () => void;
}) {
  const { extension } = LIMITS.session;
  const maxed = extensions >= extension.maxPerSession;
  const broke = credits < extension.creditCost;
  return (
    <div
      role="status"
      className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl border border-warn-soft bg-warn-soft px-3 py-2 text-sm text-ink"
    >
      <Clock3 aria-hidden className="size-4 shrink-0 text-warn" />
      <p className="min-w-0 flex-[1_1_14rem]">{t.sessions.warning}</p>
      {maxed ? (
        <span className="text-ink-2">{t.sessions.maxExtensions}</span>
      ) : broke ? (
        <span className="text-ink-2">{t.sessions.noCredits}</span>
      ) : (
        <Button
          size="sm"
          variant="secondary"
          className="ml-auto"
          icon={<TimerReset aria-hidden className="size-4" />}
          onClick={onExtend}
        >
          {t.sessions.extend(extension.creditCost)}
        </Button>
      )}
    </div>
  );
}

/** Samenvatting en reflectievraag na afloop. */
export function SummaryCard({ session }: { session: Session }) {
  if (session.status === 'afronden') {
    return (
      <Card as="section" aria-busy className="border-fig/30 bg-fig-surface">
        <p className="text-ink-2 italic">{t.sessions.summarizing}</p>
      </Card>
    );
  }
  if (!session.summary) {
    return <p className="text-ink-3">{t.sessions.noSummary}</p>;
  }
  return (
    <Card as="section" aria-labelledby="samenvatting" className="border-fig/30 bg-fig-surface">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="samenvatting" className="text-2xl">
          {t.sessions.summaryTitle}
        </h2>
        <AiLabel />
      </div>
      <p className="mt-2 max-w-[70ch] leading-relaxed text-ink-2">{session.summary}</p>
      {session.reflectionQuestion && (
        <div className="mt-4 rounded-xl border border-fig/25 bg-card p-4">
          <p className="text-xs font-semibold tracking-wide text-fig uppercase">
            {t.sessions.reflectionTitle}
          </p>
          <p className="mt-1 font-fig text-xl text-fig">{session.reflectionQuestion}</p>
        </div>
      )}
      {session.topics && session.topics.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Onderwerpen">
          {session.topics.map((topic) => (
            <li
              key={topic}
              className="rounded-full border border-fig/25 bg-card px-2.5 py-0.5 text-xs text-fig"
            >
              {topic}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

/** Kiezen bij de start: typen of bellen. */
export function ModeChoice({
  canCall,
  callBlockedReason,
  onType,
  onCall,
  setupLink,
}: {
  canCall: boolean;
  callBlockedReason?: string;
  onType: () => void;
  onCall: () => void;
  setupLink?: string;
}) {
  return (
    <section aria-labelledby="vorm" className="mt-6">
      <h2 id="vorm" className="mb-3 text-2xl">
        {t.sessions.chooseMode}
      </h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={onType}
          className="flex items-start gap-3 rounded-2xl border-2 border-fig bg-card p-4 text-left shadow-card transition-colors hover:bg-fig-surface focus-visible:outline-3 focus-visible:outline-info"
        >
          <Keyboard aria-hidden className="mt-0.5 size-6 shrink-0 text-fig" />
          <span>
            <span className="block font-display text-xl font-semibold">{t.sessions.typeMode}</span>
            <span className="block text-sm text-ink-2">{t.sessions.typeModeHint}</span>
          </span>
        </button>
        <div className="flex flex-col">
          <button
            type="button"
            onClick={onCall}
            disabled={!canCall}
            className="flex flex-1 items-start gap-3 rounded-2xl border-2 border-line-strong bg-card p-4 text-left shadow-card transition-colors hover:bg-fig-surface focus-visible:outline-3 focus-visible:outline-info disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-card"
          >
            <Phone aria-hidden className="mt-0.5 size-6 shrink-0 text-fig" />
            <span>
              <span className="block font-display text-xl font-semibold">
                {t.sessions.callMode}
              </span>
              <span className="block text-sm text-ink-2">{t.sessions.callModeHint}</span>
            </span>
          </button>
          {!canCall && callBlockedReason && (
            <p className="mt-2 text-sm text-ink-2">
              {callBlockedReason}{' '}
              {setupLink && (
                <ButtonLink to={setupLink} variant="ghost" size="sm" className="px-1 underline">
                  {t.sessions.setupVoice}
                </ButtonLink>
              )}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
