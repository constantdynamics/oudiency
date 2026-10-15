import { networkFigure } from '../define';

export const mencius = networkFigure({
  id: 'mencius',
  name: 'Mencius',
  nativeName: '孟子',
  nativeScript: 'han',
  monogram: '孟',
  epithet: 'Verdediger van de goede menselijke natuur',
  born: -372,
  died: -289,
  approximate: true,
  displayYears: 'ca. 372–289 v.Chr.',
  origin: 'Zou (in het huidige Shandong, China)',
  school: 'Confucianisme',
  family: 'chinees',
  theme: { primary: '#5a3328', accent: '#b88a40', motif: 'scroll' },
  tags: ['menselijkheid', 'goedheid', 'compassie', 'leiderschap', 'opvoeding', 'rechtvaardigheid'],
  bio: 'Meng Ke, bekend als Mencius, geldt na Confucius als de tweede wijze van het confucianisme. Hij reisde langs vorstenhoven en hield heersers voor dat goed bestuur begint bij het welzijn van het volk. Zijn beroemdste stelling: de menselijke natuur is goed. Iedereen die een kind bij een put ziet wankelen, voelt onmiddellijk schrik en medeleven.',
  keyConcepts: [
    {
      term: 'De goede natuur',
      explanation: 'Ieder mens heeft de kiemen van goedheid in zich; ze moeten alleen worden gekoesterd.',
    },
    {
      term: 'De vier kiemen',
      explanation: 'Medeleven, schaamte, bescheidenheid en het besef van goed en kwaad.',
    },
    {
      term: 'Het mandaat van de hemel',
      explanation: 'Een vorst die het volk onderdrukt, verliest zijn recht om te regeren.',
    },
    {
      term: 'Niet aan de scheuten trekken',
      native: '揠苗助長',
      explanation: 'De boer die zijn gewassen hielp groeien door eraan te trekken, doodde ze: groei laat zich niet forceren.',
    },
  ],
  keyWorks: [{ title: 'Mencius (Mengzi, 孟子)' }],
  lifeEvents: [
    { year: 'ca. 372 v.Chr.', text: 'Geboren in Zou.' },
    {
      year: 'overlevering',
      text: 'Zijn moeder verhuist drie keer, om hem in een goede omgeving te laten opgroeien.',
    },
    { year: '4e eeuw v.Chr.', text: 'Reist langs vorstenhoven, zoals die van Qi en Liang, om vorsten te adviseren.' },
    { year: 'ca. 289 v.Chr.', text: 'Sterft.' },
  ],
  quotes: [
    {
      text: 'Ieder mens heeft een hart dat het lijden van anderen niet kan verdragen.',
      original: '人皆有不忍人之心',
      source: 'Mencius 2A6',
      status: 'authentiek',
      translation: 'eigen',
      verified: true,
    },
    {
      text: 'Het volk is het belangrijkst, de altaren van het land komen daarna, en de vorst telt het minst.',
      original: '民為貴，社稷次之，君為輕',
      source: 'Mencius 7B14',
      status: 'authentiek',
      translation: 'eigen',
      verified: true,
    },
  ],
  voice: {
    register: 'Hartstochtelijk, welbespraakt en vasthoudend; durft vorsten tegen te spreken.',
    method: 'Gebruikt treffende voorbeelden, zoals het kind bij de put en de boer die aan zijn gewassen trekt.',
  },
  modernLens:
    'Mencius herinnert politici eraan dat het volk het belangrijkst is, en ouders dat kinderen groeien zoals gewassen: niet door eraan te trekken.',
  network: [
    { id: 'confucius', relation: 'voorbeeld' },
    { id: 'mozi', relation: 'tegenpool' },
    { id: 'yangzhu', relation: 'tegenpool' },
    { id: 'hanfeizi', relation: 'andere school' },
    { id: 'zhuangzi', relation: 'tijdgenoot' },
  ],
  helpsWith: ['geloven in de goedheid van mensen', 'opvoeding', 'rechtvaardig leiderschap'],
});
