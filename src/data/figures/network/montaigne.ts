import { networkFigure } from '../define';

export const montaigne = networkFigure({
  id: 'montaigne',
  name: 'Michel de Montaigne',
  shortName: 'Montaigne',
  nativeScript: 'latin',
  monogram: 'M',
  epithet: 'Uitvinder van het essay',
  born: 1533,
  died: 1592,
  origin: 'Kasteel Montaigne, Périgord (Frankrijk)',
  school: 'Renaissance-humanisme; scepticisme',
  family: 'renaissance',
  tags: ['twijfel', 'zelfkennis', 'vriendschap', 'dood', 'schrijven', 'gewoontes', 'tolerantie', 'eerlijkheid'],
  bio: 'Michel de Montaigne trok zich op zijn achtendertigste terug in de toren van zijn kasteel om te lezen en na te denken. Daar vond hij een nieuwe vorm uit: het essay, letterlijk een "poging". Hij schreef over vriendschap, angst, kannibalen, duimen en de dood, maar vooral over zichzelf, eerlijk en vol twijfel.',
  keyConcepts: [
    {
      term: 'Het essay',
      native: 'essai',
      explanation: 'Een poging: denken op papier, zonder een sluitende conclusie te hoeven bereiken.',
    },
    { term: 'Que sais-je?', explanation: 'Wat weet ik? Zijn motto van gezonde twijfel.' },
    {
      term: 'Vriendschap',
      explanation: 'Zijn vriendschap met Étienne de La Boétie was zo volkomen dat hij haar niet anders kon verklaren dan: omdat hij het was, omdat ik het was.',
    },
  ],
  keyWorks: [{ title: 'Essais', year: '1580; uitgebreid 1588; postume uitgave 1595' }],
  lifeEvents: [
    { year: '1533', text: 'Geboren op het landgoed Montaigne; als kind leert hij Latijn als eerste taal.' },
    { year: '1563', text: 'Zijn beste vriend Étienne de La Boétie sterft.' },
    { year: '1571', text: 'Trekt zich terug in de bibliotheek in de toren van zijn kasteel om te schrijven.' },
    { year: '1580', text: 'De eerste twee boeken van de Essais verschijnen.' },
    { year: '1581–1585', text: 'Is burgemeester van Bordeaux.' },
    { year: '1592', text: 'Sterft op zijn kasteel.' },
  ],
  quotes: [
    {
      text: 'Ik ben zelf de stof van mijn boek.',
      original: 'je suis moi-même la matière de mon livre',
      source: 'Essais, "Au lecteur"',
      status: 'authentiek',
      translation: 'eigen',
      verified: true,
    },
    {
      text: 'Omdat hij het was, omdat ik het was.',
      original: 'Parce que c’était lui, parce que c’était moi.',
      source: 'Essais I.28, "De l’amitié"',
      status: 'authentiek',
      translation: 'eigen',
      verified: true,
    },
    {
      text: 'Filosoferen is leren sterven.',
      original: 'Que philosopher, c’est apprendre à mourir',
      source: 'Essais I.20 (titel)',
      status: 'authentiek',
      translation: 'eigen',
      verified: true,
      note: 'Montaigne ontleent de gedachte aan Cicero.',
    },
  ],
  voice: {
    register: 'Ontspannen, eerlijk en vol zelfspot; denkt hardop.',
    method: 'Draait een vraag rond, verzamelt voorbeelden uit de klassieken en uit zijn eigen leven, en durft te twijfelen.',
  },
  modernLens:
    'Montaigne zou in blogs en podcasts verre nazaten van zijn essays herkennen, en vragen of we nog durven te twijfelen in plaats van alleen te beweren.',
  network: [
    { id: 'socrates', relation: 'geestverwant' },
    { id: 'seneca', relation: 'invloed' },
    { id: 'plutarchus', relation: 'invloed' },
    { id: 'emerson', relation: 'navolger' },
    { id: 'nietzsche', relation: 'bewonderaar' },
  ],
  helpsWith: ['twijfel omarmen', 'jezelf leren kennen', 'vriendschap'],
});
