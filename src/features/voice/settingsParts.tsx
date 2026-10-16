import {
  AlertTriangle,
  AudioLines,
  CircleCheck,
  ExternalLink,
  Headphones,
  History,
  KeyRound,
  Phone,
  RefreshCw,
  Trash2,
  Wrench,
} from 'lucide-react';
import { type FormEvent, type ReactNode, useState } from 'react';
import { Pill } from '@/components/Badges';
import { Button, ButtonLink } from '@/components/Button';
import { Card } from '@/components/Card';
import { TextField } from '@/components/Field';
import { Thinking } from '@/components/Thinking';
import { toast } from '@/components/toastStore';
import { VOICE } from '@/config/voice';
import { figureName, type FigureMeta } from '@/data/figures';
import type { VoiceSpec } from '@/data/voices';
import { tv } from '@/i18n/voice';
import { formatLongDate, formatTime } from '@/lib/dates';
import { capitalize } from '@/lib/text';
import type { TrialCall } from '@/store/schemas';
import { elevenLabsKeyStorage, maskApiKey, useHasSecret } from '@/store/settingsStore';
import { useVoiceStore } from '@/store/voiceStore';
import {
  createElevenLabsApi,
  toVoiceError,
  type VoiceApiError,
  type VoicePreview,
} from '@/voice/api';
import { formatCredits, formatDuration, formatMoney } from '@/voice/format';
import { designPreviews, ensureAgent, refreshAccount, saveVoice } from '@/voice/setup';

function StepCard({
  id,
  icon,
  title,
  done,
  children,
}: {
  id: string;
  icon: ReactNode;
  title: string;
  done?: boolean;
  children: ReactNode;
}) {
  return (
    <Card as="section" aria-labelledby={id}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 id={id} className="flex items-center gap-2 text-2xl">
          {icon}
          {title}
        </h2>
        {done && (
          <Pill tone="ok" icon={<CircleCheck aria-hidden className="size-3" />}>
            Klaar
          </Pill>
        )}
      </div>
      {children}
    </Card>
  );
}

/** Foutmelding in gewone taal, met de toelichting van ElevenLabs waar die helpt. */
export function VoiceErrorNote({ error }: { error: VoiceApiError }) {
  const showDetail = ['permission', 'invalid', 'other', 'quota'].includes(error.kind);
  return (
    <div
      role="alert"
      className="mt-3 flex gap-2 rounded-xl border border-danger-soft bg-danger-soft p-3 text-ink"
    >
      <AlertTriangle aria-hidden className="mt-0.5 size-5 shrink-0 text-danger" />
      <div>
        <p>{tv.errors[error.kind]}</p>
        {showDetail && error.message && (
          <p className="mt-1 text-sm text-ink-2">ElevenLabs: {error.message}</p>
        )}
      </div>
    </div>
  );
}

function AccountSummary() {
  const account = useVoiceStore((s) => s.account);
  if (!account) return null;
  return (
    <ul className="mt-2 space-y-0.5 text-sm text-ink-2">
      <li>{tv.key.plan(capitalize(account.tier))}</li>
      <li>
        {tv.key.credits(formatCredits(account.creditsUsed), formatCredits(account.creditLimit))}
      </li>
      {account.resetsAt && <li>{tv.key.resets(formatLongDate(account.resetsAt))}</li>}
    </ul>
  );
}

type KeyStatus = 'idle' | 'testing' | 'ok' | 'okNoAccount' | 'error';

