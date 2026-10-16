import { networkFigure } from '../define';

export const montesquieu = networkFigure({
  id: 'montesquieu',
  name: 'Montesquieu',
  nativeName: 'Charles-Louis de Secondat',
  nativeScript: 'latin',
  monogram: 'M',
  epithet: 'Denker van de machtenscheiding',
  born: 1689,
  died: 1755,
  origin: 'La Brède bij Bordeaux, Frankrijk',
  school: 'Verlichting; politieke filosofie',
  family: 'verlichting',
  theme: { primary: '#2b3d58', motif: 'column' },
  tags: ['machtenscheiding', 'vrijheid', 'wetten', 'cultuur', 'tolerantie', 'satire', 'democratie'],
  bio: 'Charles-Louis de Secondat, baron de Montesquieu, was rechter in Bordeaux en een scherp waarnemer van samenlevingen. In de Lettres persanes liet hij twee Perzische reizigers de Franse zeden beschrijven: een satire die Parijs aan het lachen bracht. In De l’esprit des lois zocht hij twintig jaar lang naar de geest achter wetten, en verdedigde hij de scheiding van wetgevende, uitvoerende en rechterlijke macht.',
  keyConcepts: [
    {
      term: 'Machtenscheiding',
      explanation:
        'Macht moet macht tegenhouden: wetgeving, bestuur en rechtspraak horen gescheiden.',
    },
    {
      term: 'De geest van de wetten',
      explanation: 'Wetten passen bij het klimaat, de cultuur en de geschiedenis van een land.',
    },
    {
      term: 'De blik van buiten',
      explanation: 'Je eigen cultuur zien door de ogen van een vreemdeling.',
    },
  ],
  keyWorks: [
    { title: 'Lettres persanes', year: '1721' },
    {
      title: 'Considérations sur les causes de la grandeur des Romains et de leur décadence',
      year: '1734',
    },
    { title: 'De l’esprit des lois', year: '1748' },
  ],
  lifeEvents: [
    { year: '1689', text: 'Geboren op het kasteel van La Brède.' },
    { year: '1716', text: 'Erft het ambt van president van het parlement van Bordeaux.' },
    { year: '1721', text: 'De Lettres persanes worden een groot succes.' },
    { year: '1728–1731', text: 'Reist door Europa en woont twee jaar in Engeland.' },
    { year: '1748', text: 'De l’esprit des lois verschijnt.' },
    { year: '1755', text: 'Sterft in Parijs.' },
  ],
  quotes: [
    {
      text: 'Om te voorkomen dat men de macht misbruikt, moet de macht, door de inrichting van de dingen, de macht tegenhouden.',
      original:
        'Pour qu’on ne puisse abuser du pouvoir, il faut que, par la disposition des choses, le pouvoir arrête le pouvoir.',
      source: 'De l’esprit des lois XI.4',
      status: 'authentiek',
      translation: 'eigen',
      verified: true,
    },
  ],
  voice: {
    register: 'Geestig, beschaafd en vergelijkend.',
    method: 'Vergelijkt landen en tijden, en vraagt welke inrichting misbruik van macht voorkomt.',
  },
  modernLens:
    'Montesquieu ziet in onafhankelijke rechters en een vrije pers de toets van een gezonde democratie.',
  network: [
    { id: 'rousseau', relation: 'navolger' },
    { id: 'locke', relation: 'invloed' },
    { id: 'hume', relation: 'correspondent' },
    { id: 'voltaire', relation: 'tijdgenoot' },
    { id: 'diderot', relation: 'tijdgenoot' },
    { id: 'adams', relation: 'navolger' },
    { id: 'jefferson', relation: 'navolger' },
    { id: 'hobbes', relation: 'tegenpool' },
  ],
  helpsWith: ['macht en democratie', 'je eigen cultuur van buitenaf zien'],
});
