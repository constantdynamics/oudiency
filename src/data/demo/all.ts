/**
 * Alle demo-inhoud, statisch geïmporteerd. Alleen voor scripts en tests; de app laadt de inhoud
 * per denker lazy via ./index.ts.
 */
import type { DemoFigureContent } from '../types';
import { aureliusDemo } from './core/aurelius';
import { franklinDemo } from './core/franklin';
import { gandhiDemo } from './core/gandhi';
import { kantDemo } from './core/kant';
import { laoziDemo } from './core/laozi';
import { rousseauDemo } from './core/rousseau';
import { socratesDemo } from './core/socrates';
import { spinozaDemo } from './core/spinoza';

export const ALL_DEMO_CONTENT: readonly DemoFigureContent[] = [
  socratesDemo,
  aureliusDemo,
  laoziDemo,
  kantDemo,
  franklinDemo,
  gandhiDemo,
  spinozaDemo,
  rousseauDemo,
];
