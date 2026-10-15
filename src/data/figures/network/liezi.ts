import { networkFigure } from '../define';

export const liezi = networkFigure({
  id: 'liezi',
  name: 'Liezi',
  nativeName: '列子',
  nativeScript: 'han',
  monogram: '列',
  epithet: 'De meester die op de wind reed',
  born: -450,
  died: -375,
  approximate: true,
  displayYears: 'traditioneel 5e–4e eeuw v.Chr.',
  origin: 'Staat Zheng (China), volgens de overlevering',
  school: 'Taoïsme',
  family: 'chinees',
  theme: { primary: '#334a44', motif: 'wave' },
  tags: ['taoisme', 'volharding', 'loslaten', 'verhalen', 'lot', 'dromen'],
  bio: 'Liezi is een legendarische taoïstische meester uit de staat Zheng, die volgens Zhuangzi op de wind kon rijden. Het boek dat zijn naam draagt, is waarschijnlijk pas eeuwen later samengesteld, maar bevat prachtige verhalen, zoals dat van de oude dwaas die bergen verzette. Het bevat ook een opvallend hoofdstuk over de denker Yang Zhu.',
  keyConcepts: [
    {
      term: 'De oude dwaas die bergen verzette',
      native: '愚公移山',
      explanation: 'Volharding over generaties heen: wat één leven niet kan, kunnen kinderen en kleinkinderen.',
    },
    { term: 'Op de wind rijden', explanation: 'Volledige vrijheid, omdat je nergens aan vastzit.' },
  ],
  keyWorks: [{ title: 'Liezi (列子)', note: 'In de huidige vorm samengesteld rond de 4e eeuw n.Chr., uit oudere stof.' }],
  lifeEvents: [
    { year: 'traditioneel 5e eeuw v.Chr.', text: 'Leeft volgens de overlevering arm en teruggetrokken in de staat Zheng.' },
    {
      year: 'overlevering',
      text: 'Weigert graan dat de premier van Zheng hem laat brengen; niet lang daarna wordt die premier vermoord.',
    },
    { year: 'ca. 300 n.Chr.', text: 'Het boek Liezi krijgt zijn huidige vorm.' },
  ],
  voice: {
    register: 'Verhalend en luchtig; laat je eerst lachen en dan nadenken.',
    method: 'Vertelt een gelijkenis en vraagt wat jij erin ziet.',
  },
  modernLens:
    'Liezi zou bij grote, trage opgaven wijzen op de oude dwaas: wat jij niet afmaakt, maken je kleinkinderen af.',
  network: [
    { id: 'laozi', relation: 'invloed' },
    { id: 'zhuangzi', relation: 'geestverwant' },
    { id: 'yangzhu', relation: 'geestverwant' },
  ],
  helpsWith: ['volhouden', 'zorgen loslaten'],
});
