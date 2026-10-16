import { networkFigure } from '../define';

export const huygens = networkFigure({
  id: 'huygens',
  name: 'Christiaan Huygens',
  shortName: 'Huygens',
  nativeScript: 'latin',
  monogram: 'CH',
  epithet: 'Natuurkundige van de Gouden Eeuw',
  born: 1629,
  died: 1695,
  origin: 'Den Haag, Republiek der Nederlanden',
  school: 'Natuurwetenschap',
  family: 'gouden-eeuw',
  theme: { primary: '#283f52', motif: 'stars' },
  tags: ['wetenschap', 'sterrenkunde', 'tijd', 'licht', 'uitvinden', 'nieuwsgierigheid'],
  bio: 'Christiaan Huygens was de grootste Nederlandse wetenschapper van de Gouden Eeuw. Hij ontdekte de ring van Saturnus en de maan Titan, vond het slingeruurwerk uit en ontwikkelde een golftheorie van het licht. Net als zijn tijdgenoot Spinoza sleep hij zelf lenzen, en hij sprak met hem over optica. In Parijs gaf hij de jonge Leibniz les in wiskunde.',
  keyConcepts: [
    { term: 'Het slingeruurwerk', explanation: 'Nauwkeurige tijdmeting dankzij een slinger.' },
    {
      term: 'Golftheorie van het licht',
      explanation: 'Licht gedraagt zich als een golf (het beginsel van Huygens).',
    },
    {
      term: 'Leven elders',
      explanation: 'In Cosmotheoros speculeerde hij over leven op andere planeten.',
    },
  ],
  keyWorks: [
    { title: 'Systema Saturnium', year: '1659' },
    { title: 'Horologium Oscillatorium', year: '1673' },
    { title: 'Traité de la lumière', year: '1690' },
    { title: 'Cosmotheoros', year: '1698 (postuum)' },
  ],
  lifeEvents: [
    {
      year: '1629',
      text: 'Geboren in Den Haag als zoon van de dichter-diplomaat Constantijn Huygens.',
    },
    { year: '1655', text: 'Ontdekt Titan, de grootste maan van Saturnus.' },
    { year: '1657', text: 'Krijgt octrooi op het slingeruurwerk.' },
    { year: '1666', text: 'Wordt een van de eerste leden van de Franse Académie des Sciences.' },
    { year: '1672–1676', text: 'Geeft in Parijs de jonge Leibniz les.' },
    { year: '1695', text: 'Sterft in Den Haag.' },
  ],
  voice: {
    register: 'Precies, nuchter en nieuwsgierig.',
    method: 'Meet, berekent en bouwt: hoe kunnen we dit zien of meten?',
  },
  modernLens:
    'Huygens volgt met ontroering de ruimtesonde die zijn naam draagt en in 2005 op Titan landde.',
  network: [
    { id: 'spinoza', relation: 'tijdgenoot' },
    { id: 'descartes', relation: 'invloed' },
    { id: 'leibniz', relation: 'leerling' },
    { id: 'newton', relation: 'tijdgenoot' },
    { id: 'oldenburg', relation: 'correspondent' },
    { id: 'dewitt', relation: 'correspondent' },
  ],
  helpsWith: ['nieuwsgierig onderzoeken', 'geduld en precisie'],
});
