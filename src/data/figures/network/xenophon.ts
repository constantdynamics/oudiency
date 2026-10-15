import { networkFigure } from '../define';

export const xenophon = networkFigure({
  id: 'xenophon',
  name: 'Xenophon',
  nativeName: 'Ξενοφῶν',
  nativeScript: 'greek',
  epithet: 'Soldaat, schrijver en leerling van Socrates',
  born: -430,
  died: -354,
  approximate: true,
  displayYears: 'ca. 430–354 v.Chr.',
  origin: 'Athene',
  school: 'Socratische kring; geschiedschrijving',
  family: 'grieks',
  tags: ['leiderschap', 'oorlog', 'huishouden', 'vriendschap', 'geschiedenis', 'praktische ethiek'],
  bio: 'Xenophon was een Atheense leerling van Socrates, soldaat en schrijver. In 401–400 v.Chr. hielp hij tienduizend Griekse huurlingen door het Perzische rijk terug naar de zee te leiden, en beschreef die tocht in de Anabasis. Later schreef hij zijn eigen herinneringen aan Socrates, nuchterder en praktischer dan die van Plato, en boeken over leiderschap en het beheer van een huishouden.',
  keyConcepts: [
    {
      term: 'Leiden door voorbeeld',
      explanation: 'Een goede leider wint mensen door zorg, rechtvaardigheid en eigen voorbeeld (Cyropaedie).',
    },
    {
      term: 'Oikonomia',
      native: 'οἰκονομία',
      explanation: 'Het goed beheren van een huishouden; ons woord economie komt van zijn titel Oikonomikos.',
    },
  ],
  keyWorks: [
    { title: 'Anabasis', note: 'De tocht van de Tienduizend.' },
    { title: 'Herinneringen aan Socrates (Memorabilia)' },
    { title: 'Cyropaedie (De opvoeding van Cyrus)' },
    { title: 'Oikonomikos' },
  ],
  lifeEvents: [
    { year: 'ca. 430 v.Chr.', text: 'Geboren in Athene.' },
    {
      year: '401 v.Chr.',
      text: 'Trekt als huurling mee met Cyrus de Jongere, die de troon van zijn broer, de Perzische koning, opeist.',
    },
    {
      year: '401–400 v.Chr.',
      text: 'Na de nederlaag bij Cunaxa leidt hij mee de terugtocht van de Tienduizend naar de Zwarte Zee.',
    },
    { year: 'ca. 394 v.Chr.', text: 'Wordt uit Athene verbannen en woont later op een landgoed bij Olympia.' },
    { year: 'ca. 354 v.Chr.', text: 'Sterft.' },
  ],
  quotes: [
    {
      text: 'De zee! De zee!',
      original: 'θάλαττα θάλαττα',
      source: 'Anabasis IV.7.24',
      status: 'authentiek',
      translation: 'eigen',
      verified: true,
      note: 'De kreet van de soldaten wanneer ze na maanden eindelijk de zee zien.',
    },
  ],
  voice: {
    register: 'Nuchter, praktisch en anekdotisch, als een oud-officier.',
    method: 'Vertelt wat hij zag en hoe mensen echt leidinggeven, en trekt daar praktische lessen uit.',
  },
  modernLens:
    'Xenophon zou in managementboeken verre neven van zijn Cyropaedie herkennen, en vragen: zou jij je mensen ook door de woestijn naar de zee kunnen leiden?',
  controversies: ['Hij vocht aan de kant van Sparta tegen zijn eigen stad Athene, wat zijn verbanning verklaart.'],
  network: [
    { id: 'socrates', relation: 'leraar' },
    { id: 'plato', relation: 'tijdgenoot', note: 'medeleerling van Socrates' },
    { id: 'zeno', relation: 'navolger', note: 'las zijn Herinneringen en ging daarna op zoek naar een leraar' },
  ],
  helpsWith: ['leidinggeven in moeilijke tijden', 'praktische ethiek'],
});
