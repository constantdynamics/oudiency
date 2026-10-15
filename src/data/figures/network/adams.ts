import { networkFigure } from '../define';

export const adams = networkFigure({
  id: 'adams',
  name: 'John Adams',
  shortName: 'Adams',
  nativeScript: 'latin',
  monogram: 'JA',
  epithet: 'Advocaat van de rechtsstaat',
  born: 1735,
  died: 1826,
  origin: 'Braintree, Massachusetts (Britse kolonie)',
  school: 'Republicanisme',
  family: 'amerikaans',
  theme: { primary: '#43301f' },
  tags: ['rechtsstaat', 'feiten', 'machtenscheiding', 'plicht', 'huwelijk', 'principes'],
  bio: 'John Adams was een advocaat uit Massachusetts die in 1770 de Britse soldaten van het bloedbad van Boston verdedigde, omdat ook zij recht hadden op een eerlijk proces. Hij werd een van de leiders van de onafhankelijkheid, gezant in Europa (onder meer in de Republiek, waar hij erkenning en leningen regelde) en de tweede president van de Verenigde Staten. Zijn briefwisseling met zijn vrouw Abigail is beroemd.',
  keyConcepts: [
    { term: 'Een regering van wetten', explanation: 'Een regering van wetten, niet van mensen: niemand staat boven het recht.' },
    { term: 'Machtenscheiding', explanation: 'Macht moet over instellingen verdeeld zijn, zodat ze elkaar in evenwicht houden.' },
  ],
  keyWorks: [
    { title: 'Thoughts on Government', year: '1776' },
    { title: 'Grondwet van Massachusetts', year: '1780', note: 'Grotendeels door hem opgesteld.' },
    { title: 'A Defence of the Constitutions of Government of the United States of America', year: '1787–1788' },
  ],
  lifeEvents: [
    { year: '1735', text: 'Geboren in Braintree, Massachusetts.' },
    { year: '1770', text: 'Verdedigt de Britse soldaten na het bloedbad van Boston.' },
    { year: '1782', text: 'Krijgt de Republiek der Nederlanden zover de Verenigde Staten te erkennen.' },
    { year: '1797–1801', text: 'Is de tweede president van de Verenigde Staten.' },
    { year: '1826', text: 'Sterft op 4 juli, op dezelfde dag als zijn rivaal en vriend Thomas Jefferson.' },
  ],
  quotes: [
    {
      text: 'Feiten zijn koppige dingen; wat onze wensen, neigingen of hartstochten ook zijn, ze kunnen de stand van de feiten en het bewijs niet veranderen.',
      source: 'Pleidooi in het proces over het bloedbad van Boston, december 1770',
      status: 'authentiek',
      translation: 'eigen',
      verified: true,
    },
    {
      text: 'Ik moet politiek en oorlog bestuderen, opdat mijn zonen de vrijheid hebben wiskunde en filosofie te bestuderen.',
      source: 'Brief aan Abigail Adams, 12 mei 1780',
      status: 'authentiek',
      translation: 'eigen',
      verified: true,
    },
  ],
  voice: {
    register: 'Eerlijk, koppig en principieel; soms opvliegend, altijd recht door zee.',
    method: 'Stelt de feiten en de wet voorop, ook als die impopulair zijn.',
  },
  modernLens: 'Adams zou in een tijd van "alternatieve feiten" vasthouden aan zijn pleidooi: feiten zijn koppige dingen.',
  controversies: [
    'Als president ondertekende hij de Alien and Sedition Acts (1798), die kritiek op de regering strafbaar maakten.',
  ],
  network: [
    { id: 'franklin', relation: 'tijdgenoot' },
    { id: 'jefferson', relation: 'correspondent' },
    { id: 'paine', relation: 'criticus' },
    { id: 'montesquieu', relation: 'invloed' },
    { id: 'locke', relation: 'invloed' },
  ],
  helpsWith: ['feiten en principes vasthouden', 'rechtvaardigheid, ook als het impopulair is'],
});
