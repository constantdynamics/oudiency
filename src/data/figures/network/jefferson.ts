import { networkFigure } from '../define';

export const jefferson = networkFigure({
  id: 'jefferson',
  name: 'Thomas Jefferson',
  shortName: 'Jefferson',
  nativeScript: 'latin',
  monogram: 'TJ',
  epithet: 'Schrijver van de Onafhankelijkheidsverklaring',
  born: 1743,
  died: 1826,
  origin: 'Shadwell, Virginia (Britse kolonie)',
  school: 'Verlichting; republicanisme',
  family: 'amerikaans',
  tags: ['vrijheid', 'gelijkheid', 'democratie', 'religievrijheid', 'onderwijs', 'rechten', 'hypocrisie'],
  bio: 'Thomas Jefferson schreef op zijn drieëndertigste het ontwerp van de Amerikaanse Onafhankelijkheidsverklaring, met de beroemde zin dat alle mensen gelijk geschapen zijn. Hij werd de derde president van de Verenigde Staten, verdubbelde het grondgebied met de aankoop van Louisiana en stichtte de Universiteit van Virginia. Tegelijk bezat hij zijn hele leven honderden tot slaaf gemaakte mensen.',
  keyConcepts: [
    { term: 'Onvervreemdbare rechten', explanation: 'Leven, vrijheid en het nastreven van geluk: rechten die geen regering mag afnemen.' },
    { term: 'Scheiding van kerk en staat', explanation: 'Een "muur van scheiding" tussen religie en overheid.' },
  ],
  keyWorks: [
    { title: 'De Onafhankelijkheidsverklaring', year: '1776', note: 'Het ontwerp, door het Congres bewerkt.' },
    { title: 'Virginia Statute for Religious Freedom', year: '1777, aangenomen 1786' },
    { title: 'Notes on the State of Virginia', year: '1785' },
  ],
  lifeEvents: [
    { year: '1743', text: 'Geboren in Shadwell, Virginia.' },
    { year: '1776', text: 'Schrijft het ontwerp van de Onafhankelijkheidsverklaring.' },
    { year: '1785–1789', text: 'Is gezant in Parijs en ziet het begin van de Franse Revolutie.' },
    { year: '1801–1809', text: 'Is de derde president van de Verenigde Staten.' },
    { year: '1819', text: 'Sticht de Universiteit van Virginia.' },
    { year: '1826', text: 'Sterft op 4 juli, precies vijftig jaar na de Onafhankelijkheidsverklaring, op dezelfde dag als John Adams.' },
  ],
  quotes: [
    {
      text: 'Wij houden deze waarheden voor vanzelfsprekend: dat alle mensen gelijk geschapen zijn, dat zij door hun Schepper zijn begiftigd met zekere onvervreemdbare rechten, waaronder leven, vrijheid en het nastreven van geluk.',
      source: 'Onafhankelijkheidsverklaring (1776)',
      status: 'authentiek',
      translation: 'eigen',
      verified: true,
    },
    {
      text: 'Ik heb op het altaar van God eeuwige vijandschap gezworen tegen elke vorm van tirannie over de geest van de mens.',
      source: 'Brief aan Benjamin Rush, 23 september 1800',
      status: 'authentiek',
      translation: 'eigen',
      verified: true,
    },
  ],
  voice: {
    register: 'Elegant, beheerst en idealistisch; schrijft beter dan hij spreekt.',
    method: 'Formuleert principes helder en algemeen, en toetst instellingen aan vrijheid en gelijkheid.',
  },
  modernLens:
    'Jefferson zou vrije pers en religievrijheid toejuichen, en moet zich tegelijk laten bevragen over de kloof tussen zijn idealen en zijn eigen leven.',
  controversies: [
    'Hij schreef dat alle mensen gelijk geschapen zijn, maar bezat zijn hele leven meer dan zeshonderd tot slaaf gemaakte mensen en liet bijna niemand van hen vrij.',
    'Hij had kinderen bij Sally Hemings, een vrouw die hij tot slaaf had gemaakt.',
  ],
  network: [
    { id: 'franklin', relation: 'tijdgenoot' },
    { id: 'adams', relation: 'correspondent', note: 'eerst rivalen, later briefvrienden' },
    { id: 'paine', relation: 'vriend' },
    { id: 'locke', relation: 'invloed' },
    { id: 'montesquieu', relation: 'invloed' },
    { id: 'priestley', relation: 'vriend' },
  ],
  helpsWith: ['vrijheid en rechten', 'idealen en hypocrisie'],
});
