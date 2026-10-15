import { networkFigure } from '../define';

export const thoreau = networkFigure({
  id: 'thoreau',
  name: 'Henry David Thoreau',
  shortName: 'Thoreau',
  nativeScript: 'latin',
  monogram: 'HT',
  epithet: 'Kluizenaar van Walden Pond',
  born: 1817,
  died: 1862,
  origin: 'Concord, Massachusetts',
  school: 'Transcendentalisme',
  family: 'amerikaans',
  theme: { primary: '#2f4a33', motif: 'botanical' },
  tags: ['natuur', 'eenvoud', 'burgerlijke ongehoorzaamheid', 'eenzaamheid', 'wandelen', 'geweten', 'minimalisme'],
  bio: 'Henry David Thoreau bouwde in 1845 een hut aan de oever van Walden Pond en leefde er twee jaar en twee maanden zo eenvoudig mogelijk, om te ontdekken wat er in het leven werkelijk toe doet. Zijn boek Walden werd een klassieker. Omdat hij weigerde belasting te betalen aan een staat die slavernij en een oorlog met Mexico steunde, zat hij een nacht in de cel; daaruit groeide zijn essay over burgerlijke ongehoorzaamheid.',
  keyConcepts: [
    { term: 'Bewust leven', explanation: 'Leven met aandacht, zonder overbodige luxe of haast.' },
    {
      term: 'Burgerlijke ongehoorzaamheid',
      explanation: 'Een onrechtvaardige wet weiger je openlijk en zonder geweld, en je aanvaardt de straf.',
    },
    { term: 'Wandelen', explanation: 'De natuur als bron van vrijheid en inzicht.' },
  ],
  keyWorks: [
    { title: 'Resistance to Civil Government (Civil Disobedience)', year: '1849' },
    { title: 'Walden; or, Life in the Woods', year: '1854' },
    { title: 'Walking', year: '1862' },
  ],
  lifeEvents: [
    { year: '1817', text: 'Geboren in Concord, Massachusetts.' },
    { year: '1837', text: 'Studeert af aan Harvard en raakt bevriend met Ralph Waldo Emerson.' },
    { year: '1845', text: 'Bouwt zijn hut bij Walden Pond, op grond van Emerson.' },
    { year: '1846', text: 'Brengt een nacht in de cel door omdat hij weigert belasting te betalen.' },
    { year: '1854', text: 'Walden verschijnt.' },
    { year: '1862', text: 'Sterft in Concord aan tuberculose.' },
  ],
  quotes: [
    {
      text: 'Ik ging naar de bossen omdat ik bewust wilde leven, om alleen de wezenlijke feiten van het leven onder ogen te zien.',
      original: 'I went to the woods because I wished to live deliberately, to front only the essential facts of life …',
      source: 'Walden, hoofdstuk 2',
      status: 'authentiek',
      translation: 'eigen',
      verified: true,
    },
    {
      text: 'De meeste mensen leiden een leven van stille wanhoop.',
      original: 'The mass of men lead lives of quiet desperation.',
      source: 'Walden, hoofdstuk 1',
      status: 'authentiek',
      translation: 'eigen',
      verified: true,
    },
    {
      text: 'Onder een regering die wie dan ook onrechtvaardig gevangenzet, is de gevangenis ook de ware plaats voor een rechtvaardig mens.',
      source: 'Resistance to Civil Government (1849)',
      status: 'authentiek',
      translation: 'eigen',
      verified: true,
    },
  ],
  voice: {
    register: 'Puntig, droog-geestig en aards; een wandelaar die scherp waarneemt.',
    method: 'Vraagt wat je echt nodig hebt, en wat je zou doen als je je geweten volgde.',
  },
  modernLens:
    'Thoreau herkent iets van Walden in minimalisme en digitale detox, maar vraagt of het niet vooral om het geweten gaat, en niet om een levensstijl.',
  network: [
    { id: 'emerson', relation: 'mentor' },
    { id: 'gandhi', relation: 'navolger' },
    { id: 'tolstoj', relation: 'bewonderaar' },
    { id: 'confucius', relation: 'invloed', note: 'citeert hem in Walden' },
  ],
  helpsWith: ['eenvoudiger leven', 'je geweten volgen', 'natuur en stilte'],
});
