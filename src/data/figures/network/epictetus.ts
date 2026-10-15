import { networkFigure } from '../define';

export const epictetus = networkFigure({
  id: 'epictetus',
  name: 'Epictetus',
  nativeName: 'Ἐπίκτητος',
  nativeScript: 'greek',
  epithet: 'Van slaaf tot leraar van de vrijheid',
  born: 50,
  died: 135,
  approximate: true,
  displayYears: 'ca. 50–135',
  origin: 'Hiërapolis (Frygië, in het huidige Turkije)',
  school: 'Stoa',
  family: 'romeins',
  theme: { primary: '#5e2f22', motif: 'column', displayFont: 'cormorant' },
  tags: [
    'stoicisme',
    'vrijheid',
    'controle',
    'angst',
    'tegenslag',
    'oordelen',
    'veerkracht',
    'piekeren',
  ],
  bio: 'Epictetus werd als slaaf geboren en diende in Rome een secretaris van keizer Nero. Hij mocht lessen volgen bij de stoïcijn Musonius Rufus en werd later vrijgelaten. Toen keizer Domitianus de filosofen uit Rome verbande, stichtte hij een school in Nicopolis in Griekenland. Zijn leerling Arrianus schreef zijn lessen op; het Handboekje daaruit is tot vandaag een gids voor wie wil leren onderscheiden wat wel en niet in zijn macht ligt.',
  keyConcepts: [
    {
      term: 'Wat in onze macht ligt',
      native: 'τὰ ἐφ’ ἡμῖν',
      explanation:
        'Onze oordelen, verlangens en keuzes zijn van ons; ons lichaam, bezit en aanzien niet.',
    },
    {
      term: 'Morele keuze',
      native: 'προαίρεσις',
      explanation:
        'Het vermogen om te kiezen hoe je oordeelt en handelt: het enige wat echt van jou is.',
    },
    {
      term: 'Oordelen',
      native: 'δόγματα',
      explanation: 'Niet de dingen, maar onze oordelen erover maken ons onrustig.',
    },
  ],
  keyWorks: [
    { title: 'Handboekje (Enchiridion)', note: 'Opgetekend door zijn leerling Arrianus.' },
    { title: 'Diatriben (Gesprekken)', note: 'Opgetekend door Arrianus.' },
  ],
  lifeEvents: [
    { year: 'ca. 50', text: 'Geboren in Hiërapolis, als slaaf.' },
    {
      year: 'jaren 60–90',
      text: 'Is in Rome slaaf van Epaphroditos, secretaris van Nero, en volgt lessen bij Musonius Rufus.',
    },
    {
      year: 'ca. 93',
      text: 'Keizer Domitianus verbant de filosofen uit Rome; Epictetus begint een school in Nicopolis.',
    },
    { year: 'ca. 135', text: 'Sterft in Nicopolis.' },
  ],
  quotes: [
    {
      text: 'Sommige dingen liggen in onze macht, andere niet.',
      original: 'Τῶν ὄντων τὰ μέν ἐστιν ἐφ’ ἡμῖν, τὰ δὲ οὐκ ἐφ’ ἡμῖν.',
      source: 'Handboekje 1',
      status: 'authentiek',
      translation: 'eigen',
      verified: true,
    },
    {
      text: 'Niet de dingen zelf verontrusten de mensen, maar hun oordelen over de dingen.',
      original: 'Ταράσσει τοὺς ἀνθρώπους οὐ τὰ πράγματα, ἀλλὰ τὰ περὶ τῶν πραγμάτων δόγματα.',
      source: 'Handboekje 5',
      status: 'authentiek',
      translation: 'eigen',
      verified: true,
    },
    {
      text: 'Verlang niet dat wat gebeurt, gebeurt zoals jij wilt, maar wil dat het gebeurt zoals het gebeurt, en het zal je goed gaan.',
      source: 'Handboekje 8',
      status: 'authentiek',
      translation: 'eigen',
      verified: true,
    },
  ],
  voice: {
    register: 'Direct, streng en vaak grappig: een leraar die zijn leerlingen wakker schudt.',
    method:
      'Onderscheidt steeds wat wel en niet in je macht ligt, en vraagt dan: wat ga je doen met wat wél van jou is?',
  },
  modernLens:
    'Epictetus herkent onze stress over de meningen van anderen, het nieuws en algoritmes als het oude probleem: we hechten ons aan wat niet van ons is.',
  controversies: [
    'Zijn strenge raad over verdriet (als je je kind kust, zeg dan in jezelf dat je een sterfelijk wezen kust) vinden velen kil.',
  ],
  network: [
    { id: 'musonius', relation: 'leraar' },
    { id: 'socrates', relation: 'voorbeeld' },
    { id: 'diogenes', relation: 'voorbeeld' },
    { id: 'zeno', relation: 'invloed' },
    { id: 'chrysippus', relation: 'invloed' },
    { id: 'seneca', relation: 'geestverwant' },
    { id: 'aurelius', relation: 'navolger' },
    { id: 'rusticus', relation: 'bewonderaar', note: 'gaf Marcus Aurelius zijn lessen te lezen' },
  ],
  helpsWith: [
    'onderscheiden wat in je macht ligt',
    'angst en piekeren',
    'vrijheid in moeilijke omstandigheden',
  ],
});
