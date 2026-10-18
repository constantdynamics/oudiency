import { ArrowLeft, BookOpen, KeyRound, RotateCcw } from 'lucide-react';
import { useId } from 'react';
import { Link } from 'react-router';
import { Avatar } from '@/components/Avatar';
import { AiLabel, Pill } from '@/components/Badges';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { RichText } from '@/components/RichText';
import { ThemeFrame } from '@/components/ThemeFrame';
import { Thinking } from '@/components/Thinking';
import { findMeta } from '@/data/figures';
import type { Figure } from '@/data/types';
import { tr } from '@/i18n/research';
import { furtherReadingWorks } from '@/services/lecture.service';
import type { ResearchOutput } from '@/store/researchSchemas';
import type { ResearchPhase } from './format';

function BackLink({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      className="mb-4 inline-flex items-center gap-1.5 rounded-md text-ink-2 hover:text-ink focus-visible:outline-3 focus-visible:outline-info"
    >
      <ArrowLeft aria-hidden className="size-4" />
      {label}
    </Link>
  );
}

export function BackToResearch() {
  return <BackLink to="/onderzoek" label={tr.page.back} />;
}

export function BackToDiscover() {
  return <BackLink to="/" label={tr.library.back} />;
}

/** Zonder eigen Claude-sleutel kan er niets worden uitgezocht. */
export function KeyNotice() {
  const titleId = useId();
  return (
    <Card as="section" aria-labelledby={titleId} className="mb-6 border-warn-soft bg-warn-soft/40">
      <h2 id={titleId} className="flex items-center gap-2 text-xl">
        <KeyRound aria-hidden className="size-5 text-warn" />
        {tr.problems.sleutel}
      </h2>
      <p className="mt-2">
        <Link to="/profiel" className="text-fig underline underline-offset-2">
          Profiel → Instellingen
        </Link>
      </p>
    </Card>
  );
}

/** De denkers van een onderzoek als rij medaillons. */
export function FigureRow({ ids, size = 32 }: { ids: readonly string[]; size?: number }) {
  return (
    <span className="flex -space-x-2">
      {ids.map((id) => {
        const meta = findMeta(id);
        return meta ? (
          <span key={id} className="rounded-full ring-2 ring-card">
            <Avatar figure={meta} size={size} />
          </span>
        ) : null;
      })}
    </span>
  );
}

export function StatusPill({ phase }: { phase: ResearchPhase }) {
  if (phase === 'klaar') return null;
  return (
    <Pill tone={phase === 'zoeken' ? 'gold' : 'neutral'}>
      {phase === 'zoeken'
        ? tr.library.status.zoeken
        : phase === 'onderbroken'
          ? tr.library.status.onderbroken
          : tr.library.status.fout}
    </Pill>
  );
}

/** Een essay: titel, de denker, het AI-label, de tekst en leestips uit het eigen werk. */
export function EssayCard({ output, figure }: { output: ResearchOutput; figure: Figure }) {
  const titleId = useId();
  const readingId = useId();
  const works = furtherReadingWorks(figure, output.furtherReading ?? []);
  return (
    <ThemeFrame
      figure={figure}
      className="rounded-3xl border border-line bg-card p-5 shadow-card sm:p-7"
    >
      <article aria-labelledby={titleId}>
        <header>
          <div className="flex items-center gap-3">
            <Avatar figure={figure} size={44} />
            <p className="min-w-0 flex-1 text-sm text-ink-3">{tr.page.essayBy(figure.name)}</p>
            <AiLabel />
          </div>
          <h3
            id={titleId}
            className="mt-3 font-display text-2xl font-semibold text-fig sm:text-3xl"
          >
            {output.title}
          </h3>
        </header>
        <RichText text={output.text ?? ''} className="mt-5 text-lg leading-relaxed" />
        {works.length > 0 && (
          <section aria-labelledby={readingId} className="mt-6 border-t border-line pt-4">
            <h4 id={readingId} className="flex items-center gap-2 text-xl">
              <BookOpen aria-hidden className="size-5 text-fig" />
              {tr.page.furtherReading}
            </h4>
            <ul className="mt-2 space-y-1.5">
              {works.map((work) => (
                <li key={work.title}>
                  <span className="font-semibold">{work.title}</span>
                  {work.year && <span className="text-ink-3"> ({work.year})</span>}
                  {work.note && <p className="text-sm text-ink-2">{work.note}</p>}
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>
    </ThemeFrame>
  );
}

/** Bezig, onderbroken of mislukt (met opnieuw proberen). */
export function WorkState({
  phase,
  busyText,
  error,
  onRetry,
}: {
  phase: 'maken' | 'onderbroken' | 'fout';
  busyText: string;
  error?: string;
  onRetry?: () => void;
}) {
  if (phase === 'maken') return <Thinking text={busyText} />;
  return (
    <div className="space-y-2">
      <p role="alert" className="text-danger">
        {phase === 'onderbroken' ? tr.page.outputInterrupted : (error ?? tr.page.outputFailed)}
      </p>
      {onRetry && (
        <Button
          variant="secondary"
          size="sm"
          icon={<RotateCcw aria-hidden className="size-4" />}
          onClick={onRetry}
        >
          {tr.page.retry}
        </Button>
      )}
    </div>
  );
}
