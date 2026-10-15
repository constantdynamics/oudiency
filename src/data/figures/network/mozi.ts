import { networkFigure } from '../define';

export const mozi = networkFigure({
  id: 'mozi',
  name: 'Mozi',
  nativeName: '墨子',
  nativeScript: 'han',
  monogram: '墨',
  epithet: 'Prediker van onpartijdige zorg',
  born: -470,
  died: -391,
  approximate: true,
  displayYears: 'ca. 470–391 v.Chr.',
  origin: 'Staat Lu of Song (China), precieze herkomst onzeker',
  school: 'Mohisme',
  family: 'chinees',
  theme: { primary: '#2f3b40', accent: '#9d4636', motif: 'compass' },
  tags: [
    'onpartijdige zorg',
    'vrede',
    'rechtvaardigheid',
    'nut',
    'zuinigheid',
    'oorlog',
    'techniek',
  ],
  bio: 'Mo Di, bekend als Mozi, was een denker en ambachtsman die een strak georganiseerde beweging leidde. Hij predikte onpartijdige zorg: om iedereen geven alsof het je eigen familie is. Hij was tegen aanvalsoorlogen en verspillende rituelen, en zijn volgelingen trokken als experts in verdedigingswerken naar belegerde steden om ze te helpen.',
  keyConcepts: [
    {
      term: 'Onpartijdige zorg',
      native: '兼愛',
      explanation: 'Om iedereen evenveel geven, niet alleen om je eigen familie of staat.',
    },
    {
      term: 'Tegen aanvalsoorlog',
      native: '非攻',
      explanation: 'Een aanvalsoorlog is diefstal en moord op grote schaal.',
    },
    {
      term: 'Drie maatstaven',
      native: '三表',
      explanation:
        'Toets een leer aan de wijzen van vroeger, aan wat mensen zien en horen, en aan het nut voor het volk.',
    },
  ],
  keyWorks: [{ title: 'Mozi (墨子)' }],
  lifeEvents: [
    { year: 'ca. 470 v.Chr.', text: 'Geboren.' },
    {
      year: 'overlevering',
      text: 'Loopt tien dagen en nachten naar de staat Chu om een aanval op Song te voorkomen, en verslaat de vestingbouwer Gongshu Ban in een gespeelde belegering.',
    },
    { year: 'ca. 391 v.Chr.', text: 'Sterft.' },
  ],
  quotes: [
    {
      text: 'Als de wereld elkaar onpartijdig liefheeft, is er orde; als men elkaar haat, is er chaos.',
      original: '天下兼相愛則治，交相惡則亂',
      source: 'Mozi, hoofdstuk 14 ("Onpartijdige zorg I")',
      status: 'authentiek',
      translation: 'eigen',
      verified: true,
    },
  ],
  voice: {
    register: 'Rechtlijnig, praktisch en een tikje streng.',
    method: 'Rekent voor wat iets het volk oplevert en kost, en vraagt: is dit goed voor iedereen?',
  },
  modernLens:
    'Mozi zou bij elk beleid vragen wat het het hele volk oplevert, en bij oorlogen alleen de verdediging steunen.',
  network: [
    { id: 'confucius', relation: 'tegenpool' },
    { id: 'mencius', relation: 'criticus' },
    { id: 'yangzhu', relation: 'tegenpool' },
    { id: 'hanfeizi', relation: 'criticus' },
    { id: 'laozi', relation: 'andere school' },
  ],
  helpsWith: ['zorg voor iedereen, niet alleen je eigen kring', 'vrede en conflict'],
});
