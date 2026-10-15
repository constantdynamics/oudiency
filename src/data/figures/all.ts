/**
 * Alle denkers, volledig (statische imports). Alleen voor scripts, tests en de generator van
 * de lichte index; de app laadt volledige profielen per denker lazy via registry.ts.
 */
import type { Figure } from '../types';
import { socrates } from './core/socrates';
import { aurelius } from './core/aurelius';
import { laozi } from './core/laozi';
import { kant } from './core/kant';
import { franklin } from './core/franklin';
import { gandhi } from './core/gandhi';
import { spinoza } from './core/spinoza';
import { rousseau } from './core/rousseau';
import { adams } from './network/adams';
import { antoninus } from './network/antoninus';
import { aristoteles } from './network/aristoteles';
import { besant } from './network/besant';
import { chrysippus } from './network/chrysippus';
import { confucius } from './network/confucius';
import { descartes } from './network/descartes';
import { dewitt } from './network/dewitt';
import { diderot } from './network/diderot';
import { diogenes } from './network/diogenes';
import { emerson } from './network/emerson';
import { epictetus } from './network/epictetus';
import { fichte } from './network/fichte';
import { fronto } from './network/fronto';
import { goethe } from './network/goethe';
import { gokhale } from './network/gokhale';
import { hanfeizi } from './network/hanfeizi';
import { hegel } from './network/hegel';
import { heraclitus } from './network/heraclitus';
import { herder } from './network/herder';
import { hobbes } from './network/hobbes';
import { hume } from './network/hume';
import { huygens } from './network/huygens';
import { jefferson } from './network/jefferson';
import { kierkegaard } from './network/kierkegaard';
import { leibniz } from './network/leibniz';
import { liezi } from './network/liezi';
import { locke } from './network/locke';
import { maimonides } from './network/maimonides';
import { mather } from './network/mather';
import { mencius } from './network/mencius';
import { mendelssohn } from './network/mendelssohn';
import { montaigne } from './network/montaigne';
import { montesquieu } from './network/montesquieu';
import { mozi } from './network/mozi';
import { musonius } from './network/musonius';
import { nagarjuna } from './network/nagarjuna';
import { naoroji } from './network/naoroji';
import { newton } from './network/newton';
import { nietzsche } from './network/nietzsche';
import { oldenburg } from './network/oldenburg';
import { paine } from './network/paine';
import { pestalozzi } from './network/pestalozzi';
import { plato } from './network/plato';
import { plutarchus } from './network/plutarchus';
import { priestley } from './network/priestley';
import { protagoras } from './network/protagoras';
import { rajchandra } from './network/rajchandra';
import { ruskin } from './network/ruskin';
import { rusticus } from './network/rusticus';
import { schopenhauer } from './network/schopenhauer';
import { seneca } from './network/seneca';
import { smith } from './network/smith';
import { tagore } from './network/tagore';
import { thoreau } from './network/thoreau';
import { tolstoj } from './network/tolstoj';
import { vandenenden } from './network/vandenenden';
import { voltaire } from './network/voltaire';
import { wangbi } from './network/wangbi';
import { wolff } from './network/wolff';
import { wollstonecraft } from './network/wollstonecraft';
import { xenophon } from './network/xenophon';
import { yangzhu } from './network/yangzhu';
import { zeno } from './network/zeno';
import { zhuangzi } from './network/zhuangzi';

export const CORE_FIGURES: Figure[] = [
  socrates,
  aurelius,
  laozi,
  kant,
  franklin,
  gandhi,
  spinoza,
  rousseau,
];

export const NETWORK_FIGURES: Figure[] = [
  adams,
  antoninus,
  aristoteles,
  besant,
  chrysippus,
  confucius,
  descartes,
  dewitt,
  diderot,
  diogenes,
  emerson,
  epictetus,
  fichte,
  fronto,
  goethe,
  gokhale,
  hanfeizi,
  hegel,
  heraclitus,
  herder,
  hobbes,
  hume,
  huygens,
  jefferson,
  kierkegaard,
  leibniz,
  liezi,
  locke,
  maimonides,
  mather,
  mencius,
  mendelssohn,
  montaigne,
  montesquieu,
  mozi,
  musonius,
  nagarjuna,
  naoroji,
  newton,
  nietzsche,
  oldenburg,
  paine,
  pestalozzi,
  plato,
  plutarchus,
  priestley,
  protagoras,
  rajchandra,
  ruskin,
  rusticus,
  schopenhauer,
  seneca,
  smith,
  tagore,
  thoreau,
  tolstoj,
  vandenenden,
  voltaire,
  wangbi,
  wolff,
  wollstonecraft,
  xenophon,
  yangzhu,
  zeno,
  zhuangzi,
];

export const ALL_FIGURES: Figure[] = [...CORE_FIGURES, ...NETWORK_FIGURES];

/** Bestandspad (relatief aan deze map) per denker, voor lazy laden. */
export function figureModulePath(figure: Pick<Figure, 'id' | 'tier'>): string {
  return figure.tier === 'kern' ? `./core/${figure.id}.ts` : `./network/${figure.id}.ts`;
}
