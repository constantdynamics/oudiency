import { networkFigure } from '../define';

export const zeno = networkFigure({
  id: 'zeno',
  name: 'Zeno van Citium',
  shortName: 'Zeno',
  nativeName: 'Ζήνων ὁ Κιτιεύς',
  nativeScript: 'greek',
  monogram: 'Z',
  epithet: 'Grondlegger van de Stoa',
  born: -334,
  died: -262,
  approximate: true,
  displayYears: 'ca. 334–262 v.Chr.',
  origin: 'Kition (Cyprus)',
  school: 'Stoa',
  family: 'grieks',
  theme: { primary: '#3b5262', motif: 'column' },
  tags: ['stoicisme', 'deugd', 'natuur', 'kalmte', 'rede', 'luisteren'],
  bio: 'Zeno was een koopman uit Kition op Cyprus die na een schipbreuk in Athene belandde. In een boekwinkel las hij over Socrates en vroeg hij waar hij zo’n man kon vinden; de verkoper wees op de cynicus Crates, die net voorbijliep. Na jaren studie begon Zeno zelf te onderwijzen in de Stoa Poikile, de "beschilderde zuilengang", waaraan de Stoa haar naam dankt.',
  keyConcepts: [
    {
      term: 'Leven in overeenstemming met de natuur',
      native: 'ὁμολογουμένως τῇ φύσει ζῆν',
      explanation:
        'Het doel van het leven: leven volgens de rede die in de natuur en in jezelf werkt.',
    },
    {
      term: 'Deugd als enige goed',
      explanation: 'Alleen een goed karakter is werkelijk goed; al het andere is bijzaak.',
    },
    {
      term: 'Onverschillige zaken',
      native: 'ἀδιάφορα',
      explanation:
        'Gezondheid, rijkdom en roem zijn op zich niet goed of slecht; het gaat om wat je ermee doet.',
    },
  ],
  keyWorks: [
    { title: 'Politeia (De staat)', note: 'Verloren; bekend uit citaten bij latere schrijvers.' },
  ],
  lifeEvents: [
    { year: 'ca. 334 v.Chr.', text: 'Geboren in Kition op Cyprus.' },
    {
      year: 'ca. 312 v.Chr.',
      text: 'Lijdt schipbreuk, komt in Athene terecht en wordt leerling van de cynicus Crates.',
    },
    { year: 'ca. 300 v.Chr.', text: 'Begint te onderwijzen in de Stoa Poikile.' },
    { year: 'ca. 262 v.Chr.', text: 'Sterft in Athene; de stad eert hem met een gouden krans.' },
  ],
  quotes: [
    {
      text: 'We hebben twee oren en één mond, zodat we meer luisteren en minder praten.',
      source: 'Diogenes Laërtius VII.23',
      status: 'toegeschreven',
      translation: 'eigen',
      verified: true,
      note: 'Als uitspraak van Zeno overgeleverd door Diogenes Laërtius.',
    },
    {
      text: 'Het doel is in overeenstemming met de natuur te leven.',
      source: 'Diogenes Laërtius VII.87',
      status: 'toegeschreven',
      translation: 'eigen',
      verified: true,
      note: 'Volgens Diogenes Laërtius Zeno’s eigen formulering, uit zijn verloren boek over de natuur van de mens.',
    },
  ],
  voice: {
    register: 'Sober en kort van stof; streng maar rechtvaardig.',
    method: 'Brengt alles terug tot de vraag: is dit deugdzaam, en ligt het in lijn met de natuur?',
  },
  modernLens:
    'Zeno zou ons aanraden de telefoon even weg te leggen en twee keer zoveel te luisteren als we praten.',
  network: [
    { id: 'socrates', relation: 'voorbeeld' },
    { id: 'xenophon', relation: 'invloed' },
    { id: 'diogenes', relation: 'invloed' },
    { id: 'heraclitus', relation: 'invloed' },
    { id: 'chrysippus', relation: 'navolger' },
    { id: 'epictetus', relation: 'navolger' },
    { id: 'seneca', relation: 'navolger' },
    { id: 'aurelius', relation: 'navolger' },
    { id: 'musonius', relation: 'navolger' },
  ],
  helpsWith: ['kalm blijven', 'beter luisteren'],
});
