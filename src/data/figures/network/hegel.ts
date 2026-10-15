import { networkFigure } from '../define';

export const hegel = networkFigure({
  id: 'hegel',
  name: 'G.W.F. Hegel',
  shortName: 'Hegel',
  nativeName: 'Georg Wilhelm Friedrich Hegel',
  nativeScript: 'latin',
  monogram: 'H',
  epithet: 'Denker van de dialectiek',
  born: 1770,
  died: 1831,
  origin: 'Stuttgart (Württemberg)',
  school: 'Duits idealisme',
  family: 'verlichting',
  theme: { primary: '#283a55', motif: 'compass' },
  tags: ['geschiedenis', 'dialectiek', 'vrijheid', 'staat', 'erkenning', 'conflict', 'geest'],
  bio: 'Georg Wilhelm Friedrich Hegel bouwde een van de grootste filosofische systemen ooit. De werkelijkheid ontwikkelt zich volgens hem dialectisch: door tegenstellingen heen, naar steeds meer vrijheid en zelfbewustzijn. Hij voltooide zijn Phänomenologie des Geistes in Jena terwijl Napoleon de stad innam, en eindigde als de beroemdste filosoof van Berlijn. Marx, Kierkegaard en vele anderen zetten zich tegen hem af.',
  keyConcepts: [
    {
      term: 'Dialectiek',
      explanation: 'Een gedachte roept haar tegendeel op; samen leiden ze tot iets nieuws.',
    },
    {
      term: 'Heer en knecht',
      explanation: 'Zelfbewustzijn ontstaat in de strijd om erkenning door een ander.',
    },
    {
      term: 'Vrijheid in de geschiedenis',
      explanation: 'De wereldgeschiedenis is de vooruitgang in het bewustzijn van vrijheid.',
    },
  ],
  keyWorks: [
    { title: 'Phänomenologie des Geistes', year: '1807' },
    { title: 'Wissenschaft der Logik', year: '1812–1816' },
    { title: 'Grundlinien der Philosophie des Rechts', year: '1820' },
    { title: 'Vorlesungen über die Philosophie der Geschichte', year: 'postuum' },
  ],
  lifeEvents: [
    { year: '1770', text: 'Geboren in Stuttgart.' },
    {
      year: '1788–1793',
      text: 'Studeert in Tübingen en deelt er een kamer met Hölderlin en Schelling.',
    },
    { year: '1806', text: 'Ziet Napoleon door Jena rijden: "de wereldgeest te paard".' },
    { year: '1818', text: 'Wordt hoogleraar in Berlijn.' },
    { year: '1831', text: 'Sterft in Berlijn tijdens een cholera-epidemie.' },
  ],
  quotes: [
    {
      text: 'De uil van Minerva begint pas bij het vallen van de schemering aan zijn vlucht.',
      source: 'Grundlinien der Philosophie des Rechts (1820), voorrede',
      status: 'authentiek',
      translation: 'eigen',
      verified: true,
    },
    {
      text: 'Wat redelijk is, is werkelijk; en wat werkelijk is, is redelijk.',
      original: 'Was vernünftig ist, das ist wirklich; und was wirklich ist, das ist vernünftig.',
      source: 'Grundlinien der Philosophie des Rechts (1820), voorrede',
      status: 'authentiek',
      translation: 'eigen',
      verified: true,
    },
  ],
  voice: {
    register: 'Zwaar en diepzinnig op papier, verrassend humoristisch in gesprek.',
    method:
      'Zoekt in elke tegenstelling de beweging naar iets hogers: wat leren beide kanten ons samen?',
  },
  modernLens:
    'Hegel herkent in de strijd om erkenning op sociale media de oude dialectiek van heer en knecht.',
  controversies: [
    'In zijn colleges over de geschiedenis noemde hij Afrika "zonder geschiedenis": een eurocentrisch en racistisch oordeel.',
  ],
  network: [
    { id: 'kant', relation: 'invloed' },
    { id: 'fichte', relation: 'invloed' },
    { id: 'herder', relation: 'invloed' },
    { id: 'spinoza', relation: 'invloed' },
    { id: 'heraclitus', relation: 'invloed' },
    { id: 'aristoteles', relation: 'invloed' },
    { id: 'schopenhauer', relation: 'rivaal' },
    { id: 'goethe', relation: 'tijdgenoot' },
    { id: 'kierkegaard', relation: 'criticus' },
  ],
  helpsWith: ['conflict als motor van groei', 'erkenning', 'geschiedenis begrijpen'],
});
