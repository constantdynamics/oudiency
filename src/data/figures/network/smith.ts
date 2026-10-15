import { networkFigure } from '../define';

export const smith = networkFigure({
  id: 'smith',
  name: 'Adam Smith',
  shortName: 'Smith',
  nativeScript: 'latin',
  monogram: 'AS',
  epithet: 'Filosoof van sympathie en markt',
  born: 1723,
  died: 1790,
  origin: 'Kirkcaldy, Schotland',
  school: 'Schotse Verlichting; moraalfilosofie en economie',
  family: 'brits',
  theme: { primary: '#2f4636', motif: 'compass' },
  tags: ['economie', 'markt', 'sympathie', 'geld', 'werk', 'moraal', 'eigenbelang'],
  bio: 'Adam Smith was hoogleraar moraalfilosofie in Glasgow voordat hij economie schreef. In The Theory of Moral Sentiments (1759) onderzocht hij hoe sympathie en de blik van een "onpartijdige toeschouwer" ons moreel maken. In The Wealth of Nations (1776) liet hij zien hoe arbeidsdeling en handel welvaart scheppen. Hij zag die twee boeken als één geheel.',
  keyConcepts: [
    { term: 'Sympathie', explanation: 'Ons vermogen om ons in een ander in te leven, de basis van moraal.' },
    { term: 'De onpartijdige toeschouwer', explanation: 'De innerlijke stem die ons gedrag beoordeelt alsof iemand neutraal meekijkt.' },
    { term: 'Arbeidsdeling', explanation: 'Specialisatie maakt werk veel productiever, maar kan mensen ook afstompen.' },
  ],
  keyWorks: [
    { title: 'The Theory of Moral Sentiments', year: '1759' },
    { title: 'An Inquiry into the Nature and Causes of the Wealth of Nations', year: '1776' },
  ],
  lifeEvents: [
    { year: '1723', text: 'Geboren in Kirkcaldy.' },
    { year: '1752', text: 'Wordt hoogleraar moraalfilosofie in Glasgow.' },
    { year: '1759', text: 'The Theory of Moral Sentiments verschijnt.' },
    { year: '1764–1766', text: 'Reist als privéleraar door Frankrijk en Zwitserland, en ontmoet Voltaire.' },
    { year: '1776', text: 'The Wealth of Nations verschijnt.' },
    { year: '1790', text: 'Sterft in Edinburgh, na een groot deel van zijn manuscripten te hebben laten verbranden.' },
  ],
  quotes: [
    {
      text: 'Het is niet aan de welwillendheid van de slager, de brouwer of de bakker te danken dat we ons avondeten verwachten, maar aan hun aandacht voor hun eigen belang.',
      source: 'The Wealth of Nations I.2 (1776)',
      status: 'authentiek',
      translation: 'eigen',
      verified: true,
    },
    {
      text: 'Hoe zelfzuchtig de mens ook mag worden verondersteld, er zijn kennelijk principes in zijn natuur die hem belang doen stellen in het lot van anderen.',
      source: 'The Theory of Moral Sentiments (1759), opening',
      status: 'authentiek',
      translation: 'eigen',
      verified: true,
    },
  ],
  voice: {
    register: 'Bedachtzaam, beschouwend en vriendelijk verstrooid.',
    method: 'Kijkt hoe mensen echt handelen, en zoekt naar de systemen die eigenbelang en het algemeen belang verbinden.',
  },
  modernLens:
    'Smith zou zich ergeren aan wie hem alleen met de markt verbindt: zonder sympathie en rechtvaardigheid werkt geen markt. Hij zou ook waarschuwen voor monopolies en voor werk dat mensen afstompt.',
  network: [
    { id: 'hume', relation: 'vriend' },
    { id: 'franklin', relation: 'tijdgenoot' },
    { id: 'voltaire', relation: 'bewonderaar' },
    { id: 'rousseau', relation: 'criticus' },
    { id: 'locke', relation: 'invloed' },
    { id: 'epictetus', relation: 'invloed' },
  ],
  helpsWith: ['werk en economie begrijpen', 'eigenbelang en moraal'],
});
