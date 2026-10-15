/**
 * Demomodus-inhoud (§8.8): per kerndenker handgeschreven sessiefragmenten, lesblokken,
 * timeline-reacties en gedachten. Per denker lazy geladen.
 */
import type { DemoFigureContent } from '../types';

const loaders = import.meta.glob<Record<string, DemoFigureContent>>('./core/*.ts');
const cache = new Map<string, DemoFigureContent | null>();

export async function loadDemoContent(figureId: string): Promise<DemoFigureContent | undefined> {
  if (cache.has(figureId)) return cache.get(figureId) ?? undefined;
  const loader = loaders[`./core/${figureId}.ts`];
  if (!loader) {
    cache.set(figureId, null);
    return undefined;
  }
  const module = await loader();
  const content = module[`${figureId}Demo`] ?? Object.values(module)[0];
  cache.set(figureId, content ?? null);
  return content;
}
