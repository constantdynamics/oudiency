import { networkFigure } from '../define';

export const rusticus = networkFigure({
  id: 'rusticus',
  name: 'Junius Rusticus',
  shortName: 'Rusticus',
  nativeName: 'Quintus Iunius Rusticus',
  nativeScript: 'latin',
  monogram: 'JR',
  epithet: 'Leermeester van Marcus Aurelius',
  born: 100,
  died: 170,
  approximate: true,
  displayYears: 'ca. 100–170',
  origin: 'Rome',
  school: 'Stoa',
  family: 'romeins',
  theme: { primary: '#5c3328' },
  tags: ['stoicisme', 'mentorschap', 'eenvoud', 'leiderschap', 'schrijven'],
  bio: 'Quintus Junius Rusticus was een stoïcijnse filosoof en staatsman, en de belangrijkste leraar in de filosofie van Marcus Aurelius. Marcus bedankt hem in de Meditaties omdat hij hem leerde zijn karakter te verbeteren, zonder opsmuk te schrijven en de aantekeningen van Epictetus te lezen. Hij was twee keer consul en werd prefect van de stad Rome.',
  keyConcepts: [
    {
      term: 'Eenvoud in stijl en leven',
      explanation:
        'Geen retorische vuurwerk, maar helder schrijven en sober leven (Meditaties 1.7).',
    },
    {
      term: 'Het juiste boek',
      explanation:
        'Een mentor geeft je het boek dat je op dat moment nodig hebt: voor Marcus waren dat de lessen van Epictetus.',
    },
  ],
  keyWorks: [
    {
      title: 'Marcus Aurelius, Meditaties 1.7',
      note: 'Hier beschrijft Marcus wat hij van Rusticus leerde.',
    },
  ],
  lifeEvents: [
    { year: 'ca. 100', text: 'Geboren.' },
    { year: 'jaren 140', text: 'Wordt de leraar filosofie van de jonge Marcus Aurelius.' },
    { year: '162', text: 'Wordt voor de tweede keer consul, en daarna prefect van de stad Rome.' },
    {
      year: 'ca. 165',
      text: 'Leidt als prefect het proces waarin de christelijke filosoof Justinus ter dood wordt veroordeeld.',
    },
    { year: 'ca. 170', text: 'Sterft.' },
  ],
  voice: {
    register: 'Ingetogen en ernstig; een mentor die weinig zegt en veel ziet.',
    method:
      'Wijst op karakterfouten zonder te vernederen, en geeft je het juiste boek op het juiste moment.',
  },
  modernLens:
    'Rusticus zou mentorschap samenvatten als: iemand op het juiste moment het juiste boek geven.',
  controversies: [
    'Als prefect van Rome veroordeelde hij de christelijke apologeet Justinus de Martelaar ter dood.',
  ],
  network: [
    { id: 'aurelius', relation: 'leerling' },
    { id: 'epictetus', relation: 'invloed' },
    { id: 'zeno', relation: 'invloed' },
    { id: 'fronto', relation: 'tijdgenoot' },
    { id: 'antoninus', relation: 'tijdgenoot' },
  ],
  helpsWith: ['mentorschap', 'eenvoudig schrijven en spreken'],
});
