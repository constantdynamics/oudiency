import { Check, ExternalLink, Lock, ShieldCheck, ShieldOff, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';
import { Avatar } from '@/components/Avatar';
import { Pill } from '@/components/Badges';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { TextArea, TextField } from '@/components/Field';
import { PageHeader, SectionTitle } from '@/components/PageHeader';
import { toast } from '@/components/toastStore';
import { figureName, findMeta } from '@/data/figures';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { t } from '@/i18n/nl';
import { formatLongDate } from '@/lib/dates';
import {
  approveLecture,
  disableModerator,
  enableModerator,
  moderationQueue,
  pinProblem,
  rejectLecture,
  unlockModerator,
  useModeratorSession,
} from '@/services/moderation.service';
import { useLectureStore } from '@/store/lectureStore';
import type { Lecture } from '@/store/schemas';
import { useSettingsStore } from '@/store/settingsStore';

const VERDICT_TONE = { ok: 'ok', twijfel: 'warn', afwijzen: 'danger' } as const;

function PinSetup() {
  const [pin, setPin] = useState('');
  const [repeat, setRepeat] = useState('');
  const [error, setError] = useState<string>();
  const submit = async () => {
    const problem = pinProblem(pin) ?? (pin !== repeat ? t.moderation.pinMismatch : undefined);
    if (problem) {
      setError(problem);
      return;
    }
    await enableModerator(pin);
  };
  return (
    <Card as="section" aria-labelledby="pin-instellen" className="max-w-md">
      <h2 id="pin-instellen" className="flex items-center gap-2 text-2xl">
        <ShieldCheck aria-hidden className="size-5 text-fig" />
        {t.moderation.setupTitle}
      </h2>
      <p className="mt-1 text-ink-2">{t.moderation.setupBody}</p>
      <form
        className="mt-4 space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        <TextField
          label={t.moderation.pinLabel}
          type="password"
          inputMode="numeric"
          autoComplete="new-password"
          maxLength={8}
          value={pin}
          onChange={(event) => {
            setPin(event.target.value);
            setError(undefined);
          }}
        />
        <TextField
          label={t.moderation.pinRepeat}
          type="password"
          inputMode="numeric"
          autoComplete="new-password"
          maxLength={8}
          value={repeat}
          onChange={(event) => {
            setRepeat(event.target.value);
            setError(undefined);
          }}
        />
        {error && (
          <p role="alert" className="text-danger">
            {error}
          </p>
        )}
        <Button type="submit" disabled={!pin || !repeat}>
          {t.moderation.enable}
        </Button>
      </form>
    </Card>
  );
}

function PinUnlock() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const submit = async () => {
    const ok = await unlockModerator(pin);
    setError(!ok);
    if (!ok) setPin('');
  };
  return (
    <Card as="section" aria-labelledby="ontgrendelen" className="max-w-md">
      <h2 id="ontgrendelen" className="flex items-center gap-2 text-2xl">
        <Lock aria-hidden className="size-5 text-fig" />
        {t.moderation.unlockTitle}
      </h2>
      <form
        className="mt-4 space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        <TextField
          label={t.moderation.pinLabel}
          type="password"
          inputMode="numeric"
          autoComplete="current-password"
          maxLength={8}
          value={pin}
          onChange={(event) => {
            setPin(event.target.value);
            setError(false);
          }}
        />
        {error && (
          <p role="alert" className="text-danger">
            {t.moderation.wrongPin}
          </p>
        )}
        <Button type="submit" disabled={!pin}>
          {t.moderation.unlock}
        </Button>
      </form>
    </Card>
  );
}

