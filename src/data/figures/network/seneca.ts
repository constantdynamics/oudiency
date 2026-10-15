import { networkFigure } from '../define';

export const seneca = networkFigure({
  id: 'seneca',
  name: 'Seneca',
  nativeName: 'Lucius Annaeus Seneca',
  nativeScript: 'latin',
  epithet: 'Stoïcijn aan het hof van Nero',
  born: -4,
  died: 65,
  approximate: true,
  displayYears: 'ca. 4 v.Chr.–65 n.Chr.',
  origin: 'Corduba (Hispania, nu Córdoba)',
  school: 'Stoa',
  family: 'romeins',
  tags: ['tijd', 'uitstelgedrag', 'stoicisme', 'woede', 'rijkdom', 'dood', 'vriendschap', 'stress'],
  bio: 'Lucius Annaeus Seneca was filosoof, toneelschrijver en een van de rijkste mannen van Rome. Hij was leraar en later adviseur van de jonge keizer Nero. In zijn Brieven aan Lucilius en zijn essays over woede, tijd en geluk schreef hij levendig over het stoïcijnse leven. Toen Nero hem van samenzwering beschuldigde, moest hij zich in 65 van het leven beroven.',
  keyConcepts: [
    {
      term: 'De kortheid van het leven',
      explanation: 'We krijgen niet te weinig tijd, maar verspillen er veel van.',
    },
    { term: 'Woede beteugelen', explanation: 'Woede is een tijdelijke waanzin; uitstel is het beste medicijn.' },
    {
      term: 'Avondreflectie',
      explanation: 'Elke avond je dag doornemen: wat ging goed, wat kan beter? (Over woede III.36)',
    },
  ],
  keyWorks: [
    { title: 'Brieven aan Lucilius (Epistulae morales)' },
    { title: 'Over de kortheid van het leven (De brevitate vitae)' },
    { title: 'Over woede (De ira)' },
    { title: 'Over het gelukkige leven (De vita beata)' },
  ],
  lifeEvents: [
    { year: 'ca. 4 v.Chr.', text: 'Geboren in Corduba.' },
    { year: '41', text: 'Wordt door keizer Claudius verbannen naar Corsica.' },
    { year: '49', text: 'Wordt teruggeroepen om de jonge Nero te onderwijzen.' },
    { year: '54', text: 'Wordt de belangrijkste adviseur van keizer Nero.' },
    {
      year: '65',
      text: 'Wordt beschuldigd van betrokkenheid bij een samenzwering en moet zich op bevel van Nero van het leven beroven.',
    },
  ],
  quotes: [
    {
      text: 'Niet omdat het moeilijk is, durven we niet; omdat we niet durven, is het moeilijk.',
      original: 'Non quia difficilia sunt non audemus, sed quia non audemus difficilia sunt.',
      source: 'Brieven aan Lucilius 104.26',
      status: 'authentiek',
      translation: 'eigen',
      verified: true,
    },
    {
      text: 'Het is niet zo dat we weinig tijd hebben; we verspillen er veel van.',
      original: 'Non exiguum temporis habemus, sed multum perdidimus.',
      source: 'Over de kortheid van het leven 1.3',
      status: 'authentiek',
      translation: 'eigen',
      verified: true,
    },
    {
      text: 'Terwijl het wordt uitgesteld, rent het leven voorbij.',
      original: 'Dum differtur vita transcurrit.',
      source: 'Brieven aan Lucilius 1.3',
      status: 'authentiek',
      translation: 'eigen',
      verified: true,
    },
  ],
  voice: {
    register: 'Elegant, beeldend en persoonlijk, alsof hij een brief schrijft aan een vriend.',
    method: 'Begint bij een alledaagse gebeurtenis en leidt die naar een levensles.',
  },
  modernLens:
    'Seneca ziet in onze volle agenda’s en het eindeloze scrollen precies het tijdverlies waarover hij schreef, en vraagt: welk deel van deze dag was echt van jou?',
  controversies: [
    'Hij predikte eenvoud terwijl hij een enorm fortuin bezat, en diende jarenlang een gewelddadige keizer. Die tegenstrijdigheid werd hem al in zijn eigen tijd verweten.',
  ],
  network: [
    { id: 'zeno', relation: 'invloed' },
    { id: 'chrysippus', relation: 'invloed' },
    { id: 'socrates', relation: 'voorbeeld' },
    { id: 'musonius', relation: 'tijdgenoot' },
    { id: 'epictetus', relation: 'geestverwant' },
    { id: 'aurelius', relation: 'navolger' },
    { id: 'montaigne', relation: 'navolger' },
    { id: 'fronto', relation: 'criticus', note: 'vond zijn stijl verwerpelijk' },
  ],
  helpsWith: ['tijd en uitstelgedrag', 'woede', 'rijkdom en eenvoud'],
});
