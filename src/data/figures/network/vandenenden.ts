import { networkFigure } from '../define';

export const vandenenden = networkFigure({
  id: 'vandenenden',
  name: 'Franciscus van den Enden',
  shortName: 'Van den Enden',
  nativeScript: 'latin',
  monogram: 'FE',
  epithet: 'Leraar van Spinoza en radicale democraat',
  born: 1602,
  died: 1674,
  origin: 'Antwerpen (Spaanse Nederlanden)',
  school: 'Radicale Verlichting (voorloper)',
  family: 'gouden-eeuw',
  theme: { primary: '#2f4650' },
  tags: ['democratie', 'gelijkheid', 'onderwijs', 'vrijheid', 'radicalisme', 'toneel'],
  bio: 'Franciscus van den Enden was een voormalig jezuïet die in Amsterdam een kunsthandel en een Latijnse school dreef. Hij leerde de jonge Spinoza Latijn en liet zijn leerlingen klassiek toneel spelen. In zijn Vrye Politijke Stellingen (1665) bepleitte hij een radicale democratie van gelijken. In 1674 werd hij in Parijs opgehangen wegens betrokkenheid bij een samenzwering tegen Lodewijk XIV.',
  keyConcepts: [
    {
      term: 'Democratie van gelijken',
      explanation: 'De staat hoort de vrijheid en gelijkheid van alle burgers te dienen.',
    },
    {
      term: 'Onderwijs voor vrijheid',
      explanation: 'Wie leert denken, kan zich niet zomaar laten onderdrukken.',
    },
  ],
  keyWorks: [
    { title: 'Kort Verhael van Nieuw-Nederlants', year: '1662' },
    { title: 'Vrye Politijke Stellingen', year: '1665' },
  ],
  lifeEvents: [
    { year: '1602', text: 'Geboren in Antwerpen.' },
    { year: 'ca. 1645', text: 'Vestigt zich als kunsthandelaar in Amsterdam.' },
    { year: 'ca. 1657', text: 'Leert de jonge Spinoza Latijn.' },
    { year: '1665', text: 'Publiceert de Vrye Politijke Stellingen.' },
    { year: '1671', text: 'Verhuist naar Parijs en opent er een school.' },
    {
      year: '1674',
      text: 'Wordt in Parijs opgehangen na een mislukte samenzwering tegen Lodewijk XIV.',
    },
  ],
  voice: {
    register: 'Bevlogen, eigenzinnig en radicaal.',
    method: 'Vraagt of een staat werkelijk de vrijheid en gelijkheid van alle burgers dient.',
  },
  modernLens:
    'Van den Enden ziet in burgerberaden en directe democratie iets van zijn radicale ideeën terug.',
  network: [
    { id: 'spinoza', relation: 'leerling' },
    { id: 'dewitt', relation: 'tijdgenoot' },
  ],
  helpsWith: ['democratie en gelijkheid'],
});
