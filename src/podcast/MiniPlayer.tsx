/**
 * De miniplayer: op elke pagina (behalve Podcasts zelf) boven de navigatie, zolang er iets speelt
 * of klaarstaat in je wachtrij. Een tik op de titel opent de speler.
 */
import { Pause, Play, RotateCcw, RotateCw } from 'lucide-react';
import { useEffect } from 'react';
import { Link, useLocation } from 'react-router';
import { Avatar } from '@/components/Avatar';
import { findMeta } from '@/data/figures';
import { t } from '@/i18n/nl';
import { episodeProgress, speakerName } from './episodeInfo';
import { useCurrentEpisode } from './hooks';
import { withPlayer } from './playerActions';
import { usePlayer } from './playerState';

export function MiniPlayer() {
  const location = useLocation();
  const player = usePlayer();
  const current = useCurrentEpisode();
  // Op de Podcasts-pagina en bij de tekst van deze aflevering staat de grote speler al.
  const hidden =
    !current ||
    location.pathname === '/podcasts' ||
    location.pathname === `/podcasts/${current.id}`;

  // Pagina's houden ruimte vrij voor de miniplayer (zie --player-h in index.css).
  useEffect(() => {
    document.documentElement.style.setProperty('--player-h', hidden ? '0px' : '4rem');
    return () => document.documentElement.style.setProperty('--player-h', '0px');
  }, [hidden]);

  if (hidden || !current) return null;

  const active = player.episodeId === current.id;
  const playing = active && (player.status === 'speelt' || player.status === 'laden');
  const failed = active && player.status === 'fout';
  const segment = active ? player.segment : (current.position?.segment ?? 0);
  const progress = active
    ? episodeProgress(current, player.segment, player.seconds, player.duration)
    : episodeProgress(current, segment, 0, 0);
  const meta = findMeta(current.figureIds[0]);
  const speaker = active ? speakerName(current, segment) : undefined;
  const status = failed
    ? t.miniPlayer.error
    : active && player.status === 'laden'
      ? t.miniPlayer.loading
      : speaker
        ? t.miniPlayer.speaking(speaker)
        : t.miniPlayer.ready;

  return (
    <section
      aria-label={t.miniPlayer.region}
      className="fixed inset-x-0 bottom-[calc(4rem_+_env(safe-area-inset-bottom))] z-30 flex h-16 flex-col border-t border-line bg-paper/95 backdrop-blur md:bottom-0"
    >
      <div
        role="progressbar"
        aria-label={t.miniPlayer.progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress * 100)}
        className="h-1 shrink-0 bg-line"
      >
        <div className="h-full bg-gold" style={{ width: `${progress * 100}%` }} />
      </div>
      <div className="mx-auto flex w-full max-w-6xl flex-1 items-center gap-2 px-4 sm:gap-3 sm:px-6">
        <Link to="/podcasts" className="flex min-w-0 flex-1 items-center gap-3 rounded-xl py-1">
          {meta && <Avatar figure={meta} size={40} />}
          <span className="min-w-0">
            <span className="block truncate text-[0.95rem] font-medium">{current.title}</span>
            <span
              className={
                failed ? 'block truncate text-sm text-danger' : 'block truncate text-sm text-ink-2'
              }
            >
              {status}
            </span>
            <span className="sr-only">{t.miniPlayer.open}</span>
          </span>
        </Link>
        {/* Alleen een fout wordt voorgelezen; de rest zou het luisteren storen. */}
        <span role="status" className="sr-only">
          {failed ? t.miniPlayer.error : ''}
        </span>
        {active && (
          <button
            type="button"
            aria-label={t.miniPlayer.back}
            onClick={() => withPlayer((p) => p.skipBackward())}
            className="hidden size-11 shrink-0 items-center justify-center rounded-full text-ink-2 hover:bg-paper-2 sm:inline-flex"
          >
            <RotateCcw aria-hidden className="size-5" />
          </button>
        )}
        <button
          type="button"
          aria-label={playing ? t.miniPlayer.pause : t.miniPlayer.play}
          onClick={() => withPlayer((p) => (playing ? p.pause() : p.play(current.id)))}
          className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-ink text-paper hover:bg-ink-2"
        >
          {playing ? (
            <Pause aria-hidden className="size-5" />
          ) : (
            <Play aria-hidden className="size-5" />
          )}
        </button>
        {active && (
          <button
            type="button"
            aria-label={t.miniPlayer.forward}
            onClick={() => withPlayer((p) => p.skipForward())}
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-full text-ink-2 hover:bg-paper-2"
          >
            <RotateCw aria-hidden className="size-5" />
          </button>
        )}
      </div>
    </section>
  );
}
