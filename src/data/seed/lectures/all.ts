/**
 * Alle voorbeeldcolleges, statisch geïmporteerd. Alleen voor scripts en tests; de app gebruikt
 * de lichte index (index.generated.ts) en laadt de volledige tekst per college lazy.
 */
import type { ExampleLecture } from '../../types';
import aureliusNieuws from './items/aurelius-nieuws';
import confuciusGoedMens from './items/confucius-goed-mens';
import franklinGewoontes from './items/franklin-gewoontes';
import gandhiVerzet from './items/gandhi-verzet';
import kantLiegen from './items/kant-liegen';
import laoziWuwei from './items/laozi-wuwei';
import montaigneZelfkennis from './items/montaigne-zelfkennis';
import rousseauSmartphone from './items/rousseau-smartphone';
import senecaTijd from './items/seneca-tijd';
import socratesAgora from './items/socrates-agora';
import spinozaEmoties from './items/spinoza-emoties';
import wollstonecraftOnderwijs from './items/wollstonecraft-onderwijs';

export const ALL_EXAMPLE_LECTURES: readonly ExampleLecture[] = [
  socratesAgora,
  aureliusNieuws,
  laoziWuwei,
  kantLiegen,
  franklinGewoontes,
  gandhiVerzet,
  spinozaEmoties,
  rousseauSmartphone,
  senecaTijd,
  confuciusGoedMens,
  montaigneZelfkennis,
  wollstonecraftOnderwijs,
];
