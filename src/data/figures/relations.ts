/**
 * Leesbare relaties. Een link in het netwerk van D met relatie R beschrijft wie X is ten opzichte
 * van D (§6.2): "Plato (leerling)" in het netwerk van Socrates betekent: Plato is leerling van
 * Socrates. Deze functies maken daar een lopende zin van.
 */
import type { Relation } from '../types';

const PHRASES: Record<Relation, (of: string) => string> = {
  leraar: (of) => `leraar van ${of}`,
  leerling: (of) => `leerling van ${of}`,
  invloed: (of) => `inspireerde ${of}`,
  navolger: (of) => `navolger van ${of}`,
  tijdgenoot: (of) => `tijdgenoot van ${of}`,
  gesprekspartner: (of) => `gesprekspartner van ${of}`,
  correspondent: (of) => `correspondeerde met ${of}`,
  vriend: (of) => `vriend van ${of}`,
  rivaal: (of) => `rivaal van ${of}`,
  mentor: (of) => `mentor van ${of}`,
  criticus: (of) => `criticus van ${of}`,
  tegenpool: (of) => `tegenpool van ${of}`,
  'andere school': (of) => `andere school dan ${of}`,
  geestverwant: (of) => `geestverwant van ${of}`,
  commentator: (of) => `commentator van ${of}`,
  bewonderaar: (of) => `bewonderaar van ${of}`,
  voorbeeld: (of) => `voorbeeld voor ${of}`,
  protegé: (of) => `protegé van ${of}`,
};

/** "leerling van Socrates", "inspireerde Kant" */
export function relationPhrase(relation: Relation, of: string): string {
  return PHRASES[relation](of);
}

/** Korte label voor een chip: "Leerling", "Andere school". */
export function relationLabel(relation: Relation): string {
  return relation.charAt(0).toUpperCase() + relation.slice(1);
}
