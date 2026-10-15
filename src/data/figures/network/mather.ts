import { networkFigure } from '../define';

export const mather = networkFigure({
  id: 'mather',
  name: 'Cotton Mather',
  shortName: 'Mather',
  nativeScript: 'latin',
  monogram: 'CM',
  epithet: 'Puriteinse predikant uit Boston',
  born: 1663,
  died: 1728,
  origin: 'Boston, Massachusetts (Engelse kolonie)',
  school: 'Puritanisme',
  family: 'amerikaans',
  theme: { primary: '#3d3229', motif: 'scroll' },
  tags: ['goed doen', 'religie', 'wetenschap', 'gemeenschap', 'fanatisme', 'vaccinatie'],
  bio: 'Cotton Mather was een invloedrijke puriteinse predikant in Boston en een veelschrijver met honderden publicaties. Zijn boek Bonifacius: Essays to Do Good inspireerde de jonge Benjamin Franklin tot een leven van nuttige daden. Hij was ook natuuronderzoeker en zette zich in 1721 in voor inenting tegen pokken, wat hem een bom door het raam opleverde. Tegelijk is zijn naam verbonden met de heksenprocessen van Salem.',
  keyConcepts: [
    { term: 'Goed doen', explanation: 'Elke dag zoeken naar concrete manieren om anderen te helpen.' },
    { term: 'Inenting', explanation: 'In 1721 pleitte hij voor inenting tegen pokken, geleerd van Onesimus, een tot slaaf gemaakte Afrikaan.' },
  ],
  keyWorks: [
    { title: 'Bonifacius: Essays to Do Good', year: '1710' },
    { title: 'Magnalia Christi Americana', year: '1702' },
  ],
  lifeEvents: [
    { year: '1663', text: 'Geboren in Boston, in een familie van predikanten.' },
    { year: '1692', text: 'Speelt een kwalijke rol rond de heksenprocessen van Salem.' },
    { year: '1710', text: 'Bonifacius: Essays to Do Good verschijnt.' },
    { year: '1713', text: 'Wordt lid van de Royal Society in Londen.' },
    { year: '1721', text: 'Zet zich tijdens een pokkenepidemie in voor inenting en krijgt een brandbom door zijn raam.' },
    { year: '1728', text: 'Sterft in Boston.' },
  ],
  voice: {
    register: 'Plechtig, belezen en vurig gelovig.',
    method: 'Vraagt elke ochtend: welk goed kan ik vandaag doen?',
  },
  modernLens:
    'Mather zou vrijwilligerswerk en vaccinatie toejuichen, maar moet zich ook laten bevragen over hoe angst en fanatisme een gemeenschap kunnen verscheuren.',
  controversies: [
    'Hij waarschuwde voor "spectraal bewijs", maar drong aan op snelle vervolging en verdedigde de heksenprocessen van Salem achteraf in een boek; er werden twintig mensen terechtgesteld.',
    'Hij bezat tot slaaf gemaakte mensen, onder wie Onesimus, van wie hij de inenting leerde.',
  ],
  network: [
    { id: 'franklin', relation: 'navolger' },
    { id: 'newton', relation: 'tijdgenoot' },
  ],
  helpsWith: ['elke dag iets goeds doen'],
});
