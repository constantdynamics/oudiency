import { networkFigure } from '../define';

export const ruskin = networkFigure({
  id: 'ruskin',
  name: 'John Ruskin',
  shortName: 'Ruskin',
  nativeScript: 'latin',
  monogram: 'JR',
  epithet: 'Kunstcriticus en criticus van de economie',
  born: 1819,
  died: 1900,
  origin: 'Londen, Engeland',
  school: 'Kunstkritiek; sociaal denken',
  family: 'brits',
  theme: { primary: '#3f3a2a', motif: 'botanical' },
  tags: ['kunst', 'werk', 'rijkdom', 'natuur', 'ambacht', 'rechtvaardigheid', 'economie'],
  bio: 'John Ruskin was de invloedrijkste kunstcriticus van het Victoriaanse Engeland, een kampioen van de schilder Turner en van de gotiek. Later richtte hij zijn pijlen op de economie van zijn tijd: in Unto This Last betoogde hij dat echte rijkdom het leven zelf is, en dat werk eerlijk beloond moet worden. Gandhi las het boek in 1904 tijdens één treinreis en veranderde daarna zijn leven.',
  keyConcepts: [
    { term: 'Er is geen rijkdom dan het leven', explanation: 'Echte welvaart meet je af aan het leven van mensen, niet aan geld.' },
    { term: 'Eerlijk loon', explanation: 'Loon hoort niet alleen van de markt af te hangen, maar van rechtvaardigheid.' },
    { term: 'De waardigheid van ambacht', explanation: 'Goed werk geeft de werker ruimte om te denken en te scheppen.' },
  ],
  keyWorks: [
    { title: 'Modern Painters', year: '1843–1860' },
    { title: 'The Stones of Venice', year: '1851–1853' },
    { title: 'Unto This Last', year: '1860; als boek 1862' },
  ],
  lifeEvents: [
    { year: '1819', text: 'Geboren in Londen.' },
    { year: '1843', text: 'Verdedigt in Modern Painters de schilder J.M.W. Turner.' },
    {
      year: '1860',
      text: 'Zijn artikelen over economie wekken zoveel woede dat de reeks wordt stopgezet; in 1862 verschijnen ze als Unto This Last.',
    },
    { year: '1869', text: 'Wordt de eerste Slade-hoogleraar kunst in Oxford.' },
    { year: '1900', text: 'Sterft in Brantwood, aan het Coniston Water.' },
  ],
  quotes: [
    {
      text: 'Er is geen rijkdom dan het leven.',
      original: 'There is no wealth but life.',
      source: 'Unto This Last, essay IV',
      status: 'authentiek',
      translation: 'eigen',
      verified: true,
    },
  ],
  voice: {
    register: 'Hartstochtelijk, beeldend en moralistisch.',
    method: 'Kijkt wat iets doet met het leven van mensen: maakt het hen rijker, of alleen hun portemonnee?',
  },
  modernLens: 'Ruskin vraagt bij elk groeicijfer: groeit hier ook het leven van mensen?',
  network: [
    { id: 'gandhi', relation: 'navolger' },
    { id: 'tolstoj', relation: 'bewonderaar' },
    { id: 'plato', relation: 'invloed' },
  ],
  helpsWith: ['rijkdom en waarde', 'betekenisvol werk'],
});
