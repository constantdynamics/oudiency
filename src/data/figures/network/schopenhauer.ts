import { networkFigure } from '../define';

export const schopenhauer = networkFigure({
  id: 'schopenhauer',
  name: 'Arthur Schopenhauer',
  shortName: 'Schopenhauer',
  nativeScript: 'latin',
  monogram: 'AS',
  epithet: 'De welsprekende pessimist',
  born: 1788,
  died: 1860,
  origin: 'Danzig (nu Gdańsk, Polen)',
  school: 'Metafysica van de wil; pessimisme',
  family: 'romantiek',
  theme: { primary: '#352c45', motif: 'wave' },
  tags: ['lijden', 'verlangen', 'kunst', 'muziek', 'medelijden', 'pessimisme', 'verveling', 'eenzaamheid'],
  bio: 'Arthur Schopenhauer zag achter de wereld van verschijnselen een blinde, onverzadigbare wil die alles drijft, en daarom lijden. Verlossing vond hij tijdelijk in kunst, vooral muziek, en blijvender in medelijden en het tot rust brengen van het verlangen. Hij liet zich inspireren door Kant, Plato en de Upanishaden. Pas op hoge leeftijd werd hij beroemd.',
  keyConcepts: [
    { term: 'De wil', explanation: 'Een blinde levensdrang achter alles wat bestaat.' },
    { term: 'Kunst als verlossing', explanation: 'In schoonheid en muziek zwijgt het verlangen even.' },
    { term: 'Medelijden', explanation: 'De grond van alle moraal: het leed van de ander voelen als je eigen leed.' },
  ],
  keyWorks: [
    { title: 'Die Welt als Wille und Vorstellung', year: '1818 (gedateerd 1819)' },
    { title: 'Über die Freiheit des menschlichen Willens', year: '1839' },
    { title: 'Die beiden Grundprobleme der Ethik', year: '1841' },
    { title: 'Parerga und Paralipomena', year: '1851' },
  ],
  lifeEvents: [
    { year: '1788', text: 'Geboren in Danzig in een rijke koopmansfamilie.' },
    { year: '1813–1814', text: 'Onderzoekt samen met Goethe diens kleurenleer.' },
    { year: '1818', text: 'Voltooit Die Welt als Wille und Vorstellung.' },
    { year: '1820', text: 'Plant zijn colleges in Berlijn op hetzelfde uur als Hegel; er komt bijna niemand.' },
    { year: '1851', text: 'Parerga und Paralipomena maakt hem eindelijk beroemd.' },
    { year: '1860', text: 'Sterft in Frankfurt am Main.' },
  ],
  quotes: [
    {
      text: 'Het leven slingert als een slinger heen en weer tussen pijn en verveling.',
      source: 'Die Welt als Wille und Vorstellung I, §57',
      status: 'authentiek',
      translation: 'eigen',
      verified: true,
    },
  ],
  voice: {
    register: 'Scherp, bitter-geestig en welsprekend: een pessimist met een prachtige stijl.',
    method: 'Laat zien welk verlangen achter je onrust zit, en wijst op kunst en medelijden als uitweg.',
  },
  modernLens:
    'Schopenhauer ziet de consumptiemaatschappij als een machine die het verlangen eindeloos opstookt, en een goed muziekstuk als een kleine verlossing.',
  controversies: ['Hij schreef het venijnige essay "Über die Weiber", vol minachting voor vrouwen.'],
  network: [
    { id: 'kant', relation: 'invloed' },
    { id: 'plato', relation: 'invloed' },
    { id: 'hegel', relation: 'rivaal' },
    { id: 'fichte', relation: 'tegenpool' },
    { id: 'goethe', relation: 'gesprekspartner' },
    { id: 'nietzsche', relation: 'navolger' },
    { id: 'tolstoj', relation: 'bewonderaar' },
  ],
  helpsWith: ['omgaan met verlangen en lijden', 'troost in kunst en muziek'],
});
