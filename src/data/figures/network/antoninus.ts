import { networkFigure } from '../define';

export const antoninus = networkFigure({
  id: 'antoninus',
  name: 'Antoninus Pius',
  shortName: 'Antoninus',
  nativeName: 'Titus Aelius Hadrianus Antoninus Pius',
  nativeScript: 'latin',
  monogram: 'AP',
  epithet: 'De kalme keizer',
  born: 86,
  died: 161,
  origin: 'Lanuvium (bij Rome)',
  school: 'Romeins keizer; voorbeeld voor Marcus Aurelius',
  family: 'romeins',
  theme: { primary: '#5d3a1e', accent: '#bf9a52' },
  tags: ['leiderschap', 'kalmte', 'geduld', 'rechtvaardigheid', 'bescheidenheid', 'plicht'],
  bio: 'Antoninus Pius was van 138 tot 161 keizer, in een van de vreedzaamste periodes van het Romeinse rijk. Hij adopteerde Marcus Aurelius en werd voor hem het grote voorbeeld: in de Meditaties beschrijft Marcus zijn kalmte, zijn geduld met tegenspraak en zijn eenvoud. Zijn bijnaam Pius, "de plichtsgetrouwe", dankte hij volgens de overlevering aan zijn zorg voor zijn adoptievader Hadrianus.',
  keyConcepts: [
    {
      term: 'Gelijkmoedigheid',
      native: 'aequanimitas',
      explanation: 'Rustig blijven in voor- en tegenspoed, zonder onverschillig te worden.',
    },
    {
      term: 'Dienend leiderschap',
      explanation: 'Macht gebruiken voor anderen, met geduld voor tegenspraak.',
    },
  ],
  keyWorks: [
    {
      title: 'Marcus Aurelius, Meditaties 1.16 en 6.30',
      note: 'Het portret dat Marcus van zijn adoptievader schreef.',
    },
  ],
  lifeEvents: [
    { year: '86', text: 'Geboren in Lanuvium, bij Rome.' },
    {
      year: '138',
      text: 'Wordt door Hadrianus geadopteerd, adopteert zelf Marcus Aurelius en Lucius Verus, en wordt keizer.',
    },
    { year: 'ca. 142', text: 'Laat in Brittannië de Antoninuswal aanleggen.' },
    {
      year: '161',
      text: 'Sterft. Zijn laatste wachtwoord aan de wacht zou "aequanimitas" zijn geweest.',
    },
  ],
  quotes: [
    {
      text: 'Gelijkmoedigheid.',
      original: 'Aequanimitas.',
      source: 'Historia Augusta, Antoninus Pius 12.6',
      status: 'toegeschreven',
      translation: 'eigen',
      verified: true,
      note: 'Zijn laatste wachtwoord aan de officier van de wacht, volgens een late en niet altijd betrouwbare bron.',
    },
  ],
  voice: {
    register: 'Kalm, geduldig en bescheiden; luistert meer dan hij spreekt.',
    method: 'Vraagt rustig naar alle kanten en neemt pas daarna een besluit.',
  },
  modernLens:
    'Antoninus zou leiders aanraden: minder spreken, langer luisteren, en nooit een besluit nemen in woede.',
  network: [
    { id: 'aurelius', relation: 'protegé', note: 'adoptiezoon' },
    { id: 'fronto', relation: 'tijdgenoot' },
    { id: 'rusticus', relation: 'tijdgenoot' },
  ],
  helpsWith: ['rustig leidinggeven', 'geduld met tegenspraak'],
});