/** Stap 1: de ElevenLabs-sleutel (alleen in deze browser; nooit in een export). */
export function KeyCard() {
  const hasKey = useHasSecret(elevenLabsKeyStorage);
  const clearAccount = useVoiceStore((s) => s.clearAccount);
  const [value, setValue] = useState('');
  const [status, setStatus] = useState<KeyStatus>('idle');
  const [error, setError] = useState<VoiceApiError | null>(null);

  /** Test de sleutel; bewaart hem pas als hij werkt. */
  async function test(key: string): Promise<boolean> {
    setStatus('testing');
    setError(null);
    const api = createElevenLabsApi(key);
    try {
      await refreshAccount(api);
      setStatus('ok');
      return true;
    } catch (caught) {
      const first = toVoiceError(caught);
      if (first.kind === 'permission') {
        // Zonder leesrecht op het account kan de sleutel nog prima bellen.
        try {
          await api.findAgentId();
          setStatus('okNoAccount');
          return true;
        } catch (second) {
          setError(toVoiceError(second));
          setStatus('error');
          return false;
        }
      }
      setError(first);
      setStatus('error');
      return false;
    }
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    const key = value.trim();
    if (!key) return;
    if (await test(key)) {
      elevenLabsKeyStorage.set(key);
      setValue('');
    }
  }

  const stored = elevenLabsKeyStorage.get();

  return (
    <StepCard
      id="sleutel"
      icon={<KeyRound aria-hidden className="size-5 text-fig" />}
      title={tv.key.title}
      done={hasKey}
    >
      {hasKey && stored ? (
        <div>
          <p>
            {tv.key.stored}:{' '}
            <code className="rounded bg-paper-2 px-1.5 py-0.5">{maskApiKey(stored)}</code>
          </p>
          <AccountSummary />
          {status === 'okNoAccount' && (
            <p className="mt-2 text-sm text-ink-2">{tv.key.okNoAccount}</p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={<RefreshCw aria-hidden className="size-4" />}
              disabled={status === 'testing'}
              onClick={() => {
                void test(stored).then((ok) => ok && toast(tv.key.ok, 'ok'));
              }}
            >
              {status === 'testing' ? tv.key.testing : tv.key.retest}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              icon={<Trash2 aria-hidden className="size-4" />}
              onClick={() => {
                elevenLabsKeyStorage.clear();
                clearAccount();
                setStatus('idle');
                toast(tv.key.cleared, 'ok');
              }}
            >
              {tv.key.clear}
            </Button>
          </div>
        </div>
      ) : (
        <div>
          <h3 className="text-lg font-semibold">{tv.key.stepsTitle}</h3>
          <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-ink-2">
            {tv.key.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <a
            href={tv.key.keysUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="mt-2 inline-flex items-center gap-1.5 font-medium text-info underline"
          >
            {tv.key.openKeys}
            <ExternalLink aria-hidden className="size-4" />
          </a>
          <form onSubmit={(event) => void save(event)} className="mt-4 space-y-3">
            <TextField
              label={tv.key.label}
              hint={tv.key.hint}
              type="password"
              autoComplete="off"
              spellCheck={false}
              placeholder={tv.key.placeholder}
              value={value}
              onChange={(event) => setValue(event.target.value)}
            />
            <Button type="submit" disabled={!value.trim() || status === 'testing'}>
              {status === 'testing' ? tv.key.testing : tv.key.save}
            </Button>
          </form>
        </div>
      )}
      {error && <VoiceErrorNote error={error} />}
    </StepCard>
  );
}

/** Stap 2: de gespreksagent in het account van de gebruiker. */
export function AgentCard() {
  const hasKey = useHasSecret(elevenLabsKeyStorage);
  const agent = useVoiceStore((s) => s.agent);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<VoiceApiError | null>(null);
  const outdated = agent !== undefined && agent.configVersion !== VOICE.agentConfigVersion;
  const ready = agent !== undefined && !outdated;

  async function prepare() {
    const key = elevenLabsKeyStorage.get();
    if (!key) return;
    setWorking(true);
    setError(null);
    try {
      await ensureAgent(createElevenLabsApi(key));
      toast(tv.agent.done, 'ok');
    } catch (caught) {
      setError(toVoiceError(caught));
    } finally {
      setWorking(false);
    }
  }

  return (
    <StepCard
      id="agent"
      icon={<Wrench aria-hidden className="size-5 text-fig" />}
      title={tv.agent.title}
      done={ready}
    >
      <p className="text-ink-2">{tv.agent.body}</p>
      <p className="mt-2 font-medium">
        {!agent
          ? tv.agent.missing
          : outdated
            ? tv.agent.outdated
            : agent.minimal
              ? tv.agent.minimal
              : tv.agent.ready}
      </p>
      {(!ready || error) && (
        <Button className="mt-3" disabled={!hasKey || working} onClick={() => void prepare()}>
          {working ? tv.agent.working : agent ? tv.agent.update : tv.agent.action}
        </Button>
      )}
      {error && <VoiceErrorNote error={error} />}
    </StepCard>
  );
}

function PreviewPlayer({ preview, index }: { preview: VoicePreview; index: number }) {
  return (
    <audio
      controls
      preload="none"
      className="w-full"
      aria-label={tv.design.preview(index + 1)}
      src={`data:${preview.mediaType};base64,${preview.audioBase64}`}
    />
  );
}

type DesignPhase = 'idle' | 'designing' | 'choosing' | 'saving';

/** Stap 3: de stem van een denker, gekozen uit drie ontworpen voorbeelden. */
export function VoiceDesignCard({ meta, spec }: { meta: FigureMeta; spec: VoiceSpec }) {
  const hasKey = useHasSecret(elevenLabsKeyStorage);
  const voice = useVoiceStore((s) => s.voices[meta.id]);
  const [phase, setPhase] = useState<DesignPhase>('idle');
  const [previews, setPreviews] = useState<VoicePreview[]>([]);
  const [round, setRound] = useState(0);
  const [error, setError] = useState<VoiceApiError | null>(null);
  const name = meta.shortName ?? meta.name;

  async function design(nextRound: number) {
    const key = elevenLabsKeyStorage.get();
    if (!key) return;
    setPhase('designing');
    setError(null);
    try {
      const result = await designPreviews(createElevenLabsApi(key), meta, spec, nextRound);
      setPreviews(result);
      setRound(nextRound);
      setPhase('choosing');
    } catch (caught) {
      setError(toVoiceError(caught));
      setPhase(previews.length > 0 ? 'choosing' : 'idle');
    }
  }

  async function choose(preview: VoicePreview) {
    const key = elevenLabsKeyStorage.get();
    if (!key) return;
    setPhase('saving');
    setError(null);
    try {
      await saveVoice(createElevenLabsApi(key), meta, spec, preview, previews);
      setPreviews([]);
      setPhase('idle');
      toast(tv.design.saved(name), 'ok');
    } catch (caught) {
      setError(toVoiceError(caught));
      setPhase('choosing');
    }
  }

  return (
    <StepCard
      id="stem"
      icon={<AudioLines aria-hidden className="size-5 text-fig" />}
      title={tv.design.title(name)}
      done={Boolean(voice) && phase === 'idle'}
    >
      <p className="text-ink-2">{tv.design.body}</p>
      <details className="mt-2 text-sm text-ink-3">
        <summary className="cursor-pointer">{tv.design.description}</summary>
        <p className="mt-1" lang="en">
          {spec.design}
        </p>
      </details>

      {phase === 'idle' &&
        (voice ? (
          <div className="mt-3">
            <p className="font-medium">{tv.design.chosen}</p>
            <Button
              className="mt-2"
              variant="secondary"
              size="sm"
              disabled={!hasKey}
              onClick={() => void design(round + 1)}
            >
              {tv.design.redo}
            </Button>
            <p className="mt-1 text-xs text-ink-3">{tv.design.redoNote}</p>
          </div>
        ) : (
          <div className="mt-3">
            <Button disabled={!hasKey} onClick={() => void design(0)}>
              {tv.design.start(name)}
            </Button>
            <p className="mt-1 text-xs text-ink-3">{tv.design.costNote}</p>
          </div>
        ))}

      {phase === 'designing' && <Thinking className="mt-3" text={tv.design.working} />}
      {phase === 'saving' && <Thinking className="mt-3" text={tv.design.saving} />}

      {phase === 'choosing' && (
        <div className="mt-4 space-y-3">
          <ol className="space-y-3">
            {previews.map((preview, index) => (
              <li
                key={preview.generatedVoiceId}
                className="rounded-xl border border-line bg-paper p-3"
              >
                <p className="mb-2 font-medium">{tv.design.preview(index + 1)}</p>
                <PreviewPlayer preview={preview} index={index} />
                <Button
                  className="mt-2"
                  variant="figure"
                  size="sm"
                  onClick={() => void choose(preview)}
                >
                  {tv.design.choose}
                </Button>
              </li>
            ))}
          </ol>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={() => void design(round + 1)}>
              {tv.design.more}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setPreviews([]);
                setPhase('idle');
              }}
            >
              {tv.design.cancel}
            </Button>
          </div>
          <p className="text-xs text-ink-3">{tv.design.costNote}</p>
        </div>
      )}
      {error && <VoiceErrorNote error={error} />}
    </StepCard>
  );
}

/** Stap 4: het proefgesprek. */
export function TrialCard({ meta }: { meta: FigureMeta }) {
  const hasKey = useHasSecret(elevenLabsKeyStorage);
  const hasVoice = useVoiceStore((s) => Boolean(s.voices[meta.id]));
  // De agent zet de app bij het bellen zo nodig zelf klaar; sleutel en stem zijn genoeg.
  const ready = hasKey && hasVoice;
  const name = meta.shortName ?? meta.name;
  return (
    <StepCard
      id="proef"
      icon={<Phone aria-hidden className="size-5 text-fig" />}
      title={tv.trial.title}
    >
      <p className="text-ink-2">{tv.trial.body(name, VOICE.trialMinutes)}</p>
      <ul className="mt-3 space-y-1.5 text-sm text-ink-2">
        {tv.trial.tips.map((tip, index) => (
          <li key={tip} className="flex gap-2">
            {index === 0 ? (
              <Headphones aria-hidden className="mt-0.5 size-4 shrink-0 text-fig" />
            ) : (
              <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-fig" />
            )}
            {tip}
          </li>
        ))}
      </ul>
      <div className="mt-4">
        {ready ? (
          <ButtonLink
            to={`/bellen/${meta.id}`}
            variant="figure"
            size="lg"
            icon={<Phone aria-hidden className="size-5" />}
          >
            {tv.trial.call(name)}
          </ButtonLink>
        ) : (
          <>
            <Button
              variant="figure"
              size="lg"
              disabled
              icon={<Phone aria-hidden className="size-5" />}
            >
              {tv.trial.call(name)}
            </Button>
            <p className="mt-1 text-sm text-ink-3">{tv.trial.notReady}</p>
          </>
        )}
      </div>
    </StepCard>
  );
}

export function CostLine({ trial }: { trial: TrialCall }) {
  const currency = useVoiceStore((s) => s.account?.currency);
  if (!trial.cost) return null;
  const parts: string[] = [];
  if (trial.cost.credits !== undefined)
    parts.push(tv.call.costCredits(formatCredits(trial.cost.credits)));
  if (trial.cost.fiat !== undefined)
    parts.push(tv.call.costFiat(formatMoney(trial.cost.fiat, currency)));
  if (trial.cost.source === 'tegoed') parts.push(`(${tv.call.costFromBalance})`);
  return <span>{parts.join(' ')}</span>;
}

/** De laatste proefgesprekken, met transcript en kosten. */
export function TrialHistory() {
  const trials = useVoiceStore((s) => s.trials);
  const clearTrials = useVoiceStore((s) => s.clearTrials);
  return (
    <section aria-labelledby="geschiedenis">
      <h2 id="geschiedenis" className="mb-3 flex items-center gap-2 text-2xl">
        <History aria-hidden className="size-5 text-ink-3" />
        {tv.history.title}
      </h2>
      {trials.length === 0 ? (
        <p className="text-ink-3">{tv.history.empty}</p>
      ) : (
        <>
          <ul className="space-y-2">
            {trials.map((trial) => {
              const started = Date.parse(trial.startedAt);
              const duration = Date.parse(trial.endedAt) - started;
              return (
                <li key={trial.id}>
                  <Card padded={false} className="p-3.5">
                    <p className="font-medium">
                      {figureName(trial.figureId)} · {formatLongDate(started)},{' '}
                      {formatTime(started)}
                    </p>
                    <p className="text-sm text-ink-2">
                      {tv.call.duration(formatDuration(duration))} ·{' '}
                      {tv.endReasons[trial.endReason]} <CostLine trial={trial} />
                    </p>
                    {trial.transcript.length > 0 && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-sm font-medium">
                          {tv.history.transcript}
                        </summary>
                        <ol className="mt-2 space-y-1.5 text-sm">
                          {trial.transcript.map((line) => (
                            <li key={`${line.at}-${line.role}-${line.text.slice(0, 32)}`}>
                              <span className="font-semibold">
                                {line.role === 'user'
                                  ? tv.call.you
                                  : line.role === 'figure'
                                    ? figureName(trial.figureId)
                                    : tv.call.app}
                                :
                              </span>{' '}
                              {line.text}
                            </li>
                          ))}
                        </ol>
                      </details>
                    )}
                  </Card>
                </li>
              );
            })}
          </ul>
          <Button
            className="mt-3"
            variant="ghost"
            size="sm"
            icon={<Trash2 aria-hidden className="size-4" />}
            onClick={() => {
              clearTrials();
              toast(tv.history.cleared, 'ok');
            }}
          >
            {tv.history.clear}
          </Button>
        </>
      )}
    </section>
  );
}
