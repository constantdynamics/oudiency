import { networkFigure } from '../define';

export const kierkegaard = networkFigure({
  id: 'kierkegaard',
  name: 'Søren Kierkegaard',
  shortName: 'Kierkegaard',
  nativeScript: 'latin',
  monogram: 'SK',
  epithet: 'Denker van angst en keuze',
  born: 1813,
  died: 1855,
  origin: 'Kopenhagen, Denemarken',
  school: 'Existentiefilosofie (voorloper)',
  family: 'romantiek',
  tags: ['angst', 'keuze', 'geloof', 'individu', 'wanhoop', 'ironie', 'liefde', 'zingeving'],
  bio: 'Søren Kierkegaard was een Deense filosoof en schrijver die onder allerlei schuilnamen publiceerde. Hij verbrak zijn verloving met Regine Olsen en schreef daarna in hoog tempo boeken over angst, wanhoop, keuze en geloof. Tegen het grote systeem van Hegel in hield hij vol dat het om de enkeling gaat, die zelf moet kiezen hoe hij leeft. Hij geldt als voorloper van het existentialisme.',
  keyConcepts: [
    { term: 'Angst', native: 'Angest', explanation: 'De duizeling van de vrijheid: het besef dat je kunt kiezen.' },
    { term: 'De sprong', explanation: 'Geloof en echte keuzes zijn niet te bewijzen; je moet springen.' },
    { term: 'Of/of', native: 'Enten – Eller', explanation: 'Esthetisch of ethisch leven: je moet kiezen wie je wilt zijn.' },
    {
      term: 'Indirecte mededeling',
      explanation: 'Door schuilnamen en verhalen de lezer zelf laten ontdekken en kiezen.',
    },
  ],
  keyWorks: [
    { title: 'Over het begrip ironie', year: '1841' },
    { title: 'Of/of (Enten – Eller)', year: '1843' },
    { title: 'Vrees en beven', year: '1843' },
    { title: 'Het begrip angst', year: '1844' },
    { title: 'De ziekte tot de dood', year: '1849' },
  ],
  lifeEvents: [
    { year: '1813', text: 'Geboren in Kopenhagen als jongste zoon van een rijke koopman.' },
    { year: '1840', text: 'Verlooft zich met Regine Olsen, en verbreekt de verloving een jaar later.' },
    { year: '1841', text: 'Promoveert op het begrip ironie, met voortdurende verwijzing naar Socrates.' },
    { year: '1843', text: 'Of/of verschijnt, onder de schuilnaam Victor Eremita.' },
    { year: '1854–1855', text: 'Voert een felle campagne tegen de Deense staatskerk.' },
    { year: '1855', text: 'Sterft op 42-jarige leeftijd in Kopenhagen.' },
  ],
  quotes: [
    {
      text: 'Het leven kan alleen achterwaarts begrepen worden, maar moet voorwaarts geleefd worden.',
      source: 'Dagboek, 1843',
      status: 'authentiek',
      translation: 'eigen',
      verified: true,
    },
    {
      text: 'Angst is de duizeling van de vrijheid.',
      source: 'Het begrip angst (1844)',
      status: 'authentiek',
      translation: 'eigen',
      verified: true,
    },
  ],
  voice: {
    register: 'Ironisch, hartstochtelijk en persoonlijk; afwisselend speels en diep ernstig.',
    method: 'Spreekt de enkeling aan: niet wat "men" vindt, maar wat jij kiest. Gebruikt verhalen en paradoxen.',
  },
  modernLens:
    'Kierkegaard herkent in onze eindeloze keuzemogelijkheden de duizeling van de vrijheid, en in de massa op sociale media het anonieme "publiek" dat hij wantrouwde.',
  network: [
    { id: 'socrates', relation: 'voorbeeld' },
    { id: 'hegel', relation: 'tegenpool' },
    { id: 'kant', relation: 'invloed' },
    { id: 'schopenhauer', relation: 'tijdgenoot' },
    { id: 'nietzsche', relation: 'geestverwant' },
  ],
  helpsWith: ['keuzes maken', 'angst en twijfel', 'zingeving en geloof'],
});
