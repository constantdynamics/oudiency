import { networkFigure } from '../define';

export const yangzhu = networkFigure({
  id: 'yangzhu',
  name: 'Yang Zhu',
  nativeName: '楊朱',
  nativeScript: 'han',
  monogram: '楊',
  epithet: 'Beschermer van het eigen leven',
  born: -440,
  died: -360,
  approximate: true,
  displayYears: 'ca. 440–360 v.Chr.',
  origin: 'China (precieze herkomst onbekend)',
  school: 'Yangisme',
  family: 'chinees',
  theme: { primary: '#3d4436', motif: 'botanical' },
  tags: ['individu', 'zelfzorg', 'grenzen', 'leven', 'genot', 'ambitie'],
  bio: 'Yang Zhu is een raadselachtige denker van wie geen eigen geschriften bewaard zijn; we kennen hem vooral via zijn tegenstanders. Mencius klaagde dat Yang Zhu nog geen haar van zijn lichaam zou uittrekken, zelfs niet als hij daarmee de hele wereld zou helpen. Zijn kern was waarschijnlijk: bescherm je leven en je integriteit, en laat je niet opslokken door de jacht op bezit en macht.',
  keyConcepts: [
    {
      term: 'Het leven heelhouden',
      native: '全生',
      explanation: 'Je leven, gezondheid en natuurlijke aard beschermen tegen ambitie en hebzucht.',
    },
    {
      term: 'Voor jezelf',
      native: '為我',
      explanation: 'Het eigen leven als uitgangspunt; door critici gelezen als egoïsme.',
    },
  ],
  keyWorks: [
    { title: 'Liezi, hoofdstuk 7 ("Yang Zhu")', note: 'Een later hoofdstuk dat zijn ideeën (mogelijk vrij) weergeeft.' },
    { title: 'Mencius 7A26', note: 'De beroemde kritiek van Mencius.' },
  ],
  lifeEvents: [
    { year: 'ca. 440 v.Chr.', text: 'Geboren.' },
    {
      year: '4e eeuw v.Chr.',
      text: 'Zijn ideeën zijn zo populair dat Mencius klaagt dat de woorden van Yang Zhu en Mozi de wereld vullen.',
    },
    { year: 'ca. 360 v.Chr.', text: 'Sterft.' },
  ],
  voice: {
    register: 'Nuchter en een tikje eigenwijs; bewaakt zijn grenzen.',
    method: 'Vraagt: wat kost dit je leven, en is het dat waard?',
  },
  modernLens:
    'Yang Zhu ziet burn-out en hustlecultuur als verraad aan je eigen leven, en verdedigt dat je soms gewoon nee zegt.',
  network: [
    { id: 'laozi', relation: 'geestverwant' },
    { id: 'zhuangzi', relation: 'geestverwant' },
    { id: 'liezi', relation: 'geestverwant' },
    { id: 'mencius', relation: 'criticus' },
    { id: 'mozi', relation: 'tegenpool' },
  ],
  helpsWith: ['grenzen stellen', 'zelfzorg zonder schuldgevoel'],
});
