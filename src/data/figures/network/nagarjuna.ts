import { networkFigure } from '../define';

export const nagarjuna = networkFigure({
  id: 'nagarjuna',
  name: 'Nagarjuna',
  nativeName: 'नागार्जुन',
  nativeScript: 'devanagari',
  monogram: 'N',
  epithet: 'Filosoof van de middenweg en de leegte',
  born: 150,
  died: 250,
  approximate: true,
  displayYears: 'ca. 2e–3e eeuw',
  origin: 'Zuid-India (precieze plaats onzeker)',
  school: 'Madhyamaka (boeddhistische filosofie van de middenweg)',
  family: 'indiaas',
  theme: { primary: '#5a3a1c', accent: '#8a6a2e' },
  tags: ['leegte', 'boeddhisme', 'middenweg', 'logica', 'loslaten', 'verbondenheid'],
  bio: 'Nagarjuna is een van de invloedrijkste boeddhistische filosofen. Hij leefde waarschijnlijk in de tweede of derde eeuw in Zuid-India, maar over zijn leven is weinig zeker. In zijn Fundamentele verzen over de middenweg laat hij met scherpe logica zien dat niets op zichzelf bestaat: alles ontstaat in afhankelijkheid van iets anders. Dat noemt hij leegte.',
  keyConcepts: [
    { term: 'Leegte', native: 'शून्यता', explanation: 'Niets heeft een eigen, onafhankelijk bestaan.' },
    {
      term: 'Afhankelijk ontstaan',
      native: 'प्रतीत्यसमुत्पाद',
      explanation: 'Alles bestaat in relatie tot iets anders.',
    },
    { term: 'Twee waarheden', explanation: 'Een conventionele, alledaagse waarheid en een uiteindelijke waarheid.' },
  ],
  keyWorks: [
    { title: 'Mūlamadhyamakakārikā (Fundamentele verzen over de middenweg)' },
    { title: 'Vigrahavyāvartanī (Het afweren van tegenwerpingen)' },
  ],
  lifeEvents: [
    {
      year: '2e–3e eeuw',
      text: 'Leeft waarschijnlijk in Zuid-India, mogelijk in het rijk van de Satavahana’s.',
    },
    { year: 'onbekend', text: 'Schrijft volgens de overlevering een brief met raad aan een koning, de Brief aan een vriend.' },
    { year: 'latere eeuwen', text: 'Zijn denken verspreidt zich naar Tibet, China en Japan.' },
  ],
  quotes: [
    {
      text: 'Wat afhankelijk ontstaat, dat noemen wij leegte.',
      source: 'Mūlamadhyamakakārikā 24.18',
      status: 'authentiek',
      translation: 'eigen',
      verified: true,
    },
  ],
  voice: {
    register: 'Rustig en messcherp; ontmantelt elke vaste overtuiging, ook zijn eigen.',
    method: 'Laat zien dat elk standpunt, tot het uiterste doorgedacht, zichzelf opheft, en wijst dan op de middenweg.',
  },
  modernLens:
    'Nagarjuna herkent in netwerken en ecosystemen zijn afhankelijk ontstaan, en herinnert ons eraan dat ook ons "ik" geen eiland is.',
  network: [
    { id: 'laozi', relation: 'geestverwant', note: 'vergelijkende filosofie' },
    { id: 'zhuangzi', relation: 'geestverwant', note: 'vergelijkende filosofie' },
  ],
  helpsWith: ['vaste overtuigingen loslaten', 'verbondenheid zien'],
});
