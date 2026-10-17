/**
 * De grote podcastspeler, op de Podcasts-pagina en bij de tekst van een aflevering.
 */
import {
  ChevronLeft,
  FileText,
  Moon,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  SkipBack,
  SkipForward,
} from 'lucide-react';
import { lazy, type ReactNode, Suspense, useId } from 'react';
import { Link } from 'react-router';
import { Avatar } from '@/components/Avatar';
import { AiLabel } from '@/components/Badges';
import { Card } from '@/components/Card';
import { PODCAST } from '@/config/podcast';
import type { FigureMeta } from '@/data/figures';
import { useNow } from '@/hooks/useNow';
import { tp } from '@/i18n/podcast';
import { cx } from '@/lib/cx';
import { episodeProgress, speakerName } from '@/podcast/episodeInfo';
import { withPlayer } from '@/podcast/playerActions';
import { usePlayer } from '@/podcast/playerState';
import { usePodcastStore } from '@/store/podcastStore';
import type { PodcastEpisode } from '@/store/schemas';
import { formatDuration } from '@/voice/format';
import { episodeFigures, formatSpeed } from './format';
import { QuestionPanel } from './QuestionPanel';

// Alleen bij een fout van ElevenLabs nodig: niet meeladen met de pagina.
const VoiceErrorNote = lazy(() =>
  import('@/features/voice/settingsParts').then((m) => ({ default: m.VoiceErrorNote })),
);

/** Eén of twee medaillons, de tweede half over de eerste. */
export function AvatarStack({ figures, size = 56 }: { figures: FigureMeta[]; size?: number }) {
  return (
    <span className="flex shrink-0" aria-hidden>
      {figures.slice(0, 2).map((meta, index) => (
        <Avatar
          key={meta.id}
          figure={meta}
          size={size}
          className={cx(index > 0 && '-ml-4 rounded-full ring-2 ring-card')}
        />
      ))}
    </span>
  );
}

function ControlButton({
  label,
  onClick,
  disabled,
  children,
  primary,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={cx(
        'inline-flex shrink-0 items-center justify-center rounded-full transition-colors disabled:opacity-40',
        primary
          ? 'size-16 bg-ink text-paper shadow-card hover:bg-ink-2'
          : 'size-12 text-ink-2 hover:bg-paper-2 hover:text-ink',
      )}
    >
      {children}
    </button>
  );
}

function SpeedControl() {
  const id = useId();
  const speed = usePodcastStore((s) => s.settings.speed);
  return (
    <label htmlFor={id} className="flex items-center gap-2 text-sm">
      <span className="font-medium">{tp.card.speed}</span>
      <select
        id={id}
        value={speed}
        onChange={(event) => {
          const rate = Number(event.target.value);
          withPlayer((p) => p.setSpeed(rate));
        }}
        className="min-h-9 rounded-full border border-line-strong bg-card px-3 text-sm"
      >
        {PODCAST.speeds.map((rate) => (
          <option key={rate} value={rate}>
            {formatSpeed(rate)}
          </option>
        ))}
      </select>
    </label>
  );
}

function SleepControl() {
  const id = useId();
  const sleep = usePlayer((s) => s.sleep);
  const now = useNow(sleep?.until ? 1000 : 60_000);
  const value = sleep?.endOfEpisode ? 'einde' : sleep?.until ? 'loopt' : 'uit';
  return (
    <label htmlFor={id} className="flex items-center gap-2 text-sm">
      <Moon aria-hidden className="size-4 text-ink-3" />
      <span className="font-medium">{tp.card.sleep}</span>
      <select
        id={id}
        value={value}
        onChange={(event) => {
          const choice = event.target.value;
          if (choice === 'loopt') return;
          withPlayer((p) =>
            p.setSleep(choice === 'uit' ? null : choice === 'einde' ? 'einde' : Number(choice)),
          );
        }}
        className="min-h-9 rounded-full border border-line-strong bg-card px-3 text-sm"
      >
        <option value="uit">{tp.card.sleepOff}</option>
        {sleep?.until && (
          <option value="loopt" disabled>
            {tp.card.sleepLeft(formatDuration(sleep.until - now))}
          </option>
        )}
        {PODCAST.sleepMinutes.map((minutes) => (
          <option key={minutes} value={minutes}>
            {tp.card.sleepMinutes(minutes)}
          </option>
        ))}
        <option value="einde">{tp.card.sleepEnd}</option>
      </select>
    </label>
  );
}

