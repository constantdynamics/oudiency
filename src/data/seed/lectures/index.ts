/**
 * Voorbeeldcolleges (§7.4): ~12 vooraf geschreven colleges, gelabeld als Voorbeeld.
 *  - Synchroon: lichte metadata (titel, docent, tags, leestijd) uit index.generated.ts.
 *  - Asynchroon: de volledige tekst per college (eigen chunk).
 */
import type { ExampleLecture } from '../../types';
import { EXAMPLE_LECTURE_INDEX } from './index.generated';
import type { ExampleLectureMeta } from './meta';

export type { ExampleLectureMeta } from './meta';

export const EXAMPLE_LECTURES: readonly ExampleLectureMeta[] = EXAMPLE_LECTURE_INDEX;

const byId = new Map(EXAMPLE_LECTURE_INDEX.map((meta) => [meta.id, meta]));
const loaders = import.meta.glob<ExampleLecture>('./items/*.ts', { import: 'default' });
const cache = new Map<string, ExampleLecture>();

export function findExampleLecture(id: string): ExampleLectureMeta | undefined {
  return byId.get(id);
}

export function isExampleLectureId(id: string): boolean {
  return byId.has(id);
}

export async function loadExampleLecture(id: string): Promise<ExampleLecture | undefined> {
  const cached = cache.get(id);
  if (cached) return cached;
  if (!byId.has(id)) return undefined;
  for (const [path, load] of Object.entries(loaders)) {
    // Bestandsnaam = id zonder het voorvoegsel 'vb-'.
    if (!path.endsWith(`/${id.replace(/^vb-/, '')}.ts`)) continue;
    const lecture = await load();
    cache.set(id, lecture);
    return lecture;
  }
  return undefined;
}