function QueueItem({ lecture }: { lecture: Lecture }) {
  const meta = findMeta(lecture.figureId);
  const [reason, setReason] = useState('');
  const [rejecting, setRejecting] = useState(false);
  const [error, setError] = useState(false);
  const precheck = lecture.precheck;
  const title = lecture.plan?.title ?? lecture.topic;

  const reject = () => {
    if (!reason.trim()) {
      setError(true);
      return;
    }
    if (rejectLecture(lecture.id, reason)) toast(t.moderation.rejected, 'ok');
  };

  return (
    <Card as="article" aria-labelledby={`wachtrij-${lecture.id}`}>
      <div className="flex items-start gap-3">
        {meta && <Avatar figure={meta} size={44} />}
        <div className="min-w-0 flex-1">
          <h3 id={`wachtrij-${lecture.id}`} className="font-display text-xl font-semibold">
            {title}
          </h3>
          <p className="text-sm text-ink-3">
            {figureName(lecture.figureId)} ·{' '}
            {t.moderation.submittedOn(
              formatLongDate(Date.parse(lecture.submittedAt ?? lecture.createdAt)),
            )}
          </p>
          <p className="mt-1 text-ink-2">{lecture.mainQuestion}</p>
        </div>
      </div>

      <section aria-label={t.moderation.precheck} className="mt-4 rounded-xl bg-paper-2 p-3">
        <p className="text-sm font-semibold">{t.moderation.precheck}</p>
        {precheck ? (
          <>
            <p className="mt-1 flex flex-wrap items-center gap-2">
              <Pill tone={VERDICT_TONE[precheck.verdict]}>
                {t.moderation.verdict[precheck.verdict]}
              </Pill>
              <span className="text-xs text-ink-3">{t.moderation.source[precheck.source]}</span>
            </p>
            {precheck.reasons.length > 0 && (
              <ul className="mt-2 list-disc space-y-0.5 pl-5 text-sm text-ink-2">
                {precheck.reasons.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            )}
          </>
        ) : (
          <p className="mt-1 text-sm text-ink-3 italic">{t.moderation.precheckPending}</p>
        )}
      </section>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Link
          to={`/colleges/${lecture.id}`}
          className="inline-flex items-center gap-1.5 text-sm text-fig underline underline-offset-2"
        >
          <ExternalLink aria-hidden className="size-4" />
          {t.moderation.open}
        </Link>
        <div className="ml-auto flex flex-wrap gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={<X aria-hidden className="size-4" />}
            onClick={() => setRejecting(true)}
          >
            {t.moderation.reject}
          </Button>
          <Button
            size="sm"
            icon={<Check aria-hidden className="size-4" />}
            onClick={() => {
              if (approveLecture(lecture.id)) toast(t.moderation.approved, 'ok');
            }}
          >
            {t.moderation.approve}
          </Button>
        </div>
      </div>

      {rejecting && (
        <form
          className="mt-3 space-y-2"
          onSubmit={(event) => {
            event.preventDefault();
            reject();
          }}
        >
          <TextArea
            label={t.moderation.reason}
            placeholder={t.moderation.reasonPlaceholder}
            maxLength={300}
            rows={2}
            value={reason}
            onChange={(event) => {
              setReason(event.target.value);
              setError(false);
            }}
          />
          {error && (
            <p role="alert" className="text-sm text-danger">
              {t.moderation.reasonRequired}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setRejecting(false)}>
              {t.app.cancel}
            </Button>
            <Button type="submit" variant="danger" size="sm">
              {t.moderation.reject}
            </Button>
          </div>
        </form>
      )}
    </Card>
  );
}

/** Moderatormodus: pincode instellen of ontgrendelen, dan de wachtrij met advies. */
export function ModerationPage() {
  useDocumentTitle(t.moderation.title);
  const enabled = useSettingsStore((s) => s.settings.moderatorMode);
  const unlocked = useModeratorSession((s) => s.unlocked);
  const lectures = useLectureStore((s) => s.lectures);
  const queue = moderationQueue(lectures);
  const shared = lectures.filter((l) => l.share === 'goedgekeurd').length;

  return (
    <>
      <PageHeader title={t.moderation.title} intro={t.moderation.intro} />
      {!enabled ? (
        <PinSetup />
      ) : !unlocked ? (
        <PinUnlock />
      ) : (
        <div className="space-y-6">
          <section aria-labelledby="wachtrij" className="space-y-4">
            <SectionTitle id="wachtrij">{t.moderation.queue}</SectionTitle>
            {queue.length > 0 ? (
              queue.map((lecture) => <QueueItem key={lecture.id} lecture={lecture} />)
            ) : (
              <EmptyState
                icon={<ShieldCheck aria-hidden className="size-8" />}
                title={t.moderation.empty}
              />
            )}
          </section>
          <p className="text-sm text-ink-3">{t.moderation.inLibrary(shared)}</p>
          <Button
            variant="ghost"
            size="sm"
            icon={<ShieldOff aria-hidden className="size-4" />}
            onClick={() => {
              disableModerator();
              toast(t.moderation.disabled, 'ok');
            }}
          >
            {t.moderation.disable}
          </Button>
        </div>
      )}
    </>
  );
}
