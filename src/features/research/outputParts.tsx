/**
 * Wat er van een onderzoek gemaakt is: een essay (hier te lezen), een podcast (in je wachtrij) of
 * een gesprek (bellen wanneer je wilt). Per vorm een kaart met de stand van zaken.
 */
import { BookOpenText, Headphones, Phone, Podcast } from 'lucide-react';
import { type ReactNode, useId } from 'react';
import { useNavigate } from 'react-router';
import { AiLabel } from '@/components/Badges';
import { Button, ButtonLink } from '@/components/Button';
import { Card } from '@/components/Card';
import { RESEARCH } from '@/config/research';
import { findMeta } from '@/data/figures';
import type { Figure } from '@/data/types';
import { formatName } from '@/features/podcasts/format';
import { usePodcastKeys } from '@/features/podcasts/usePodcastKeys';
import { tp } from '@/i18n/podcast';
import { tr } from '@/i18n/research';
import { withPlayer } from '@/podcast/playerActions';
import { startOutput } from '@/research/researchState';
import { useLectureStore } from '@/store/lectureStore';
import { usePodcastStore } from '@/store/podcastStore';
import type { Research, ResearchOutput } from '@/store/researchSchemas';
import { figureNames, outputPhaseOf } from './format';
import { EssayCard, FigureRow, WorkState } from './researchParts';

function OutputCard({
  icon,
  label,
  title,
  figureIds,
  children,
}: {
  icon: ReactNode;
  label: string;
  title: string;
  figureIds: readonly string[];
  children: ReactNode;
}) {
  const titleId = useId();
  return (
    <Card as="article" aria-labelledby={titleId}>
      <header>
        <div className="flex items-center justify-between gap-3">
          <FigureRow ids={figureIds} size={36} />
          <AiLabel />
        </div>
        <p className="mt-3 flex items-center gap-1.5 text-sm text-ink-3">
          {icon}
          {label}
        </p>
        <h3 id={titleId} className="mt-1 font-display text-2xl font-semibold">
          {title}
        </h3>
      </header>
      <div className="mt-3">{children}</div>
    </Card>
  );
}

function PodcastOutput({ research, output }: { research: Research; output: ResearchOutput }) {
  const navigate = useNavigate();
  const keys = usePodcastKeys();
  const episode = usePodcastStore((s) => s.episodes.find((e) => e.id === output.refId));
  const phase = outputPhaseOf(research, output);
  const format = formatName({
    format: output.podcastFormat ?? 'gesprek',
    figureIds: output.figureIds,
  });
  return (
    <OutputCard
      icon={<Podcast aria-hidden className="size-4" />}
      label={`${tr.forms.podcast} · ${format} · ${tp.meta.minutes(output.minutes ?? 10)}`}
      title={episode?.title ?? output.title ?? research.title ?? research.question}
      figureIds={output.figureIds}
    >
      {phase !== 'klaar' ? (
        <WorkState
          phase={phase}
          busyText={tr.page.podcastWriting}
          error={output.error}
          onRetry={() => startOutput(research.id, output.id)}
        />
      ) : episode ? (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            <Button
              icon={<Headphones aria-hidden className="size-4" />}
              disabled={!keys.elevenLabs}
              onClick={() => {
                withPlayer((player) => player.play(episode.id));
                navigate(`/podcasts/${episode.id}`);
              }}
            >
              {tr.page.listen}
            </Button>
            <ButtonLink variant="ghost" to={`/podcasts/${episode.id}`}>
              {tr.page.toEpisode}
            </ButtonLink>
          </div>
          {!keys.elevenLabs && <p className="text-sm text-ink-3">{tr.page.listenNeedsKey}</p>}
        </div>
      ) : (
        <p className="text-ink-2">{tr.page.episodeGone}</p>
      )}
    </OutputCard>
  );
}

function LectureOutput({ research, output }: { research: Research; output: ResearchOutput }) {
  const lecture = useLectureStore((s) => s.lectures.find((l) => l.id === output.refId));
  const phase = outputPhaseOf(research, output);
  const [hostId, ...guestIds] = output.figureIds;
  const host = findMeta(hostId);
  return (
    <OutputCard
      icon={<BookOpenText aria-hidden className="size-4" />}
      label={
        guestIds.length > 0
          ? `${tr.forms.college} · ${tr.page.lectureWithGuests(host?.name ?? '', figureNames(guestIds), guestIds.length)}`
          : `${tr.forms.college} · ${host?.name ?? ''}`
      }
      title={lecture?.plan?.title ?? output.title ?? research.title ?? research.question}
      figureIds={output.figureIds}
    >
      {phase !== 'klaar' ? (
        <WorkState
          phase={phase}
          busyText={tr.page.lecturePreparing}
          error={output.error}
          onRetry={() => startOutput(research.id, output.id)}
        />
      ) : lecture ? (
        <div className="space-y-2">
          <p className="text-ink-2">
            {lecture.status === 'afgerond' ? tr.page.lectureDone : tr.page.lectureHint}
          </p>
          <ButtonLink
            to={`/colleges/${lecture.id}`}
            icon={<BookOpenText aria-hidden className="size-4" />}
          >
            {lecture.segments.length > 0 ? tr.page.lectureContinue : tr.page.lectureStart}
          </ButtonLink>
        </div>
      ) : (
        <p className="text-ink-2">{tr.page.lectureGone}</p>
      )}
    </OutputCard>
  );
}

function CallOutput({ research, output }: { research: Research; output: ResearchOutput }) {
  const keys = usePodcastKeys();
  const figureId = output.figureIds[0] ?? '';
  const meta = findMeta(figureId);
  const name = meta?.shortName ?? meta?.name ?? figureId;
  return (
    <OutputCard
      icon={<Phone aria-hidden className="size-4" />}
      label={`${tr.forms.bellen} · ${tp.meta.minutes(RESEARCH.callMinutes)}`}
      title={tr.page.callTitle(meta?.name ?? figureId)}
      figureIds={output.figureIds}
    >
      <p className="text-ink-2">{tr.page.callHint}</p>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        {keys.elevenLabs ? (
          <ButtonLink
            to={`/onderzoek/${research.id}/bellen/${figureId}`}
            icon={<Phone aria-hidden className="size-4" />}
          >
            {tr.page.call(name)}
          </ButtonLink>
        ) : (
          <p className="text-sm text-ink-3">{tr.call.needsKey}</p>
        )}
      </div>
    </OutputCard>
  );
}

/** Eén vorm uit een onderzoek, in de stand waarin hij is. */
export function OutputView({
  research,
  output,
  figures,
}: {
  research: Research;
  output: ResearchOutput;
  figures: readonly Figure[];
}) {
  if (output.form === 'podcast') return <PodcastOutput research={research} output={output} />;
  if (output.form === 'bellen') return <CallOutput research={research} output={output} />;
  if (output.form === 'college') return <LectureOutput research={research} output={output} />;
  if (output.form !== 'tekst') return null;
  const phase = outputPhaseOf(research, output);
  const figure = figures.find((f) => f.id === output.figureIds[0]);
  if (phase === 'klaar') {
    return output.text && figure ? <EssayCard output={output} figure={figure} /> : null;
  }
  return (
    <Card>
      <WorkState
        phase={phase}
        busyText={tr.page.writing(figureNames(output.figureIds))}
        error={output.error}
        onRetry={() => startOutput(research.id, output.id)}
      />
    </Card>
  );
}
