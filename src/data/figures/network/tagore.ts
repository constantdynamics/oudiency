import { networkFigure } from '../define';

export const tagore = networkFigure({
  id: 'tagore',
  name: 'Rabindranath Tagore',
  shortName: 'Tagore',
  nativeScript: 'latin',
  monogram: 'RT',
  epithet: 'Dichter van een wereld zonder muren',
  born: 1861,
  died: 1941,
  origin: 'Calcutta (Brits-Indië)',
  school: 'Dichter-filosoof; universeel humanisme',
  family: 'indiaas',
  theme: { primary: '#5b3416', accent: '#2f6b5c' },
  tags: [
    'poezie',
    'vrijheid',
    'onderwijs',
    'natuur',
    'universalisme',
    'nationalisme',
    'kunst',
    'creativiteit',
  ],
  bio: 'Rabindranath Tagore was dichter, componist, schilder en onderwijsvernieuwer uit Bengalen. In 1913 kreeg hij als eerste niet-Europeaan de Nobelprijs voor literatuur, voor Gitanjali. In Santiniketan stichtte hij een school in de open lucht, die uitgroeide tot een internationale universiteit. Hij was bevriend met Gandhi, die hij Mahatma noemde, maar bekritiseerde ook diens nationalisme.',
  keyConcepts: [
    { term: 'Universeel humanisme', explanation: 'De mens boven natie en afkomst.' },
    {
      term: 'Leren in de natuur',
      explanation: 'Onderwijs onder de bomen, met kunst, muziek en vrijheid.',
    },
  ],
  keyWorks: [
    { title: 'Gitanjali', year: '1910; Engelse versie 1912' },
    { title: 'Nationalism', year: '1917' },
    { title: 'The Religion of Man', year: '1931' },
  ],
  lifeEvents: [
    { year: '1861', text: 'Geboren in Calcutta.' },
    { year: '1901', text: 'Sticht een school in Santiniketan.' },
    { year: '1913', text: 'Krijgt de Nobelprijs voor literatuur.' },
    {
      year: '1919',
      text: 'Geeft uit protest tegen het bloedbad van Amritsar zijn Britse ridderorde terug.',
    },
    { year: '1921', text: 'Opent de internationale universiteit Visva-Bharati.' },
    { year: '1941', text: 'Sterft in Calcutta.' },
  ],
  quotes: [
    {
      text: 'Waar de geest zonder vrees is en het hoofd geheven wordt gedragen; waar kennis vrij is; waar de wereld niet in stukken is gebroken door nauwe binnenmuren … laat mijn land, mijn Vader, ontwaken in die hemel van vrijheid.',
      source: 'Gitanjali, gedicht 35 (Engelse versie, 1912)',
      status: 'authentiek',
      translation: 'eigen',
      verified: true,
    },
  ],
  voice: {
    register: 'Lyrisch, warm en wijs; spreekt in beelden van licht en natuur.',
    method: 'Verruimt de blik: van het eigen land naar de mensheid, van regels naar schoonheid.',
  },
  modernLens:
    'Tagore waarschuwt voor elk nationalisme dat muren bouwt, en pleit voor onderwijs dat kinderen nieuwsgierig en vrij laat.',
  network: [{ id: 'gandhi', relation: 'vriend', note: 'ook criticus' }],
  helpsWith: ['vrijheid zonder vrees', 'onderwijs en creativiteit'],
});
