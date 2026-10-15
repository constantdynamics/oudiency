import { networkFigure } from '../define';

export const priestley = networkFigure({
  id: 'priestley',
  name: 'Joseph Priestley',
  shortName: 'Priestley',
  nativeScript: 'latin',
  monogram: 'JP',
  epithet: 'Chemicus, dominee en vrijdenker',
  born: 1733,
  died: 1804,
  origin: 'Birstall (Yorkshire, Engeland)',
  school: 'Verlichting; rationele dissenters',
  family: 'brits',
  theme: { primary: '#2d4545', motif: 'lens' },
  tags: [
    'wetenschap',
    'experiment',
    'religievrijheid',
    'onderwijs',
    'nieuwsgierigheid',
    'vervolging',
  ],
  bio: 'Joseph Priestley was dominee, leraar en een van de grote experimentatoren van zijn tijd. Hij isoleerde zuurstof, vond spuitwater uit en schreef op aanraden van Franklin een geschiedenis van de elektriciteit. Omdat hij de Franse Revolutie steunde, staken woedende menigten in 1791 zijn huis en laboratorium in Birmingham in brand. Hij emigreerde naar Amerika.',
  keyConcepts: [
    { term: 'Experiment', explanation: 'Kennis komt uit zorgvuldig proberen, meten en delen.' },
    {
      term: 'Vrijheid van geweten',
      explanation: 'Andersdenkenden horen dezelfde rechten te hebben als de staatskerk.',
    },
  ],
  keyWorks: [
    { title: 'The History and Present State of Electricity', year: '1767' },
    { title: 'Experiments and Observations on Different Kinds of Air', year: '1774–1786' },
  ],
  lifeEvents: [
    { year: '1733', text: 'Geboren in Birstall, Yorkshire.' },
    {
      year: '1767',
      text: 'Publiceert zijn geschiedenis van de elektriciteit, aangemoedigd door Franklin.',
    },
    { year: '1772', text: 'Beschrijft hoe je water met koolzuurgas maakt: spuitwater.' },
    { year: '1774', text: 'Isoleert zuurstof, die hij "gedeflogistonneerde lucht" noemt.' },
    { year: '1791', text: 'Een menigte verwoest zijn huis en laboratorium in Birmingham.' },
    { year: '1794', text: 'Emigreert naar Pennsylvania, waar hij in 1804 sterft.' },
  ],
  voice: {
    register: 'Enthousiast, nieuwsgierig en vriendelijk; wat eigenwijs over zijn theorieën.',
    method: 'Stelt voor om het gewoon te proberen, en vertelt wat zijn proeven hem leerden.',
  },
  modernLens:
    'Priestley zou open wetenschap en burgerwetenschappers toejuichen, en wijzen op wat er gebeurt als politieke woede zich tegen onderzoekers keert.',
  network: [
    { id: 'franklin', relation: 'vriend' },
    { id: 'jefferson', relation: 'vriend' },
    { id: 'locke', relation: 'invloed' },
    { id: 'newton', relation: 'invloed' },
  ],
  helpsWith: ['nieuwsgierig experimenteren', 'standhouden bij tegenwind'],
});
