/**
 * Ontdekken van denkers (§6.3): kerndenkers zijn altijd ontdekt; netwerkdenkers ontdek je via
 * profielen, reacties op je timeline, de denker van de dag of "Wie kan mij helpen?".
 */
import { useMemo } from 'react';
import { CORE_IDS, FIGURES_META, findMeta, figureName, type FigureMeta } from '@/data/figures';
import { relationPhrase } from '@/data/figures/relations';
import { useProfileStore } from '@/store/profileStore';

export function isDiscovered(id: string, discovered: readonly string[]): boolean {
  return CORE_IDS.includes(id) || discovered.includes(id);
}

/** Set met alle ontdekte denkers (kern + ontdekt). */
export function discoveredSet(discovered: readonly string[]): Set<string> {
  return new Set([...CORE_IDS, ...discovered.filter((id) => findMeta(id))]);
}

export function useDiscovered(): Set<string> {
  const discovered = useProfileStore((s) => s.profile.discovered);
  return useMemo(() => discoveredSet(discovered), [discovered]);
}

/**
 * Een hint voor een nog niet ontdekte denker, vanuit een ontdekte denker in wiens netwerk hij
 * staat: "leerling van Socrates". Undefined als geen enkele ontdekte denker hem noemt.
 */
export function teaserHint(id: string, known: ReadonlySet<string>): string | undefined {
  for (const meta of FIGURES_META) {
    if (!known.has(meta.id)) continue;
    const link = meta.network.find((l) => l.id === id);
    if (link) return relationPhrase(link.relation, figureName(meta.id));
  }
  return undefined;
}

/** Nog niet ontdekte denkers die grenzen aan wat je al kent (de "rand" van je netwerk). */
export function frontier(known: ReadonlySet<string>): FigureMeta[] {
  const ids = new Set<string>();
  for (const meta of FIGURES_META) {
    if (!known.has(meta.id)) continue;
    for (const link of meta.network) if (!known.has(link.id)) ids.add(link.id);
  }
  return FIGURES_META.filter((meta) => ids.has(meta.id));
}
