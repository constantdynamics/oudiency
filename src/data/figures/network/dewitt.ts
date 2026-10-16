import { networkFigure } from '../define';

export const dewitt = networkFigure({
  id: 'dewitt',
  name: 'Johan de Witt',
  shortName: 'De Witt',
  nativeScript: 'latin',
  monogram: 'JW',
  epithet: 'Raadpensionaris en wiskundige',
  born: 1625,
  died: 1672,
  origin: 'Dordrecht, Republiek der Nederlanden',
  school: 'Staatsmanschap; wiskunde',
  family: 'gouden-eeuw',
  theme: { primary: '#2a4049', accent: '#c4813a' },
  tags: ['politiek', 'republiek', 'wiskunde', 'vrijheid', 'populisme', 'geweld', 'risico'],
  bio: 'Johan de Witt was bijna twintig jaar raadpensionaris van Holland en daarmee de machtigste politicus van de Republiek zonder stadhouder. Hij was ook een begaafd wiskundige die als een van de eersten berekende wat een lijfrente waard is. In het Rampjaar 1672 werd hij samen met zijn broer Cornelis in Den Haag door een woedende menigte vermoord.',
  keyConcepts: [
    {
      term: 'Ware Vrijheid',
      explanation: 'Een republiek zonder stadhouder, bestuurd door de Staten.',
    },
    {
      term: 'De waarde van lijfrenten',
      explanation: 'Kansrekening toegepast op de staatsfinanciën.',
    },
  ],
  keyWorks: [
    { title: 'Elementa curvarum linearum', year: '1659' },
    { title: 'Waardije van Lyf-renten naer proportie van Los-renten', year: '1671' },
  ],
  lifeEvents: [
    { year: '1625', text: 'Geboren in Dordrecht.' },
    { year: '1653', text: 'Wordt raadpensionaris van Holland.' },
    {
      year: '1667',
      text: 'Na de tocht naar Chatham sluit de Republiek een gunstige vrede met Engeland.',
    },
    { year: '1671', text: 'Publiceert zijn berekening van de waarde van lijfrenten.' },
    {
      year: '1672',
      text: 'Wordt in het Rampjaar met zijn broer Cornelis in Den Haag door een menigte vermoord.',
    },
  ],
  voice: {
    register: 'Kalm, rationeel en zakelijk.',
    method: 'Rekent de dingen door en kiest het redelijke boven het populaire.',
  },
  modernLens:
    'De Witt herkent in het opgehitste klimaat van sociale media de woede die hem fataal werd, en pleit voor redelijk bestuur.',
  network: [
    { id: 'spinoza', relation: 'tijdgenoot' },
    { id: 'huygens', relation: 'correspondent' },
    { id: 'vandenenden', relation: 'tijdgenoot' },
    { id: 'descartes', relation: 'invloed' },
  ],
  helpsWith: ['redelijk besturen onder druk', 'rekenen aan risico’s'],
});
