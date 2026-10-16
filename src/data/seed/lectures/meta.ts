/**
 * Lichte gegevens per voorbeeldcollege (voor Ontdekken, zoeken en filters). De volledige tekst
 * laadt pas als je het college opent. De index wordt gemaakt door `npm run gen:index`.
 */
import { readingMinutes, truncate, wordCount } from '@/lib/text';
import type { ExampleLecture } from '../../types';

export interface ExampleLectureMeta {
  id: string;
  figureId: string;
  topic: string;
  mainQuestion: string;
  title: string;
  tags: string[];
  publishedAt: string;
  /** Aantal woorden van het hele college. */
  words: number;
  /** Geschatte leestijd in minuten. */
  minutes: number;
  /** Begin van de opening, voor kaarten en zoekresultaten. */
  teaser: string;
}

export function toLectureMeta(lecture: ExampleLecture): ExampleLectureMeta {
  const words = lecture.segments.reduce((sum, segment) => sum + wordCount(segment.text), 0);
  const opening = lecture.segments.find((s) => s.kind === 'opening')?.text ?? '';
  return {
    id: lecture.id,
    figureId: lecture.figureId,
    topic: lecture.topic,
    mainQuestion: lecture.mainQuestion,
    title: lecture.title,
    tags: lecture.tags,
    publishedAt: lecture.publishedAt,
    words,
    minutes: readingMinutes(words),
    teaser: truncate(opening.split('\n\n')[0] ?? '', 180),
  };
}

export function renderLectureIndex(lectures: readonly ExampleLecture[]): string {
  const metas = lectures.map(toLectureMeta);
  return [
    '// AUTOMATISCH GEGENEREERD door scripts/gen-index.ts — niet met de hand bewerken.',
    '// Wijzig de colleges in src/data/seed/lectures/items/*.ts en draai daarna: npm run gen:index',
    "import type { ExampleLectureMeta } from './meta';",
    '',
    `export const EXAMPLE_LECTURE_INDEX: ExampleLectureMeta[] = ${JSON.stringify(metas, null, 2)};`,
    '',
  ].join('\n');
}
