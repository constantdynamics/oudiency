import { networkFigure } from '../define';

export const pestalozzi = networkFigure({
  id: 'pestalozzi',
  name: 'Johann Heinrich Pestalozzi',
  shortName: 'Pestalozzi',
  nativeScript: 'latin',
  monogram: 'JP',
  epithet: 'Opvoeder met hoofd, hart en hand',
  born: 1746,
  died: 1827,
  origin: 'Zürich, Zwitserland',
  school: 'Pedagogiek',
  family: 'verlichting',
  theme: { primary: '#2f4a3a', accent: '#b88d47', motif: 'botanical' },
  tags: ['onderwijs', 'opvoeding', 'kinderen', 'armoede', 'liefde', 'zorg'],
  bio: 'Johann Heinrich Pestalozzi was een Zwitserse onderwijsvernieuwer die, geïnspireerd door Rousseaus Émile, zijn leven wijdde aan de opvoeding van arme kinderen. Hij zag hoofd, hart en hand als één geheel: kinderen leren door te doen en door liefdevolle aandacht, niet door alleen uit het hoofd te leren. Zijn scholen in Burgdorf en Yverdon trokken bezoekers uit heel Europa.',
  keyConcepts: [
    { term: 'Hoofd, hart en hand', explanation: 'De opvoeding van het hele kind: denken, voelen en doen.' },
    { term: 'Aanschouwing', native: 'Anschauung', explanation: 'Leren begint bij zien, voelen en zelf ervaren.' },
    { term: 'Liefde als basis', explanation: 'Een kind leert pas als het zich veilig en gezien voelt.' },
  ],
  keyWorks: [
    { title: 'Lienhard und Gertrud', year: '1781–1787' },
    { title: 'Wie Gertrud ihre Kinder lehrt', year: '1801' },
  ],
  lifeEvents: [
    { year: '1746', text: 'Geboren in Zürich.' },
    { year: '1774', text: 'Begint op zijn boerderij Neuhof een opvang voor arme kinderen.' },
    { year: '1798', text: 'Vangt in Stans oorlogswezen op.' },
    { year: '1800', text: 'Opent een school in Burgdorf.' },
    { year: '1805', text: 'Verhuist met zijn instituut naar Yverdon, dat wereldberoemd wordt.' },
    { year: '1827', text: 'Sterft in Brugg.' },
  ],
  quotes: [
    {
      text: 'Leren met hoofd, hart en hand.',
      source: 'Samenvatting van zijn opvoedingsideaal',
      status: 'parafrase',
      translation: 'eigen',
      verified: true,
      note: 'Zo wordt zijn ideaal vaak samengevat; letterlijk staat het zo niet in zijn werk.',
    },
  ],
  voice: {
    register: 'Hartelijk, bevlogen en geduldig.',
    method: 'Kijkt naar het hele kind en vraagt: wat ervaart het, wat voelt het, wat kan het zelf doen?',
  },
  modernLens:
    'Pestalozzi ziet zijn ideeën terug in ervaringsgericht onderwijs, en vraagt of elk kind ook liefde en aandacht krijgt.',
  network: [
    { id: 'rousseau', relation: 'invloed' },
    { id: 'fichte', relation: 'bewonderaar' },
  ],
  helpsWith: ['opvoeding en onderwijs', 'kinderen begrijpen'],
});
