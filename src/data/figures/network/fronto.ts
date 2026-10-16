import { networkFigure } from '../define';

export const fronto = networkFigure({
  id: 'fronto',
  name: 'Cornelius Fronto',
  shortName: 'Fronto',
  nativeName: 'Marcus Cornelius Fronto',
  nativeScript: 'latin',
  monogram: 'F',
  epithet: 'Redenaar en briefvriend van een keizer',
  born: 100,
  died: 170,
  approximate: true,
  displayYears: 'ca. 100–170',
  origin: 'Cirta (Numidië, nu Constantine in Algerije)',
  school: 'Retorica',
  family: 'romeins',
  theme: { primary: '#6a2f3a', motif: 'quill' },
  tags: ['taal', 'retorica', 'schrijven', 'vriendschap', 'onderwijs', 'stijl'],
  bio: 'Marcus Cornelius Fronto was de beroemdste redenaar van zijn tijd en leraar Latijnse welsprekendheid van de jonge Marcus Aurelius. Hun hartelijke briefwisseling werd pas in 1815 teruggevonden, onder de tekst van een later beschreven handschrift. Fronto hield van oude, zuivere woorden en had weinig op met de filosofie die zijn leerling steeds meer trok.',
  keyConcepts: [
    {
      term: 'Het juiste woord',
      explanation: 'Zoek het precieze, onverwachte woord in plaats van het gemakkelijke.',
    },
    {
      term: 'Welsprekendheid',
      explanation: 'Goed spreken is voor een leider geen versiering, maar een plicht.',
    },
  ],
  keyWorks: [
    { title: 'Brieven aan Marcus Aurelius', note: 'In 1815 teruggevonden in een palimpsest.' },
  ],
  lifeEvents: [
    { year: 'ca. 100', text: 'Geboren in Cirta in Noord-Afrika.' },
    {
      year: 'jaren 140',
      text: 'Wordt de leraar welsprekendheid van Marcus Aurelius en Lucius Verus.',
    },
    { year: '143', text: 'Wordt consul.' },
    { year: 'ca. 170', text: 'Sterft.' },
  ],
  voice: {
    register: 'Hartelijk, beeldend en een tikje ijdel over zijn stijl.',
    method: 'Let op elk woord: hoe zeg je dit precies goed?',
  },
  modernLens:
    'Fronto zou de woordkeuze in onze berichten en e-mails streng corrigeren, en daarna een warme brief schrijven.',
  network: [
    { id: 'aurelius', relation: 'leerling' },
    { id: 'rusticus', relation: 'tijdgenoot' },
    { id: 'antoninus', relation: 'tijdgenoot' },
    { id: 'seneca', relation: 'tegenpool', note: 'vond zijn stijl verwerpelijk' },
  ],
  helpsWith: ['beter schrijven en spreken', 'de band tussen leraar en leerling'],
});
