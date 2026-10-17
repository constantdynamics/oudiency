import { Plus, Podcast } from 'lucide-react';
import { useState } from 'react';
import { AiLabel } from '@/components/Badges';
import { Button, ButtonLink } from '@/components/Button';
import { Dialog } from '@/components/Dialog';
import { EmptyState } from '@/components/EmptyState';
import { PageHeader } from '@/components/PageHeader';
import { toast } from '@/components/toastStore';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { tp } from '@/i18n/podcast';
import { useCurrentEpisode } from '@/podcast/hooks';
import { usePodcastStore } from '@/store/podcastStore';
import type { PodcastEpisode } from '@/store/schemas';
import {
  DailyCard,
  EpisodeRow,
  HostVoiceCard,
  QueueSection,
  SetupCard,
  StorageCard,
} from './libraryParts';
import { PlayerCard } from './playerParts';
import { usePodcastKeys } from './usePodcastKeys';

/** Podcasts: de speler, je wachtrij, je afleveringen en de instellingen. */
export function PodcastsPage() {
  useDocumentTitle(tp.page.title);
  const episodes = usePodcastStore((s) => s.episodes);
  const queue = usePodcastStore((s) => s.queue);
  const current = useCurrentEpisode();
  const keys = usePodcastKeys();
  const [removing, setRemoving] = useState<PodcastEpisode | null>(null);
  const newestFirst = [...episodes].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const queued = new Set(queue);

  const remove = () => {
    if (!removing) return;
    const id = removing.id;
    setRemoving(null);
    void import('@/podcast/player')
      .then((player) => player.deleteEpisode(id))
      .then(() => toast(tp.actions.removed, 'ok'));
  };

  return (
    <>
      <PageHeader
        title={tp.page.title}
        intro={tp.page.intro}
        actions={
          <>
            <AiLabel className="self-center" />
            <ButtonLink to="/podcasts/nieuw" icon={<Plus aria-hidden className="size-4" />}>
              {tp.page.newEpisode}
            </ButtonLink>
          </>
        }
      />
      <SetupCard />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0">
          {current && <PlayerCard episode={current} />}
          <QueueSection />
          <section aria-labelledby="afleveringen" className="mt-10">
            <h2 id="afleveringen" className="mb-3 text-2xl sm:text-3xl">
              {tp.page.library}
            </h2>
            {newestFirst.length > 0 ? (
              <ul className="space-y-3">
                {newestFirst.map((episode) => (
                  <EpisodeRow
                    key={episode.id}
                    episode={episode}
                    inQueue={queued.has(episode.id)}
                    onRemove={setRemoving}
                  />
                ))}
              </ul>
            ) : (
              <EmptyState
                icon={<Podcast aria-hidden className="size-8" />}
                title={tp.page.libraryEmptyTitle}
                action={<ButtonLink to="/podcasts/nieuw">{tp.page.newEpisode}</ButtonLink>}
              >
                {tp.page.libraryEmpty}
              </EmptyState>
            )}
          </section>
        </div>
        <aside aria-label={tp.page.settings} className="min-w-0 space-y-6">
          <DailyCard />
          <StorageCard />
          {keys.elevenLabs && <HostVoiceCard />}
        </aside>
      </div>
      <Dialog
        open={removing !== null}
        onClose={() => setRemoving(null)}
        title={tp.actions.confirmRemove}
        description={tp.actions.confirmRemoveBody}
        footer={
          <>
            <Button variant="ghost" onClick={() => setRemoving(null)}>
              {tp.actions.cancel}
            </Button>
            <Button variant="danger" onClick={remove}>
              {tp.actions.remove}
            </Button>
          </>
        }
      >
        <p className="font-medium">{removing?.title}</p>
      </Dialog>
    </>
  );
}
