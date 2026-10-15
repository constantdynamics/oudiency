import { networkFigure } from '../define';

export const zhuangzi = networkFigure({
  id: 'zhuangzi',
  name: 'Zhuangzi',
  nativeName: '莊子',
  nativeScript: 'han',
  monogram: '莊',
  epithet: 'De dromer van de vlinder',
  born: -369,
  died: -286,
  approximate: true,
  displayYears: 'ca. 369–286 v.Chr.',
  origin: 'Meng, in de staat Song (China)',
  school: 'Taoïsme',
  family: 'chinees',
  theme: { primary: '#2c4a3e' },
  tags: [
    'vrijheid',
    'relativiteit',
    'humor',
    'dromen',
    'natuur',
    'spontaniteit',
    'nut',
    'dood',
    'loslaten',
  ],
  bio: 'Zhuangzi was een taoïstische denker en verteller. Volgens Sima Qian was hij een tijd opzichter van een lakboomgaard en weigerde hij een hoge functie aan het hof, omdat hij liever vrij in de modder speelde. Het boek dat zijn naam draagt, staat vol absurde en geestige verhalen: over een man die droomt dat hij een vlinder is, over een kok die een os uitbeent zonder dat zijn mes bot wordt, over bomen die oud worden omdat ze nutteloos zijn.',
  keyConcepts: [
    {
      term: 'De vlinderdroom',
      explanation:
        'Is hij een man die droomde een vlinder te zijn, of een vlinder die droomt een man te zijn?',
    },
    {
      term: 'Het nut van het nutteloze',
      native: '無用之用',
      explanation: 'De kromme boom wordt niet gekapt en mag daardoor oud worden.',
    },
    {
      term: 'Vrij zwerven',
      native: '逍遙遊',
      explanation:
        'Door het leven gaan zonder vast te zitten aan nut, status of één enkel standpunt.',
    },
    {
      term: 'Kok Ding',
      explanation:
        'Wie de natuurlijke lijnen volgt, werkt moeiteloos: zijn mes bleef negentien jaar scherp.',
    },
  ],
  keyWorks: [
    {
      title: 'Zhuangzi (莊子)',
      note: 'De "binnenhoofdstukken" (1–7) worden het meest aan hem zelf toegeschreven.',
    },
  ],
  lifeEvents: [
    { year: 'ca. 369 v.Chr.', text: 'Geboren in Meng, in de staat Song.' },
    { year: 'onbekend', text: 'Werkt volgens Sima Qian als opzichter van een lakboomgaard.' },
    {
      year: 'overlevering',
      text: 'Weigert het aanbod van de koning van Chu om minister te worden: hij is liever een schildpad die zijn staart door de modder sleept.',
    },
    {
      year: 'overlevering',
      text: 'Als zijn vrouw sterft, vindt een vriend hem trommelend en zingend. Leven en dood komen en gaan, legt hij uit, als de seizoenen.',
    },
    { year: 'ca. 286 v.Chr.', text: 'Sterft.' },
  ],
  quotes: [
    {
      text: 'Eens droomde Zhuang Zhou dat hij een vlinder was, fladderend en tevreden; hij wist niet dat hij Zhou was. Plots werd hij wakker, en daar was hij, Zhou. Nu weet hij niet: is hij Zhou die droomde een vlinder te zijn, of een vlinder die droomt dat hij Zhou is?',
      source: 'Zhuangzi, hoofdstuk 2',
      status: 'authentiek',
      translation: 'eigen',
      verified: true,
    },
    {
      text: 'De fuik is er voor de vis; heb je de vis, dan vergeet je de fuik. Woorden zijn er voor de betekenis; heb je de betekenis, dan vergeet je de woorden.',
      source: 'Zhuangzi, hoofdstuk 26',
      status: 'authentiek',
      translation: 'eigen',
      verified: true,
    },
  ],
  voice: {
    register: 'Speels, absurd en geestig; vertelt liever een verhaal dan een stelling.',
    method:
      'Relativeert door van perspectief te wisselen: kijk eens vanuit de vis, de boom, de vlinder. Ontwapent met humor.',
  },
  modernLens:
    'Zhuangzi lacht om onze obsessie met nut en productiviteit, en vertelt over de kromme boom die juist door zijn nutteloosheid oud mocht worden.',
  network: [
    { id: 'laozi', relation: 'invloed' },
    { id: 'liezi', relation: 'geestverwant' },
    { id: 'yangzhu', relation: 'geestverwant' },
    { id: 'confucius', relation: 'andere school', note: 'voert hem vaak op in zijn verhalen' },
    { id: 'mencius', relation: 'tijdgenoot' },
    { id: 'mozi', relation: 'andere school' },
    { id: 'nagarjuna', relation: 'geestverwant', note: 'vergelijkende filosofie' },
  ],
  helpsWith: [
    'minder serieus nemen wat er niet toe doet',
    'vrijheid en spontaniteit',
    'omgaan met verlies',
  ],
});
