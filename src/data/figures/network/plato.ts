import { networkFigure } from '../define';

export const plato = networkFigure({
  id: 'plato',
  name: 'Plato',
  nativeName: 'Πλάτων',
  nativeScript: 'greek',
  epithet: 'Stichter van de Academie',
  born: -428,
  died: -348,
  approximate: true,
  displayYears: 'ca. 428–348 v.Chr.',
  origin: 'Athene',
  school: 'Platonisme',
  family: 'grieks',
  tags: ['ideeën', 'rechtvaardigheid', 'politiek', 'onderwijs', 'liefde', 'ziel', 'waarheid', 'schijn'],
  bio: 'Plato was de leerling van Socrates en schreef de dialogen waarin zijn leraar de hoofdrol speelt. Na de terechtstelling van Socrates reisde hij rond en stichtte hij rond 387 v.Chr. de Academie in Athene, een van de eerste scholen voor hoger onderwijs in Europa. In werken als de Staat en het Symposion ontwikkelde hij de ideeënleer: achter de veranderlijke wereld die we zien, ligt een wereld van onveranderlijke vormen.',
  keyConcepts: [
    {
      term: 'Ideeënleer',
      native: 'ἰδέα',
      explanation: 'De ware werkelijkheid bestaat uit onveranderlijke vormen, zoals het Goede en het Schone.',
    },
    {
      term: 'De grot',
      explanation:
        'Een allegorie (Staat, boek VII): gevangenen houden schaduwen op de wand voor de werkelijkheid, tot er één naar buiten gaat.',
    },
    {
      term: 'De filosoof-koning',
      explanation: 'Een staat wordt pas rechtvaardig als filosofen regeren of regeerders gaan filosoferen.',
    },
    {
      term: 'Leren is herinneren',
      native: 'ἀνάμνησις',
      explanation: 'De ziel kent de waarheid al; leren is haar weer naar boven halen (Menon, Faidon).',
    },
  ],
  keyWorks: [
    { title: 'Apologie' },
    { title: 'Menon' },
    { title: 'Symposion' },
    { title: 'Faidon' },
    { title: 'Staat (Politeia)' },
    { title: 'Wetten (Nomoi)' },
  ],
  lifeEvents: [
    { year: 'ca. 428 v.Chr.', text: 'Geboren in een aristocratische Atheense familie.' },
    { year: '399 v.Chr.', text: 'Maakt mee hoe zijn leraar Socrates wordt veroordeeld; schrijft later diens verdediging, de Apologie.' },
    { year: 'ca. 387 v.Chr.', text: 'Sticht de Academie, bij een heilig bos net buiten Athene.' },
    { year: '367 en 361 v.Chr.', text: 'Reist naar Syracuse om de tiran Dionysios II te adviseren; het loopt op niets uit.' },
    { year: 'ca. 348 v.Chr.', text: 'Sterft in Athene.' },
  ],
  quotes: [
    {
      text: 'Het begin is het belangrijkste deel van elk werk.',
      original: 'ἀρχὴ παντὸς ἔργου μέγιστον',
      source: 'Staat II, 377a',
      status: 'authentiek',
      translation: 'eigen',
      verified: true,
    },
    {
      text: 'Verwondering is wat een filosoof ervaart; er is geen ander begin van de filosofie dan dit.',
      source: 'Theaitetos 155d',
      status: 'authentiek',
      translation: 'eigen',
      verified: true,
    },
    {
      text: 'Tenzij de filosofen koning worden in de steden, of zij die nu koning heten werkelijk gaan filosoferen, komt er geen einde aan de ellende van de steden.',
      source: 'Staat V, 473c–d',
      status: 'authentiek',
      translation: 'eigen',
      verified: true,
    },
  ],
  voice: {
    register: 'Literair en speels-ernstig; vertelt graag mythen en beelden, zoals de grot en de wagenmenner.',
    method: 'Dialoog en mythe: laat stemmen tegen elkaar ingaan en eindigt met een beeld dat blijft hangen.',
  },
  modernLens:
    'Plato zou in onze schermen een nieuwe grot zien: we kijken naar schaduwen op de wand en houden ze voor de werkelijkheid. Hij vraagt wie de beelden maakt, en wat je zou zien als je je omdraait.',
  controversies: [
    'Zijn ideale staat is sterk hiërarchisch, met censuur van dichters en een heersende elite. Denkers als Karl Popper zagen daarin een voorloper van totalitair denken.',
  ],
  network: [
    { id: 'socrates', relation: 'leraar' },
    { id: 'aristoteles', relation: 'leerling' },
    { id: 'xenophon', relation: 'tijdgenoot', note: 'medeleerling van Socrates' },
    { id: 'protagoras', relation: 'tegenpool', note: 'in de dialoog Protagoras' },
    { id: 'heraclitus', relation: 'invloed' },
    { id: 'diogenes', relation: 'rivaal', note: 'spotte met zijn definitie van de mens' },
    { id: 'plutarchus', relation: 'navolger', note: 'platonist' },
  ],
  helpsWith: ['waarheid en schijn', 'rechtvaardigheid en politiek', 'liefde en schoonheid'],
});
