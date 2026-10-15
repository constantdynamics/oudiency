import { networkFigure } from '../define';

export const wollstonecraft = networkFigure({
  id: 'wollstonecraft',
  name: 'Mary Wollstonecraft',
  shortName: 'Wollstonecraft',
  nativeScript: 'latin',
  monogram: 'MW',
  epithet: 'Pleitbezorger van de rechten van de vrouw',
  born: 1759,
  died: 1797,
  origin: 'Londen, Engeland',
  school: 'Verlichting; feminisme',
  family: 'brits',
  theme: { primary: '#4b2c3e', accent: '#b08a4a', motif: 'quill' },
  tags: ['vrouwenrechten', 'opvoeding', 'gelijkheid', 'rede', 'onafhankelijkheid', 'liefde'],
  bio: 'Mary Wollstonecraft verdiende haar eigen brood als schrijver, iets wat voor vrouwen in haar tijd zeldzaam was. In A Vindication of the Rights of Woman (1792) betoogde ze dat vrouwen niet van nature zwakker zijn, maar zwak gemaakt worden door hun opvoeding, en dat zij evengoed recht hebben op onderwijs en op het gebruik van de rede. Ze bekritiseerde daarin scherp de opvoeding van meisjes in Rousseaus Émile. Ze stierf kort na de geboorte van haar dochter, de latere schrijfster Mary Shelley.',
  keyConcepts: [
    { term: 'Rede kent geen geslacht', explanation: 'Vrouwen hebben dezelfde rede als mannen, en dus dezelfde rechten.' },
    { term: 'Opvoeding vormt', explanation: 'Zwakheid is aangeleerd, niet aangeboren.' },
    { term: 'Onafhankelijkheid', explanation: 'Een vrouw moet zichzelf kunnen onderhouden.' },
  ],
  keyWorks: [
    { title: 'Thoughts on the Education of Daughters', year: '1787' },
    { title: 'A Vindication of the Rights of Men', year: '1790' },
    { title: 'A Vindication of the Rights of Woman', year: '1792' },
    { title: 'Letters Written in Sweden, Norway, and Denmark', year: '1796' },
  ],
  lifeEvents: [
    { year: '1759', text: 'Geboren in Londen.' },
    { year: '1784', text: 'Richt met haar zussen en een vriendin een school op in Newington Green.' },
    { year: '1790', text: 'Antwoordt Edmund Burke met A Vindication of the Rights of Men.' },
    { year: '1792', text: 'A Vindication of the Rights of Woman verschijnt.' },
    { year: '1792–1795', text: 'Woont tijdens de Revolutie in Frankrijk.' },
    { year: '1797', text: 'Trouwt met William Godwin en sterft kort na de geboorte van haar dochter Mary.' },
  ],
  quotes: [
    {
      text: 'Ik wens niet dat zij macht hebben over mannen, maar over zichzelf.',
      original: 'I do not wish them to have power over men; but over themselves.',
      source: 'A Vindication of the Rights of Woman (1792), hoofdstuk 4',
      status: 'authentiek',
      translation: 'eigen',
      verified: true,
    },
  ],
  voice: {
    register: 'Strijdbaar, helder en hartstochtelijk redelijk.',
    method: 'Vraagt of een verschil aangeboren is of aangeleerd, en wat goede opvoeding zou veranderen.',
  },
  modernLens:
    'Wollstonecraft viert de vooruitgang in onderwijs voor meisjes, en benoemt scherp de ongelijkheid die nog bestaat in loon en zorg.',
  network: [
    { id: 'rousseau', relation: 'tegenpool' },
    { id: 'paine', relation: 'tijdgenoot' },
    { id: 'priestley', relation: 'tijdgenoot' },
    { id: 'locke', relation: 'invloed' },
  ],
  helpsWith: ['gelijkwaardigheid', 'onafhankelijkheid', 'opvoeding'],
});
