/**
 * Demomodus: Marcus Aurelius. Kalm, beknopt, zelfaanspraak ("Marcus, …"), wat in je macht ligt,
 * vergankelijkheid zonder somberheid, altijd terug naar de volgende juiste handeling.
 * Letterlijke citaten alleen uit de geverifieerde lijst; al het andere in eigen woorden.
 */
import type { DemoFigureContent } from '../../types';

const p = (...parts: string[]) => parts.join('\n\n');

export const aureliusDemo: DemoFigureContent = {
  figureId: 'aurelius',
  sessionFragments: [
    /* ---------- Opening ---------- */
    {
      id: 'aur-open-1',
      phase: 'opening',
      text: 'Welkom{naam}. Ga zitten; het kampvuur is warm genoeg voor twee. Ik las vanochtend al berichten over grensgeschillen en graanvoorraden, dus een gesprek over iets wezenlijks is me welkom. Wat drukt er op je?',
    },
    {
      id: 'aur-open-2',
      phase: 'opening',
      text: 'Kom binnen{naam}. Marcus, zei ik vanochtend tegen mezelf, vandaag komt er iemand met een vraag: luister beter dan je spreekt. Dus ik luister. Wat houdt je bezig?',
    },
    {
      id: 'aur-open-3',
      phase: 'opening',
      text: 'Welkom{naam}. Bij je afspraak schreef je: ‘{onderwerp}’. Laten we dat straks verdelen over twee stapels: wat in jouw macht ligt, en wat niet. Maar vertel me eerst wat er speelt.',
    },
    {
      id: 'aur-open-4',
      phase: 'opening',
      text: 'Je bent op tijd{naam}; dat waardeer ik. ‘{onderwerp}’, schreef je. Vertel me niet eerst wat je ervan vindt, maar wat er feitelijk gebeurd is. De oordelen komen later wel.',
    },

    /* ---------- Terugkeer ---------- */
    {
      id: 'aur-terug-1',
      phase: 'terugkeer',
      text: 'Daar ben je weer{naam}. De vorige keer spraken we over {vorige}. Ik vraag niet of het is opgelost. Ik vraag: wat heb je sindsdien gedaan dat in je macht lag?',
    },
    {
      id: 'aur-terug-2',
      phase: 'terugkeer',
      text: 'Welkom terug{naam}. We spraken over {vorige}. Sindsdien is er veel veranderd, want alles verandert. Hoe kijk je er nu naar?',
    },

    /* ---------- Doorvragen ---------- */
    {
      id: 'aur-door-1',
      phase: 'doorvragen',
      keywords: ['stress', 'zorgen', 'piekeren', 'onrust', 'paniek', 'druk', 'spanning'],
      text: 'Je noemt ‘{woord}’. Laten we het uit elkaar halen. Welk deel ervan kun je morgen zelf beïnvloeden, en welk deel niet? Het tweede deel mag je loslaten. Aan het eerste kunnen we werken.',
    },
    {
      id: 'aur-door-2',
      phase: 'doorvragen',
      keywords: ['boos', 'irritant', 'ergernis', 'ruzie', 'woedend', 'collega', 'baas'],
      text: 'Iemand heeft je geërgerd, hoor ik. Wat deed die persoon precies, en welk oordeel heb jij daaraan toegevoegd? Vaak zit de pijn niet in de daad zelf, maar in wat we er zelf van maken.',
    },
    {
      id: 'aur-door-3',
      phase: 'doorvragen',
      keywords: ['moet', 'moeten', 'plicht', 'verantwoordelijk', 'verwachting', 'verwachten'],
      text: 'Je zegt dat het moet. Van wie moet het? Van jezelf, van anderen, of van een stem die je ooit hebt overgenomen zonder haar te onderzoeken? Plicht is goed, maar alleen als je weet waaraan je trouw bent.',
    },
    {
      id: 'aur-door-4',
      phase: 'doorvragen',
      keywords: ['nieuws', 'wereld', 'oorlog', 'politiek', 'klimaat', 'crisis'],
      text: 'Je bent bezorgd over de wereld. Ik ook; ik bestuur er een flink stuk van, en aan alle grenzen rommelt het. Maar zeg eens: wat kun jíj vandaag doen, in je eigen straat, met je eigen handen?',
    },
    {
      id: 'aur-door-5',
      phase: 'doorvragen',
      text: 'Laat me samenvatten wat ik hoor, zoals ik dat ’s avonds in mijn schrift doe: er is iets wat je overkomt, en er is wat jij ervan vindt. Welk van de twee weegt nu het zwaarst?',
    },

    /* ---------- Verdiepen ---------- */
    {
      id: 'aur-verdiep-1',
      phase: 'verdiepen',
      keywords: ['tegenslag', 'mislukt', 'probleem', 'obstakel', 'pech', 'tegenvaller', 'gefaald'],
      text: 'Ik schreef het ooit voor mezelf op: “Wat de handeling hindert, bevordert de handeling; wat in de weg staat, wordt de weg.” (Meditaties 5.20). Een obstakel is geen muur, maar materiaal. Wat kun je juist dankzij deze tegenslag oefenen?',
    },
    {
      id: 'aur-verdiep-2',
      phase: 'verdiepen',
      keywords: ['mensen', 'familie', 'buren', 'onbeleefd', 'irritant', 'lastig', 'collega'],
      text: 'Mijn tweede boek begint zo: “Zeg ’s morgens vroeg tegen jezelf: vandaag kom ik een bemoeial tegen, een ondankbare, een brutale, een bedrieger, een jaloerse en een onverdraagzame.” (Meditaties 2.1). Niet om somber te worden, maar om niet verrast te zijn. Kun je hen dan met wat meer mildheid tegemoet treden?',
    },
    {
      id: 'aur-verdiep-3',
      phase: 'verdiepen',
      keywords: ['wraak', 'terugpakken', 'gekwetst', 'onrecht', 'beledigd', 'vernederd'],
      text: '“De beste manier om je te verweren: niet worden zoals de ander.” (Meditaties 6.6). Dat is geen zwakte. Het is de enige overwinning die niemand je kan afpakken. Wie zou je worden als je terugsloeg?',
    },
    {
      id: 'aur-verdiep-4',
      phase: 'verdiepen',
      keywords: ['team', 'samen', 'gemeenschap', 'samenleving', 'organisatie', 'leidinggeven'],
      text: '“Wat niet goed is voor de zwerm, is ook niet goed voor de bij.” (Meditaties 6.54). We zijn gemaakt om samen te werken, zoals voeten, handen en oogleden. Hoe ziet je vraag eruit als je haar bekijkt vanuit de zwerm, en niet alleen vanuit de bij?',
    },
    {
      id: 'aur-verdiep-5',
      phase: 'verdiepen',
      keywords: ['dood', 'verlies', 'ouder', 'tijd', 'vergankelijk', 'afscheid', 'rouw'],
      text: 'Ik heb veel van mijn kinderen moeten begraven, en veel vrienden. Ik leerde mezelf te denken aan bladeren die de wind wegblaast en die het voorjaar weer terugbrengt. Dat maakt het verdriet niet kleiner, maar het moment wel kostbaarder. Wat wil je doen, nu het er nog is?',
    },
    {
      id: 'aur-verdiep-6',
      phase: 'verdiepen',
      keywords: ['mening', 'oordeel', 'kijk', 'perspectief', 'gedachten', 'denken'],
      text: '“Het heelal is verandering, het leven is opvatting.” (Meditaties 4.3). Je lijdt niet alleen aan wat er gebeurt, maar ook aan wat je erover denkt. Welke opvatting zou je kunnen laten varen, zodat de last lichter wordt?',
    },
    {
      id: 'aur-verdiep-7',
      phase: 'verdiepen',
      keywords: ['ochtend', 'opstaan', 'motivatie', 'lui', 'zin', 'moe', 'uitstellen'],
      text: 'Ook ik bleef ’s ochtends graag onder de deken liggen. Dan zei ik tegen mezelf, in eigen woorden: ik sta op om het werk van een mens te doen. Waarom zou ik daarover klagen, als ik daarvoor gemaakt ben? Wat is het werk waarvoor jij gemaakt bent?',
    },
    {
      id: 'aur-verdiep-8',
      phase: 'verdiepen',
      text: 'Mijn schrift begint met een lange lijst van dank: aan mijn grootvader, mijn moeder, Rusticus, mijn adoptievader Antoninus. Wie zou er op jouw lijst staan? Soms vind je het antwoord op een vraag bij iemand die je lang geleden al iets leerde.',
    },

    /* ---------- Afronden ---------- */
    {
      id: 'aur-afrond-1',
      phase: 'afronden',
      text: 'De zandloper loopt bijna leeg. Laten we het concreet maken, want mooie woorden zonder daad zijn niets waard: wat is de eerstvolgende juiste handeling die in jouw macht ligt? Eén ding, vandaag of morgen.',
    },
    {
      id: 'aur-afrond-2',
      phase: 'afronden',
      text: 'We moeten afronden. Marcus, zeg ik dan tegen mezelf: je hebt geluisterd, geef nu nog één advies. Hier is het: scheid wat je overkomt van wat je ervan vindt. Het eerste kies je niet; het tweede wel.',
    },

    /* ---------- Slot ---------- */
    {
      id: 'aur-slot-1',
      phase: 'slot',
      text: 'Een laatste gedachte, want plicht wacht niet: alles wat we vandaag bespraken, is morgen al herinnering. Laat het dus vandaag iets doen.',
    },
    {
      id: 'aur-slot-2',
      phase: 'slot',
      text: 'Nog één woord voor je gaat: gelijkmoedigheid. Mijn adoptievader gaf het als laatste wachtwoord aan de wacht, kort voordat hij stierf. Neem het mee.',
    },
  ],

  lecture: {
    openings: [
      p(
        'Welkom in mijn tent. Buiten waait het koud over de Donau, maar binnen is het rustig genoeg om na te denken. Je vroeg mij om een college over ‘{onderwerp}’. Je hoofdvraag is: “{hoofdvraag}”',
        'Ik ben geen leraar zoals Epictetus dat was; ik ben een leerling die toevallig keizer werd. Wat ik weet, heb ik vooral aan mezelf moeten vertellen, ’s avonds, in een schrift dat nooit voor anderen bedoeld was. Misschien heb je daar juist daarom iets aan.',
        'Laten we beginnen bij de belangrijkste vraag die ik ken. Ze past op jouw onderwerp als een sleutel op een slot: wat ligt in mijn macht, en wat niet?',
      ),
      p(
        'Ga zitten. Het onderwerp van vandaag is ‘{onderwerp}’, en de vraag die je meebracht luidt: “{hoofdvraag}”',
        'Je zult merken dat ik weinig nieuws vertel. De Stoa heeft geen geheime leer. Wat ze wel heeft, is oefening: elke dag opnieuw dezelfde waarheden toepassen, tot ze je tweede natuur worden.',
        'Daarom houd ik het concreet. Na elk deel mag je me een vraag stellen. Ik beantwoord die zoals ik mezelf zou antwoorden: kort en zonder omhaal.',
      ),
    ],
    blocks: [
      {
        id: 'aur-blok-macht',
        heading: 'Wat in je macht ligt',
        keywords: [
          'macht',
          'controle',
          'zorgen',
          'stress',
          'invloed',
          'onzeker',
          'piekeren',
          'onzekerheid',
          'angst',
        ],
        lesson:
          'Scheid wat in je macht ligt (je oordelen, keuzes en handelingen) van wat niet in je macht ligt, en richt je kracht op het eerste.',
        text: p(
          'Mijn leraar Rusticus gaf mij de aantekeningen van de lessen van Epictetus. Ik heb er meer van geleerd dan van al mijn retoricalessen samen. De kern is eenvoudig, bijna beschamend eenvoudig: sommige dingen liggen in onze macht, andere niet. In onze macht liggen onze oordelen, onze voornemens en onze handelingen. Niet in onze macht liggen ons lichaam, ons bezit, onze reputatie en wat anderen doen.',
          'Dat klinkt als een rijtje voor schooljongens. Maar probeer het eens toe te passen op ‘{onderwerp}’. Pak een vel en maak twee kolommen. Links wat jij kunt kiezen en doen, rechts wat je overkomt of wat van anderen afhangt. Je zult merken dat je meeste zorgen in de rechterkolom staan, en dat je meeste mogelijkheden in de linker op je liggen te wachten.',
          'Begrijp me goed: de rechterkolom doet er wel toe. Ik ben keizer; ik maak me zorgen over grenzen, oogsten en de pest. Maar ik heb geleerd dat zorg die niet in handeling kan veranderen, alleen maar lijden is. Bij elke zorg vraag ik dus: Marcus, wat kun je hier doen? Is het antwoord niets, dan laat ik het gaan. Is het antwoord iets, dan doe ik dat, en dan pas laat ik het gaan.',
        ),
      },
      {
        id: 'aur-blok-burcht',
        heading: 'De innerlijke burcht',
        keywords: [
          'rust',
          'kalm',
          'onrust',
          'nieuws',
          'drukte',
          'emotie',
          'paniek',
          'meldingen',
          'telefoon',
          'sociale media',
        ],
        lesson:
          'Rust zit niet in een plek maar in een geordende geest; je kunt je op elk uur in jezelf terugtrekken.',
        text: p(
          'Mensen zoeken rust buiten zichzelf: op het land, aan zee, in de bergen. Ik verlangde daar ook naar, aan het hof en in het kamp. Maar ik schreef mezelf, in eigen woorden: je kunt je op elk uur dat je wilt in jezelf terugtrekken. Nergens trek je je rustiger terug dan in je eigen ziel, zeker als je daar gedachten hebt waar je meteen kalm van wordt.',
          'Ik hoor dat jullie de hele dag berichten ontvangen, uit alle hoeken van de wereld, op een plankje in je hand. In mijn tijd bestond dat niet, maar de koeriers met slecht nieuws kende ik maar al te goed. Het verschil is dat mijn koeriers soms moesten slapen. De jouwe niet. Des te meer heb je een burcht nodig die niet afhangt van het nieuws.',
          'Hoe bouw je die? Door oefening. Elke ochtend bereid je je voor op wat de dag zal brengen. Elke avond kijk je terug: wat ging goed, wat kan beter? En tussendoor trek je je even terug, al is het maar een minuut. Kijk zo naar ‘{onderwerp}’: wat zou er veranderen als je er niet op reageerde vanuit de storm, maar vanuit de burcht?',
        ),
      },
      {
        id: 'aur-blok-weg',
        heading: 'Wat in de weg staat, wordt de weg',
        keywords: [
          'tegenslag',
          'obstakel',
          'probleem',
          'mislukken',
          'crisis',
          'veerkracht',
          'falen',
          'moeilijk',
          'tegenvaller',
        ],
        lesson:
          'Een obstakel is ook materiaal: wat je tegenhoudt, kan je juist leren hoe je moet handelen.',
        text: p(
          'Ik schreef ooit in mijn schrift: “Wat de handeling hindert, bevordert de handeling; wat in de weg staat, wordt de weg.” (Meditaties 5.20). Ik bedoelde het niet als troostrijm. Ik bedoelde het als werkinstructie. Een vuur dat iets op zijn pad vindt, maakt er brandstof van. Zo kan een goede geest van elk obstakel materiaal maken.',
          'Mijn regering was er een van tegenslag. De pest trok door het rijk, er was oorlog aan de Donau, de schatkist raakte leeg. Ik liet toen bezittingen van het paleis veilen, zodat ik de belastingen niet hoefde te verhogen. Was dat een nederlaag? Het voelde als een kans om te laten zien wat een keizer werkelijk waard is.',
          'Pas het eens toe op ‘{onderwerp}’. Wat staat er in de weg? Geduld, moed, rechtvaardigheid, zelfbeheersing: elk obstakel nodigt uit tot een van die deugden. Een lastige collega is oefenstof voor geduld. Een mislukking is oefenstof voor nederigheid en volharding. De vraag is dus niet hoe je het obstakel ontloopt, maar welke deugd het van je vraagt.',
        ),
      },
      {
        id: 'aur-blok-zwerm',
        heading: 'De bij en de zwerm',
        keywords: [
          'samen',
          'samenleving',
          'gemeenschap',
          'leidinggeven',
          'leiderschap',
          'team',
          'politiek',
          'plicht',
          'werk',
          'verantwoordelijkheid',
        ],
        lesson:
          'Wat niet goed is voor de gemeenschap, is ook niet goed voor jou; handel als deel van een groter geheel.',
        text: p(
          'Een van mijn kortste aantekeningen is misschien wel de belangrijkste: “Wat niet goed is voor de zwerm, is ook niet goed voor de bij.” (Meditaties 6.54). We zijn niet gemaakt om alleen te leven. We zijn gemaakt om samen te werken, zoals voeten en handen, zoals de boven- en onderrij van je tanden.',
          'Leidinggeven leerde ik niet uit boeken, maar van mijn adoptievader Antoninus. Hij luisterde naar iedereen die iets nuttigs te zeggen had. Hij was geduldig, onderzocht zaken grondig en liet zich niet meeslepen door lof. Ik heb geprobeerd hem na te volgen, en ik ben er vaak in tekortgeschoten. Maar het voorbeeld bleef.',
          'Kijk zo naar ‘{onderwerp}’. Wie is hier de zwerm: je gezin, je team, je stad, de hele mensheid? En wat is goed voor die zwerm, ook als het jou even iets kost? Ik vraag het niet om je klein te maken. Een bij die haar zwerm dient, is niet minder bij. Ze is juist wat een bij hoort te zijn.',
        ),
      },
      {
        id: 'aur-blok-vergankelijk',
        heading: 'Alles stroomt voorbij',
        keywords: [
          'tijd',
          'dood',
          'vergankelijkheid',
          'ouder worden',
          'verlies',
          'roem',
          'faam',
          'afscheid',
          'rouw',
          'zin',
        ],
        lesson:
          'Denken aan vergankelijkheid maakt niet somber; het helpt je kiezen wat er vandaag werkelijk toe doet.',
        text: p(
          'Denk eens aan de tijd van keizer Vespasianus. Mensen trouwden en kregen kinderen, werden ziek en stierven, voerden oorlog, feestten, handelden en vleiden. Van al dat leven is niets meer over. Denk dan aan de tijd van Trajanus: precies hetzelfde. Ik schreef het voor mezelf op, in eigen woorden, om niet te vergeten hoe snel alles voorbijgaat.',
          'Je zou denken dat zulke gedachten somber maken. Bij mij werkten ze andersom. Wie weet dat het leven kort is, verspilt het niet aan wrok, aan ijdelheid of aan zorgen over wat de mensen later van hem zullen zeggen. Roem is een echo die steeds zwakker wordt. Maar een goede daad vandaag is vandaag goed, en dat blijft ze.',
          'Wat betekent dat voor ‘{onderwerp}’? Stel jezelf de vraag: als dit mijn laatste maand was, hoe zou ik er dan mee omgaan? Niet om in paniek te raken, maar om helder te zien. Vaak verdwijnt dan wat onbelangrijk is, en blijft er één ding over dat je allang had moeten doen.',
        ),
      },
      {
        id: 'aur-blok-dank',
        heading: 'Beginnen bij dank',
        keywords: [
          'dankbaar',
          'dankbaarheid',
          'familie',
          'ouders',
          'leraar',
          'opvoeding',
          'vriendschap',
          'geluk',
        ],
        lesson:
          'Begin bij wat je ontvangen hebt; dankbaarheid maakt je bescheiden en sterk tegelijk.',
        text: p(
          'Het eerste boek van mijn schrift is geen filosofie, maar een lijst van dank. Van mijn grootvader leerde ik een goed karakter en een kalm humeur. Van mijn moeder eenvoud en vrijgevigheid. Van Rusticus dat ik mijn karakter moest verbeteren, en hij gaf me de lessen van Epictetus. Van mijn adoptievader zachtmoedigheid en standvastigheid.',
          'Waarom begin ik zo? Omdat niemand zichzelf maakt. Wie dat vergeet, wordt hoogmoedig in voorspoed en bitter in tegenspoed. Wie het onthoudt, staat steviger. Hij weet dat hij gedragen wordt, en dat hij op zijn beurt anderen moet dragen.',
          'Probeer het vanavond eens bij ‘{onderwerp}’. Schrijf op van wie je hierover iets geleerd hebt: een ouder, een leraar, een vriend, desnoods iemand die je liet zien hoe het niet moet. Je zult merken dat je vraag minder eenzaam voelt. En misschien vind je in die lijst al een deel van het antwoord.',
        ),
      },
    ],
    answers: [
      p(
        'Je vraagt: “{vraag}” Laat me eerlijk zijn: dat vroeg ik mezelf ook vaak, ’s avonds bij de lamp.',
        'Mijn antwoord begint altijd hetzelfde: wat ligt hier in jouw macht? Bij ‘{woord}’ is dat waarschijnlijk minder dan je zou willen, maar meer dan je denkt. Begin bij dat kleine deel. In het volgende deel kom ik erop terug.',
      ),
      p(
        'Een goede vraag: “{vraag}” Ik geef je geen troost, maar een oefening.',
        'Stel je voor dat je dit over tien jaar terugleest. Wat zou je dan willen dat je nu had gedaan? Dat is meestal de volgende juiste handeling. De rest is opvatting, en opvattingen kun je herzien.',
      ),
      p(
        '“{vraag}”: die vraag laat zien dat je echt nadenkt. Dat waardeer ik.',
        'Kort antwoord: verwar niet wat je overkomt met wat je ervan vindt. Het eerste is het weer; het tweede is je kompas. Laten we in het volgende deel kijken hoe je dat kompas bijstelt.',
      ),
    ],
    conclusions: [
      p(
        'We komen bij het einde. Je vroeg: “{hoofdvraag}”',
        'Mijn antwoord is eenvoudig, en daarom moeilijk: scheid wat in je macht ligt van wat niet, richt je kracht op het eerste, en doe dat elke dag opnieuw. Niet omdat het je gelukkig maakt, al gebeurt dat soms, maar omdat het past bij wat een mens is. Wat ik je meegeef:',
      ),
      p(
        'De lamp brandt bijna op. Je vroeg: “{hoofdvraag}”',
        'Als ik het in één zin moet zeggen: het antwoord ligt niet in de wereld, maar in hoe jij erop antwoordt. De wereld verandert voortdurend; jouw volgende handeling kun je kiezen. Neem dit mee:',
      ),
    ],
    thinkQuestions: [
      'Welke zorg over dit onderwerp draag je mee die niet in jouw macht ligt, en wat zou er gebeuren als je haar neerlegde?',
      'Wat is de eerstvolgende juiste handeling die je morgen kunt doen?',
      'Van wie heb je over dit onderwerp iets geleerd, en heb je diegene daar ooit voor bedankt?',
    ],
  },

  timelineReactions: [
    {
      keywords: ['stress', 'zorgen', 'druk', 'piekeren', 'spanning', 'onrust'],
      text: 'Marcus, zeg ik dan tegen mezelf: welk deel hiervan ligt in jouw macht? Begin daar, en laat de rest aan de rivier.',
    },
    {
      keywords: ['nieuws', 'wereld', 'oorlog', 'politiek', 'klimaat'],
      text: 'Ook aan mijn grenzen rommelt het. Ik lees de berichten en vraag dan: wat kan ik vandaag doen? Het antwoord is altijd kleiner en beter dan de paniek.',
    },
    {
      keywords: ['collega', 'baas', 'irritant', 'boos', 'ergernis', 'ruzie'],
      text: 'Elke ochtend bereidde ik me voor op lastige mensen. Ze handelen uit onwetendheid over goed en kwaad. Word niet zoals zij; dat is je beste verweer.',
    },
    {
      keywords: ['mislukt', 'tegenslag', 'pech', 'fout', 'gefaald', 'tegenvaller'],
      text: 'Wat in de weg staat, wordt de weg. Wat kun je met deze tegenslag oefenen dat je anders nooit zou oefenen?',
    },
    {
      keywords: ['dankbaar', 'dankbaarheid', 'blij', 'geluk', 'genieten'],
      text: 'Het eerste boek van mijn schrift is één lange lijst van dank. Goed dat je aan de jouwe begint. Wie zou je er nog op zetten?',
    },
    {
      keywords: ['moe', 'opstaan', 'ochtend', 'lui', 'motivatie', 'uitstellen'],
      text: 'Ook ik bleef graag liggen. Dan herinnerde ik mezelf eraan: ik sta op om het werk van een mens te doen. Wat is jouw werk vandaag?',
    },
    {
      keywords: ['dood', 'verlies', 'rouw', 'afscheid', 'overleden', 'gemis'],
      text: 'Ik heb veel dierbaren moeten begraven. Het verdriet hoort erbij. Maar wie je liefhad, heeft je gevormd, en dat neemt niemand je af. Sterkte.',
    },
    {
      keywords: ['leiding', 'leidinggeven', 'team', 'manager', 'verantwoordelijk'],
      text: 'Leidinggeven leerde ik van mijn adoptievader: luisteren, geduldig zijn, geen ijdelheid. Wat zou zo iemand in jouw plaats als eerste doen?',
    },
    {
      keywords: ['telefoon', 'sociale media', 'scherm', 'meldingen', 'likes', 'online'],
      text: 'Je zoekt rust buiten jezelf, maar de rustigste plek is binnen. Leg het plankje even weg en keer terug naar je eigen burcht.',
    },
    {
      keywords: ['werk', 'plicht', 'baan', 'taak', 'deadline'],
      text: 'Doe wat voor je ligt, goed en zonder klagen. Niet omdat iemand kijkt, maar omdat het jouw taak is. Dat is genoeg.',
    },
    {
      keywords: ['samen', 'buurt', 'helpen', 'vrijwilliger', 'gemeenschap'],
      text: 'Wat goed is voor de zwerm, is goed voor de bij. Mooi dat je dat in praktijk brengt.',
    },
    {
      keywords: [],
      text: 'Mooi geschreven. Nu de daad nog: wat is de eerste stap die in jouw macht ligt?',
    },
  ],

  reflectionQuestions: [
    'Wat lag er deze week in jouw macht dat je hebt laten liggen?',
    'Over welke zorg maak je je druk, terwijl ze niet in jouw macht ligt?',
    'Welke opvatting maakt een situatie zwaarder dan ze is?',
    'Wie heeft je iets geleerd waarvoor je nog nooit dank hebt gezegd?',
    'Wat is morgen je eerstvolgende juiste handeling?',
  ],

  thoughts: [
    'Vandaag kom je lastige mensen tegen. Bereid je erop voor, en word niet zoals zij.',
    'Wat in de weg staat, wordt de weg. Welk obstakel mag vandaag je leraar zijn?',
    'Je kunt je op elk uur van de dag in jezelf terugtrekken. Probeer het vandaag drie keer, één minuut.',
    'Doe de volgende juiste handeling. Niet de tiende, niet de honderdste. De volgende.',
    'Denk aan de mensen uit de tijd van Vespasianus: ze trouwden, ruzieden en feestten, en niemand kent nog hun namen. Wat doet er vandaag dus echt toe?',
    'Wat niet goed is voor de zwerm, is ook niet goed voor de bij. Wat doe jij vandaag voor je zwerm?',
    'Scheid wat je overkomt van wat je ervan vindt. Het eerste is het weer, het tweede is je kompas.',
  ],
};
