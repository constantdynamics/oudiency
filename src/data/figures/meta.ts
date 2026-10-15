/**
 * Lichte metadata per denker: alles wat lijsten, avatars, thema's, netwerken en matching nodig
 * hebben. De volledige profielen (bio, citaten, persona) worden per denker lazy geladen.
 * De index (index.generated.ts) wordt gemaakt door `npm run gen:index`.
 */
import type { Figure, FigureTheme, NativeScript } from '../types';
import type { ResolvedLink } from './network-resolve';

export interface FigureMeta {
  id: string;
  tier: 'kern' | 'netwerk';
  name: string;
  shortName?: string;
  nativeName?: string;
  nativeScript?: NativeScript;
  monogram?: string;
  epithet: string;
  born: number;
  died: number;
  approximate?: boolean;
  displayYears?: string;
  origin: string;
  school: string;
  tags: string[];
  helpsWith: string[];
  theme: FigureTheme;
  /** Netwerk inclusief afgeleide omgekeerde relaties (max. 10). */
  network: ResolvedLink[];
  /** Aantal geverifieerde citaten. */
  verifiedQuotes: number;
}

export function toMeta(figure: Figure, network: ResolvedLink[]): FigureMeta {
  const meta: FigureMeta = {
    id: figure.id,
    tier: figure.tier,
    name: figure.name,
    epithet: figure.epithet,
    born: figure.born,
    died: figure.died,
    origin: figure.origin,
    school: figure.school,
    tags: figure.tags,
    helpsWith: figure.helpsWith,
    theme: figure.theme,
    network,
    verifiedQuotes: figure.quotes.filter((q) => q.verified).length,
  };
  if (figure.shortName) meta.shortName = figure.shortName;
  if (figure.nativeName) meta.nativeName = figure.nativeName;
  if (figure.nativeScript) meta.nativeScript = figure.nativeScript;
  if (figure.monogram) meta.monogram = figure.monogram;
  if (figure.approximate) meta.approximate = figure.approximate;
  if (figure.displayYears) meta.displayYears = figure.displayYears;
  return meta;
}
