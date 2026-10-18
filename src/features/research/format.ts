/** Kleine hulpjes voor de onderzoekspagina's: namen, fases en labels. */
import { findMeta } from '@/data/figures';
import { tr } from '@/i18n/research';
import { joinDutch } from '@/lib/text';
import { isActive } from '@/research/researchState';
import type { Research, ResearchOutput } from '@/store/researchSchemas';

export function figureNames(ids: readonly string[]): string {
  return joinDutch(ids.map((id) => findMeta(id)?.name ?? id));
}

export type ResearchPhase = 'zoeken' | 'onderbroken' | 'klaar' | 'fout';

/** Waar een onderzoek is; "zoeken" zonder lopend werk in deze sessie is onderbroken. */
export function phaseOf(research: Research): ResearchPhase {
  if (research.status === 'zoeken') return isActive(research.id) ? 'zoeken' : 'onderbroken';
  return research.status;
}

export type OutputPhase = 'maken' | 'onderbroken' | 'klaar' | 'fout';

export function outputPhaseOf(research: Research, output: ResearchOutput): OutputPhase {
  if (output.status !== 'maken') return output.status;
  // Tijdens het uitzoeken wacht de vorm op het onderzoek.
  if (research.status === 'zoeken' && isActive(research.id)) return 'maken';
  return isActive(research.id, output.id) ? 'maken' : 'onderbroken';
}

export function formLabel(output: ResearchOutput): string {
  const base = tr.forms[output.form];
  if (output.form === 'tekst' && output.length) return `${base} · ${output.length}`;
  return base;
}
