import { networkFigure } from '../define';

export const maimonides = networkFigure({
  id: 'maimonides',
  name: 'Maimonides',
  nativeName: 'Moshe ben Maimon',
  nativeScript: 'latin',
  monogram: 'M',
  epithet: 'Gids voor wie verdoold is',
  born: 1138,
  died: 1204,
  origin: 'Córdoba (Al-Andalus)',
  school: 'Middeleeuwse joodse filosofie; aristotelisme',
  family: 'middeleeuws',
  tags: ['geloof en rede', 'religie', 'liefdadigheid', 'geneeskunde', 'twijfel', 'wet'],
  bio: 'Moshe ben Maimon, bekend als Maimonides of de Rambam, was rabbijn, arts en filosoof. Zijn familie vluchtte voor vervolging uit Córdoba; hij belandde uiteindelijk in Egypte, waar hij lijfarts werd aan het hof van Saladins vizier. In zijn Gids voor de verdoolden probeerde hij geloof en de filosofie van Aristoteles met elkaar te verzoenen, voor wie verward was geraakt tussen beide.',
  keyConcepts: [
    { term: 'Negatieve theologie', explanation: 'Over God kun je alleen zeggen wat Hij níét is.' },
    {
      term: 'De acht treden van liefdadigheid',
      explanation: 'De hoogste trede is iemand helpen zelfstandig te worden.',
    },
    { term: 'Geloof en rede', explanation: 'Ware rede en ware openbaring spreken elkaar niet tegen.' },
  ],
  keyWorks: [
    { title: 'Mishneh Torah', year: 'ca. 1180' },
    { title: 'Gids voor de verdoolden (Moreh Nevukhim)', year: 'ca. 1190' },
  ],
  lifeEvents: [
    { year: '1138', text: 'Geboren in Córdoba.' },
    { year: '1148', text: 'De Almohaden veroveren Córdoba; zijn familie begint aan jaren van zwerven.' },
    { year: 'ca. 1166', text: 'Vestigt zich in Fustat (Oud-Caïro).' },
    { year: '1180', text: 'Voltooit de Mishneh Torah, een overzicht van de hele joodse wet.' },
    { year: 'ca. 1190', text: 'Schrijft de Gids voor de verdoolden.' },
    { year: '1204', text: 'Sterft in Fustat.' },
  ],
  voice: {
    register: 'Helder, geleerd en geduldig: een arts die ook de geest wil genezen.',
    method: 'Lost verwarring op door begrippen zorgvuldig te ontleden, met respect voor zowel geloof als rede.',
  },
  modernLens:
    'Maimonides veroordeelt wie twijfelt tussen geloof en wetenschap niet, maar geeft een gids, en wijst op de hoogste vorm van hulp: iemand zelfstandig maken.',
  network: [
    { id: 'aristoteles', relation: 'invloed' },
    { id: 'spinoza', relation: 'criticus' },
    { id: 'mendelssohn', relation: 'navolger' },
  ],
  helpsWith: ['geloof en wetenschap verbinden', 'goed helpen'],
});
