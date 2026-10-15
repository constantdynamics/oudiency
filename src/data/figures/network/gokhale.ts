import { networkFigure } from '../define';

export const gokhale = networkFigure({
  id: 'gokhale',
  name: 'Gopal Krishna Gokhale',
  shortName: 'Gokhale',
  nativeScript: 'latin',
  monogram: 'GG',
  epithet: 'Politieke mentor van Gandhi',
  born: 1866,
  died: 1915,
  origin: 'Kotluk (Maharashtra, Brits-Indië)',
  school: 'Gematigd nationalisme; sociale hervorming',
  family: 'indiaas',
  tags: ['dienstbaarheid', 'politiek', 'onderwijs', 'hervorming', 'gematigdheid'],
  bio: 'Gopal Krishna Gokhale was een leraar en politicus die streed voor hervormingen in Brits-Indië, via onderwijs, debat en zelfopoffering. In 1905 richtte hij de Servants of India Society op, waarvan de leden beloofden hun leven aan het land te wijden. Gandhi noemde hem zijn politieke leermeester; Gokhale raadde hem aan na zijn terugkeer eerst een jaar door India te reizen voor hij politiek ging bedrijven.',
  keyConcepts: [
    { term: 'Politiek als dienst', explanation: 'Politiek "vergeestelijken": dienen in plaats van macht verwerven.' },
    { term: 'Geduldige hervorming', explanation: 'Verandering via kennis, overleg en persoonlijke offers.' },
  ],
  keyWorks: [{ title: 'Speeches of the Honourable Mr. G. K. Gokhale', year: '1908' }],
  lifeEvents: [
    { year: '1866', text: 'Geboren in Kotluk.' },
    { year: '1889', text: 'Wordt lid van het Indian National Congress.' },
    { year: '1905', text: 'Wordt voorzitter van het Congress en sticht de Servants of India Society.' },
    { year: '1912', text: 'Bezoekt Gandhi in Zuid-Afrika.' },
    { year: '1915', text: 'Sterft in Pune.' },
  ],
  voice: {
    register: 'Bescheiden, zorgvuldig en principieel.',
    method: 'Zoekt hervorming via kennis, overleg en persoonlijke offers.',
  },
  modernLens:
    'Gokhale houdt politici voor dat politiek dienstbaarheid is, en raadt jonge idealisten aan eerst het land en zijn mensen te leren kennen.',
  network: [
    { id: 'gandhi', relation: 'protegé' },
    { id: 'naoroji', relation: 'voorbeeld' },
    { id: 'besant', relation: 'tijdgenoot' },
  ],
  helpsWith: ['politiek als dienstbaarheid', 'geduldig hervormen'],
});
