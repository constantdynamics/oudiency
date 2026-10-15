import { networkFigure } from '../define';

export const hume = networkFigure({
  id: 'hume',
  name: 'David Hume',
  shortName: 'Hume',
  nativeScript: 'latin',
  monogram: 'DH',
  epithet: 'De opgewekte scepticus',
  born: 1711,
  died: 1776,
  origin: 'Edinburgh, Schotland',
  school: 'Empirisme; Schotse Verlichting',
  family: 'brits',
  tags: [
    'twijfel',
    'empirisme',
    'emoties',
    'gewoonte',
    'religie',
    'oorzaak',
    'geschiedenis',
    'vriendschap',
    'bewijs',
  ],
  bio: 'David Hume was een Schotse filosoof, historicus en essayist, beroemd om zijn scherpe twijfel en zijn goede humeur. Op zijn achtentwintigste publiceerde hij A Treatise of Human Nature, dat volgens hemzelf doodgeboren van de pers viel. Hij betoogde dat ons idee van oorzaak en gevolg uit gewoonte voortkomt, niet uit de rede, en dat de rede de dienaar is van onze gevoelens. Zijn twijfel wekte Kant uit diens "dogmatische sluimer".',
  keyConcepts: [
    {
      term: 'Gewoonte',
      explanation:
        'We verwachten dat de zon morgen opkomt uit gewoonte; de rede kan het niet bewijzen.',
    },
    {
      term: 'Van zijn naar moeten',
      explanation: 'Uit hoe de dingen zijn, volgt niet zomaar hoe ze moeten zijn.',
    },
    {
      term: 'Rede en hartstocht',
      explanation: 'De rede wijst de weg, maar onze gevoelens bepalen waar we heen willen.',
    },
  ],
  keyWorks: [
    { title: 'A Treatise of Human Nature', year: '1739–1740' },
    { title: 'An Enquiry concerning Human Understanding', year: '1748' },
    { title: 'An Enquiry concerning the Principles of Morals', year: '1751' },
    { title: 'The History of England', year: '1754–1762' },
    { title: 'Dialogues concerning Natural Religion', year: '1779 (postuum)' },
  ],
  lifeEvents: [
    { year: '1711', text: 'Geboren in Edinburgh.' },
    { year: '1734–1737', text: 'Woont in La Flèche in Frankrijk en schrijft daar zijn Treatise.' },
    { year: '1739', text: 'Het Treatise verschijnt en wordt nauwelijks opgemerkt.' },
    {
      year: '1752',
      text: 'Wordt bibliothecaris in Edinburgh en begint aan zijn geschiedenis van Engeland.',
    },
    {
      year: '1763–1765',
      text: 'Werkt op de Britse ambassade in Parijs, waar de salons hem "le bon David" noemen.',
    },
    {
      year: '1766',
      text: 'Neemt Rousseau mee naar Engeland; hun vriendschap eindigt in een openbare ruzie.',
    },
    { year: '1776', text: 'Sterft in Edinburgh, opgewekt tot het einde.' },
  ],
  quotes: [
    {
      text: 'De rede is, en behoort te zijn, alleen de slaaf van de hartstochten.',
      original: 'Reason is, and ought only to be the slave of the passions.',
      source: 'A Treatise of Human Nature 2.3.3',
      status: 'authentiek',
      translation: 'eigen',
      verified: true,
    },
    {
      text: 'Een wijs mens stemt zijn geloof dus af op het bewijs.',
      original: 'A wise man, therefore, proportions his belief to the evidence.',
      source: 'An Enquiry concerning Human Understanding, sectie X',
      status: 'authentiek',
      translation: 'eigen',
      verified: true,
    },
  ],
  voice: {
    register: 'Opgewekt, ironisch en verbazend redelijk; twijfelt met een glimlach.',
    method: 'Vraagt waar een idee vandaan komt: uit welke ervaring? En hoe zeker is het dus?',
  },
  modernLens:
    'Hume vraagt bij elk sensationeel bericht: hoe sterk is het bewijs? En hij glimlacht om de mens die denkt dat hij zuiver redelijk kiest.',
  controversies: [
    'In een voetnoot in zijn essay "Of National Characters" schreef hij racistisch over niet-witte mensen; die passage wordt nu breed veroordeeld.',
  ],
  network: [
    { id: 'kant', relation: 'criticus', note: 'Hume wekte hem uit zijn sluimer' },
    { id: 'franklin', relation: 'vriend' },
    { id: 'rousseau', relation: 'vriend', note: 'later ruzie' },
    { id: 'smith', relation: 'vriend' },
    { id: 'locke', relation: 'invloed' },
    { id: 'newton', relation: 'invloed' },
    { id: 'diderot', relation: 'vriend' },
    { id: 'montesquieu', relation: 'correspondent' },
  ],
  helpsWith: ['kritisch denken', 'gewoontes en verwachtingen', 'rede en gevoel'],
});
