import { networkFigure } from '../define';

export const fichte = networkFigure({
  id: 'fichte',
  name: 'Johann Gottlieb Fichte',
  shortName: 'Fichte',
  nativeScript: 'latin',
  monogram: 'JF',
  epithet: 'Filosoof van het vrije Ik',
  born: 1762,
  died: 1814,
  origin: 'Rammenau (Saksen)',
  school: 'Duits idealisme',
  family: 'verlichting',
  theme: { primary: '#3b3550', motif: 'flame' },
  tags: ['vrijheid', 'zelf', 'plicht', 'onderwijs', 'natie', 'idealisme', 'handelen'],
  bio: 'Johann Gottlieb Fichte was een arme boerenzoon die dankzij een weldoener kon studeren. Zijn eerste boek verscheen in 1792 anoniem en werd voor een werk van Kant gehouden; toen bleek wie de schrijver was, was hij in één klap beroemd. In zijn filosofie staat het vrije, handelende Ik centraal. Later hield hij in het door Napoleon bezette Berlijn zijn omstreden Redevoeringen tot de Duitse natie.',
  keyConcepts: [
    { term: 'Het Ik', explanation: 'Het zelf dat zich in vrij handelen stelt en de wereld tegemoet treedt.' },
    { term: 'Vrijheid als opdracht', explanation: 'Vrijheid bewijs je niet, je oefent haar in de daad.' },
  ],
  keyWorks: [
    { title: 'Versuch einer Critik aller Offenbarung', year: '1792' },
    { title: 'Grundlage der gesammten Wissenschaftslehre', year: '1794' },
    { title: 'Die Bestimmung des Menschen', year: '1800' },
    { title: 'Reden an die deutsche Nation', year: '1808' },
  ],
  lifeEvents: [
    { year: '1762', text: 'Geboren in Rammenau als zoon van een lintwever.' },
    { year: '1791', text: 'Bezoekt Kant in Königsberg.' },
    { year: '1792', text: 'Zijn boek over openbaring wordt voor een werk van Kant gehouden.' },
    { year: '1799', text: 'Moet na beschuldigingen van atheïsme zijn leerstoel in Jena opgeven.' },
    { year: '1811', text: 'Wordt rector van de nieuwe universiteit van Berlijn.' },
    { year: '1814', text: 'Sterft aan tyfus, opgelopen via zijn vrouw die gewonde soldaten verpleegde.' },
  ],
  quotes: [
    {
      text: 'Welke filosofie je kiest, hangt af van wat voor mens je bent.',
      original: 'Was für eine Philosophie man wähle, hängt sonach davon ab, was man für ein Mensch ist.',
      source: 'Erste Einleitung in die Wissenschaftslehre (1797)',
      status: 'authentiek',
      translation: 'eigen',
      verified: true,
    },
  ],
  voice: {
    register: 'Vurig, gedreven en veeleisend.',
    method: 'Daagt de ander uit om zelf te handelen: vrijheid laat je zien in de daad.',
  },
  modernLens:
    'Fichte herkent de moderne nadruk op zelfontplooiing, maar vraagt of we vrijheid ook zien als een plicht tegenover anderen.',
  controversies: [
    'Hij liet zich vijandig uit over joden, en zijn nationalisme werd later misbruikt.',
  ],
  network: [
    { id: 'kant', relation: 'invloed' },
    { id: 'hegel', relation: 'navolger' },
    { id: 'schopenhauer', relation: 'criticus' },
    { id: 'spinoza', relation: 'tegenpool' },
    { id: 'goethe', relation: 'tijdgenoot' },
    { id: 'rousseau', relation: 'invloed' },
    { id: 'pestalozzi', relation: 'voorbeeld' },
  ],
  helpsWith: ['vrijheid en verantwoordelijkheid', 'jezelf vormen door te handelen'],
});
