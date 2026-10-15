import { networkFigure } from '../define';

export const plutarchus = networkFigure({
  id: 'plutarchus',
  name: 'Plutarchus',
  nativeName: 'Πλούταρχος',
  nativeScript: 'greek',
  epithet: 'Biograaf en moralist',
  born: 46,
  died: 120,
  approximate: true,
  displayYears: 'ca. 46–120',
  origin: 'Chaeronea (Boeotië, Griekenland)',
  school: 'Platonisme',
  family: 'grieks',
  theme: { primary: '#43504a', motif: 'scroll' },
  tags: ['karakter', 'geschiedenis', 'leiderschap', 'opvoeding', 'luisteren', 'vriendschap', 'woede'],
  bio: 'Plutarchus was een Griekse schrijver en priester van Apollo in Delphi, in de tijd van het Romeinse rijk. Zijn Parallelle levens zetten telkens een Griekse en een Romeinse beroemdheid naast elkaar, om te laten zien hoe karakter het verschil maakt. Zijn morele essays, de Moralia, gaan over alledaagse deugden: luisteren, vriendschap, woede beheersen. Eeuwenlang was hij een van de meest gelezen schrijvers van Europa.',
  keyConcepts: [
    {
      term: 'Karakter in kleine dingen',
      explanation: 'Een grap of een terloops woord zegt soms meer over iemand dan een gewonnen veldslag.',
    },
    {
      term: 'Vergelijkende levens',
      explanation: 'Door twee levens naast elkaar te leggen, zie je beter wat deugd en ondeugd is.',
    },
  ],
  keyWorks: [
    { title: 'Parallelle levens' },
    { title: 'Moralia' },
    { title: 'Over het luisteren', note: 'Onderdeel van de Moralia.' },
  ],
  lifeEvents: [
    { year: 'ca. 46', text: 'Geboren in Chaeronea.' },
    { year: 'ca. 66', text: 'Studeert in Athene filosofie bij de platonist Ammonios.' },
    { year: 'ca. 95', text: 'Wordt priester in het heiligdom van Apollo in Delphi.' },
    { year: 'ca. 120', text: 'Sterft.' },
  ],
  quotes: [
    {
      text: 'De geest hoeft niet gevuld te worden zoals een fles, maar heeft, zoals hout, een vonk nodig die hem aanzet om zelf te denken.',
      source: 'Over het luisteren (Moralia 48c)',
      status: 'authentiek',
      translation: 'eigen',
      verified: true,
    },
    {
      text: 'De geest is geen vat dat gevuld moet worden, maar een vuur dat ontstoken moet worden.',
      source: 'Populaire samenvatting van Over het luisteren (Moralia 48c)',
      status: 'parafrase',
      translation: 'eigen',
      verified: true,
      note: 'Zo staat het niet letterlijk bij Plutarchus; zie het citaat hierboven.',
    },
  ],
  voice: {
    register: 'Vriendelijk, verhalend en wijs; houdt van anekdotes.',
    method: 'Leert door levens te vertellen en naast elkaar te leggen.',
  },
  modernLens:
    'Plutarchus zou in biografieën en podcasts over beroemde mensen zijn eigen genre herkennen, en vragen niet naar hun successen te kijken, maar naar hun karakter.',
  network: [
    { id: 'plato', relation: 'voorbeeld' },
    { id: 'socrates', relation: 'voorbeeld' },
    { id: 'chrysippus', relation: 'tegenpool' },
    { id: 'montaigne', relation: 'navolger' },
    { id: 'rousseau', relation: 'navolger' },
  ],
  helpsWith: ['leren van levens van anderen', 'karakter en leiderschap'],
});