/** De speler met alle knoppen. Zonder `readAlong` geen link naar de tekst (die staat er al). */
export function PlayerCard({
  episode,
  readAlong = true,
  heading: Heading = 'h2',
}: {
  episode: PodcastEpisode;
  readAlong?: boolean;
  /** h1 op de pagina van de aflevering zelf. */
  heading?: 'h1' | 'h2';
}) {
  const player = usePlayer();
  const titleId = useId();
  const active = player.episodeId === episode.id;
  const status = active ? player.status : 'stil';
  const playing = status === 'speelt' || status === 'laden';
  const segment = active ? player.segment : (episode.position?.segment ?? 0);
  const total = episode.segments.length;
  const progress = active
    ? episodeProgress(episode, player.segment, player.seconds, player.duration)
    : episodeProgress(episode, segment, 0, 0);
  const speaker = speakerName(episode, segment);
  const error = active && status === 'fout' ? player.error : undefined;

  return (
    <Card as="section" aria-labelledby={titleId}>
      <div className="flex items-center gap-3">
        <AvatarStack figures={episodeFigures(episode)} size={48} />
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1">
          <p className="text-sm text-ink-3">
            {tp.formats[episode.format]} · {tp.meta.minutes(episode.minutes)}
          </p>
          <AiLabel />
        </div>
      </div>
      <Heading id={titleId} className="mt-3 text-2xl leading-tight sm:text-3xl">
        {episode.title}
      </Heading>
      <p className="mt-1 min-h-6 text-ink-2">
        {status === 'laden'
          ? tp.card.loading
          : status === 'speelt' && speaker
            ? tp.card.speaking(speaker)
            : status === 'pauze'
              ? tp.card.paused
              : tp.card.ready}
      </p>

      <div className="mt-4">
        <div
          role="progressbar"
          aria-label={tp.card.progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress * 100)}
          className="h-1.5 overflow-hidden rounded-full bg-line"
        >
          <div className="h-full bg-gold" style={{ width: `${progress * 100}%` }} />
        </div>
        <div className="mt-1.5 flex justify-between text-sm text-ink-3">
          <span>{total > 0 && tp.card.segment(Math.min(segment + 1, total), total)}</span>
          {active && player.duration > 0 && (
            <span>
              {tp.card.time(
                formatDuration(player.seconds * 1000),
                formatDuration(player.duration * 1000),
              )}
            </span>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-center gap-1 sm:gap-3">
        <ControlButton
          label={tp.card.previous}
          disabled={!active}
          onClick={() => withPlayer((p) => p.previousSegment())}
        >
          <SkipBack aria-hidden className="size-5" />
        </ControlButton>
        <ControlButton
          label={tp.card.back}
          disabled={!active}
          onClick={() => withPlayer((p) => p.skipBackward())}
        >
          <RotateCcw aria-hidden className="size-6" />
        </ControlButton>
        <ControlButton
          primary
          label={playing ? tp.card.pause : tp.card.play}
          onClick={() => withPlayer((p) => (playing ? p.pause() : p.play(episode.id)))}
        >
          {playing ? (
            <Pause aria-hidden className="size-7" />
          ) : (
            <Play aria-hidden className="size-7" />
          )}
        </ControlButton>
        <ControlButton
          label={tp.card.forward}
          disabled={!active}
          onClick={() => withPlayer((p) => p.skipForward())}
        >
          <RotateCw aria-hidden className="size-6" />
        </ControlButton>
        <ControlButton
          label={tp.card.next}
          disabled={!active}
          onClick={() => withPlayer((p) => p.nextSegment())}
        >
          <SkipForward aria-hidden className="size-5" />
        </ControlButton>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <SpeedControl />
          <SleepControl />
        </div>
        {readAlong && (
          <Link
            to={`/podcasts/${episode.id}`}
            className="inline-flex items-center gap-1.5 font-medium text-info underline underline-offset-2"
          >
            <FileText aria-hidden className="size-4" />
            {tp.card.readAlong}
          </Link>
        )}
      </div>
      {active && player.sleep?.endOfEpisode && (
        <p className="mt-2 text-sm text-ink-3">{tp.card.sleepAtEnd}</p>
      )}

      {error &&
        (error.voice ? (
          <Suspense fallback={<p role="alert">{error.message}</p>}>
            <VoiceErrorNote error={error.voice} />
          </Suspense>
        ) : (
          <p
            role="alert"
            className="mt-3 rounded-xl border border-danger-soft bg-danger-soft p-3 text-ink"
          >
            {error.message}{' '}
            <Link to="/profiel/stem" className="font-medium text-info underline">
              {tp.card.voiceSettings}
            </Link>
          </p>
        ))}
      {error?.voice && (
        <p className="mt-2 text-sm">
          <Link to="/profiel/stem" className="font-medium text-info underline">
            {tp.card.voiceSettings}
          </Link>
        </p>
      )}

      {episode.status === 'klaar' && <QuestionPanel episode={episode} />}
    </Card>
  );
}

export function BackToPodcasts() {
  return (
    <Link
      to="/podcasts"
      className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-ink-2 hover:text-ink"
    >
      <ChevronLeft aria-hidden className="size-4" />
      {tp.transcript.back}
    </Link>
  );
}
