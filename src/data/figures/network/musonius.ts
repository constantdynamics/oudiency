import { networkFigure } from '../define';

export const musonius = networkFigure({
  id: 'musonius',
  name: 'Musonius Rufus',
  shortName: 'Musonius',
  nativeScript: 'latin',
  monogram: 'MR',
  epithet: 'De Romeinse Socrates',
  born: 30,
  died: 100,
  approximate: true,
  displayYears: 'ca. 30–100',
  origin: 'Volsinii (Etrurië)',
  school: 'Stoa',
  family: 'romeins',
  tags: ['stoicisme', 'gelijkheid', 'vrouwen', 'opvoeding', 'eenvoud', 'oefening', 'discipline'],
  bio: 'Gaius Musonius Rufus was een Romeinse ridder en een van de grote leraren van de Stoa in de eerste eeuw. Hij werd meermaals verbannen, onder meer door Nero naar het rotsige eiland Gyaros. Hij hamerde op oefening boven theorie en op een eenvoudig leven, en verdedigde opvallend modern dat vrouwen evengoed filosofie moeten studeren als mannen.',
  keyConcepts: [
    {
      term: 'Oefening',
      native: 'ἄσκησις',
      explanation:
        'Deugd leer je niet uit boeken alleen, maar door dagelijkse oefening van lichaam en geest.',
    },
    {
      term: 'Gelijke opvoeding',
      explanation: 'Dochters en zonen verdienen dezelfde opvoeding in deugd en filosofie.',
    },
  ],
  keyWorks: [
    {
      title: 'Diatriben (Lessen)',
      note: 'Opgetekend door zijn leerling Lucius, bewaard bij Stobaeus.',
    },
  ],
  lifeEvents: [
    { year: 'ca. 30', text: 'Geboren in Volsinii, als Romeins ridder.' },
    { year: '65', text: 'Wordt door Nero verbannen naar het eiland Gyaros.' },
    {
      year: '69',
      text: 'Probeert tijdens de burgeroorlog soldaten tot vrede te bewegen, en wordt uitgelachen.',
    },
    { year: 'ca. 100', text: 'Sterft.' },
  ],
  quotes: [
    {
      text: 'Vrouwen hebben van de goden hetzelfde verstand gekregen als mannen.',
      source: 'Diatribe 3, "Dat ook vrouwen filosofie moeten studeren"',
      status: 'parafrase',
      translation: 'eigen',
      verified: true,
      note: 'Kern van zijn derde les, zoals opgetekend door Lucius.',
    },
  ],
  voice: {
    register: 'Ernstig, praktisch en direct.',
    method: 'Vraagt niet wat je weet, maar wat je oefent.',
  },
  modernLens:
    'Musonius zou blij zijn dat vrouwen nu overal studeren, en zou ons aanraden vaker iets te oefenen dat moeilijk is: eenvoud, matigheid, een koude ochtend.',
  network: [
    { id: 'zeno', relation: 'invloed' },
    { id: 'epictetus', relation: 'leerling' },
    { id: 'seneca', relation: 'tijdgenoot' },
    { id: 'socrates', relation: 'voorbeeld' },
  ],
  helpsWith: ['discipline en oefening', 'gelijkwaardigheid'],
});
