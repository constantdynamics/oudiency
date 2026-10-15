import { networkFigure } from '../define';

export const chrysippus = networkFigure({
  id: 'chrysippus',
  name: 'Chrysippus',
  nativeName: 'Χρύσιππος',
  nativeScript: 'greek',
  epithet: 'De tweede grondlegger van de Stoa',
  born: -279,
  died: -206,
  approximate: true,
  displayYears: 'ca. 279–206 v.Chr.',
  origin: 'Soloi (Cilicië)',
  school: 'Stoa',
  family: 'grieks',
  theme: { primary: '#38475e', motif: 'compass' },
  tags: ['logica', 'stoicisme', 'lot', 'vrije wil', 'emoties', 'redeneren'],
  bio: 'Chrysippus was het derde hoofd van de Stoa en de grote systematicus van de school. Hij zou meer dan zevenhonderd boeken hebben geschreven, vooral over logica; vrijwel niets daarvan is bewaard. In de oudheid zei men: "Als Chrysippus er niet was geweest, was er geen Stoa geweest."',
  keyConcepts: [
    {
      term: 'Stoïcijnse logica',
      explanation:
        'Redeneren met hele uitspraken (als … dan …, of … of …): een voorloper van de moderne logica.',
    },
    {
      term: 'De rollende cilinder',
      explanation:
        'Een duw zet een cilinder in beweging, maar hoe hij rolt hangt af van zijn eigen vorm. Zo verenigde hij lot en verantwoordelijkheid (bij Cicero, Over het lot).',
    },
    {
      term: 'Emoties als oordelen',
      explanation: 'Een emotie is een overhaast oordeel dat ons overvalt, en daarom te corrigeren.',
    },
  ],
  keyWorks: [
    { title: 'Logische onderzoekingen', note: 'Fragmenten op een papyrus uit Herculaneum.' },
  ],
  lifeEvents: [
    { year: 'ca. 279 v.Chr.', text: 'Geboren in Soloi.' },
    {
      year: 'ca. 260 v.Chr.',
      text: 'Komt naar Athene en studeert bij Cleanthes, de opvolger van Zeno.',
    },
    { year: 'ca. 232 v.Chr.', text: 'Wordt hoofd van de Stoa.' },
    {
      year: 'ca. 206 v.Chr.',
      text: 'Sterft; volgens een anekdote van het lachen om een ezel die vijgen at.',
    },
  ],
  voice: {
    register: 'Scherpzinnig, grondig en een tikje pedant.',
    method: 'Ontleedt een redenering in stappen en zoekt de zwakke schakel.',
  },
  modernLens:
    'Chrysippus zou in computerlogica familie van zijn eigen als-dan-redeneringen herkennen, en zich erover verbazen dat machines nu redeneren.',
  network: [
    { id: 'zeno', relation: 'invloed' },
    { id: 'heraclitus', relation: 'invloed' },
    { id: 'epictetus', relation: 'navolger' },
    { id: 'seneca', relation: 'navolger' },
    { id: 'aurelius', relation: 'navolger' },
    { id: 'plutarchus', relation: 'criticus' },
  ],
  helpsWith: ['helder redeneren', 'lot en vrije wil'],
});
