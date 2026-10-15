import { networkFigure } from '../define';

export const wangbi = networkFigure({
  id: 'wangbi',
  name: 'Wang Bi',
  nativeName: '王弼',
  nativeScript: 'han',
  monogram: '王',
  epithet: 'Het wonderkind van de duistere leer',
  born: 226,
  died: 249,
  origin: 'Shanyang (in het huidige Shandong, China)',
  school: 'Xuanxue ("duistere leer"), neotaoïsme',
  family: 'chinees',
  theme: { primary: '#283a3a', motif: 'inkwash' },
  tags: ['taoisme', 'leegte', 'interpretatie', 'jeugd', 'betekenis', 'taal'],
  bio: 'Wang Bi stierf op zijn drieëntwintigste, en toch schreef hij commentaren op de Daodejing en de Yijing die eeuwenlang de standaard bleven. Hij was een wonderkind aan het hof van de Wei-dynastie en een van de grondleggers van de "duistere leer" (xuanxue), die taoïsme en confucianisme verbond rond het idee van het niet-zijn als grond van alles.',
  keyConcepts: [
    { term: 'Niet-zijn', native: '無', explanation: 'De leegte als grond van alles wat is.' },
    {
      term: 'De betekenis grijpen, het beeld vergeten',
      native: '得意忘象',
      explanation: 'Woorden en beelden zijn middelen; heb je de betekenis, laat ze dan los.',
    },
  ],
  keyWorks: [
    { title: 'Commentaar op de Daodejing (老子注)' },
    { title: 'Commentaar op de Yijing (周易注)' },
    { title: 'Algemene opmerkingen over de Yijing (周易略例)' },
  ],
  lifeEvents: [
    { year: '226', text: 'Geboren.' },
    {
      year: 'jaren 240',
      text: 'Maakt aan het hof van Wei indruk met zijn gesprekken over het niet-zijn.',
    },
    { year: '249', text: 'Sterft aan een ziekte, 23 jaar oud.' },
  ],
  quotes: [
    {
      text: 'Wie de betekenis grijpt, vergeet het beeld; wie het beeld grijpt, vergeet de woorden.',
      original: '得意在忘象，得象在忘言',
      source: 'Algemene opmerkingen over de Yijing, "Het beeld verhelderen"',
      status: 'authentiek',
      translation: 'eigen',
      verified: true,
    },
  ],
  voice: {
    register: 'Helder, jong en scherpzinnig; liefst kort.',
    method: 'Zoekt de kern achter de woorden en vraagt wat er overblijft als je het beeld loslaat.',
  },
  modernLens:
    'Wang Bi waarschuwt dat we in een zee van beelden en woorden de betekenis kwijt kunnen raken.',
  network: [
    { id: 'laozi', relation: 'invloed' },
    { id: 'confucius', relation: 'voorbeeld', note: 'zag in hem de ware wijze' },
    { id: 'zhuangzi', relation: 'invloed' },
  ],
  helpsWith: ['de kern zien', 'leegte en rust'],
});
