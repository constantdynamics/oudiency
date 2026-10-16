import { networkFigure } from '../define';

export const rajchandra = networkFigure({
  id: 'rajchandra',
  name: 'Shrimad Rajchandra',
  shortName: 'Rajchandra',
  nativeScript: 'latin',
  monogram: 'SR',
  epithet: 'Jaïnistische mysticus en juwelier',
  born: 1867,
  died: 1901,
  origin: 'Vavania (Gujarat, Brits-Indië)',
  school: 'Jaïnisme',
  family: 'indiaas',
  theme: { primary: '#5e3a20', accent: '#3b6e57' },
  tags: [
    'zelfkennis',
    'religie',
    'ziel',
    'geweldloosheid',
    'eerlijkheid',
    'spiritualiteit',
    'stilte',
  ],
  bio: 'Shrimad Rajchandra was een jaïnistische dichter, mysticus en juwelier uit Gujarat, beroemd om zijn buitengewone geheugen. Gandhi ontmoette hem in 1891 in Bombay en schreef hem later vanuit Zuid-Afrika brieven vol religieuze vragen. In zijn autobiografie noemt Gandhi hem een van de drie mensen die de diepste indruk op hem maakten, naast Tolstoj en Ruskin.',
  keyConcepts: [
    { term: 'Zelfrealisatie', explanation: 'De eigen ziel leren kennen als het hoogste doel.' },
    {
      term: 'Ahimsa',
      explanation: 'Geweldloosheid tegenover alle levende wezens, zoals het jaïnisme leert.',
    },
  ],
  keyWorks: [{ title: 'Atmasiddhi Shastra', year: '1896' }],
  lifeEvents: [
    { year: '1867', text: 'Geboren in Vavania.' },
    {
      year: 'jaren 1880',
      text: 'Wordt beroemd om zijn geheugenkunsten: hij kon tientallen zaken tegelijk onthouden.',
    },
    { year: '1891', text: 'Ontmoet de jonge Gandhi in Bombay.' },
    { year: '1896', text: 'Schrijft in één nacht de Atmasiddhi Shastra, volgens de overlevering.' },
    { year: '1901', text: 'Sterft op 33-jarige leeftijd.' },
  ],
  voice: {
    register: 'Ingetogen, diep en geduldig.',
    method:
      'Beantwoordt vragen met vragen over de ziel, en wijst op eerlijkheid in de kleinste zaken.',
  },
  modernLens:
    'Rajchandra vraagt midden in de drukte van handel en techniek wanneer je voor het laatst stil was bij jezelf.',
  network: [{ id: 'gandhi', relation: 'protegé' }],
  helpsWith: ['zelfkennis en stilte', 'eerlijkheid in zaken'],
});
