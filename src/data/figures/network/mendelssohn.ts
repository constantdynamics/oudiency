import { networkFigure } from '../define';

export const mendelssohn = networkFigure({
  id: 'mendelssohn',
  name: 'Moses Mendelssohn',
  shortName: 'Mendelssohn',
  nativeScript: 'latin',
  monogram: 'MM',
  epithet: 'De Duitse Socrates',
  born: 1729,
  died: 1786,
  origin: 'Dessau (Anhalt)',
  school: 'Verlichting; joodse Verlichting (Haskala)',
  family: 'verlichting',
  theme: { primary: '#36435e', motif: 'lens' },
  tags: ['tolerantie', 'religie', 'vrijheid', 'vriendschap', 'opvoeding', 'identiteit', 'onsterfelijkheid'],
  bio: 'Moses Mendelssohn kwam als arme joodse jongen naar Berlijn, leerde zichzelf Duits, Latijn en filosofie en werd een van de beroemdste denkers van de Verlichting: "de Duitse Socrates". Hij was bevriend met de schrijver Lessing, die hem vereeuwigde als de wijze Nathan. Mendelssohn pleitte voor scheiding van kerk en staat en voor gelijke rechten voor joden, en vertaalde de Thora in het Duits.',
  keyConcepts: [
    { term: 'Godsdienstvrijheid', explanation: 'De staat mag geloof niet afdwingen; het geweten is vrij.' },
    {
      term: 'De Duitse Socrates',
      explanation: 'Zijn Phädon (1767) verdedigde in de geest van Plato de onsterfelijkheid van de ziel en maakte hem beroemd.',
    },
  ],
  keyWorks: [
    { title: 'Phädon oder über die Unsterblichkeit der Seele', year: '1767' },
    { title: 'Jerusalem oder über religiöse Macht und Judentum', year: '1783' },
    { title: 'Morgenstunden', year: '1785' },
  ],
  lifeEvents: [
    { year: '1729', text: 'Geboren in Dessau als zoon van een thoraschrijver.' },
    { year: '1743', text: 'Loopt als veertienjarige zijn leraar achterna naar Berlijn.' },
    { year: '1754', text: 'Raakt bevriend met Gotthold Ephraim Lessing.' },
    { year: '1763', text: 'Wint de prijsvraag van de Berlijnse Academie, vóór Kant.' },
    { year: '1767', text: 'Zijn Phädon wordt een bestseller in heel Europa.' },
    { year: '1783', text: 'Publiceert Jerusalem, een pleidooi voor godsdienstvrijheid.' },
    { year: '1786', text: 'Sterft in Berlijn.' },
  ],
  voice: {
    register: 'Bescheiden, warm en helder; een tolerante gesprekspartner.',
    method: 'Zoekt het redelijke gesprek tussen geloof en rede, en vraagt respect voor wie anders gelooft.',
  },
  modernLens:
    'Mendelssohn pleit in debatten over religie en identiteit voor wat hij in Jerusalem schreef: de staat moet het geweten niet dwingen, en verschil mag er zijn.',
  network: [
    { id: 'kant', relation: 'correspondent' },
    { id: 'leibniz', relation: 'invloed' },
    { id: 'wolff', relation: 'invloed' },
    { id: 'maimonides', relation: 'voorbeeld' },
    { id: 'spinoza', relation: 'gesprekspartner', note: 'de pantheïsmestrijd van 1785 draaide om hem' },
    { id: 'rousseau', relation: 'invloed', note: 'vertaalde zijn tweede Discours in het Duits' },
    { id: 'herder', relation: 'tijdgenoot' },
  ],
  helpsWith: ['tolerantie tussen geloven', 'geloof en rede verbinden'],
});
