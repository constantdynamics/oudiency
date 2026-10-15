/** Rendert de inhoud van index.generated.ts (gedeeld door de generator en validate:data). */
import type { Figure } from '../types';
import { toMeta } from './meta';
import { resolveNetworks } from './network-resolve';

export function renderFigureIndex(figures: readonly Figure[]): string {
  const networks = resolveNetworks(figures);
  const metas = figures.map((figure) => toMeta(figure, networks.get(figure.id) ?? []));
  return [
    '// AUTOMATISCH GEGENEREERD door scripts/gen-figure-index.ts — niet met de hand bewerken.',
    '// Wijzig de denkers in src/data/figures/*.ts en draai daarna: npm run gen:figures',
    "import type { FigureMeta } from './meta';",
    '',
    `export const FIGURE_INDEX: FigureMeta[] = ${JSON.stringify(metas, null, 2)};`,
    '',
  ].join('\n');
}
