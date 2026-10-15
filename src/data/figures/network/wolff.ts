import { networkFigure } from '../define';

export const wolff = networkFigure({
  id: 'wolff',
  name: 'Christian Wolff',
  shortName: 'Wolff',
  nativeScript: 'latin',
  monogram: 'CW',
  epithet: 'Systeembouwer van de Duitse Verlichting',
  born: 1679,
  died: 1754,
  origin: 'Breslau (Silezië, nu Wrocław in Polen)',
  school: 'Rationalisme; Duitse Verlichting',
  family: 'verlichting',
  theme: { primary: '#30425a' },
  tags: ['rede', 'systeem', 'onderwijs', 'ethiek', 'china', 'vrijheid van denken'],
  bio: 'Christian Wolff maakte van de filosofie van Leibniz een groot en helder systeem, en schreef als een van de eersten filosofie in het Duits; veel Duitse vaktermen komen van hem. In 1721 hield hij in Halle een rede waarin hij de ethiek van Confucius prees als bewijs dat moraal zonder christelijke openbaring mogelijk is. Zijn tegenstanders kregen gedaan dat de koning hem in 1723 op straffe van de strop uit Pruisen verbande.',
  keyConcepts: [
    {
      term: 'Systematisch denken',
      explanation: 'Filosofie als een helder, logisch opgebouwd geheel.',
    },
    {
      term: 'Moraal uit de rede',
      explanation: 'Wat goed is, kun je met de rede inzien, ook zonder openbaring.',
    },
  ],
  keyWorks: [
    { title: 'Vernünfftige Gedancken von Gott, der Welt und der Seele des Menschen', year: '1720' },
    {
      title: 'Oratio de Sinarum philosophia practica',
      year: '1721; gedrukt 1726',
      note: 'De rede over de Chinese ethiek.',
    },
  ],
  lifeEvents: [
    { year: '1679', text: 'Geboren in Breslau.' },
    { year: '1706', text: 'Wordt hoogleraar in Halle, op aanbeveling van Leibniz.' },
    { year: '1721', text: 'Prijst in een openbare rede de praktische filosofie van de Chinezen.' },
    {
      year: '1723',
      text: 'Wordt op straffe van de strop uit Pruisen verbannen en gaat naar Marburg.',
    },
    { year: '1740', text: 'Frederik de Grote haalt hem in ere terug naar Halle.' },
    { year: '1754', text: 'Sterft in Halle.' },
  ],
  voice: {
    register: 'Helder, methodisch en geduldig.',
    method: 'Definieert eerst alle begrippen en bouwt dan stap voor stap op.',
  },
  modernLens:
    'Wolff ziet in de moderne wetenschap zijn ideaal van helder, systematisch denken terug, en vraagt waarom we elkaar niet vaker om definities vragen.',
  network: [
    { id: 'leibniz', relation: 'invloed' },
    { id: 'kant', relation: 'navolger' },
    { id: 'mendelssohn', relation: 'navolger' },
    { id: 'confucius', relation: 'voorbeeld', note: 'prees zijn ethiek in 1721' },
  ],
  helpsWith: ['helder en systematisch denken', 'moraal zonder dogma'],
});
