import { BookOpen, Heart, MessageCircleQuestion, Send } from 'lucide-react';
import { type ReactNode, useEffect, useRef } from 'react';
import { Avatar, type AvatarState } from '@/components/Avatar';
import { AiLabel, DemoBadge, ExampleBadge, Pill } from '@/components/Badges';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { RichText } from '@/components/RichText';
import type { FigureMeta } from '@/data/figures';
import type { KeyWork } from '@/data/types';
import { t } from '@/i18n/nl';
import { cx } from '@/lib/cx';
import { joinDutch } from '@/lib/text';
import type { Chapter } from '@/services/lecture.service';
import { useLibraryStore } from '@/store/miscStores';
import type { LectureSegment } from '@/store/schemas';
import { chapterId } from './chapters';

/** De collegezaal: docent, titel, hoofdvraag en de labels (AI-simulatie, Voorbeeld, Demomodus). */
export function LectureHall({
  meta,
  title,
  mainQuestion,
  eyebrow,
  state = 'idle',
  isExample = false,
  demo = false,
  guests = [],
  children,
}: {
  meta: FigureMeta;
  title: string;
  mainQuestion: string;
  eyebrow: string;
  state?: AvatarState;
  isExample?: boolean;
  demo?: boolean;
  /** Gastdocenten (een college uit een onderzoek). */
  guests?: readonly FigureMeta[];
  children?: ReactNode;
}) {
  return (
    <header
      className="rounded-3xl border border-line bg-fig-surface p-5 shadow-card motif-bg sm:p-7"
      data-motif={meta.theme.motif}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <Avatar figure={meta} size={88} state={state} decorative={false} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium tracking-wide text-fig uppercase">{eyebrow}</p>
          <h1 className="mt-1 font-fig text-3xl leading-tight text-fig sm:text-4xl">{title}</h1>
          <p className="mt-3 max-w-[60ch] text-lg text-ink-2">
            <span className="font-semibold text-ink">{t.lectures.mainQuestion}: </span>
            {mainQuestion}
          </p>
          {guests.length > 0 && (
            <p className="mt-3 flex flex-wrap items-center gap-2 text-ink-2">
              <span className="flex -space-x-2">
                {guests.map((guest) => (
                  <span key={guest.id} className="rounded-full ring-2 ring-fig-surface">
                    <Avatar figure={guest} size={32} />
                  </span>
                ))}
              </span>
              {t.lectures.guests(joinDutch(guests.map((g) => g.name)), guests.length)}
            </p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <AiLabel />
            {isExample && <ExampleBadge />}
            {demo && <DemoBadge />}
          </div>
          {children}
        </div>
      </div>
    </header>
  );
}

/** Wie dit deel geeft, als het een gastdocent is. */
export function GuestLabel({ guest }: { guest: FigureMeta }) {
  return (
    <p className="mb-2 flex items-center gap-2 text-sm font-medium text-ink-2">
      <Avatar figure={guest} size={28} />
      {t.lectures.guestPart(guest.name)}
    </p>
  );
}

/** Eén onderdeel van het college als hoofdstuk. Antwoorden van de docent via de veilige RichText. */
export function SegmentBlock({
  segment,
  index,
  part,
  streaming = false,
  live = false,
  footer,
  guest,
}: {
  segment: Pick<LectureSegment, 'kind' | 'heading' | 'text'>;
  index: number;
  /** Nummer van het deel (alleen bij kind 'deel'). */
  part?: number;
  streaming?: boolean;
  /** Lopend onderdeel: voorgelezen voor schermlezers. */
  live?: boolean;
  footer?: ReactNode;
  /** Gegeven door een gastdocent. */
  guest?: FigureMeta;
}) {
  const answer = segment.kind === 'antwoord';
  return (
    <section
      aria-labelledby={`${chapterId(index)}-kop`}
      className={cx(
        'scroll-mt-[calc(var(--header-h)+1rem)]',
        answer && 'rounded-2xl border border-fig/25 bg-card px-4 py-4 sm:px-6',
      )}
    >
      <header className="mb-3">
        {guest && <GuestLabel guest={guest} />}
        {segment.kind === 'deel' && part !== undefined && (
          <p className="text-sm font-semibold tracking-wide text-fig uppercase">
            {t.lectures.part(part)}
          </p>
        )}
        <h2
          id={`${chapterId(index)}-kop`}
          tabIndex={-1}
          className={cx(
            'font-fig leading-tight text-fig focus:outline-none',
            answer ? 'text-xl' : 'text-2xl sm:text-3xl',
          )}
        >
          {segment.heading}
        </h2>
      </header>
      <div aria-live={live ? 'polite' : undefined} aria-atomic={live ? false : undefined}>
        <RichText
          text={segment.text}
          streaming={streaming}
          className="max-w-[70ch] text-[1.075rem] leading-[1.8]"
        />
      </div>
      {footer}
    </section>
  );
}

/** De vraag van de student, vlak voor het antwoord. */
export function QuestionBlock({ text }: { text: string }) {
  return (
    <figure className="ml-auto max-w-[min(36rem,92%)] rounded-2xl rounded-br-md bg-ink px-4 py-3 text-paper">
      <figcaption className="mb-1 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-paper/75 uppercase">
        <MessageCircleQuestion aria-hidden className="size-3.5" />
        {t.lectures.questionLabel}
      </figcaption>
      <blockquote className="whitespace-pre-wrap">{text}</blockquote>
    </figure>
  );
}

/** Hoofdstuknavigatie (knoppen, geen ankers: de router gebruikt de hash). */
export function ChapterList({
  chapters,
  current,
  onSelect,
}: {
  chapters: readonly Chapter[];
  current?: number;
  onSelect: (index: number) => void;
}) {
  return (
    <ol className="space-y-0.5">
      {chapters.map((chapter) => (
        <li key={chapter.index}>
          <button
            type="button"
            onClick={() => onSelect(chapter.index)}
            aria-current={current === chapter.index ? 'step' : undefined}
            className={cx(
              'w-full rounded-lg px-3 py-1.5 text-left text-sm transition-colors hover:bg-paper-2 focus-visible:outline-3 focus-visible:outline-info',
              chapter.kind === 'antwoord' && 'pl-6 text-ink-3 italic',
              current === chapter.index ? 'bg-fig-surface font-semibold text-fig' : 'text-ink-2',
            )}
          >
            {chapter.label}
          </button>
        </li>
      ))}
    </ol>
  );
}

/** Voortgangsbalk in stappen: opening, de delen en de conclusie. */
export function ProgressSteps({ done, total }: { done: number; total: number }) {
  return (
    <div
      role="progressbar"
      aria-label={t.lectures.progressLabel}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={done}
      aria-valuetext={t.lectures.progress(done, total)}
      className="flex items-center gap-3"
    >
      <div className="flex flex-1 gap-1">
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={cx(
              'h-1.5 flex-1 rounded-full',
              i < done ? 'bg-fig' : i === done ? 'bg-fig/35' : 'bg-line',
            )}
          />
        ))}
      </div>
      <span className="shrink-0 text-sm text-ink-3 tabular-nums">
        {t.lectures.progress(done, total)}
      </span>
    </div>
  );
}

