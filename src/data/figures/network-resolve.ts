/**
 * Netwerk afleiden: elke denker heeft een expliciet netwerk in de data. We vullen dat aan met de
 * omgekeerde relaties uit de netwerken van anderen (leraar ↔ leerling, invloed ↔ navolger …),
 * tot maximaal 10. Expliciete relaties gaan altijd voor.
 */
import type { Figure, Relation } from '../types';

export const MAX_NETWORK = 10;

export const INVERSE_RELATION: Record<Relation, Relation> = {
  leraar: 'leerling',
  leerling: 'leraar',
  invloed: 'navolger',
  navolger: 'invloed',
  mentor: 'protegé',
  protegé: 'mentor',
  voorbeeld: 'navolger',
  bewonderaar: 'invloed',
  commentator: 'invloed',
  criticus: 'tegenpool',
  tijdgenoot: 'tijdgenoot',
  gesprekspartner: 'gesprekspartner',
  correspondent: 'correspondent',
  vriend: 'vriend',
  rivaal: 'rivaal',
  tegenpool: 'tegenpool',
  'andere school': 'andere school',
  geestverwant: 'geestverwant',
};

export interface ResolvedLink {
  id: string;
  relation: Relation;
  note?: string;
  /** Afgeleid uit het netwerk van de ander (omgekeerde relatie). */
  derived?: boolean;
}

/** Sorteervolgorde van relaties: nauwe banden eerst. */
const RELATION_WEIGHT: Record<Relation, number> = {
  leraar: 10,
  leerling: 10,
  mentor: 9,
  protegé: 9,
  invloed: 8,
  navolger: 8,
  voorbeeld: 8,
  vriend: 7,
  correspondent: 7,
  gesprekspartner: 6,
  rivaal: 6,
  criticus: 6,
  tegenpool: 5,
  bewonderaar: 5,
  commentator: 5,
  geestverwant: 4,
  tijdgenoot: 3,
  'andere school': 2,
};

export function resolveNetworks(figures: readonly Figure[]): Map<string, ResolvedLink[]> {
  const ids = new Set(figures.map((f) => f.id));
  const result = new Map<string, ResolvedLink[]>();
  for (const figure of figures) {
    result.set(
      figure.id,
      figure.network
        .filter((link) => ids.has(link.id) && link.id !== figure.id)
        .map((link) => ({ id: link.id, relation: link.relation, note: link.note })),
    );
  }
  // Omgekeerde relaties toevoegen waar ze nog ontbreken.
  const candidates = new Map<string, ResolvedLink[]>();
  for (const figure of figures) {
    for (const link of figure.network) {
      if (!ids.has(link.id) || link.id === figure.id) continue;
      const target = result.get(link.id);
      if (!target || target.some((l) => l.id === figure.id)) continue;
      const list = candidates.get(link.id) ?? [];
      list.push({ id: figure.id, relation: INVERSE_RELATION[link.relation], derived: true });
      candidates.set(link.id, list);
    }
  }
  for (const [id, extra] of candidates) {
    const current = result.get(id) ?? [];
    const room = MAX_NETWORK - current.length;
    if (room <= 0) continue;
    const sorted = [...extra].sort(
      (a, b) =>
        RELATION_WEIGHT[b.relation] - RELATION_WEIGHT[a.relation] || a.id.localeCompare(b.id),
    );
    result.set(id, [...current, ...sorted.slice(0, room)]);
  }
  return result;
}
