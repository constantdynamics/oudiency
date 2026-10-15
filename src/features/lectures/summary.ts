/**
 * Eén weergavevorm voor colleges uit verschillende bronnen: voorbeeldcolleges (vast, lazy tekst)
 * en je eigen colleges (opgeslagen). Gebruikt door Ontdekken, Colleges en de denkersprofielen.
 */
import { useMemo } from 'react';
import { EXAMPLE_LECTURES, type ExampleLectureMeta } from '@/data/seed/lectures';
import { readingMinutes, wordCount } from '@/lib/text';
import { useLectureStore } from '@/store/lectureStore';
import { useLibraryStore } from '@/store/miscStores';
import type { Lecture, ShareStatus } from '@/store/schemas';

export interface LectureSummary {
  id: string;
  figureId: string;
  title: string;
  topic: string;
  mainQuestion: string;
  tags: string[];
  minutes: number;
  isExample: boolean;
  /** Alleen bij eigen colleges. */
  status?: Lecture['status'];
  share?: ShareStatus;
  /** Publicatie- of aanmaakdatum (ISO). */
  date: string;
  liked: boolean;
}

export function fromExample(meta: ExampleLectureMeta, liked = false): LectureSummary {
  return {
    id: meta.id,
    figureId: meta.figureId,
    title: meta.title,
    topic: meta.topic,
    mainQuestion: meta.mainQuestion,
    tags: meta.tags,
    minutes: meta.minutes,
    isExample: true,
    date: meta.publishedAt,
    liked,
  };
}

export function fromLecture(lecture: Lecture, liked = lecture.likedByMe): LectureSummary {
  const words = lecture.segments.reduce((sum, s) => sum + wordCount(s.text), 0);
  return {
    id: lecture.id,
    figureId: lecture.figureId,
    title: lecture.plan?.title ?? lecture.topic,
    topic: lecture.topic,
    mainQuestion: lecture.mainQuestion,
    tags: lecture.tags ?? [],
    minutes: readingMinutes(words),
    isExample: false,
    status: lecture.status,
    share: lecture.share,
    date: lecture.publishedAt ?? lecture.completedAt ?? lecture.createdAt,
    liked,
  };
}

/** Alle colleges die je kunt bekijken: voorbeelden + je eigen colleges. */
export function useAllLectureSummaries(): LectureSummary[] {
  const lectures = useLectureStore((s) => s.lectures);
  const likes = useLibraryStore((s) => s.likes);
  return useMemo(
    () => [
      ...EXAMPLE_LECTURES.map((meta) => fromExample(meta, Boolean(likes[meta.id]))),
      ...lectures.map((lecture) => fromLecture(lecture, Boolean(likes[lecture.id]))),
    ],
    [lectures, likes],
  );
}

/**
 * De bibliotheek (Fase 1): voorbeeldcolleges plus je eigen colleges die na moderatie zijn
 * goedgekeurd. Eigen colleges die privé zijn, staan alleen onder "Mijn colleges".
 */
export function isInLibrary(summary: LectureSummary): boolean {
  return summary.isExample || summary.share === 'goedgekeurd';
}
