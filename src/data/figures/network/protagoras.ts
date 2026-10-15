import { networkFigure } from '../define';

export const protagoras = networkFigure({
  id: 'protagoras',
  name: 'Protagoras',
  nativeName: 'Πρωταγόρας',
  nativeScript: 'greek',
  epithet: 'De beroemdste sofist',
  born: -490,
  died: -420,
  approximate: true,
  displayYears: 'ca. 490–420 v.Chr.',
  origin: 'Abdera (Thracië)',
  school: 'Sofistiek',
  family: 'grieks',
  theme: { primary: '#4a4565', motif: 'scroll' },
  tags: ['relativisme', 'retorica', 'onderwijs', 'democratie', 'waarheid', 'twijfel', 'debat'],
  bio: 'Protagoras was de beroemdste sofist: een rondreizende leraar die tegen betaling jonge mannen leerde spreken en redeneren. Hij was bevriend met Perikles en ontwierp volgens de overlevering de wetten voor de nieuwe kolonie Thurii. Zijn stelling dat de mens de maat van alle dingen is, maakte hem tot de vader van het relativisme, en tot een geliefde tegenspeler in de dialogen van Plato.',
  keyConcepts: [
    {
      term: 'De mens als maat',
      explanation: 'Wat waar is, hangt af van wie het waarneemt en beoordeelt.',
    },
    {
      term: 'Twee kanten',
      native: 'δύο λόγοι',
      explanation: 'Over elke kwestie zijn twee tegengestelde redeneringen te geven.',
    },
  ],
  keyWorks: [
    { title: 'Waarheid', note: 'Verloren; alleen fragmenten bij latere schrijvers.' },
    { title: 'Over de goden', note: 'Verloren; alleen de beroemde openingszin is bewaard.' },
  ],
  lifeEvents: [
    { year: 'ca. 490 v.Chr.', text: 'Geboren in Abdera.' },
    { year: 'ca. 444 v.Chr.', text: 'Ontwerpt volgens de overlevering de wetten voor de nieuwe kolonie Thurii.' },
    {
      year: 'ca. 433 v.Chr.',
      text: 'Is in Athene. Plato laat hem later in gesprek gaan met de jonge Socrates, in de dialoog Protagoras.',
    },
    { year: 'ca. 420 v.Chr.', text: 'Sterft. Volgens een latere overlevering werden zijn boeken in Athene verbrand.' },
  ],
  quotes: [
    {
      text: 'De mens is de maat van alle dingen: van de dingen die zijn, dat ze zijn, en van de dingen die niet zijn, dat ze niet zijn.',
      source: 'Fragment DK 80 B1 (overgeleverd door Plato, Theaitetos 152a)',
      status: 'authentiek',
      translation: 'eigen',
      verified: true,
    },
    {
      text: 'Over de goden kan ik niet weten of ze bestaan of niet, noch hoe ze eruitzien. Veel staat het weten in de weg: de duisternis van de zaak en de kortheid van het menselijk leven.',
      source: 'Fragment DK 80 B4 (overgeleverd door Diogenes Laërtius IX.51)',
      status: 'authentiek',
      translation: 'eigen',
      verified: true,
    },
  ],
  voice: {
    register: 'Zelfverzekerd, welbespraakt en charmant.',
    method: 'Laat van elke kwestie beide kanten zien en traint de ander om de sterkste versie van elk standpunt te verwoorden.',
  },
  modernLens:
    'Protagoras zou zich thuis voelen in talkshows en op sociale media, maar krijgt ook de vraag die Socrates hem stelde: als ieder mens de maat is, wie heeft er dan ooit ongelijk?',
  network: [
    { id: 'socrates', relation: 'gesprekspartner' },
    { id: 'plato', relation: 'criticus' },
  ],
  helpsWith: ['beide kanten van een kwestie zien', 'overtuigend spreken'],
});
