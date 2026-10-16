/**
 * Register van denkers.
 *  - Synchroon: lichte metadata (naam, thema, netwerk, tags) uit index.generated.ts.
 *  - Asynchroon: het volledige profiel per denker, lazy geladen (eigen chunk per denker).
 */
import { useEffect, useState } from 'react';
import type { Figure } from '../types';
import { FIGURE_INDEX } from './index.generated';
import type { FigureMeta } from './meta';

export type { FigureMeta } from './meta';
export type { ResolvedLink } from './network-resolve';

const META = new Map(FIGURE_INDEX.map((meta) => [meta.id, meta]));

export const FIGURES_META: readonly FigureMeta[] = FIGURE_INDEX;
export const CORE_META: readonly FigureMeta[] = FIGURE_INDEX.filter((m) => m.tier === 'kern');
export const NETWORK_META: readonly FigureMeta[] = FIGURE_INDEX.filter((m) => m.tier === 'netwerk');
export const TOTAL_FIGURES = FIGURE_INDEX.length;
export const CORE_IDS: readonly string[] = CORE_META.map((m) => m.id);

export function findMeta(id: string | undefined | null): FigureMeta | undefined {
  return id ? META.get(id) : undefined;
}

export function getMeta(id: string): FigureMeta {
  const meta = META.get(id);
  if (!meta) throw new Error(`Onbekende denker: ${id}`);
  return meta;
}

/** Korte naam voor in zinnen ("Marcus Aurelius vraagt …", "Kant reageerde …"). */
export function figureName(id: string): string {
  const meta = META.get(id);
  return meta ? (meta.shortName ?? meta.name) : id;
}

/* ---------- Volledige profielen, lazy ---------- */

const loaders = import.meta.glob<Record<string, Figure>>(['./core/*.ts', './network/*.ts']);
const cache = new Map<string, Figure>();
const pending = new Map<string, Promise<Figure>>();

function modulePath(meta: FigureMeta): string {
  return meta.tier === 'kern' ? `./core/${meta.id}.ts` : `./network/${meta.id}.ts`;
}

export function peekFigure(id: string): Figure | undefined {
  return cache.get(id);
}

export function loadFigure(id: string): Promise<Figure> {
  const cached = cache.get(id);
  if (cached) return Promise.resolve(cached);
  const inFlight = pending.get(id);
  if (inFlight) return inFlight;
  const meta = META.get(id);
  const loader = meta ? loaders[modulePath(meta)] : undefined;
  if (!meta || !loader) return Promise.reject(new Error(`Onbekende denker: ${id}`));
  const promise = loader()
    .then((module) => {
      const figure = module[id];
      if (!figure) throw new Error(`Profiel van ${id} ontbreekt in de module`);
      cache.set(id, figure);
      pending.delete(id);
      return figure;
    })
    .catch((error: unknown) => {
      pending.delete(id);
      throw error;
    });
  pending.set(id, promise);
  return promise;
}

export function loadFigures(ids: readonly string[]): Promise<Figure[]> {
  return Promise.all([...new Set(ids)].filter((id) => META.has(id)).map(loadFigure));
}

/** Hook: het volledige profiel (undefined zolang het laadt of als de denker niet bestaat). */
export function useFigure(id: string | undefined): {
  figure: Figure | undefined;
  status: 'loading' | 'ready' | 'missing' | 'error';
} {
  const known = id ? META.has(id) : false;
  const [, setVersion] = useState(0);
  const figure = id ? cache.get(id) : undefined;
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!id || !META.has(id) || cache.has(id)) return;
    let active = true;
    loadFigure(id).then(
      () => active && setVersion((v) => v + 1),
      () => active && setFailed(true),
    );
    return () => {
      active = false;
    };
  }, [id]);

  if (!id || !known) return { figure: undefined, status: 'missing' };
  if (figure) return { figure, status: 'ready' };
  return { figure: undefined, status: failed ? 'error' : 'loading' };
}
