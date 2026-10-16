import { networkFigure } from '../define';

export const herder = networkFigure({
  id: 'herder',
  name: 'Johann Gottfried Herder',
  shortName: 'Herder',
  nativeScript: 'latin',
  monogram: 'JH',
  epithet: 'Denker van taal en cultuur',
  born: 1744,
  died: 1803,
  origin: 'Mohrungen (Oost-Pruisen, nu Morąg in Polen)',
  school: 'Late Verlichting; Sturm und Drang',
  family: 'romantiek',
  theme: { primary: '#3e3352', motif: 'scroll' },
  tags: ['taal', 'cultuur', 'geschiedenis', 'identiteit', 'diversiteit', 'menselijkheid', 'muziek'],
  bio: 'Johann Gottfried Herder studeerde in Königsberg bij Kant en werd later diens criticus. Hij zag taal, cultuur en geschiedenis als de bodem waarin mensen wortelen: elk volk heeft een eigen manier om mens te zijn, met eigen liederen en verhalen. Hij verzamelde volksliederen uit heel Europa en beïnvloedde de jonge Goethe en de romantiek.',
  keyConcepts: [
    {
      term: 'Taal en denken',
      explanation: 'Denken gebeurt in taal; elke taal is een eigen manier van zien.',
    },
    {
      term: 'Elke cultuur van binnenuit',
      explanation:
        'Een cultuur moet je begrijpen vanuit haar eigen tijd en plaats, niet met de maatstaf van de jouwe.',
    },
    {
      term: 'Humaniteit',
      native: 'Humanität',
      explanation: 'Het doel van de geschiedenis: echte menselijkheid.',
    },
  ],
  keyWorks: [
    { title: 'Abhandlung über den Ursprung der Sprache', year: '1772' },
    { title: 'Volkslieder', year: '1778–1779' },
    { title: 'Ideen zur Philosophie der Geschichte der Menschheit', year: '1784–1791' },
    { title: 'Briefe zu Beförderung der Humanität', year: '1793–1797' },
  ],
  lifeEvents: [
    { year: '1744', text: 'Geboren in Mohrungen.' },
    { year: '1762–1764', text: 'Studeert in Königsberg en volgt colleges bij Kant.' },
    { year: '1770', text: 'Ontmoet in Straatsburg de jonge Goethe.' },
    {
      year: '1772',
      text: 'Wint de prijsvraag van de Berlijnse Academie over de oorsprong van de taal.',
    },
    { year: '1776', text: 'Wordt dankzij Goethe hoofdpredikant in Weimar.' },
    { year: '1803', text: 'Sterft in Weimar.' },
  ],
  voice: {
    register: 'Bevlogen, beeldend en breed; springt van taal naar muziek naar geschiedenis.',
    method:
      'Vraagt naar de wortels van een gedachte: uit welke taal, welk volk, welke tijd komt zij?',
  },
  modernLens:
    'Herder koestert de verscheidenheid aan talen en culturen in de wereld van nu, en waarschuwt voor één eenvormige wereldcultuur.',
  controversies: [
    'Zijn idee van een eigen "volksgeest" werd later door nationalisten misbruikt, al was Herder zelf tegen het verheffen van één volk boven andere.',
  ],
  network: [
    { id: 'kant', relation: 'leraar', note: 'later tegenpool' },
    { id: 'goethe', relation: 'vriend' },
    { id: 'rousseau', relation: 'invloed' },
    { id: 'spinoza', relation: 'invloed' },
    { id: 'leibniz', relation: 'invloed' },
    { id: 'hegel', relation: 'navolger' },
    { id: 'mendelssohn', relation: 'tijdgenoot' },
  ],
  helpsWith: ['taal en cultuur begrijpen', 'wortels en identiteit'],
});
