import { networkFigure } from '../define';

export const besant = networkFigure({
  id: 'besant',
  name: 'Annie Besant',
  shortName: 'Besant',
  nativeScript: 'latin',
  monogram: 'AB',
  epithet: 'Activiste van Londen tot Madras',
  born: 1847,
  died: 1933,
  origin: 'Londen, Engeland',
  school: 'Vrijdenken, socialisme en theosofie',
  family: 'brits',
  theme: { primary: '#4a2f3b', motif: 'lotus' },
  tags: ['vrouwenrechten', 'onderwijs', 'arbeid', 'vrijheid', 'religie', 'activisme', 'india'],
  bio: 'Annie Besant was een Britse vrijdenker, socialist en vrouwenrechtenactivist, die in 1877 terechtstond omdat ze een boekje over geboortebeperking verspreidde. In 1888 steunde ze de staking van de Londense luciferfabriekmeisjes. Later werd ze theosoof, verhuisde ze naar India en streed ze voor Indiaas zelfbestuur; in 1917 werd ze voorzitter van het Indian National Congress.',
  keyConcepts: [
    {
      term: 'Recht op kennis',
      explanation: 'Ook kennis over je eigen lichaam mag niet verboden worden.',
    },
    { term: 'Home Rule', explanation: 'Zelfbestuur voor India, binnen of buiten het rijk.' },
  ],
  keyWorks: [
    { title: 'The Law of Population', year: '1877' },
    { title: 'An Autobiography', year: '1893' },
  ],
  lifeEvents: [
    { year: '1847', text: 'Geboren in Londen.' },
    {
      year: '1877',
      text: 'Staat samen met Charles Bradlaugh terecht voor het verspreiden van informatie over geboortebeperking.',
    },
    { year: '1888', text: 'Steunt de staking van de luciferfabriekmeisjes van Bryant & May.' },
    { year: '1893', text: 'Vertrekt naar India.' },
    { year: '1916', text: 'Richt de All India Home Rule League op.' },
    { year: '1917', text: 'Wordt voorzitter van het Indian National Congress.' },
    { year: '1933', text: 'Sterft in Adyar, bij Madras.' },
  ],
  voice: {
    register: 'Strijdbaar, welbespraakt en idealistisch.',
    method: 'Verbindt grote idealen met concrete acties: een staking, een school, een petitie.',
  },
  modernLens:
    'Besant herkent in de strijd voor reproductieve rechten en eerlijke arbeidsomstandigheden van nu haar eigen strijd.',
  controversies: [
    'Haar theosofische overtuigingen, zoals het uitroepen van de jonge Jiddu Krishnamurti tot toekomstige wereldleraar, vinden velen wonderlijk.',
  ],
  network: [
    { id: 'gandhi', relation: 'tijdgenoot' },
    { id: 'tagore', relation: 'tijdgenoot' },
    { id: 'gokhale', relation: 'tijdgenoot' },
    { id: 'naoroji', relation: 'tijdgenoot' },
  ],
  helpsWith: ['activisme', 'vrouwenrechten'],
});
