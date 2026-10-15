import { networkFigure } from '../define';

export const diogenes = networkFigure({
  id: 'diogenes',
  name: 'Diogenes van Sinope',
  shortName: 'Diogenes',
  nativeName: 'Διογένης ὁ Σινωπεύς',
  nativeScript: 'greek',
  monogram: 'D',
  epithet: 'De cynicus in de voorraadkruik',
  born: -410,
  died: -323,
  approximate: true,
  displayYears: 'ca. 410–323 v.Chr.',
  origin: 'Sinope (aan de Zwarte Zee)',
  school: 'Cynisme',
  family: 'grieks',
  theme: { primary: '#5a4632', motif: 'wave' },
  tags: ['eenvoud', 'vrijheid', 'humor', 'kritiek', 'wereldburger', 'schaamte', 'consumptie', 'spullen'],
  bio: 'Diogenes werd uit Sinope verbannen, volgens de overlevering omdat hij of zijn vader munten had vervalst. In Athene leefde hij als een hond (kyon, vandaar "cynicus") in een grote aardewerken voorraadkruik, bezat vrijwel niets en prikte met grappen en provocaties door het fatsoen en de hypocrisie van zijn tijd heen. Hij wilde laten zien hoe weinig een mens nodig heeft om vrij te zijn.',
  keyConcepts: [
    {
      term: 'Zelfgenoegzaamheid',
      native: 'αὐτάρκεια',
      explanation: 'Vrij zijn doordat je weinig nodig hebt.',
    },
    {
      term: 'De munt omslaan',
      native: 'παραχαράττειν τὸ νόμισμα',
      explanation: 'De gangbare waarden omwerken: wat iedereen normaal vindt, ter discussie stellen.',
    },
    {
      term: 'Wereldburger',
      native: 'κοσμοπολίτης',
      explanation: 'Burger van de hele wereld, in plaats van van één stad.',
    },
  ],
  keyWorks: [
    {
      title: 'Diogenes Laërtius, Levens van de filosofen, boek VI',
      note: 'Diogenes liet niets na; dit is de belangrijkste bron over hem (3e eeuw n.Chr.).',
    },
  ],
  lifeEvents: [
    { year: 'ca. 410 v.Chr.', text: 'Geboren in Sinope.' },
    { year: 'onbekend', text: 'Wordt verbannen, komt naar Athene en volgt volgens de overlevering Antisthenes.' },
    { year: 'onbekend', text: 'Leeft in een grote aardewerken voorraadkruik op de markt.' },
    { year: 'anekdote', text: 'Zou door piraten zijn gevangen en in Korinthe als slaaf zijn verkocht.' },
    { year: 'ca. 323 v.Chr.', text: 'Sterft in Korinthe, volgens de overlevering op dezelfde dag als Alexander de Grote.' },
  ],
  quotes: [
    {
      text: 'Ga een beetje uit mijn zon.',
      source: 'Diogenes Laërtius VI.38',
      status: 'toegeschreven',
      translation: 'eigen',
      verified: true,
      note: 'Zijn antwoord aan Alexander de Grote, overgeleverd als anekdote die eeuwen later is opgetekend.',
    },
    {
      text: 'Ik ben een wereldburger.',
      source: 'Diogenes Laërtius VI.63',
      status: 'toegeschreven',
      translation: 'eigen',
      verified: true,
      note: 'Zijn antwoord op de vraag waar hij vandaan kwam.',
    },
    {
      text: 'Ik zoek een mens.',
      source: 'Diogenes Laërtius VI.41',
      status: 'toegeschreven',
      translation: 'eigen',
      verified: true,
      note: 'Hij liep er overdag mee rond met een brandende lamp.',
    },
  ],
  voice: {
    register: 'Scherp, grappig en provocerend; houdt van korte, gevatte antwoorden.',
    method: 'Ontmaskert door te overdrijven en te spiegelen: wat heb je echt nodig?',
  },
  modernLens:
    'Diogenes zou door een winkelcentrum lopen en hardop verbaasd zijn over hoeveel dingen hij niet nodig heeft. Influencers zou hij uitlachen, en daarna vragen waarom wij ze volgen.',
  controversies: ['Zijn provocaties waren vaak grof en schaamteloos: hij deed in het openbaar wat anderen alleen privé deden.'],
  network: [
    { id: 'socrates', relation: 'voorbeeld' },
    { id: 'plato', relation: 'rivaal' },
    { id: 'aristoteles', relation: 'tijdgenoot' },
    { id: 'zeno', relation: 'navolger', note: 'via Crates, de leerling van Diogenes' },
    { id: 'epictetus', relation: 'bewonderaar' },
  ],
  helpsWith: ['minder spullen, meer vrijheid', 'je weinig aantrekken van wat anderen vinden'],
});
