import { useParams } from 'react-router';
import { AiLabel } from '@/components/Badges';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { tp } from '@/i18n/podcast';
import { usePlayer } from '@/podcast/playerState';
import { usePodcastStore } from '@/store/podcastStore';
import { formatName } from './format';
import { EpisodeStatus } from './libraryParts';
import { BackToPodcasts, PlayerCard } from './playerParts';
import { Transcript } from './Transcript';

/** Eén aflevering: de speler en de tekst, die meeloopt met wat je hoort. */
export function EpisodePage() {
  const { id } = useParams();
  const episode = usePodcastStore((s) => s.episodes.find((e) => e.id === id));
  const current = usePlayer((s) => (s.episodeId === id ? s.segment : undefined));
  useDocumentTitle(episode?.title ?? tp.page.title);

  if (!episode) {
    return (
      <div className="mx-auto max-w-3xl">
        <BackToPodcasts />
        <EmptyState title={tp.transcript.notFound} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <BackToPodcasts />
      {episode.status === 'klaar' ? (
        <PlayerCard episode={episode} readAlong={false} heading="h1" />
      ) : (
        <Card>
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-3xl">{episode.title}</h1>
            <AiLabel />
          </div>
          <p className="mt-1 text-ink-3">{formatName(episode)}</p>
          <div className="mt-2">
            <EpisodeStatus episode={episode} />
          </div>
        </Card>
      )}
      <section aria-labelledby="tekst" className="mt-8">
        <h2 id="tekst" className="text-2xl sm:text-3xl">
          {tp.transcript.title}
        </h2>
        <p className="mt-1 mb-4 text-ink-3">{tp.transcript.intro}</p>
        {episode.segments.length > 0 ? (
          <Transcript episode={episode} current={current} />
        ) : (
          <p className="text-ink-3">{tp.transcript.writing}</p>
        )}
      </section>
    </div>
  );
}