/** Verder lezen: alleen werken uit het profiel van de docent, nooit verzonnen titels. */
export function FurtherReading({ works, name }: { works: readonly KeyWork[]; name: string }) {
  if (works.length === 0) return null;
  return (
    <Card as="section" aria-labelledby="verder-lezen">
      <h2 id="verder-lezen" className="flex items-center gap-2 text-2xl">
        <BookOpen aria-hidden className="size-5 text-fig" />
        {t.lectures.furtherReading}
      </h2>
      <p className="mt-1 text-sm text-ink-3">{t.lectures.furtherReadingIntro(name)}</p>
      <ul className="mt-3 space-y-2">
        {works.map((work) => (
          <li key={work.title}>
            <span className="font-semibold">{work.title}</span>
            {work.year && <span className="text-ink-3"> ({work.year})</span>}
            {work.note && <p className="text-sm text-ink-2">{work.note}</p>}
          </li>
        ))}
      </ul>
    </Card>
  );
}

/** Vind ik leuk (lokaal, in je bibliotheek). */
export function LikeButton({ lectureId }: { lectureId: string }) {
  const liked = useLibraryStore((s) => Boolean(s.likes[lectureId]));
  const toggleLike = useLibraryStore((s) => s.toggleLike);
  return (
    <Button
      variant={liked ? 'figure' : 'figure-outline'}
      aria-pressed={liked}
      icon={<Heart aria-hidden className={cx('size-4', liked && 'fill-current')} />}
      onClick={() => toggleLike(lectureId)}
    >
      {liked ? t.lectures.liked : t.lectures.like}
    </Button>
  );
}

/** Een vraag stellen na een deel (max. drie per college). */
export function QuestionForm({
  value,
  onChange,
  onSubmit,
  onCancel,
  left,
  max,
  maxLength,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  left: number;
  max: number;
  maxLength: number;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    ref.current?.focus();
  }, []);
  return (
    <form
      className="space-y-3 rounded-2xl border border-line bg-card p-4 shadow-card"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <label htmlFor="collegevraag" className="font-semibold">
          {t.lectures.questionLabel}
        </label>
        <Pill tone="figure">{t.lectures.questionsLeft(left, max)}</Pill>
      </div>
      <textarea
        id="collegevraag"
        ref={ref}
        rows={3}
        maxLength={maxLength}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={t.lectures.questionPlaceholder}
        className="w-full resize-y rounded-xl border border-line-strong bg-paper px-3.5 py-2.5 leading-relaxed text-ink placeholder:text-ink-3 focus:border-ink-2 focus:outline-none focus-visible:outline-3 focus-visible:outline-info"
      />
      <div className="flex flex-wrap justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>
          {t.app.cancel}
        </Button>
        <Button
          type="submit"
          variant="figure"
          disabled={!value.trim()}
          icon={<Send aria-hidden className="size-4" />}
        >
          {t.lectures.sendQuestion}
        </Button>
      </div>
    </form>
  );
}
