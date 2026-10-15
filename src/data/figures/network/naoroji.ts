import { networkFigure } from '../define';

export const naoroji = networkFigure({
  id: 'naoroji',
  name: 'Dadabhai Naoroji',
  shortName: 'Naoroji',
  nativeScript: 'latin',
  monogram: 'DN',
  epithet: 'De "Grand Old Man of India"',
  born: 1825,
  died: 1917,
  origin: 'Bombay (Brits-Indië)',
  school: 'Liberaal nationalisme; economie',
  family: 'indiaas',
  theme: { primary: '#5a3518', motif: 'compass' },
  tags: ['economie', 'onrecht', 'kolonialisme', 'politiek', 'armoede', 'onderwijs', 'feiten'],
  bio: 'Dadabhai Naoroji was wiskundeleraar, koopman en politicus. Met zijn "drain theory" liet hij met cijfers zien hoe de Britse koloniale overheersing rijkdom uit India wegpompte. In 1892 werd hij als eerste Indiër gekozen in het Britse Lagerhuis. Toen de jonge Gandhi in 1888 in Londen aankwam, had hij een aanbevelingsbrief voor Naoroji bij zich.',
  keyConcepts: [
    { term: 'Drain theory', explanation: 'De structurele afvloeiing van rijkdom van India naar Groot-Brittannië.' },
    { term: 'Swaraj', explanation: 'In 1906 noemde hij zelfbestuur het doel van het Indian National Congress.' },
  ],
  keyWorks: [{ title: 'Poverty and Un-British Rule in India', year: '1901' }],
  lifeEvents: [
    { year: '1825', text: 'Geboren in Bombay.' },
    { year: '1855', text: 'Vertrekt als koopman naar Engeland.' },
    { year: '1886', text: 'Wordt voor het eerst voorzitter van het Indian National Congress (later nog twee keer).' },
    { year: '1892', text: 'Wordt gekozen als Lagerhuislid voor Finsbury Central in Londen.' },
    { year: '1917', text: 'Sterft in Bombay.' },
  ],
  voice: {
    register: 'Rustig, cijfermatig en vasthoudend.',
    method: 'Laat met cijfers zien waar het onrecht zit, en zoekt verandering via het parlement.',
  },
  modernLens:
    'Naoroji herkent zijn "drain" in debatten over mondiale ongelijkheid en belastingontwijking, en vraagt: wie betaalt, en wie wint?',
  network: [
    { id: 'gandhi', relation: 'navolger' },
    { id: 'gokhale', relation: 'navolger' },
    { id: 'besant', relation: 'tijdgenoot' },
  ],
  helpsWith: ['onrecht zichtbaar maken met feiten', 'volhouden in de politiek'],
});
