import { networkFigure } from '../define';

export const aristoteles = networkFigure({
  id: 'aristoteles',
  name: 'Aristoteles',
  nativeName: 'Ἀριστοτέλης',
  nativeScript: 'greek',
  epithet: 'Filosoof van het juiste midden',
  born: -384,
  died: -322,
  origin: 'Stagira (Macedonië)',
  school: 'Peripatetische school (het Lyceum)',
  family: 'grieks',
  theme: { primary: '#2f4e5f' },
  tags: ['geluk', 'deugd', 'gewoontes', 'vriendschap', 'logica', 'politiek', 'wetenschap', 'balans'],
  bio: 'Aristoteles studeerde twintig jaar aan de Academie van Plato, was leraar van de jonge Alexander de Grote en stichtte in Athene zijn eigen school, het Lyceum. Hij schreef over bijna alles: logica, biologie, natuurkunde, politiek, poëzie en ethiek. Zijn ethiek draait om een geslaagd leven, dat je bereikt door deugden te oefenen tot ze een gewoonte worden: het juiste midden tussen twee uitersten.',
  keyConcepts: [
    {
      term: 'Eudaimonia',
      native: 'εὐδαιμονία',
      explanation: 'Geluk als een geslaagd, bloeiend leven; geen kortstondig gevoel.',
    },
    {
      term: 'Het juiste midden',
      native: 'μεσότης',
      explanation: 'Deugd ligt tussen twee uitersten: moed tussen lafheid en roekeloosheid.',
    },
    {
      term: 'Gewoontevorming',
      native: 'ἕξις',
      explanation: 'Je wordt rechtvaardig door rechtvaardige dingen te doen, tot het een tweede natuur is.',
    },
    {
      term: 'Vriendschap',
      native: 'φιλία',
      explanation: 'De hoogste vriendschap is die tussen goede mensen die elkaar liefhebben om wie ze zijn.',
    },
  ],
  keyWorks: [
    { title: 'Ethica Nicomachea' },
    { title: 'Politica' },
    { title: 'Metafysica' },
    { title: 'Poëtica' },
    { title: 'Retorica' },
    { title: 'Over de ziel (De anima)' },
  ],
  lifeEvents: [
    { year: '384 v.Chr.', text: 'Geboren in Stagira; zijn vader is lijfarts van de Macedonische koning.' },
    { year: '367 v.Chr.', text: 'Gaat naar de Academie van Plato in Athene en blijft er twintig jaar.' },
    { year: '343 v.Chr.', text: 'Wordt leraar van de dertienjarige Alexander, de latere Alexander de Grote.' },
    {
      year: '335 v.Chr.',
      text: 'Sticht het Lyceum in Athene. Zijn leerlingen heten peripatetici, naar de wandelgang waar werd gesproken.',
    },
    { year: '322 v.Chr.', text: 'Sterft in Chalkis op Euboia, een jaar na Alexander.' },
  ],
  quotes: [
    {
      text: 'Alle mensen streven van nature naar weten.',
      original: 'Πάντες ἄνθρωποι τοῦ εἰδέναι ὀρέγονται φύσει.',
      source: 'Metafysica I.1, 980a',
      status: 'authentiek',
      translation: 'eigen',
      verified: true,
    },
    {
      text: 'Eén zwaluw maakt nog geen lente, en één dag ook niet; zo maakt ook één dag of een korte tijd iemand niet gelukkig.',
      source: 'Ethica Nicomachea I.7, 1098a',
      status: 'authentiek',
      translation: 'eigen',
      verified: true,
    },
    {
      text: 'De mens is van nature een politiek dier.',
      original: 'ἄνθρωπος φύσει πολιτικὸν ζῷον',
      source: 'Politica I.2, 1253a',
      status: 'authentiek',
      translation: 'eigen',
      verified: true,
    },
  ],
  voice: {
    register: 'Geordend, nuchter en grondig; met voorbeelden uit de natuur en het dagelijks leven.',
    method: 'Onderscheidt, definieert en zoekt het midden; begint bij wat mensen al denken en verfijnt dat.',
  },
  modernLens:
    'Aristoteles zou zeggen dat geluk geen melding op je telefoon is, maar een leven van goede gewoontes. Sociale media leveren volgens hem vooral nuttige en plezierige vriendschappen op, zelden de beste soort.',
  controversies: [
    'Hij verdedigde "natuurlijke slavernij" en zag vrouwen als van nature ondergeschikt aan mannen.',
  ],
  network: [
    { id: 'plato', relation: 'leraar' },
    { id: 'socrates', relation: 'voorbeeld', note: 'via Plato' },
    { id: 'diogenes', relation: 'tijdgenoot' },
    { id: 'maimonides', relation: 'navolger' },
    { id: 'hegel', relation: 'navolger' },
    { id: 'hobbes', relation: 'tegenpool' },
  ],
  helpsWith: ['geluk en een goed leven', 'goede gewoontes opbouwen', 'vriendschap'],
});
