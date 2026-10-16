import { CalendarPlus, ListOrdered, Pause, Play, RotateCcw, Send, Square } from 'lucide-react';
import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { Pill } from '@/components/Badges';
import { Button, ButtonLink } from '@/components/Button';
import { toast } from '@/components/toastStore';
import { LIMITS } from '@/config/limits';
import type { FigureMeta } from '@/data/figures';
import type { Figure } from '@/data/types';
import { t } from '@/i18n/nl';
import { formatLongDate } from '@/lib/dates';
import { readingMinutes, takeWords, wordCount } from '@/lib/text';
import {
  chaptersOf,
  furtherReadingWorks,
  type LectureView,
  partNumbers,
  submitLecture,
  wordStarts,
} from '@/services/lecture.service';
import { useLectureStore } from '@/store/lectureStore';
import { useLibraryStore } from '@/store/miscStores';
import {
  ChapterList,
  FurtherReading,
  LectureHall,
  LikeButton,
  QuestionBlock,
  SegmentBlock,
} from './lectureParts';
import { goToChapter } from './chapters';
import { usePlayback } from './usePlayback';

/** Delen op het platform (alleen je eigen, afgeronde colleges). */
function SharePanel({ lectureId }: { lectureId: string }) {
  const lecture = useLectureStore((s) => s.lectures.find((l) => l.id === lectureId));
  if (!lecture) return null;
  const submit = () => {
    if (submitLecture(lecture.id)) toast(t.lectures.submitted, 'ok');
  };
  if (lecture.share === 'ingediend' || lecture.share === 'goedgekeurd') {
    return (
      <Pill tone={lecture.share === 'goedgekeurd' ? 'ok' : 'gold'}>
        {t.lectures.shareStatus[lecture.share]}
      </Pill>
    );
  }
  return (
    <div className="flex flex-wrap items-center gap-2">
      {lecture.share === 'afgekeurd' && (
        <p className="w-full text-sm text-danger">
          {t.lectures.shareStatus.afgekeurd}
          {lecture.moderationNote ? ` · ${t.lectures.rejectedReason(lecture.moderationNote)}` : ''}
        </p>
      )}
      <Button variant="secondary" icon={<Send aria-hidden className="size-4" />} onClick={submit}>
        {lecture.share === 'afgekeurd' ? t.lectures.resubmit : t.lectures.shareToPlatform}
      </Button>
    </div>
  );
}

