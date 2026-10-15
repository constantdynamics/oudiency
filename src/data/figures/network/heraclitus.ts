import { networkFigure } from '../define';

export const heraclitus = networkFigure({
  id: 'heraclitus',
  name: 'Heraclitus',
  nativeName: 'Ἡράκλειτος',
  nativeScript: 'greek',
  epithet: 'De duistere van Efeze',
  born: -535,
  died: -475,
  approximate: true,
  displayYears: 'ca. 535–475 v.Chr.',
  origin: 'Efeze (Ionië)',
  school: 'Presocratische filosofie',
  family: 'grieks',
  theme: { primary: '#5b3420', accent: '#c46a2b', motif: 'flame' },
  tags: ['verandering', 'tegenstellingen', 'logos', 'vuur', 'karakter', 'eenzaamheid'],
  bio: 'Heraclitus van Efeze schreef één boek, waarvan alleen losse, raadselachtige fragmenten bewaard zijn. Al in de oudheid heette hij "de duistere". Hij zag de wereld als een eeuwig levend vuur in voortdurende verandering, bijeengehouden door een verborgen orde, de logos, waarin tegenstellingen samenhangen.',
  keyConcepts: [
    { term: 'Logos', native: 'λόγος', explanation: 'De verborgen orde die alles verbindt.' },
    {
      term: 'Eenheid van tegendelen',
      explanation: 'Dag en nacht, oorlog en vrede: het een bestaat niet zonder het ander.',
    },
    { term: 'Vuur', explanation: 'Het oerelement, altijd in beweging, altijd veranderend.' },
  ],
  keyWorks: [
    { title: 'Fragmenten', note: 'Ongeveer 130 fragmenten, bewaard als citaten bij latere schrijvers.' },
  ],
  lifeEvents: [
    { year: 'ca. 535 v.Chr.', text: 'Geboren in een aanzienlijke familie in Efeze.' },
    { year: 'onbekend', text: 'Staat volgens de overlevering zijn erfelijke koningstitel af aan zijn broer.' },
    { year: 'onbekend', text: 'Legt zijn boek neer in de tempel van Artemis in Efeze.' },
    { year: 'ca. 475 v.Chr.', text: 'Sterft.' },
  ],
  quotes: [
    {
      text: 'Op wie in dezelfde rivieren stappen, stromen steeds andere wateren toe.',
      source: 'Fragment DK 22 B12',
      status: 'authentiek',
      translation: 'eigen',
      verified: true,
    },
    {
      text: 'Karakter is voor de mens zijn lot.',
      original: 'ἦθος ἀνθρώπῳ δαίμων',
      source: 'Fragment DK 22 B119',
      status: 'authentiek',
      translation: 'eigen',
      verified: true,
    },
    {
      text: 'Alles stroomt.',
      original: 'πάντα ῥεῖ',
      source: 'Latere samenvatting van zijn leer',
      status: 'parafrase',
      translation: 'eigen',
      verified: true,
      note: 'De beroemde samenvatting komt niet letterlijk in de fragmenten voor.',
    },
  ],
  voice: {
    register: 'Kort, raadselachtig en orakelachtig; een tikje hooghartig.',
    method: 'Spreekt in paradoxen en laat de ander zelf de samenhang vinden.',
  },
  modernLens:
    'Heraclitus ziet in onze snel veranderende wereld vooral bevestiging: alles stroomt, en wie stilstand eist, vecht tegen de rivier.',
  network: [
    { id: 'socrates', relation: 'bewonderaar', note: 'las zijn boek volgens de overlevering' },
    { id: 'plato', relation: 'navolger' },
    { id: 'zeno', relation: 'navolger' },
    { id: 'aurelius', relation: 'bewonderaar' },
    { id: 'hegel', relation: 'bewonderaar' },
    { id: 'nietzsche', relation: 'bewonderaar' },
    { id: 'laozi', relation: 'geestverwant', note: 'vergelijkende filosofie' },
  ],
  helpsWith: ['omgaan met verandering', 'tegenstellingen verdragen'],
});
