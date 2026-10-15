import { formatLifespan } from '@/lib/dates';
import type { Figure } from '../types';

/** Levensjaren zoals we ze tonen: vrije weergave als die er is, anders 'ca. 470–399 v.Chr.'. */
export function lifespanOf(
  figure: Pick<Figure, 'born' | 'died' | 'approximate' | 'displayYears'>,
): string {
  return figure.displayYears ?? formatLifespan(figure.born, figure.died, figure.approximate);
}

/** Taalcode voor de naam in het eigen schrift (voor schermlezers en het juiste font). */
export function nativeLang(script: Figure['nativeScript']): string | undefined {
  switch (script) {
    case 'greek':
      return 'grc';
    case 'han':
      return 'zh';
    case 'devanagari':
      return 'hi';
    case 'gujarati':
      return 'gu';
    default:
      return undefined;
  }
}
