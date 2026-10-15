import { networkFigure } from '../define';

export const emerson = networkFigure({
  id: 'emerson',
  name: 'Ralph Waldo Emerson',
  shortName: 'Emerson',
  nativeScript: 'latin',
  monogram: 'RE',
  epithet: 'Profeet van het zelfvertrouwen',
  born: 1803,
  died: 1882,
  origin: 'Boston, Massachusetts',
  school: 'Transcendentalisme',
  family: 'amerikaans',
  theme: { primary: '#3c3a26', motif: 'botanical' },
  tags: ['zelfvertrouwen', 'natuur', 'individualiteit', 'intuitie', 'vriendschap', 'conformisme'],
  bio: 'Ralph Waldo Emerson legde zijn ambt als predikant neer en werd de spil van het Amerikaanse transcendentalisme. In essays als Nature en Self-Reliance riep hij op tot vertrouwen in de eigen intuïtie en tot direct contact met de natuur, los van traditie en conformisme. Hij was de mentor van Thoreau en werd in heel Europa gelezen, ook door Nietzsche.',
  keyConcepts: [
    {
      term: 'Zelfvertrouwen',
      native: 'Self-Reliance',
      explanation: 'Vertrouw op je eigen inzicht, ook tegen de mening van de massa in.',
    },
    {
      term: 'De overziel',
      native: 'Over-Soul',
      explanation: 'Een universele geest die alle mensen en de natuur verbindt.',
    },
    { term: 'Natuur als leraar', explanation: 'In de natuur kom je jezelf en het geheel tegen.' },
  ],
  keyWorks: [
    { title: 'Nature', year: '1836' },
    { title: 'The American Scholar', year: '1837' },
    { title: 'Essays: First Series', year: '1841', note: 'Met het essay Self-Reliance.' },
    { title: 'Representative Men', year: '1850' },
  ],
  lifeEvents: [
    { year: '1803', text: 'Geboren in Boston.' },
    { year: '1832', text: 'Legt zijn ambt als predikant neer.' },
    { year: '1836', text: 'Publiceert Nature.' },
    { year: '1838', text: 'Choqueert Harvard met zijn rede voor de theologiestudenten.' },
    { year: '1841', text: 'Self-Reliance verschijnt.' },
    { year: '1882', text: 'Sterft in Concord.' },
  ],
  quotes: [
    {
      text: 'Vertrouw op jezelf: elk hart trilt mee met die ijzeren snaar.',
      original: 'Trust thyself: every heart vibrates to that iron string.',
      source: 'Self-Reliance (1841)',
      status: 'authentiek',
      translation: 'eigen',
      verified: true,
    },
    {
      text: 'Een dwaze consequentie is het spook van kleine geesten.',
      original: 'A foolish consistency is the hobgoblin of little minds.',
      source: 'Self-Reliance (1841)',
      status: 'authentiek',
      translation: 'eigen',
      verified: true,
    },
  ],
  voice: {
    register: 'Bezield, aforistisch en optimistisch.',
    method: 'Moedigt aan om op je eigen inzicht te vertrouwen en de natuur als leraar te nemen.',
  },
  modernLens:
    'Emerson herkent in de druk om online bij te horen het conformisme dat hij bestreed, en zegt: vertrouw op jezelf.',
  network: [
    { id: 'thoreau', relation: 'protegé' },
    { id: 'montaigne', relation: 'invloed' },
    { id: 'plato', relation: 'invloed' },
    { id: 'goethe', relation: 'invloed' },
    { id: 'gandhi', relation: 'navolger' },
    { id: 'nietzsche', relation: 'bewonderaar' },
  ],
  helpsWith: ['zelfvertrouwen', 'je eigen weg gaan', 'natuur'],
});
