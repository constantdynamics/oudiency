/**
 * Onderdelen van de Podcasts-pagina: sleutels klaarzetten, de wachtrij, je afleveringen en de
 * instellingen (aflevering van de dag, opslag, de stem van Sophie).
 */
import {
  ChevronDown,
  ChevronUp,
  CircleCheck,
  CircleX,
  GripVertical,
  KeyRound,
  ListEnd,
  ListStart,
  Play,
  RefreshCw,
  Trash2,
  X,
} from 'lucide-react';
import { type PointerEvent, useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router';
import { Pill } from '@/components/Badges';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { ChoiceChips } from '@/components/Chips';
import { Toggle } from '@/components/Field';
import { Thinking } from '@/components/Thinking';
import { toast } from '@/components/toastStore';
import { PODCAST } from '@/config/podcast';
import { tp } from '@/i18n/podcast';
import { cx } from '@/lib/cx';
import { formatShortDate } from '@/lib/dates';
import { audioUsage, clearAudio } from '@/podcast/audioCache';
import { withPlayer } from '@/podcast/playerActions';
import { usePlayer } from '@/podcast/playerState';
import { isWriting, startWriting } from '@/podcast/writingState';
import { usePodcastStore } from '@/store/podcastStore';
import type { PodcastEpisode } from '@/store/schemas';
import { episodeFigures, formatBytes, listenState } from './format';
import { AvatarStack } from './playerParts';
import { usePodcastKeys } from './usePodcastKeys';

/* ---------- Sleutels ---------- */

function KeyLine({
  ok,
  label,
  use,
  to,
  linkLabel,
}: {
  ok: boolean;
  label: string;
  use: string;
  to: string;
  linkLabel: string;
}) {
  const Icon = ok ? CircleCheck : CircleX;
  return (
    <li className="flex gap-2">
      <Icon aria-hidden className={cx('mt-1 size-4 shrink-0', ok ? 'text-ok' : 'text-danger')} />
      <span>
        <strong className="font-semibold">{label}</strong>{' '}
        <span className="text-ink-2">({use})</span>: {ok ? tp.setup.done : tp.setup.missing}
        {!ok && (
          <>
            {' · '}
            <Link to={to} className="font-medium text-info underline underline-offset-2">
              {linkLabel}
            </Link>
          </>
        )}
      </span>
    </li>
  );
}

/** Ontbreekt er een sleutel, dan staat hier wat er nog moet gebeuren. */
export function SetupCard() {
  const keys = usePodcastKeys();
  const titleId = useId();
  if (keys.claude && keys.elevenLabs) return null;
  return (
    <Card as="section" aria-labelledby={titleId} className="mb-6 border-warn-soft bg-warn-soft/40">
      <h2 id={titleId} className="flex items-center gap-2 text-xl">
        <KeyRound aria-hidden className="size-5 text-warn" />
        {tp.setup.title}
      </h2>
      <p className="mt-1 text-ink-2">{tp.setup.intro}</p>
      <ul className="mt-3 space-y-1.5">
        <KeyLine
          ok={keys.claude}
          label={tp.setup.claude}
          use={tp.setup.claudeUse}
          to="/profiel"
          linkLabel={tp.setup.claudeLink}
        />
        <KeyLine
          ok={keys.elevenLabs}
          label={tp.setup.elevenLabs}
          use={tp.setup.elevenLabsUse}
          to="/profiel/stem"
          linkLabel={tp.setup.elevenLabsLink}
        />
      </ul>
    </Card>
  );
}

/* ---------- Wachtrij ---------- */

interface DragState {
  startY: number;
  dy: number;
  /** Hoogte van een rij plus de ruimte ertussen. */
  step: number;
}

function QueueRow({
  episode,
  index,
  total,
  playing,
  onMove,
}: {
  episode: PodcastEpisode;
  index: number;
  total: number;
  playing: boolean;
  onMove: (to: number, focus?: 'up' | 'down') => void;
}) {
  const [drag, setDrag] = useState<DragState | null>(null);

  // Slepen met muis of vinger aan het handvat; met het toetsenbord gaan de pijltjesknoppen.
  const onPointerDown = (event: PointerEvent<HTMLSpanElement>) => {
    if (event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    const row = event.currentTarget.closest('li');
    setDrag({
      startY: event.clientY,
      dy: 0,
      step: (row?.getBoundingClientRect().height || 64) + 8,
    });
  };
  const onPointerMove = (event: PointerEvent<HTMLSpanElement>) => {
    if (drag) setDrag({ ...drag, dy: event.clientY - drag.startY });
  };
  const onPointerUp = () => {
    if (!drag) return;
    const steps = Math.round(drag.dy / drag.step);
    setDrag(null);
    if (steps !== 0) onMove(Math.max(0, Math.min(total - 1, index + steps)));
  };

  return (
    <li
      style={drag ? { transform: `translateY(${drag.dy}px)` } : undefined}
      className={cx(
        'relative flex items-center gap-2 rounded-xl border border-line bg-card p-2 pr-1',
        drag && 'z-10 shadow-lift',
      )}
    >
      <span
        aria-hidden
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => setDrag(null)}
        className="flex h-11 w-6 shrink-0 cursor-grab touch-none items-center justify-center text-ink-3 active:cursor-grabbing"
      >
        <GripVertical className="size-5" />
      </span>
      <span className="hidden sm:block">
        <AvatarStack figures={episodeFigures(episode)} size={36} />
      </span>
      <div className="min-w-0 flex-1">
        <Link
          to={`/podcasts/${episode.id}`}
          className="line-clamp-2 font-medium leading-snug underline-offset-2 hover:underline"
        >
          {episode.title}
        </Link>
        <p className="truncate text-sm text-ink-3">
          {playing ? (
            <span className="font-medium text-gold">{tp.status.playing}</span>
          ) : (
            tp.formats[episode.format]
          )}{' '}
          · {tp.meta.minutes(episode.minutes)}
        </p>
      </div>
      <button
        type="button"
        id={`wachtrij-${episode.id}-up`}
        aria-label={tp.queue.up(episode.title)}
        title={tp.queue.up(episode.title)}
        disabled={index === 0}
        onClick={() => onMove(index - 1, 'up')}
        className="inline-flex size-10 shrink-0 items-center justify-center rounded-full text-ink-2 hover:bg-paper-2 disabled:opacity-30"
      >
        <ChevronUp aria-hidden className="size-5" />
      </button>
      <button
        type="button"
        id={`wachtrij-${episode.id}-down`}
        aria-label={tp.queue.down(episode.title)}
        title={tp.queue.down(episode.title)}
        disabled={index === total - 1}
        onClick={() => onMove(index + 1, 'down')}
        className="inline-flex size-10 shrink-0 items-center justify-center rounded-full text-ink-2 hover:bg-paper-2 disabled:opacity-30"
      >
        <ChevronDown aria-hidden className="size-5" />
      </button>
      <button
        type="button"
        aria-label={tp.queue.remove(episode.title)}
        title={tp.queue.remove(episode.title)}
        onClick={() => usePodcastStore.getState().dequeue(episode.id)}
        className="inline-flex size-10 shrink-0 items-center justify-center rounded-full text-ink-2 hover:bg-paper-2"
      >
        <X aria-hidden className="size-5" />
      </button>
    </li>
  );
}

export function QueueSection() {
  const queue = usePodcastStore((s) => s.queue);
  const episodes = usePodcastStore((s) => s.episodes);
  const autoplay = usePodcastStore((s) => s.settings.autoplay);
  const playingId = usePlayer((s) => s.episodeId);
  const [announcement, setAnnouncement] = useState('');
  const focusAfterMoveRef = useRef<{ id: string; direction: 'up' | 'down' } | null>(null);
  const items = queue
    .map((id) => episodes.find((e) => e.id === id))
    .filter((episode) => episode !== undefined);

  // Na verplaatsen met een knop blijft de focus op die knop (of de andere, aan de rand).
  useEffect(() => {
    const target = focusAfterMoveRef.current;
    if (!target) return;
    focusAfterMoveRef.current = null;
    const button = document.getElementById(`wachtrij-${target.id}-${target.direction}`);
    if (button instanceof HTMLButtonElement && !button.disabled) button.focus();
    else {
      const other = target.direction === 'up' ? 'down' : 'up';
      document.getElementById(`wachtrij-${target.id}-${other}`)?.focus();
    }
  }, [queue]);

  const move = (episode: PodcastEpisode, to: number, direction?: 'up' | 'down') => {
    usePodcastStore.getState().moveInQueue(episode.id, to);
    if (direction) focusAfterMoveRef.current = { id: episode.id, direction };
    setAnnouncement(tp.queue.moved(episode.title, to + 1, items.length));
  };

  return (
    <section aria-labelledby="wachtrij" className="mt-8">
      <h2 id="wachtrij" className="text-2xl sm:text-3xl">
        {tp.page.queue}
      </h2>
      <p className="mt-1 mb-3 text-ink-3">{tp.page.queueIntro}</p>
      {items.length > 0 ? (
        <ol aria-label={tp.queue.label} className="space-y-2">
          {items.map((episode, index) => (
            <QueueRow
              key={episode.id}
              episode={episode}
              index={index}
              total={items.length}
              playing={episode.id === playingId}
              onMove={(to, direction) => move(episode, to, direction)}
            />
          ))}
        </ol>
      ) : (
        <p className="text-ink-3">{tp.page.queueEmpty}</p>
      )}
      <p role="status" className="sr-only">
        {announcement}
      </p>
      <Toggle
        checked={autoplay}
        onChange={(value) => usePodcastStore.getState().updateSettings({ autoplay: value })}
        label={tp.page.autoplay}
        description={tp.page.autoplayHint}
      />
    </section>
  );
}

/* ---------- Afleveringen ---------- */

export function EpisodeStatus({ episode }: { episode: PodcastEpisode }) {
  if (episode.status === 'schrijven') {
    return isWriting(episode.id) ? (
      <Thinking text={tp.status.writing} className="text-sm" />
    ) : (
      <p className="text-sm text-warn">{tp.status.interrupted}</p>
    );
  }
  if (episode.status === 'fout') {
    return (
      <p className="text-sm text-danger">
        {tp.status.failed}
        {episode.error && <span className="text-ink-2">: {episode.error}</span>}
      </p>
    );
  }
  const listened = listenState(episode);
  return (
    <p className="text-sm text-ink-3">
      {listened.state === 'beluisterd'
        ? tp.status.finished
        : listened.state === 'bezig'
          ? tp.status.started(listened.percent)
          : tp.status.new}
    </p>
  );
}

export function EpisodeRow({
  episode,
  inQueue,
  onRemove,
}: {
  episode: PodcastEpisode;
  inQueue: boolean;
  onRemove: (episode: PodcastEpisode) => void;
}) {
  const ready = episode.status === 'klaar';
  const canRetry =
    episode.status === 'fout' || (episode.status === 'schrijven' && !isWriting(episode.id));
  const enqueue = (placement: 'hierna' | 'achteraan') => {
    usePodcastStore.getState().enqueue(episode.id, placement);
    toast(tp.actions.queued, 'ok');
  };

  return (
    <Card as="li" className="flex gap-3">
      <AvatarStack figures={episodeFigures(episode)} size={44} />
      <div className="min-w-0 flex-1">
        <Link
          to={`/podcasts/${episode.id}`}
          className="font-display text-lg leading-snug font-semibold underline-offset-2 hover:underline"
        >
          {episode.title}
        </Link>
        <p className="text-sm text-ink-3">
          {tp.formats[episode.format]} · {tp.meta.minutes(episode.minutes)} ·{' '}
          {formatShortDate(Date.parse(episode.createdAt))}
          {episode.source === 'dagelijks' && ` · ${tp.meta.daily}`}
        </p>
        <div className="mt-0.5 flex flex-wrap items-center gap-2">
          <EpisodeStatus episode={episode} />
          {inQueue && <Pill>{tp.status.inQueue}</Pill>}
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {ready && (
            <Button
              size="sm"
              icon={<Play aria-hidden className="size-4" />}
              aria-label={tp.actions.playTitle(episode.title)}
              onClick={() => withPlayer((p) => p.play(episode.id))}
            >
              {tp.actions.play}
            </Button>
          )}
          {ready && !inQueue && (
            <>
              <Button
                size="sm"
                variant="secondary"
                icon={<ListStart aria-hidden className="size-4" />}
                onClick={() => enqueue('hierna')}
              >
                {tp.actions.next}
              </Button>
              <Button
                size="sm"
                variant="secondary"
                icon={<ListEnd aria-hidden className="size-4" />}
                onClick={() => enqueue('achteraan')}
              >
                {tp.actions.last}
              </Button>
            </>
          )}
          {canRetry && (
            <Button
              size="sm"
              variant="secondary"
              icon={<RefreshCw aria-hidden className="size-4" />}
              onClick={() => startWriting(episode.id)}
            >
              {tp.actions.retry}
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            icon={<Trash2 aria-hidden className="size-4" />}
            aria-label={tp.actions.removeTitle(episode.title)}
            onClick={() => onRemove(episode)}
          >
            {tp.actions.remove}
          </Button>
        </div>
      </div>
    </Card>
  );
}

/* ---------- Instellingen ---------- */

export function DailyCard() {
  const settings = usePodcastStore((s) => s.settings);
  const update = usePodcastStore((s) => s.updateSettings);
  const titleId = useId();
  return (
    <Card as="section" aria-labelledby={titleId}>
      <h2 id={titleId} className="text-xl">
        {tp.daily.title}
      </h2>
      <Toggle
        checked={settings.dailyEnabled}
        onChange={(value) => update({ dailyEnabled: value })}
        label={tp.daily.toggle}
        description={tp.daily.hint}
      />
      {settings.dailyEnabled && (
        <ChoiceChips<string>
          className="mt-2"
          label={tp.daily.length}
          value={String(settings.dailyMinutes)}
          onChange={(value) => update({ dailyMinutes: Number(value) })}
          options={PODCAST.lengths.map((minutes) => ({
            value: String(minutes),
            label: tp.meta.minutes(minutes),
          }))}
        />
      )}
    </Card>
  );
}

export function StorageCard() {
  const titleId = useId();
  const episodeCount = usePodcastStore((s) => s.episodes.length);
  const [usage, setUsage] = useState<{ fragments: number; bytes: number } | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let active = true;
    void audioUsage().then((result) => {
      if (active) setUsage(result);
    });
    return () => {
      active = false;
    };
  }, [version, episodeCount]);

  const clear = async () => {
    await clearAudio();
    setVersion((n) => n + 1);
    toast(tp.storage.cleared, 'ok');
  };

  return (
    <Card as="section" aria-labelledby={titleId}>
      <h2 id={titleId} className="text-xl">
        {tp.storage.title}
      </h2>
      <p className="mt-1 text-ink-2">
        {usage && usage.fragments > 0
          ? tp.storage.usage(usage.fragments, formatBytes(usage.bytes))
          : tp.storage.empty}
      </p>
      {usage && usage.fragments > 0 && (
        <Button className="mt-3" variant="secondary" size="sm" onClick={() => void clear()}>
          {tp.storage.clear}
        </Button>
      )}
      <p className="mt-2 text-sm text-ink-3">{tp.storage.note}</p>
    </Card>
  );
}
