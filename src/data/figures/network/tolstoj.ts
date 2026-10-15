import { networkFigure } from '../define';

export const tolstoj = networkFigure({
  id: 'tolstoj',
  name: 'Leo Tolstoj',
  shortName: 'Tolstoj',
  nativeName: 'Лев Толстой',
  nativeScript: 'latin',
  monogram: 'LT',
  epithet: 'Romancier en pleitbezorger van geweldloosheid',
  born: 1828,
  died: 1910,
  origin: 'Jasnaja Poljana (Rusland)',
  school: 'Christelijk anarchisme; geweldloosheid',
  family: 'romantiek',
  theme: { primary: '#3b3048', motif: 'botanical' },
  tags: ['geweldloosheid', 'eenvoud', 'geloof', 'zingeving', 'dood', 'liefde', 'familie', 'rijkdom'],
  bio: 'Lev Tolstoj schreef met Oorlog en vrede en Anna Karenina twee van de grootste romans ooit. Rond zijn vijftigste raakte hij in een diepe crisis over de zin van het leven, en vond hij het antwoord in een eenvoudig, radicaal christendom zonder kerk: geweldloosheid, geen overbodig bezit, werken met je handen. Zijn ideeën over geweldloos verzet inspireerden de jonge Gandhi, met wie hij correspondeerde.',
  keyConcepts: [
    { term: 'Geen geweld tegen het kwaad', explanation: 'Het kwaad niet met geweld beantwoorden, ook niet als het jou treft.' },
    { term: 'Eenvoud', explanation: 'Leven van eigen arbeid, zonder overbodig bezit.' },
    {
      term: 'Het koninkrijk Gods is in u',
      explanation: 'Geloof als innerlijke levenshouding, niet als instituut met macht.',
    },
  ],
  keyWorks: [
    { title: 'Oorlog en vrede', year: '1865–1869' },
    { title: 'Anna Karenina', year: '1875–1877' },
    { title: 'Een biecht', year: '1882' },
    { title: 'De dood van Ivan Iljitsj', year: '1886' },
    { title: 'Het koninkrijk Gods is in u', year: '1894' },
  ],
  lifeEvents: [
    { year: '1828', text: 'Geboren op het landgoed Jasnaja Poljana.' },
    { year: '1854–1855', text: 'Vecht als officier in de Krimoorlog, bij Sebastopol.' },
    { year: '1869', text: 'Voltooit Oorlog en vrede.' },
    { year: '1879–1882', text: 'Doorleeft een diepe levenscrisis en schrijft Een biecht.' },
    { year: '1901', text: 'Wordt door de Russisch-orthodoxe kerk geëxcommuniceerd.' },
    { year: '1909–1910', text: 'Correspondeert met Gandhi over geweldloos verzet.' },
    { year: '1910', text: 'Vlucht op hoge leeftijd van huis en sterft op het stationnetje van Astapovo.' },
  ],
  quotes: [
    {
      text: 'Alle gelukkige gezinnen lijken op elkaar; elk ongelukkig gezin is ongelukkig op zijn eigen manier.',
      source: 'Anna Karenina, eerste zin',
      status: 'authentiek',
      translation: 'eigen',
      verified: true,
    },
  ],
  voice: {
    register: 'Ernstig, hartstochtelijk en zoekend; vertelt in beelden uit het boerenleven.',
    method: 'Zet grote vragen naast eenvoudige verhalen en eist consequentie: leef wat je gelooft.',
  },
  modernLens:
    'Tolstoj stelt rijkdom en consumptie aan de kaak, en vraagt, zoals in zijn verhaal: hoeveel land heeft een mens eigenlijk nodig?',
  controversies: [
    'Zijn strenge idealen botsten met zijn eigen leven: zijn huwelijk met Sofja werd een bittere strijd, mede over zijn plan afstand te doen van bezit en auteursrechten.',
  ],
  network: [
    { id: 'laozi', relation: 'invloed', note: 'werkte aan een vertaling' },
    { id: 'gandhi', relation: 'correspondent', note: 'briefwisseling in 1909–1910' },
    { id: 'rousseau', relation: 'invloed' },
    { id: 'schopenhauer', relation: 'invloed' },
    { id: 'thoreau', relation: 'geestverwant' },
    { id: 'ruskin', relation: 'invloed' },
  ],
  helpsWith: ['zingeving', 'eenvoud en minder bezit', 'geweldloosheid'],
});
