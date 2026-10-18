/** De tekst van een aflevering, die meeloopt met wat je hoort (alleen op de pagina van de aflevering). */
import { Play } from 'lucide-react';
import { useEffect } from 'react';
import { Pill } from '@/components/Badges';
import { RichText } from '@/components/RichText';
import { tp } from '@/i18n/podcast';
import { cx } from '@/lib/cx';
import { stripTags } from '@/podcast/audioTags';
import { withPlayer } from '@/podcast/playerActions';
import type { PodcastEpisode } from '@/store/schemas';
import { speakerLabel } from './format';

const fragmentId = (segmentId: string) => `fragment-${segmentId}`;

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/** De tekst van de aflevering; het fragment dat je hoort is gemarkeerd en blijft in beeld. */
export function Transcript({ episode, current }: { episode: PodcastEpisode; current?: number }) {
  const currentId = current === undefined ? undefined : episode.segments[current]?.id;

  useEffect(() => {
    if (!currentId) return;
    const element = document.getElementById(fragmentId(currentId));
    if (!element || typeof element.scrollIntoView !== 'function') return;
    const rect = element.getBoundingClientRect();
    if (rect.top >= 96 && rect.bottom <= window.innerHeight - 160) return;
    element.scrollIntoView({
      block: 'center',
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    });
  }, [currentId]);

  return (
    <ol className="space-y-3">
      {episode.segments.map((segment, index) => {
        const name = speakerLabel(segment.speaker);
        const isCurrent = segment.id === currentId;
        const kind = tp.transcript.kinds[segment.kind];
        return (
          <li
            key={segment.id}
            id={fragmentId(segment.id)}
            aria-current={isCurrent ? 'true' : undefined}
            className={cx(
              'rounded-xl border p-3 sm:p-4',
              isCurrent ? 'border-gold bg-gold-soft/50' : 'border-line bg-card',
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="flex flex-wrap items-center gap-2 font-semibold">
                {name}
                {kind && <Pill tone="info">{kind}</Pill>}
                {isCurrent && <Pill tone="gold">{tp.transcript.now}</Pill>}
              </p>
              <button
                type="button"
                aria-label={tp.transcript.playFrom(name)}
                title={tp.transcript.playFrom(name)}
                onClick={() => withPlayer((p) => p.playFrom(episode.id, index))}
                className="inline-flex size-10 shrink-0 items-center justify-center rounded-full text-ink-2 hover:bg-paper-2 hover:text-ink"
              >
                <Play aria-hidden className="size-4" />
              </button>
            </div>
            <RichText text={stripTags(segment.text)} className="mt-1 text-ink-2" />
          </li>
        );
      })}
    </ol>
  );
}
