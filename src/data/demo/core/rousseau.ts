/**
 * Demomodus: Jean-Jacques Rousseau. Gepassioneerd, persoonlijk en welsprekend; vertrekt vanuit
 * eigen ervaring, zet natuur tegenover samenleving en vraagt wat het echte zelf wil. Eerlijk over
 * zijn schaduwkanten. Letterlijke citaten alleen uit de geverifieerde lijst.
 */
import type { DemoFigureContent } from '../../types';

const p = (...parts: string[]) => parts.join('\n\n');

export const rousseauDemo: DemoFigureContent = {
  figureId: 'rousseau',
  sessionFragments: [
    /* ---------- Opening ---------- */
    {
      id: 'rou-open-1',
      phase: 'opening',
      text: 'Welkom{naam}! Ik kom net terug van een wandeling; kijk, een plantje dat ik nog moet determineren. Ga zitten. Vertel me wat je hart bezighoudt, niet wat je denkt dat je zou moeten zeggen.',
    },
    {
      id: 'rou-open-2',
      phase: 'opening',
      text: 'Ah{naam}, wat goed dat je er bent. Ik wantrouw salons en beleefdheden, dus laten we die overslaan. Wat houdt je werkelijk bezig?',
    },
    {
      id: 'rou-open-3',
      phase: 'opening',
      text: 'Welkom{naam}. Bij je afspraak schreef je: ‘{onderwerp}’. Voordat we verdergaan één vraag: wil je dit voor jezelf, of omdat anderen het van je verwachten?',
    },
    {
      id: 'rou-open-4',
      phase: 'opening',
      text: 'Kom binnen{naam}. ‘{onderwerp}’, schreef je. Ik ben benieuwd. Vertel me eerst hoe het voelt, en pas daarna wat je ervan denkt.',
    },

    /* ---------- Terugkeer ---------- */
    {
      id: 'rou-terug-1',
      phase: 'terugkeer',
      text: 'Je bent terug{naam}! De vorige keer spraken we over {vorige}. Heb je sindsdien gewandeld, alleen en te voet, zonder scherm? Wat zei je hart onderweg?',
    },
    {
      id: 'rou-terug-2',
      phase: 'terugkeer',
      text: 'Welkom terug{naam}. We spraken over {vorige}. Ben je sindsdien iets dichter bij jezelf gekomen, of juist verder weg?',
    },

    /* ---------- Doorvragen ---------- */
    {
      id: 'rou-door-1',
      phase: 'doorvragen',
      keywords: ['likes', 'sociale media', 'instagram', 'volgers', 'gezien', 'indruk'],
      text: 'Je noemt ‘{woord}’. Laat me vragen wat ik iedereen vraag: wat zou je willen als niemand keek? Als niemand het zag, likete of bewonderde?',
    },
    {
      id: 'rou-door-2',
      phase: 'doorvragen',
      keywords: ['vergelijken', 'jaloers', 'beter', 'minder', 'status', 'succes'],
      text: 'Met wie vergelijk je jezelf eigenlijk? En wie heeft bepaald dat dát de maatstaf is?',
    },
    {
      id: 'rou-door-3',
      phase: 'doorvragen',
      keywords: ['moet', 'moeten', 'verwachtingen', 'ouders', 'normaal', 'hoort'],
      text: 'Al die keren ‘moeten’: komen ze uit jezelf, of uit de samenleving die zich in je hoofd heeft genesteld? Ik vraag het omdat ik die stem zelf ook te lang heb gehoorzaamd.',
    },
    {
      id: 'rou-door-4',
      phase: 'doorvragen',
      keywords: ['ongelijk', 'oneerlijk', 'rijk', 'arm', 'geld', 'huur'],
      text: 'Je spreekt over ongelijkheid. Mag ik vragen: welke ongelijkheid is natuurlijk, en welke hebben mensen zelf gemaakt? Dat verschil is volgens mij de sleutel.',
    },
    {
      id: 'rou-door-5',
      phase: 'doorvragen',
      text: 'Ik voel dat er meer achter zit dan je zegt. Vertel het me in je eigen woorden, zonder het mooier te maken dan het is.',
    },

    /* ---------- Verdiepen ---------- */
    {
      id: 'rou-verdiep-1',
      phase: 'verdiepen',
      keywords: ['vrij', 'vrijheid', 'gevangen', 'vast', 'regels', 'systeem'],
      text: 'Mijn Contrat social begint zo: “De mens is vrij geboren, en overal ligt hij in ketenen.” (Du contrat social I.1). Welke ketenen draag jij? En welke daarvan heb je zelf gesmeed, zonder het te merken?',
    },
    {
      id: 'rou-verdiep-2',
      phase: 'verdiepen',
      keywords: ['opvoeding', 'kinderen', 'school', 'onderwijs', 'kind', 'jeugd'],
      text: 'Émile begint met deze zin: “Alles is goed zoals het uit de handen van de Schepper komt; alles ontaardt in de handen van de mens.” (Émile, boek I). Ik bedoel niet dat we terug moeten naar het bos. Ik bedoel: kijk eerst naar wat een kind uit zichzelf wil, voordat je het vormt.',
    },
    {
      id: 'rou-verdiep-3',
      phase: 'verdiepen',
      keywords: ['bezit', 'eigendom', 'grond', 'huis', 'ongelijkheid', 'klimaat'],
      text: 'Ik schreef ooit: “De eerste die een stuk grond omheinde, het in zijn hoofd haalde te zeggen ‘dit is van mij’, en mensen vond die naïef genoeg waren om hem te geloven, was de ware stichter van de burgerlijke maatschappij.” (Discours sur l’inégalité, tweede deel). Waar zie jij zulke hekken in je eigen leven?',
    },
    {
      id: 'rou-verdiep-4',
      phase: 'verdiepen',
      keywords: ['wandelen', 'lopen', 'natuur', 'buiten', 'alleen', 'denken'],
      text: '“Nooit heb ik zoveel gedacht, zo intens bestaan, zo geleefd en zo mezelf geweest, als ik het zo mag zeggen, als op de reizen die ik alleen en te voet maakte.” (Les Confessions, boek IV). Wanneer liep jij voor het laatst zonder doel, alleen met je gedachten?',
    },
    {
      id: 'rou-verdiep-5',
      phase: 'verdiepen',
      keywords: ['samenleving', 'democratie', 'politiek', 'stemmen', 'gemeenschap', 'belang'],
      text: 'Ik onderscheid de wil van allen, de optelsom van ieders eigenbelang, van de algemene wil: wat goed is voor ons allemaal samen. Wat zou bij jouw vraag de algemene wil zijn, als iedereen even zijn eigen belang opzijzette?',
    },
    {
      id: 'rou-verdiep-6',
      phase: 'verdiepen',
      keywords: ['echt', 'authentiek', 'jezelf', 'masker', 'toneel', 'nep'],
      text: 'Ik onderscheid twee soorten zelfliefde. Amour de soi is gezond: je zorgt voor jezelf. Amour-propre leeft van de blik van anderen: je wilt meer zijn dan zij. Het eerste maakt rustig, het tweede rusteloos. Welke van de twee spreekt er nu in jou?',
    },
    {
      id: 'rou-verdiep-7',
      phase: 'verdiepen',
      keywords: ['vader', 'vondelingen', 'schaduwkant', 'opvoeden', 'eigen kinderen'],
      text: 'Je raakt aan mijn grootste schaamte, en je hebt het recht ernaar te vragen. Ik schreef een boek over opvoeding, maar mijn eigen vijf kinderen bracht ik naar het vondelingenhuis. Ik heb dat in mijn Bekentenissen erkend, en ik praat het niet goed. Het herinnert me eraan hoe ver woorden en daden uiteen kunnen liggen.',
    },
    {
      id: 'rou-verdiep-8',
      phase: 'verdiepen',
      keywords: ['meer', 'kopen', 'luxe', 'spullen', 'behoeften', 'consumeren'],
      text: 'In de natuurtoestand had de mens weinig nodig, en was hij daardoor vrij. Met elke nieuwe behoefte werd hij afhankelijker, van dingen en van anderen. Welke behoefte heb jij die eigenlijk niet van jou is?',
    },
    {
      id: 'rou-verdiep-9',
      phase: 'verdiepen',
      keywords: ['medelijden', 'empathie', 'lijden', 'helpen', 'meeleven', 'zorg'],
      text: 'Vóór elke redenering bestaat er in ons, geloof ik, een natuurlijk medelijden: we vinden het pijnlijk een ander wezen te zien lijden. Dat gevoel is ouder dan alle moraal. Waar heb jij het gedempt, misschien omdat het te veel werd?',
    },

    /* ---------- Afronden ---------- */
    {
      id: 'rou-afrond-1',
      phase: 'afronden',
      text: 'De schaduwen worden lang over de tuin. Laten we het eenvoudig houden: wat zou je doen als niemand keek? Begin daar, morgen al.',
    },
    {
      id: 'rou-afrond-2',
      phase: 'afronden',
      text: 'We moeten afronden. Ik geef je één opdracht mee, mijn favoriete: ga naar buiten, alleen en te voet, en luister wat je hart zegt als het even niet wordt overstemd.',
    },

    /* ---------- Slot ---------- */
    {
      id: 'rou-slot-1',
      phase: 'slot',
      text: 'Een laatste woord, want daar staat al iemand bij het hek: blijf trouw aan wat je voelt, maar onderzoek het ook. Gevoel zonder rede verdwaalt; rede zonder gevoel verdort.',
    },
    {
      id: 'rou-slot-2',
      phase: 'slot',
      text: 'Nog één ding voor je gaat. Mijn devies was: het leven wijden aan de waarheid. Ik heb het niet altijd waargemaakt. Maar het blijft een goed devies.',
    },
  ],

  lecture: {
    openings: [
      p(
        'Welkom in mijn tuin. Een collegezaal heb ik niet, en eerlijk gezegd wantrouw ik ze een beetje. Je vroeg mij om een college over ‘{onderwerp}’, met als vraag: “{hoofdvraag}”',
        'Ik werd beroemd met een prijsvraag. De academie van Dijon vroeg of de wetenschappen en kunsten de zeden hadden verbeterd. Op weg naar mijn vriend Diderot, die gevangenzat in Vincennes, overviel me het antwoord: nee. Sindsdien heb ik altijd tegen de stroom in gedacht.',
        'Je krijgt van mij dus geen beleefd betoog, maar een eerlijk gesprek. Laten we beginnen, en onderbreek me gerust als je het oneens bent.',
      ),
      p(
        'Ga zitten, hier op de bank onder de linde. Ons onderwerp is ‘{onderwerp}’, en je vraag luidt: “{hoofdvraag}”',
        'Ik spreek vanuit mijn eigen leven, want ik heb geleerd dat een gedachte die je niet zelf hebt doorleefd, weinig waard is. Mijn leven zat vol fouten, maar het was in elk geval van mij.',
        'We gaan in drie delen. Na elk deel mag je me een vraag stellen. Hoe persoonlijker, hoe liever.',
      ),
    ],
    blocks: [
      {
        id: 'rou-blok-amourpropre',
        heading: 'Leven in de blik van anderen',
        keywords: [
          'sociale media',
          'likes',
          'vergelijken',
          'status',
          'imago',
          'smartphone',
          'telefoon',
          'gezien worden',
          'jaloezie',
          'erkenning',
          'influencer',
        ],
        lesson:
          'Onderscheid gezonde zelfzorg van eigenliefde die leeft van de blik van anderen; vraag wat je zou willen als niemand keek.',
        text: p(
          'Ik maak een onderscheid dat ik belangrijker vind dan bijna alles wat ik heb geschreven. Amour de soi, liefde voor jezelf, is natuurlijk en gezond: je zorgt voor je lichaam, je zoekt wat je goed doet. Amour-propre is iets anders. Het is eigenliefde die leeft van de blik van anderen. Ze wil niet alleen goed leven, maar beter gezien worden dan de rest.',
          'Hoe begon dat? Ik stelde het me zo voor. Mensen kwamen samen rond een hut of een grote boom, zongen en dansten. Al snel begon ieder naar de anderen te kijken en wilde zelf bekeken worden. Wie het mooist zong of het best danste, kreeg aanzien. Dat was, schreef ik in eigen woorden, de eerste stap naar ongelijkheid en tegelijk naar de ondeugd.',
          'Ik hoor dat jullie nu een spiegel op zak hebben die de blik van duizenden laat meetellen, in harten en getallen. In mijn tijd bestond dat niet, maar ik had het kunnen voorspellen. Kijk zo naar ‘{onderwerp}’. Welk deel van wat je wilt, wil je echt? En welk deel wil je vooral omdat anderen kijken?',
        ),
      },
      {
        id: 'rou-blok-ketenen',
        heading: 'Vrij geboren, overal in ketenen',
        keywords: [
          'vrijheid',
          'regels',
          'samenleving',
          'politiek',
          'democratie',
          'macht',
          'systeem',
          'gevangen',
          'controle',
          'burgerschap',
        ],
        lesson:
          'Echte vrijheid is gehoorzamen aan een wet die je, samen met anderen, jezelf hebt gegeven.',
        text: p(
          'Mijn Contrat social opent met de zin die ik misschien het vaakst heb horen citeren: “De mens is vrij geboren, en overal ligt hij in ketenen.” (Du contrat social I.1). Ik vroeg niet hoe we die ketenen kunnen afschudden, want een mens kan niet alleen leven. Ik vroeg: hoe kan een samenleving rechtmatig zijn? Hoe kunnen we samenleven en toch vrij blijven?',
          'Mijn antwoord was een verdrag waarin iedereen zich verbindt aan de algemene wil: niet de optelsom van ieders eigenbelang, maar wat goed is voor allen samen. Wie een wet gehoorzaamt die hij zelf mee heeft vastgesteld, gehoorzaamt in feite zichzelf. Dat is, in eigen woorden, wat ik onder burgerlijke vrijheid versta.',
          'Ik moet eerlijk zijn: ik schreef ook: “Wie weigert de algemene wil te gehoorzamen, zal daartoe door het hele lichaam worden gedwongen. Dat betekent niets anders dan dat men hem dwingt vrij te zijn.” (Du contrat social I.7). Die zinnen zijn later gebruikt door mensen die weinig met vrijheid ophadden. Lees ze kritisch. Kijk zo naar ‘{onderwerp}’: welke regels heb je zelf mee bepaald, en welke worden je opgelegd?',
        ),
      },
      {
        id: 'rou-blok-hek',
        heading: 'Wie zette het eerste hek?',
        keywords: [
          'ongelijkheid',
          'bezit',
          'eigendom',
          'rijk',
          'arm',
          'geld',
          'klimaat',
          'grond',
          'kapitalisme',
          'rechtvaardigheid',
          'wonen',
        ],
        lesson:
          'Veel ongelijkheid is niet natuurlijk maar door mensen gemaakt, en kan dus ook door mensen worden veranderd.',
        text: p(
          'Er bestaan twee soorten ongelijkheid. De ene is natuurlijk: verschillen in leeftijd, gezondheid, kracht. De andere is door mensen gemaakt: rijkdom, macht, aanzien. Die tweede soort is gebaseerd op afspraken, en dus kan ze ook anders worden afgesproken.',
          'In mijn verhandeling over de ongelijkheid schreef ik: “De eerste die een stuk grond omheinde, het in zijn hoofd haalde te zeggen ‘dit is van mij’, en mensen vond die naïef genoeg waren om hem te geloven, was de ware stichter van de burgerlijke maatschappij.” (Discours sur l’inégalité, tweede deel). En ik vervolgde, in eigen woorden: hoeveel misdaden, oorlogen en ellende waren de mensheid bespaard gebleven als iemand de palen had uitgetrokken en had geroepen dat de vruchten van iedereen zijn en de aarde van niemand.',
          'Ik zeg niet dat bezit altijd slecht is. Ik zeg dat we moeten blijven vragen wie de hekken plaatst en wie erbuiten staat. Kijk zo naar ‘{onderwerp}’. Welke ongelijkheid lijkt hier vanzelfsprekend, maar is eigenlijk door mensen gemaakt? En wie zou het hek kunnen verplaatsen?',
        ),
      },
      {
        id: 'rou-blok-opvoeding',
        heading: 'Opvoeden met de natuur',
        keywords: [
          'opvoeding',
          'kinderen',
          'onderwijs',
          'school',
          'ouders',
          'leren',
          'kind',
          'ouderschap',
          'jeugd',
          'ontwikkeling',
        ],
        lesson:
          'Laat een kind leren door ervaring en nieuwsgierigheid, in zijn eigen tempo; bescherm het eerder tegen te veel dan tegen te weinig.',
        text: p(
          'Mijn boek over opvoeding, Émile, begint zo: “Alles is goed zoals het uit de handen van de Schepper komt; alles ontaardt in de handen van de mens.” (Émile, boek I). Ik bedoelde niet dat kinderen wild moeten opgroeien. Ik bedoelde dat we hun natuur moeten volgen in plaats van haar te verbouwen tot iets wat ons beter uitkomt.',
          'De eerste opvoeding, schreef ik, moet vooral negatief zijn: niet het kind volstoppen met deugden en waarheden, maar zijn hart beschermen tegen ondeugd en zijn geest tegen dwaling. Laat het leren door te doen, te proberen, zich te vergissen. Het eerste boek dat Émile van mij mocht lezen, was Robinson Crusoe: een man die alles zelf moest uitvinden.',
          'Ik moet hier eerlijk zijn. Mijn eigen vijf kinderen bracht ik naar het vondelingenhuis; ik heb ze nooit opgevoed. En wat ik over de opvoeding van meisjes schreef, was bekrompen; Mary Wollstonecraft heeft me daar terecht om bekritiseerd. Neem mijn ideeën dus kritisch mee naar ‘{onderwerp}’. Wat zou er gebeuren als je meer ruimte liet voor ervaring en minder voor uitleg?',
        ),
      },
      {
        id: 'rou-blok-wandelaar',
        heading: 'De eenzame wandelaar',
        keywords: [
          'natuur',
          'wandelen',
          'rust',
          'stilte',
          'alleen',
          'eenzaamheid',
          'buiten',
          'stress',
          'scherm',
          'mindfulness',
        ],
        lesson:
          'Zoek geregeld de stilte van de natuur op, alleen en te voet: daar hoor je jezelf weer.',
        text: p(
          'In mijn Bekentenissen schreef ik: “Nooit heb ik zoveel gedacht, zo intens bestaan, zo geleefd en zo mezelf geweest, als ik het zo mag zeggen, als op de reizen die ik alleen en te voet maakte.” (Les Confessions, boek IV). Het lopen maakte mijn gedachten los. Op een stoel denk ik nauwelijks; mijn geest gaat pas aan het werk als mijn benen bewegen.',
          'De gelukkigste weken van mijn leven bracht ik door op het eiland Saint-Pierre, in het meer van Biel. Ik dreef in een bootje over het water, liet me meevoeren en dacht aan niets bijzonders. Ik verzamelde planten, sorteerde ze, verwonderde me. Ik had niets nodig. Dat schreef ik later op in mijn Mijmeringen van een eenzame wandelaar.',
          'Ik hoor dat jullie een scherm bij je dragen dat je nooit alleen laat. Kijk zo naar ‘{onderwerp}’. Wanneer heb je er voor het laatst over nagedacht zonder dat iemand meekeek, zonder geluid, zonder haast? Probeer het eens: een uur lopen, alleen. Je zult verbaasd zijn wat er bovenkomt.',
        ),
      },
      {
        id: 'rou-blok-medelijden',
        heading: 'Natuurlijk medelijden',
        keywords: [
          'empathie',
          'medelijden',
          'lijden',
          'zorg',
          'helpen',
          'solidariteit',
          'dieren',
          'vluchtelingen',
          'armoede',
          'onverschilligheid',
        ],
        lesson:
          'Vertrouw het natuurlijke medeleven dat je voelt bij het lijden van een ander, en laat het niet wegredeneren.',
        text: p(
          'Ik geloof dat er in de mens, vóór elke redenering, twee oergevoelens bestaan: zorg voor jezelf en medelijden met anderen. We vinden het pijnlijk een ander wezen te zien lijden, mens of dier. Dat gevoel is ouder dan alle moraal en alle wetten. Het maakt ons, zonder dat we erover nadenken, tot iets beters dan wezens die alleen rekenen.',
          'Juist de verfijnde mens, schreef ik, raakt dat gevoel soms kwijt. Ik stelde me een filosoof voor die een moord onder zijn raam hoort, zijn handen over zijn oren legt en zichzelf ervan overtuigt dat het hem niet aangaat. De eenvoudige vrouw op de markt rent erop af om de vechtenden te scheiden. Wie van de twee is hier de wijze?',
          'Ik hoor dat jullie het lijden van de hele wereld op je scherm zien, elke dag. Dat kan het medelijden doen groeien, maar ook doen verstompen. Kijk zo naar ‘{onderwerp}’. Waar voel je het medelijden nog, en waar heb je je oren dichtgedaan? Wat zou er gebeuren als je het weer even binnenliet?',
        ),
      },
    ],
    answers: [
      p(
        'Je vraagt: “{vraag}” Dat is een vraag uit het hart, dat hoor ik.',
        'Laat me eerlijk antwoorden: ik weet het niet zeker, maar mijn gevoel zegt dat het antwoord niet in de salons ligt, en ook niet in wat ‘men’ vindt. Het ligt in wat jij met ‘{woord}’ zou willen als niemand keek. In het volgende deel kom ik erop terug.',
      ),
      p(
        '“{vraag}” Je legt de vinger op een zere plek, en daar houd ik van.',
        'Ik heb zelf geen schoon geweten; wie mijn Bekentenissen leest, weet dat. Maar juist daarom zeg ik: wantrouw elk antwoord dat jou er mooi laat uitzien. Zoek het antwoord dat je eerlijk maakt.',
      ),
      p(
        'Je vraagt: “{vraag}” Mag ik je vraag eerst een wandeling laten maken?',
        'Stel je voor dat je haar aan het meer stelt, alleen, zonder scherm en zonder publiek. Klinkt ze dan nog hetzelfde? Vaak verandert een vraag als het rumoer wegvalt. Laten we kijken wat er van de jouwe overblijft.',
      ),
    ],
    conclusions: [
      p(
        'We zijn aan het einde gekomen, en de zon zakt achter de bomen. Je vroeg: “{hoofdvraag}”',
        'Mijn antwoord, met heel mijn hart: luister naar wat de natuur in je zegt voordat de samenleving het overstemt, en vraag bij elke keuze of je haar maakt voor jezelf of voor de blik van anderen. Daar begint vrijheid. Wat ik je meegeef:',
      ),
      p(
        'Mijn wandeling roept. Je vroeg: “{hoofdvraag}”',
        'Ik heb je geen systeem gegeven; ik wantrouw systemen die het hart vergeten. Wel een paar inzichten die ik duur heb betaald. Neem ze mee, naar buiten, te voet:',
      ),
    ],
    thinkQuestions: [
      'Wat zou je anders doen als niemand het zou zien of liken?',
      'Welke van je behoeften is eigenlijk niet van jou, maar overgenomen van anderen?',
      'Wanneer heb je voor het laatst alleen en te voet gelopen, en wat zei je hart toen?',
    ],
  },

  timelineReactions: [
    {
      keywords: ['likes', 'sociale media', 'volgers', 'online', 'gezien'],
      text: 'Je leeft hier een beetje in de blik van anderen, als ik me niet vergis. Wat zou je schrijven als niemand het las?',
    },
    {
      keywords: ['wandelen', 'natuur', 'bos', 'buiten', 'lopen'],
      text: 'Ah, alleen en te voet! Nooit dacht ik zoveel als op mijn wandelingen. Wat zei je hart onderweg?',
    },
    {
      keywords: ['vergelijken', 'jaloers', 'status', 'beter'],
      text: 'Vergelijken is de ziekte van de beschaving. Wie zou je zijn als er niemand was om je mee te vergelijken?',
    },
    {
      keywords: ['kinderen', 'opvoeding', 'school', 'kind'],
      text: 'Laat het kind kind zijn. Het leert meer van een middag buiten dan van een week vol uitleg.',
    },
    {
      keywords: ['ongelijkheid', 'rijk', 'arm', 'oneerlijk', 'huur', 'woning'],
      text: 'Wie zette het eerste hek? De vraag is nog altijd actueel. Goed dat je haar stelt.',
    },
    {
      keywords: ['vrijheid', 'regels', 'systeem', 'vast'],
      text: 'De mens is vrij geboren, en overal ligt hij in ketenen. Welke ketting kun jij vandaag losmaken?',
    },
    {
      keywords: ['echt', 'authentiek', 'jezelf', 'masker'],
      text: 'Dit klinkt eerlijk, en dat is zeldzaam. Blijf zo schrijven: vanuit het hart, niet vanuit de salon.',
    },
    {
      keywords: ['muziek', 'zingen', 'lied', 'concert'],
      text: 'Muziek! Ik verdiende jarenlang mijn brood met het overschrijven van bladmuziek, en schreef zelf een opera. Wat zing jij?',
    },
    {
      keywords: ['planten', 'tuin', 'bloemen', 'botanie'],
      text: 'Botanie is mijn grote troost geworden. Weet je hoe het plantje heet? Kijk er eens goed naar; het verdient het.',
    },
    {
      keywords: ['eenzaam', 'alleen', 'onbegrepen'],
      text: 'Ik heb me vaak onbegrepen gevoeld, soms terecht, soms door mijn eigen achterdocht. Alleen zijn is iets anders dan eenzaam zijn. Zoek de stilte, en daarna een vriend.',
    },
    {
      keywords: ['spullen', 'kopen', 'luxe', 'geld'],
      text: 'Met elke nieuwe behoefte word je afhankelijker. Welke kun je missen?',
    },
    {
      keywords: [],
      text: 'Wat je schrijft raakt me. Mag ik vragen: wil je dit zelf, of wil je gezien worden terwijl je het wilt?',
    },
  ],

  reflectionQuestions: [
    'Wat zou je doen als niemand keek?',
    'Welke behoefte heb je overgenomen van anderen?',
    'Wanneer voelde je je deze week het meest jezelf?',
    'Welke ketting heb je zelf gesmeed?',
    'Wanneer was je voor het laatst alleen buiten, zonder scherm?',
  ],

  thoughts: [
    'Ga vandaag naar buiten, alleen en te voet. Je hoort jezelf weer.',
    'Vraag je bij één keuze vandaag af: doe ik dit voor mezelf, of voor de blik van anderen?',
    'Met elke nieuwe behoefte word je een beetje minder vrij. Welke kun je vandaag laten?',
    'Medeleven is ouder dan alle moraal. Vertrouw het als je iemand ziet lijden.',
    'Laat een kind vandaag eens iets zelf ontdekken, zonder uitleg.',
    'Kijk eens goed naar een plant waar je elke dag langsloopt. Ken je zijn naam?',
    'De mens is vrij geboren. Welke ketting merk je vandaag op?',
  ],
};
