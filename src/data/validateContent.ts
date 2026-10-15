/** Validatie van de overige inhoud; wordt aangevuld zodra die inhoud bestaat. */
import { ALL_FIGURES } from './figures/all';
import type { ValidationIssue } from './validation';

export function validateAllContent(): ValidationIssue[] {
  void ALL_FIGURES;
  return [];
}
