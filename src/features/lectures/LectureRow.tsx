import { Clock, Heart } from 'lucide-react';
import { Link } from 'react-router';
import { Avatar } from '@/components/Avatar';
import { ExampleBadge, Pill } from '@/components/Badges';
import { findMeta, figureName } from '@/data/figures';
import { cx } from '@/lib/cx';
import type { LectureSummary } from './summary';

const SHARE_LABEL = {
  privé: undefined,
  ingediend: 'Ingediend',
  goedgekeurd: 'In de bibliotheek',
  afgekeurd: 'Afgekeurd',
} as const;

/** Compacte regel voor een college (in lijsten en op profielen). */
export function LectureRow({
  lecture,
  showFigure = true,
  className,
}: {
  lecture: LectureSummary;
  showFigure?: boolean;
  className?: string;
}) {
  const meta = findMeta(lecture.figureId);
  const shareLabel = lecture.share ? SHARE_LABEL[lecture.share] : undefined;
  return (
    <article
      className={cx(
        'relative flex gap-3 rounded-xl border border-line bg-card p-3 transition-colors hover:bg-paper-2/60',
        className,
      )}
    >
      {showFigure && meta && <Avatar figure={meta} size={40} />}
      <div className="min-w-0 flex-1">
        <h3 className="font-display text-lg leading-snug font-semibold">
          <Link
            to={`/colleges/${lecture.id}`}
            className="after:absolute after:inset-0 after:rounded-xl focus-visible:outline-none focus-visible:after:outline-3 focus-visible:after:outline-info"
          >
            {lecture.title}
          </Link>
        </h3>
        <p className="line-clamp-2 text-sm text-ink-2">{lecture.mainQuestion}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs text-ink-3">
          {showFigure && <span>{figureName(lecture.figureId)}</span>}
          <span className="inline-flex items-center gap-1">
            <Clock aria-hidden className="size-3.5" />
            {lecture.minutes} min
          </span>
          {lecture.isExample && <ExampleBadge />}
          {lecture.status === 'bezig' && <Pill tone="warn">Nog bezig</Pill>}
          {shareLabel && (
            <Pill tone={lecture.share === 'afgekeurd' ? 'danger' : 'ok'}>{shareLabel}</Pill>
          )}
          {lecture.liked && (
            <span className="inline-flex items-center gap-1 text-terracotta">
              <Heart aria-hidden className="size-3.5 fill-current" />
              <span className="sr-only">Je vindt dit college leuk</span>
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
