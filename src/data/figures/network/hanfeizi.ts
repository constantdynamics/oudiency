import { networkFigure } from '../define';

export const hanfeizi = networkFigure({
  id: 'hanfeizi',
  name: 'Han Feizi',
  shortName: 'Han Fei',
  nativeName: '韓非子',
  nativeScript: 'han',
  monogram: '韓',
  epithet: 'Scherpste denker van het legalisme',
  born: -280,
  died: -233,
  approximate: true,
  displayYears: 'ca. 280–233 v.Chr.',
  origin: 'Staat Han (China)',
  school: 'Legalisme',
  family: 'chinees',
  theme: { primary: '#3a2f2f', accent: '#a23d33', motif: 'compass' },
  tags: ['macht', 'wetten', 'bestuur', 'strategie', 'leiderschap', 'realisme', 'organisatie'],
  bio: 'Han Fei was een prins uit de staat Han en een leerling van de confucianist Xunzi, maar hij werd de scherpste denker van het legalisme. Mensen zijn volgens hem vooral uit op eigenbelang; een staat moet daarom worden bestuurd met duidelijke wetten, beloningen en straffen, niet met deugdzame voorbeelden. De koning van Qin bewonderde zijn werk, maar liet hem in de gevangenis sterven.',
  keyConcepts: [
    {
      term: 'Wet',
      native: '法',
      explanation: 'Duidelijke, openbare regels die voor iedereen gelden.',
    },
    {
      term: 'Methode',
      native: '術',
      explanation: 'Technieken waarmee een heerser zijn ambtenaren in de hand houdt.',
    },
    {
      term: 'Positie',
      native: '勢',
      explanation: 'De macht van de positie, los van de persoon die haar bekleedt.',
    },
    {
      term: 'Wachten bij de boomstronk',
      native: '守株待兔',
      explanation:
        'De boer die bleef wachten tot er weer een haas tegen de stronk zou rennen: wie alleen oude methodes volgt, mist de nieuwe tijd.',
    },
  ],
  keyWorks: [
    {
      title: 'Han Feizi (韓非子)',
      note: 'Met de hoofdstukken "Uitleg bij Laozi" en "Illustraties bij Laozi".',
    },
  ],
  lifeEvents: [
    { year: 'ca. 280 v.Chr.', text: 'Geboren als prins in de staat Han.' },
    {
      year: 'jaren 250 v.Chr.',
      text: 'Studeert bij de confucianist Xunzi, samen met de latere minister Li Si.',
    },
    {
      year: '233 v.Chr.',
      text: 'Wordt als gezant naar Qin gestuurd, door zijn vroegere medestudent Li Si belasterd, en sterft in de gevangenis door vergif.',
    },
    {
      year: '221 v.Chr.',
      text: 'Qin verenigt China, met een bestuur dat sterk op zijn ideeën lijkt.',
    },
  ],
  quotes: [
    {
      text: 'Een dijk van duizend zhang kan bezwijken door het gat van een mier.',
      original: '千丈之堤，以螻蟻之穴潰',
      source: 'Han Feizi, hoofdstuk 21 ("Illustraties bij Laozi")',
      status: 'authentiek',
      translation: 'eigen',
      verified: true,
    },
  ],
  voice: {
    register: 'Koel, scherp en zonder illusies. Hij stotterde, maar schreef messcherp.',
    method:
      'Analyseert belangen en prikkels: wie heeft er baat bij, en welke regel voorkomt misbruik?',
  },
  modernLens:
    'Han Fei herkent zijn ideeën in compliance-afdelingen, prestatie-indicatoren en toezichtsystemen, en vraagt wie de controleurs controleert.',
  controversies: [
    'Zijn ideeën dienden het harde bewind van de Qin-dynastie, met boekverbrandingen en zware straffen.',
  ],
  network: [
    { id: 'laozi', relation: 'invloed', note: 'schreef er twee hoofdstukken over' },
    { id: 'confucius', relation: 'tegenpool' },
    { id: 'mozi', relation: 'tegenpool' },
    { id: 'mencius', relation: 'andere school' },
  ],
  helpsWith: ['macht en organisaties begrijpen', 'regels en prikkels ontwerpen'],
});
