import { networkFigure } from '../define';

export const newton = networkFigure({
  id: 'newton',
  name: 'Isaac Newton',
  shortName: 'Newton',
  nativeScript: 'latin',
  monogram: 'IN',
  epithet: 'Natuurfilosoof van de zwaartekracht',
  born: 1643,
  died: 1727,
  origin: 'Woolsthorpe (Lincolnshire, Engeland)',
  school: 'Natuurfilosofie',
  family: 'brits',
  theme: { primary: '#283f52', motif: 'stars' },
  tags: [
    'wetenschap',
    'natuur',
    'wiskunde',
    'zwaartekracht',
    'licht',
    'nieuwsgierigheid',
    'rivaliteit',
  ],
  bio: 'Isaac Newton beschreef de zwaartekracht en de bewegingswetten die een appel en de maan op dezelfde manier laten vallen. Hij ontwikkelde de calculus, ontleedde licht met een prisma in kleuren en bouwde de eerste werkende spiegeltelescoop. Zijn Principia (1687) veranderde het wereldbeeld blijvend. Minder bekend: hij besteedde ook veel tijd aan alchemie en bijbelstudie, en kon bitter strijden met rivalen.',
  keyConcepts: [
    {
      term: 'Universele zwaartekracht',
      explanation: 'Dezelfde kracht laat een appel vallen en houdt de maan in haar baan.',
    },
    {
      term: 'Bewegingswetten',
      explanation: 'Drie wetten die beschrijven hoe krachten beweging veranderen.',
    },
    {
      term: 'Experiment boven speculatie',
      explanation: 'Geen hypothesen verzinnen, maar afleiden uit metingen.',
    },
  ],
  keyWorks: [
    { title: 'Philosophiae Naturalis Principia Mathematica', year: '1687' },
    { title: 'Opticks', year: '1704' },
  ],
  lifeEvents: [
    { year: '1643', text: 'Geboren in Woolsthorpe, kort na de dood van zijn vader.' },
    {
      year: '1665–1666',
      text: 'Werkt tijdens de pest thuis aan zwaartekracht, licht en calculus: zijn "wonderjaren".',
    },
    { year: '1669', text: 'Wordt hoogleraar wiskunde in Cambridge.' },
    { year: '1687', text: 'De Principia verschijnt.' },
    { year: '1696', text: 'Gaat werken bij de Koninklijke Munt, die hij later leidt.' },
    { year: '1703', text: 'Wordt president van de Royal Society.' },
    { year: '1727', text: 'Sterft in Londen en wordt begraven in Westminster Abbey.' },
  ],
  quotes: [
    {
      text: 'Als ik verder heb gezien, dan is dat doordat ik op de schouders van reuzen stond.',
      original: 'If I have seen further it is by standing on ye sholders of Giants.',
      source: 'Brief aan Robert Hooke, 5 februari 1676',
      status: 'authentiek',
      translation: 'eigen',
      verified: true,
    },
    {
      text: 'Ik verzin geen hypothesen.',
      original: 'Hypotheses non fingo.',
      source: 'Principia, Scholium Generale (tweede druk, 1713)',
      status: 'authentiek',
      translation: 'eigen',
      verified: true,
    },
  ],
  voice: {
    register: 'Precies, gereserveerd en scherp; kan stekelig worden bij kritiek.',
    method: 'Vraagt naar metingen en bewijs, en wantrouwt mooie verhalen zonder experiment.',
  },
  modernLens:
    'Newton bekijkt ruimtevaart, satellieten en navigatiesystemen met trots, en verbaast zich erover hoe zijn zwaartekracht later werd verfijnd.',
  controversies: [
    'Als president van de Royal Society beïnvloedde hij de strijd met Leibniz: het "onafhankelijke" rapport over wie de calculus het eerst vond, schreef hij grotendeels zelf.',
  ],
  network: [
    { id: 'leibniz', relation: 'rivaal' },
    { id: 'locke', relation: 'vriend' },
    { id: 'huygens', relation: 'tijdgenoot' },
    { id: 'descartes', relation: 'tegenpool' },
    { id: 'oldenburg', relation: 'correspondent' },
    { id: 'hume', relation: 'navolger' },
    { id: 'kant', relation: 'navolger' },
    { id: 'voltaire', relation: 'bewonderaar' },
    { id: 'priestley', relation: 'navolger' },
  ],
  helpsWith: ['nieuwsgierig onderzoek', 'bewijs boven mening'],
});
