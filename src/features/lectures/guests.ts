import { type FigureMeta, findMeta } from '@/data/figures';

/** De gastdocenten van een college (een college uit een onderzoek), in volgorde. */
export function guestMetas(ids: readonly string[] | undefined): FigureMeta[] {
  return (ids ?? []).map((id) => findMeta(id)).filter((meta) => meta !== undefined);
}
