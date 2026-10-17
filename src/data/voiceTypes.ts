/**
 * Stemtype per denker, voor wie (nog) geen eigen ontworpen stem heeft: dan kiest de app een
 * kant-en-klare stem uit de bibliotheek van ElevenLabs die past bij geslacht en leeftijd.
 * Het geslacht staat hier per denker (historisch); de leeftijd volgt uit de levensjaren.
 * `npm run validate:data` controleert dat elke denker erin staat.
 */
import type { FigureMeta } from './figures/meta';

export type VoiceGender = 'man' | 'vrouw';
export type VoiceAge = 'jong' | 'midden' | 'oud';

export interface VoiceType {
  gender: VoiceGender;
  age: VoiceAge;
}

export const FIGURE_VOICE_GENDER: Readonly<Record<string, VoiceGender>> = {
  socrates: 'man',
  aurelius: 'man',
  laozi: 'man',
  kant: 'man',
  franklin: 'man',
  gandhi: 'man',
  spinoza: 'man',
  rousseau: 'man',
  adams: 'man',
  antoninus: 'man',
  aristoteles: 'man',
  besant: 'vrouw',
  chrysippus: 'man',
  confucius: 'man',
  descartes: 'man',
  dewitt: 'man',
  diderot: 'man',
  diogenes: 'man',
  emerson: 'man',
  epictetus: 'man',
  fichte: 'man',
  fronto: 'man',
  goethe: 'man',
  gokhale: 'man',
  hanfeizi: 'man',
  hegel: 'man',
  heraclitus: 'man',
  herder: 'man',
  hobbes: 'man',
  hume: 'man',
  huygens: 'man',
  jefferson: 'man',
  kierkegaard: 'man',
  leibniz: 'man',
  liezi: 'man',
  locke: 'man',
  maimonides: 'man',
  mather: 'man',
  mencius: 'man',
  mendelssohn: 'man',
  montaigne: 'man',
  montesquieu: 'man',
  mozi: 'man',
  musonius: 'man',
  nagarjuna: 'man',
  naoroji: 'man',
  newton: 'man',
  nietzsche: 'man',
  oldenburg: 'man',
  paine: 'man',
  pestalozzi: 'man',
  plato: 'man',
  plutarchus: 'man',
  priestley: 'man',
  protagoras: 'man',
  rajchandra: 'man',
  ruskin: 'man',
  rusticus: 'man',
  schopenhauer: 'man',
  seneca: 'man',
  smith: 'man',
  tagore: 'man',
  thoreau: 'man',
  tolstoj: 'man',
  vandenenden: 'man',
  voltaire: 'man',
  wangbi: 'man',
  wolff: 'man',
  wollstonecraft: 'vrouw',
  xenophon: 'man',
  yangzhu: 'man',
  zeno: 'man',
  zhuangzi: 'man',
};

/** Jong (overleden vóór 35), midden (35–59) of oud (60+): zo klinkt de stem. */
export function voiceAge(born: number, died: number): VoiceAge {
  const age = died - born;
  if (age < 35) return 'jong';
  if (age < 60) return 'midden';
  return 'oud';
}

export function voiceTypeOf(meta: Pick<FigureMeta, 'id' | 'born' | 'died'>): VoiceType {
  return { gender: FIGURE_VOICE_GENDER[meta.id] ?? 'man', age: voiceAge(meta.born, meta.died) };
}