/** Terugkijken: het hele college met hoofdstukken, of in de afspeelmodus in leestempo. */
export function LectureReplay({
  view,
  meta,
  figure,
  demo = false,
}: {
  view: LectureView;
  meta: FigureMeta;
  figure: Figure;
  demo?: boolean;
}) {
  const name = meta.shortName ?? meta.name;
  const chapters = useMemo(() => chaptersOf(view.segments), [view.segments]);
  const parts = useMemo(() => partNumbers(view.segments), [view.segments]);
  const counts = useMemo(() => view.segments.map((s) => wordCount(s.text)), [view.segments]);
  const starts = useMemo(() => wordStarts(counts), [counts]);
  const total = counts.reduce((a, b) => a + b, 0);
  const works = furtherReadingWorks(figure, view.furtherReading);
  const [playbackMode, setPlaybackMode] = useState(false);
  const playback = usePlayback(total);
  const wpm = LIMITS.lecture.playbackWordsPerMinute;

  // Bekeken (voor statistieken en aanbevelingen); afgerond zodra je het einde bereikt.
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    useLibraryStore.getState().markWatched(view.id, false);
    const end = endRef.current;
    if (!end || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        useLibraryStore.getState().markWatched(view.id, true);
        observer.disconnect();
      }
    });
    observer.observe(end);
    return () => observer.disconnect();
  }, [view.id]);

  // In de afspeelmodus blijft de nieuwste tekst in beeld.
  const caretRef = useRef<HTMLSpanElement>(null);
  const visible = playbackMode ? playback.words : total;
  useEffect(() => {
    if (playbackMode && playback.playing) caretRef.current?.scrollIntoView?.({ block: 'nearest' });
  }, [playbackMode, playback.playing, visible]);

  const current = playbackMode
    ? Math.max(
        0,
        starts.findLastIndex((start) => start <= Math.max(0, visible - 1)),
      )
    : undefined;

  const select = (index: number) => {
    // In de afspeelmodus verschijnt het hoofdstuk vanaf zijn eerste woord.
    if (playbackMode) playback.seek((starts[index] ?? 0) + 1);
    requestAnimationFrame(() => goToChapter(index));
  };

  const startPlayback = () => {
    setPlaybackMode(true);
    playback.restart();
  };

  const stopPlayback = () => {
    playback.pause();
    setPlaybackMode(false);
  };

  const done = !playbackMode || playback.finished;
  const dateLabel = view.isExample
    ? t.lectures.publishedOn(formatLongDate(Date.parse(view.date)))
    : t.lectures.completedOn(formatLongDate(Date.parse(view.date)));

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_16rem] lg:gap-10">
      <div className="mx-auto w-full max-w-3xl min-w-0 space-y-8">
        <LectureHall
          meta={meta}
          title={view.title}
          mainQuestion={view.mainQuestion}
          eyebrow={view.isExample ? t.lectures.exampleHall(name) : t.lectures.hall(name)}
          isExample={view.isExample}
          demo={demo && !view.isExample}
        >
          <p className="mt-3 text-sm text-ink-3">
            {t.lectures.readingTime(readingMinutes(total))} · {dateLabel}
          </p>
        </LectureHall>

        {/* Afspelen */}
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-line bg-card px-3 py-2.5 shadow-card">
          {!playbackMode ? (
            <>
              <Button
                variant="figure"
                size="sm"
                icon={<Play aria-hidden className="size-4" />}
                onClick={startPlayback}
              >
                {t.lectures.playback}
              </Button>
              <p className="text-sm text-ink-3">{t.lectures.playbackHint(wpm)}</p>
            </>
          ) : (
            <>
              {playback.playing ? (
                <Button
                  variant="figure"
                  size="sm"
                  icon={<Pause aria-hidden className="size-4" />}
                  onClick={playback.pause}
                >
                  {t.lectures.pause}
                </Button>
              ) : (
                <Button
                  variant="figure"
                  size="sm"
                  icon={<Play aria-hidden className="size-4" />}
                  onClick={playback.finished ? playback.restart : playback.play}
                >
                  {playback.finished ? t.lectures.restart : t.lectures.play}
                </Button>
              )}
              {!playback.finished && (
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<RotateCcw aria-hidden className="size-4" />}
                  onClick={playback.restart}
                >
                  {t.lectures.restart}
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                icon={<Square aria-hidden className="size-4" />}
                onClick={stopPlayback}
              >
                {t.lectures.stopPlayback}
              </Button>
              <div
                role="progressbar"
                aria-label={t.lectures.playbackProgress}
                aria-valuemin={0}
                aria-valuemax={total}
                aria-valuenow={visible}
                className="h-1.5 min-w-24 flex-1 overflow-hidden rounded-full bg-line"
              >
                <span
                  className="block h-full rounded-full bg-fig transition-[width] duration-200 motion-reduce:transition-none"
                  style={{ width: `${total ? (visible / total) * 100 : 0}%` }}
                />
              </div>
            </>
          )}
        </div>

        {/* Hoofdstukken (mobiel) */}
        <details className="rounded-2xl border border-line bg-card px-2 py-2 lg:hidden">
          <summary className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1 font-semibold">
            <ListOrdered aria-hidden className="size-4 text-fig" />
            {t.lectures.chapters}
          </summary>
          <nav aria-label={t.lectures.chapters} className="mt-2">
            <ChapterList chapters={chapters} current={current} onSelect={select} />
          </nav>
        </details>

        {view.segments.map((segment, index) => {
          const start = starts[index] ?? 0;
          const count = counts[index] ?? 0;
          const shown = Math.max(0, Math.min(count, visible - start));
          if (playbackMode && shown === 0) return null;
          const partial = shown < count;
          return (
            <Fragment key={segment.index}>
              <SegmentBlock
                segment={partial ? { ...segment, text: takeWords(segment.text, shown) } : segment}
                index={index}
                part={parts[index]}
                streaming={partial}
                footer={
                  partial ? (
                    <span
                      ref={caretRef}
                      aria-hidden
                      className="inline-block h-5 w-1.5 scroll-mb-28 animate-pulse rounded-sm bg-fig align-middle motion-reduce:animate-none"
                    />
                  ) : undefined
                }
              />
              {!partial &&
                view.questions
                  .filter((q) => q.afterSegment === index)
                  .map((q) => (
                    <QuestionBlock key={`${q.afterSegment}-${q.text.slice(0, 20)}`} text={q.text} />
                  ))}
            </Fragment>
          );
        })}

        <div ref={endRef} />

        {done && (
          <>
            <FurtherReading works={works} name={name} />
            <section aria-label={t.lectures.title} className="space-y-4 border-t border-line pt-6">
              <div className="flex flex-wrap items-center gap-2">
                <LikeButton lectureId={view.id} />
                {!view.isExample && <SharePanel lectureId={view.id} />}
                <ButtonLink
                  to={`/colleges/aanvragen/${meta.id}`}
                  variant="ghost"
                  icon={<CalendarPlus aria-hidden className="size-4" />}
                >
                  {t.lectures.newLecture}
                </ButtonLink>
              </div>
              <p className="text-sm text-ink-3">{t.lectures.noComments}</p>
            </section>
          </>
        )}
      </div>

      {/* Hoofdstukken (desktop) */}
      <aside className="hidden lg:block">
        <nav
          aria-label={t.lectures.chapters}
          className="sticky top-[calc(var(--header-h)+1.5rem)] rounded-2xl border border-line bg-card p-3 shadow-card"
        >
          <p className="mb-2 flex items-center gap-2 px-3 font-semibold">
            <ListOrdered aria-hidden className="size-4 text-fig" />
            {t.lectures.chapters}
          </p>
          <ChapterList chapters={chapters} current={current} onSelect={select} />
        </nav>
      </aside>
    </div>
  );
}
