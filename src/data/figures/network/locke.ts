import { networkFigure } from '../define';

export const locke = networkFigure({
  id: 'locke',
  name: 'John Locke',
  shortName: 'Locke',
  nativeScript: 'latin',
  monogram: 'JL',
  epithet: 'Filosoof van vrijheid en tolerantie',
  born: 1632,
  died: 1704,
  origin: 'Wrington (Somerset, Engeland)',
  school: 'Empirisme; liberalisme',
  family: 'brits',
  theme: { primary: '#2c4733', motif: 'tulip' },
  tags: ['vrijheid', 'rechten', 'tolerantie', 'opvoeding', 'kennis', 'eigendom', 'democratie'],
  bio: 'John Locke wordt gezien als de vader van het liberalisme. Hij stelde dat de geest bij de geboorte een onbeschreven blad is dat door ervaring wordt gevuld, en dat een regering alleen gezag heeft met instemming van de burgers, om hun leven, vrijheid en bezit te beschermen. In de jaren 1680 leefde hij in ballingschap in de Republiek, waar hij aan zijn Brief over tolerantie werkte.',
  keyConcepts: [
    { term: 'Onbeschreven blad', explanation: 'Alle kennis begint bij ervaring; niemand wordt met ideeën geboren.' },
    { term: 'Natuurlijke rechten', explanation: 'Leven, vrijheid en bezit horen bij ieder mens, vóór elke regering.' },
    { term: 'Instemming', explanation: 'Een regering heeft alleen gezag als de burgers haar steunen.' },
    { term: 'Tolerantie', explanation: 'De overheid mag zielen niet met dwang redden.' },
  ],
  keyWorks: [
    { title: 'A Letter Concerning Toleration', year: '1689' },
    { title: 'Two Treatises of Government', year: '1689' },
    { title: 'An Essay Concerning Human Understanding', year: '1689' },
    { title: 'Some Thoughts Concerning Education', year: '1693' },
  ],
  lifeEvents: [
    { year: '1632', text: 'Geboren in Wrington, in hetzelfde jaar als Spinoza.' },
    { year: '1667', text: 'Wordt arts en adviseur van de staatsman Lord Shaftesbury.' },
    { year: '1683–1689', text: 'Leeft in ballingschap in de Republiek, onder meer in Amsterdam en Rotterdam.' },
    { year: '1689', text: 'Keert terug naar Engeland; zijn drie grote werken verschijnen.' },
    { year: '1704', text: 'Sterft in Oates, Essex.' },
  ],
  quotes: [
    {
      text: 'Laten we aannemen dat de geest, zoals we zeggen, wit papier is, zonder enig teken, zonder enige ideeën.',
      source: 'An Essay Concerning Human Understanding II.1.2',
      status: 'authentiek',
      translation: 'eigen',
      verified: true,
    },
  ],
  voice: {
    register: 'Nuchter, redelijk en zorgvuldig.',
    method: 'Vraagt waar een idee vandaan komt en met welk recht iemand gezag uitoefent.',
  },
  modernLens:
    'Locke zou in privacyrechten en de bescherming van burgers tegen de staat zijn natuurlijke rechten terugzien, en vragen of digitale data ook "bezit" zijn.',
  controversies: [
    'Hij was investeerder in de Royal African Company, die tot slaaf gemaakte mensen verhandelde, en hielp de grondwet van Carolina opstellen, die slavernij toestond.',
  ],
  network: [
    { id: 'hobbes', relation: 'tegenpool' },
    { id: 'descartes', relation: 'invloed' },
    { id: 'newton', relation: 'vriend' },
    { id: 'spinoza', relation: 'tijdgenoot', note: 'beiden geboren in 1632' },
    { id: 'hume', relation: 'navolger' },
    { id: 'leibniz', relation: 'criticus' },
    { id: 'jefferson', relation: 'navolger' },
    { id: 'voltaire', relation: 'bewonderaar' },
  ],
  helpsWith: ['vrijheid en rechten', 'tolerantie', 'opvoeding'],
});
