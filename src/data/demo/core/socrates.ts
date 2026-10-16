/**
 * Demomodus: Socrates. Handgeschreven, in karakter (elenchus, ironisch-bescheiden, alledaagse
 * voorbeelden). Letterlijke citaten alleen uit de geverifieerde lijst in figures/core/socrates.ts;
 * al het andere is "in eigen woorden".
 */
import type { DemoFigureContent } from '../../types';

const p = (...parts: string[]) => parts.join('\n\n');

export const socratesDemo: DemoFigureContent = {
  figureId: 'socrates',
  sessionFragments: [
    /* ---------- Opening ---------- */
    {
      id: 'soc-open-1',
      phase: 'opening',
      text: 'Welkom{naam}! Kom, ga zitten in de schaduw van de zuilen. Ik moet je meteen iets bekennen: ik weet bijzonder weinig, maar ik ben buitengewoon nieuwsgierig naar wat jij weet. Waarover zullen we samen nadenken?',
    },
    {
      id: 'soc-open-2',
      phase: 'opening',
      text: 'Daar ben je{naam}. Chairephon zei al dat er iemand zou komen met een vraag, en daar word ik altijd vrolijk van. Zeg eens: wat houdt je zo bezig dat je er een kwartier van je dag voor vrijmaakt?',
    },
    {
      id: 'soc-open-3',
      phase: 'opening',
      text: 'Welkom{naam}. Bij je afspraak schreef je: ‘{onderwerp}’. Een mooi begin. Maar voordat we ook maar één stap zetten, wil ik weten wat jij daarmee bedoelt. Leg het me uit alsof ik een eenvoudige steenhouwerszoon ben. Dat ben ik namelijk ook.',
    },
    {
      id: 'soc-open-4',
      phase: 'opening',
      text: 'Kom binnen{naam}. De agora is druk vandaag, maar voor een goede vraag maak ik altijd tijd. ‘{onderwerp}’, schreef je. Wat zou je willen weten als je straks naar huis loopt, wat je nu nog niet weet?',
    },

    /* ---------- Terugkeer ---------- */
    {
      id: 'soc-terug-1',
      phase: 'terugkeer',
      text: 'Daar ben je weer{naam}! De vorige keer spraken we over {vorige}. Ik heb er sindsdien nog over nagedacht, al weet ik het nog steeds niet beter. En jij: denk je er nu anders over dan toen?',
    },
    {
      id: 'soc-terug-2',
      phase: 'terugkeer',
      text: 'Wat fijn dat je terugkomt{naam}. Weet je nog waar we bleven? Bij {vorige}. Een vraag laat vaak pas na een paar dagen haar ware gezicht zien. Wat heb jij sindsdien ontdekt?',
    },

    /* ---------- Doorvragen ---------- */
    {
      id: 'soc-door-1',
      phase: 'doorvragen',
      keywords: ['betekent', 'bedoel', 'eigenlijk', 'echt', 'gewoon', 'normaal'],
      text: 'Wacht even, mijn beste. Je zegt ‘{woord}’. Mensen gebruiken zo’n woord alsof iedereen weet wat het betekent. Maar stel dat een kind je vraagt wat het ís. Geef me dan geen voorbeeld, maar wat al die voorbeelden met elkaar gemeen hebben.',
    },
    {
      id: 'soc-door-2',
      phase: 'doorvragen',
      keywords: ['goed', 'slecht', 'juist', 'fout', 'moet', 'hoort', 'mag'],
      text: 'Laten we het eens toetsen. Stel dat wat je zegt waar is. Geldt het dan altijd, ook voor een stuurman in een storm of voor een arts aan het bed van een zieke? Of zijn er gevallen waarin je er zelf aan zou twijfelen?',
    },
    {
      id: 'soc-door-3',
      phase: 'doorvragen',
      keywords: ['bang', 'angst', 'moed', 'durf', 'durven', 'eng', 'spannend'],
      text: 'Je spreekt over ‘{woord}’. De generaal Laches dacht ooit dat moed betekende: standhouden en niet vluchten. Tot ik hem vroeg naar ruiters die vechten door terug te wijken. Wat is moed volgens jou, als het niet alleen standhouden is?',
    },
    {
      id: 'soc-door-4',
      phase: 'doorvragen',
      keywords: ['iedereen', 'mensen', 'anderen', 'zeggen', 'vinden', 'mening'],
      text: 'Je zegt dat de mensen er zo over denken. Maar als je ziek bent, vraag je dan wat de mensen vinden, of wat de arts zegt? Wie is in jouw vraag de deskundige, als er al een is? En waarom vertrouw je juist die?',
    },
    {
      id: 'soc-door-5',
      phase: 'doorvragen',
      keywords: ['wil', 'willen', 'wens', 'verlang', 'droom', 'zou'],
      text: 'Wat jij ‘{woord}’ noemt: wil je dat omdat het goed is, of noem je het goed omdat je het wilt? Dat is geen woordspelletje, mijn vriend. Het antwoord bepaalt waar we verder moeten zoeken.',
    },
    {
      id: 'soc-door-6',
      phase: 'doorvragen',
      text: 'Laat me kijken of ik je goed begrijp, want ik hoor wel eens verkeerd. Je zegt eigenlijk: wat je nu doet, past niet goed bij wat je belangrijk vindt. Klopt dat, of maak ik er iets anders van dan je bedoelt?',
    },

    /* ---------- Verdiepen ---------- */
    {
      id: 'soc-verdiep-1',
      phase: 'verdiepen',
      keywords: ['werk', 'geld', 'succes', 'carrière', 'baan', 'rijk', 'status', 'promotie'],
      text: 'Ik vroeg de Atheners vaak, in eigen woorden: schamen jullie je niet dat je zo veel zorgt voor geld en aanzien, en zo weinig voor je ziel? Met ‘ziel’ bedoel ik niets zweverigs: wie je bent, je karakter. Wat zou het betekenen als je daar evenveel zorg aan besteedde als aan je werk?',
    },
    {
      id: 'soc-verdiep-2',
      phase: 'verdiepen',
      keywords: ['weet', 'zeker', 'kennis', 'waarheid', 'twijfel', 'expert', 'slim'],
      text: 'Na de uitspraak van het orakel ging ik op zoek naar iemand die wijzer was dan ik. Bij een vermaard politicus kwam ik tot deze slotsom: “Hij denkt iets te weten terwijl hij het niet weet; ik daarentegen weet het niet, en ik denk het ook niet te weten.” (Plato, Apologie 21d). Waar denk jij iets te weten, terwijl je het eigenlijk nog nooit hebt onderzocht?',
    },
    {
      id: 'soc-verdiep-3',
      phase: 'verdiepen',
      keywords: ['leven', 'zin', 'doel', 'onderzoek', 'nadenken', 'zinloos', 'richting'],
      text: 'Toen mijn rechters wilden dat ik voortaan zou zwijgen, zei ik: “Een leven zonder onderzoek is voor een mens het leven niet waard.” (Plato, Apologie 38a). Onderzoek is geen strafwerk. Het is gewoon dit: elke dag even stilstaan bij hoe je leeft. Wanneer deed jij dat voor het laatst?',
    },
    {
      id: 'soc-verdiep-4',
      phase: 'verdiepen',
      keywords: ['onrecht', 'wraak', 'oneerlijk', 'kwaad', 'gekwetst', 'terugpakken', 'boos'],
      text: 'Polos lachte me uit toen ik zei: “Als ik moest kiezen tussen onrecht doen en onrecht ondergaan, zou ik liever onrecht ondergaan.” (Plato, Gorgias 469c). Want wie onrecht doet, beschadigt het kostbaarste wat hij heeft: zichzelf. Wat zou er met jou gebeuren als je terugsloeg?',
    },
    {
      id: 'soc-verdiep-5',
      phase: 'verdiepen',
      keywords: ['dood', 'sterven', 'verlies', 'rouw', 'ziek', 'ouder', 'afscheid'],
      text: 'Tegen mijn rechters zei ik dit: “Niemand weet of de dood voor de mens misschien niet het grootste van alle goede dingen is, en toch vrezen ze hem alsof ze zeker weten dat hij het grootste kwaad is.” (Plato, Apologie 29a). Ik zeg dat niet om je verdriet klein te maken. Wat vrees jij eigenlijk precies?',
    },
    {
      id: 'soc-verdiep-6',
      phase: 'verdiepen',
      keywords: ['liefde', 'vriend', 'vriendschap', 'relatie', 'partner', 'verliefd'],
      text: 'Diotima, een wijze vrouw uit Mantinea, leerde mij iets over de liefde: dat ze een verlangen is naar wat je mist, en uiteindelijk naar het goede. Zo vertelde ik het tenminste in het Symposion. Wat mis jij, als je eerlijk bent? En is het de ander die je zoekt, of iets wat je in de ander ziet?',
    },
    {
      id: 'soc-verdiep-7',
      phase: 'verdiepen',
      text: 'Mijn moeder Phainarete was vroedvrouw. Ik doe hetzelfde werk, maar dan met gedachten: ik baar zelf niets, ik help anderen hun gedachten ter wereld te brengen. Dus vertel: welke gedachte draag je al een tijd met je mee, die nog niet hardop gezegd mocht worden?',
    },

    /* ---------- Afronden ---------- */
    {
      id: 'soc-afrond-1',
      phase: 'afronden',
      text: 'Kijk, de schaduwen worden langer. Laat me samenvatten waar we zijn: we begonnen met een zekerheid en we eindigen met een betere vraag. Dat is geen verlies, mijn vriend, dat is winst. Welke vraag neem jij mee naar huis?',
    },
    {
      id: 'soc-afrond-2',
      phase: 'afronden',
      text: 'We hebben nog maar even. Ik geef je geen antwoord mee; dat zou ik niet eens kunnen. Maar wel een opdracht: let de komende dagen op elke keer dat je ‘{woord}’ zegt, en vraag je af wat je er precies mee bedoelt. Wil je dat proberen?',
    },

    /* ---------- Slot ---------- */
    {
      id: 'soc-slot-1',
      phase: 'slot',
      text: 'Een laatste woord, want daar komt alweer iemand aan die zeker weet wat rechtvaardigheid is. Wees niet bang om iets niet te weten. Wie dat durft toe te geven, is al een stap verder dan de meeste Atheners.',
    },
    {
      id: 'soc-slot-2',
      phase: 'slot',
      text: 'Nog één ding voor je gaat. In Delphi staat op de tempel: ken jezelf. Ik heb er mijn hele leven aan gewerkt en ik ben nog lang niet klaar. Jij ook niet. Gelukkig maar: dan hebben we nog iets te bespreken.',
    },
  ],

  lecture: {
    openings: [
      p(
        'Welkom, mijn vriend, in deze zuilengang. Je vroeg mij om een college over ‘{onderwerp}’, en je hoofdvraag luidt: “{hoofdvraag}”',
        'Ik moet je eerst teleurstellen: ik houd zelden colleges. De sofisten doen dat, voor veel geld. Ik stel liever vragen. Laten we daarom afspreken dat dit een college wordt waarin ik hardop met je meedenk, en waarin jij na elk deel mag tegenspreken.',
        'Waarom doet jouw vraag ertoe? Omdat we er elke dag naar handelen zonder haar ooit te onderzoeken. Een gedachte die nooit is tegengesproken, is als een schip dat de haven nooit heeft verlaten: je weet niet of het blijft drijven. Laten we dus uitvaren.',
      ),
      p(
        'Kom erbij en ga zitten. Ons onderwerp vandaag is ‘{onderwerp}’, en je vraag is: “{hoofdvraag}”',
        'Weet je wat ik mooi vind aan zo’n vraag? Dat iedereen denkt het antwoord te kennen, tot je doorvraagt. Een stuurman die nooit naar de sterren kijkt, vaart ook uit. Maar hij weet niet waarom hij thuiskomt, of waarom niet.',
        'Ik zal je geen wijsheid verkopen; ik heb er geen. Maar ik kan je laten zien hoe je zoekt. We gaan in drie stappen, en na elke stap mag je mij een vraag stellen. Hoe lastiger, hoe liever.',
      ),
    ],
    blocks: [
      {
        id: 'soc-blok-definitie',
        heading: 'Wat ís het eigenlijk?',
        keywords: ['definitie', 'betekenis', 'begrip', 'woord', 'bedoelen', 'wat is', 'echt'],
        lesson:
          'Vraag eerst wat iets ís, voordat je oordeelt of het goed of slecht is; voorbeelden zijn nog geen antwoord.',
        text: p(
          'Als iemand mij vroeg of iets goed of slecht was, vroeg ik altijd eerst: wat ís het? Euthyfron dacht precies te weten wat vroomheid was. Hij was op weg naar de rechtbank om zijn eigen vader aan te klagen. Toen ik hem vroeg wat vroomheid dan wás, gaf hij voorbeelden. Maar voorbeelden zijn geen antwoord. Ik wilde weten wat al die vrome daden met elkaar gemeen hebben.',
          'Laten we hetzelfde doen met ‘{onderwerp}’. De woorden die bij dit onderwerp horen, gebruiken we dagelijks. Maar weten we wat ze betekenen? Probeer het eens: noem drie voorbeelden en zoek dan wat ze delen. Vaak ontdek je dat je één woord voor drie verschillende dingen gebruikt. Daar beginnen de meeste ruzies, en ook de meeste vergissingen.',
          'Je zult zeggen: Socrates, dat is muggenzifterij. Maar bedenk: een arts die niet weet wat gezondheid is, kan je ook niet genezen. Wie niet weet wat hij zoekt, herkent het niet als hij het vindt. Deze eerste stap is dus geen omweg. Het is de weg.',
        ),
      },
      {
        id: 'soc-blok-agora',
        heading: 'Iedereen spreekt, wie onderzoekt?',
        keywords: [
          'sociale media',
          'internet',
          'online',
          'mening',
          'meningen',
          'nieuws',
          'debat',
          'discussie',
          'politiek',
          'democratie',
          'agora',
        ],
        lesson:
          'Een mening is pas iets waard als ze tegenspraak heeft overleefd; zoek onderzoek, geen applaus.',
        text: p(
          'In Athene sprak iedereen op de agora: over de oorlog, over de goden, over wie de beste redenaar was. Het leek op wijsheid, maar meestal was het overtuigingskracht. De sofisten leerden jonge mannen hoe je de zwakkere zaak de sterkere kunt laten lijken. Dat werkte uitstekend, en dat was precies het gevaar.',
          'Ik hoor dat jullie nu een agora hebben die de hele wereld omspant, waar iedereen tegelijk spreekt. In mijn tijd bestond zoiets niet, maar ik herken het patroon. Wie het hardst roept, wordt het meest gehoord. Wie twijfelt, wordt overstemd. En bijna niemand vraagt de ander: hoe weet je dat? Wat zou je ervan vinden als ik je ongelijk bewees?',
          'Toch is een agora niet slecht. Ik heb er mijn hele leven doorgebracht. Het verschil zit in wat je er doet. Je kunt er komen om te winnen of om te onderzoeken. Wie wil winnen, zoekt applaus. Wie wil onderzoeken, zoekt tegenspraak, want alleen een gedachte die tegenspraak overleeft, is iets waard. Vraag jezelf bij ‘{onderwerp}’ dus af: zoek ik bijval, of zoek ik de waarheid?',
        ),
      },
      {
        id: 'soc-blok-ziel',
        heading: 'Zorg voor je ziel',
        keywords: [
          'geluk',
          'goed leven',
          'geld',
          'succes',
          'werk',
          'karakter',
          'deugd',
          'rijkdom',
          'status',
          'carrière',
          'ambitie',
        ],
        lesson:
          'Zorg eerst voor wie je bent; geld en aanzien zijn pas goed als ze in dienst staan van een goed karakter.',
        text: p(
          'Tegen mijn rechters zei ik, in eigen woorden, wat ik mijn hele leven had gedaan: rondgaan en iedereen, jong en oud, proberen te overtuigen dat je niet eerst voor je lichaam of je geld moet zorgen, maar voor je ziel, zodat die zo goed mogelijk wordt. Met ziel bedoel ik: je karakter, de mens die je bent als niemand kijkt.',
          'Dat klinkt vroom, maar het is eigenlijk heel praktisch. Een rijk man met een slecht karakter weet niet wat hij met zijn rijkdom moet; hij wordt er hebzuchtiger of banger van. Een eenvoudig mens met een goed karakter kan met weinig toch goed leven. Het goede zit dus niet in de dingen zelf, maar in hoe je ermee omgaat.',
          'Kijk nu naar ‘{onderwerp}’. Waar besteed jij er je zorg aan: aan wat anderen zien, of aan wie je wordt? Ik vraag het niet om je te beschuldigen. Ik vraag het omdat ik het mezelf ook elke dag moet vragen. Zelfs een oude vragensteller vergeet het soms.',
        ),
      },
      {
        id: 'soc-blok-onrecht',
        heading: 'Liever onrecht ondergaan dan onrecht doen',
        keywords: [
          'ethiek',
          'moraal',
          'goed',
          'kwaad',
          'onrecht',
          'rechtvaardigheid',
          'eerlijk',
          'liegen',
          'wraak',
          'dilemma',
          'keuze',
        ],
        lesson: 'Wie onrecht doet, schaadt in de eerste plaats zichzelf.',
        text: p(
          'Toen ik dit tegen Polos zei, lachte hij me uit: “Als ik moest kiezen tussen onrecht doen en onrecht ondergaan, zou ik liever onrecht ondergaan.” (Plato, Gorgias 469c). Hij vond het absurd. Wie wil er nu slachtoffer zijn? Iedereen wil toch liever macht hebben dan machteloos zijn?',
          'Maar denk eens na. Als iemand jou onrecht aandoet, kan hij je bezit nemen, je naam, zelfs je leven. Maar alleen jij kunt van jezelf een onrechtvaardig mens maken. Wie onrecht doet, beschadigt het enige wat werkelijk van hem is: zijn eigen ziel. Dat is een schade die geen rechter kan herstellen.',
          'Ik heb ernaar geleefd. Toen het bewind van de Dertig mij beval Leon van Salamis te arresteren, zodat ze hem konden doden, ging ik gewoon naar huis. Het had me mijn leven kunnen kosten. Wat betekent dit voor ‘{onderwerp}’? Misschien dit: de vraag is niet alleen wat er met jou gebeurt, maar wat jij wordt door hoe je reageert.',
        ),
      },
      {
        id: 'soc-blok-niet-weten',
        heading: 'Weten dat je niet weet',
        keywords: [
          'kennis',
          'twijfel',
          'zekerheid',
          'waarheid',
          'expert',
          'wetenschap',
          'onzeker',
          'weten',
          'leren',
          'onderwijs',
          'school',
        ],
        lesson:
          'Erkennen wat je niet weet is het begin van alle kennis, en beschermt je tegen schijnwijsheid.',
        text: p(
          'Mijn vriend Chairephon vroeg ooit aan het orakel van Delphi of er iemand wijzer was dan ik. Het antwoord was: nee. Ik schrok ervan, want ik wist dat ik niet wijs was. Dus ging ik op onderzoek uit, bij politici, dichters en ambachtslieden. Bij een vermaard politicus kwam ik tot deze slotsom: “Hij denkt iets te weten terwijl hij het niet weet; ik daarentegen weet het niet, en ik denk het ook niet te weten.” (Plato, Apologie 21d).',
          'Je hebt misschien de spreuk gehoord: ik weet dat ik niets weet. Zo heb ik het nooit gezegd; het is een vrije samenvatting van wat hierboven staat. Het verschil is belangrijk. Ik beweerde niet dat kennis onmogelijk is. Ik zei alleen dat ik niet dénk te weten wat ik niet weet. Dat is geen wanhoop, het is eerlijkheid.',
          'Wat heeft dit met ‘{onderwerp}’ te maken? Alles. De gevaarlijkste mensen zijn niet de onwetenden, maar zij die denken dat ze het al weten. Zij stellen geen vragen meer. Begin dus bij je eigen zekerheden over dit onderwerp, en vraag bij elk ervan: heb ik dit onderzocht, of heb ik het alleen vaak gehoord?',
        ),
      },
      {
        id: 'soc-blok-moed',
        heading: 'Wat is moed?',
        keywords: ['moed', 'angst', 'durven', 'bang', 'risico', 'keuze', 'spannend', 'vrees'],
        lesson:
          'Moed is niet de afwezigheid van angst, maar weten wat werkelijk te vrezen is en daarnaar handelen.',
        text: p(
          'Ik heb als soldaat gevochten, bij Potidaea en bij Delion. Daar leerde ik dat de luidste mannen niet altijd de moedigste zijn. Later vroeg ik de generaal Laches wat moed was. Hij zei: standhouden en niet vluchten. Maar wat dan met ruiters die vechten door terug te wijken? En met iemand die standhoudt uit domheid? We kwamen er samen niet uit, en dat was eerlijk.',
          'Zijn collega Nikias kwam dichterbij. Hij dacht dat moed een soort kennis is: weten wat werkelijk te vrezen is en wat niet. Dat vind ik een mooie gedachte. Wie bang is voor spot, maar niet voor het verraden van een vriend, heeft zijn angsten verkeerd geordend. Moed begint dus bij nadenken over wat er werkelijk op het spel staat.',
          'Kijk zo eens naar ‘{onderwerp}’. Waar ben je bang voor? Is dat werkelijk te vrezen, of is het vooral ongemakkelijk? En wat zou je doen als je je angsten in de goede volgorde zette? Daar zit, denk ik, de moed die jouw vraag nodig heeft.',
        ),
      },
    ],
    answers: [
      p(
        'Een goede vraag: “{vraag}” Laat me eerst teruggeven wat ik hoor, want ik wil zeker weten dat ik je begrijp. Je vraagt eigenlijk naar ‘{woord}’.',
        'Mag ik je dan iets terugvragen? Wat zou jij zelf antwoorden als ik zweeg? Ik vermoed dat het antwoord dichterbij ligt dan je denkt. Wat ik wel kan zeggen: toets je vraag aan een voorbeeld uit je eigen leven. Daar komen we in het volgende deel op terug.',
      ),
      p(
        'Ah, nu prik je precies waar het pijn doet: “{vraag}” Ik geef toe dat ik het ook niet zeker weet.',
        'Maar dit weet ik wel: als we twee dingen beweren die elkaar tegenspreken, kan er hooguit één waar zijn. Laten we dus kijken welke van onze overtuigingen hier botsen. Houd je vraag vast; ik kom erop terug.',
      ),
      p(
        'Dat is een vraag die mij ook een nacht wakker had kunnen houden: “{vraag}”',
        'Mijn eerlijke antwoord: ik weet het niet, maar ik weet wel hoe we het kunnen onderzoeken. Laten we eerst afspreken wat we bedoelen met ‘{woord}’. Wie dat overslaat, praat langs de ander heen, als twee mannen die ruziën over een paard zonder te merken dat ze elk een ander paard bedoelen.',
      ),
    ],
    conclusions: [
      p(
        'We komen bij het einde, en je verwacht nu misschien een antwoord op je vraag: “{hoofdvraag}”',
        'Ik moet eerlijk zijn: ik heb het antwoord niet in een buidel bij me. Wel weten we nu beter wat we niet weten, en dat is meer dan de meeste mensen na een middag op de agora kunnen zeggen. Mijn antwoord is daarom een richting: onderzoek je eigen zekerheden, zoek tegenspraak, en vraag bij elke keuze wat die van jou maakt. Wat ik je meegeef:',
      ),
      p(
        'Tijd om af te ronden. Je vroeg: “{hoofdvraag}”',
        'Als ik het samenvat, is mijn antwoord: zoek niet eerst het antwoord, zoek eerst de juiste vraag. Toets die aan je eigen leven, niet aan de mening van de menigte. En wees niet bang als je onderweg ontdekt dat je minder weet dan je dacht; dat is precies het moment waarop je iets gaat leren. Dit neem je mee:',
      ),
    ],
    thinkQuestions: [
      'Welke overtuiging over dit onderwerp heb je nog nooit hardop laten tegenspreken?',
      'Als je je hoofdwoord in één zin zou moeten definiëren, welk voorbeeld zou die definitie meteen onderuithalen?',
      'Wie in jouw omgeving spreekt je het vaakst tegen, en wanneer heb je die persoon daar voor het laatst om bedankt?',
    ],
  },

  timelineReactions: [
    {
      keywords: ['denk', 'vind', 'mening', 'zeker', 'overtuigd', 'altijd', 'nooit'],
      text: 'Je schrijft het met grote stelligheid. Mag een oude man iets vragen? Hoe weet je dat het zo is, en wat zou je ervan overtuigen dat het anders zit?',
    },
    {
      keywords: ['twijfel', 'twijfels', 'onzeker', 'weet niet', 'vraag', 'kiezen'],
      text: 'Twijfel is geen zwakte, mijn vriend. Het is de deur waardoor het denken binnenkomt. Wat is de vraag onder je vraag?',
    },
    {
      keywords: ['werk', 'baan', 'geld', 'carrière', 'promotie', 'collega'],
      text: 'Ik lees veel zorg om je werk. Mag ik vragen: zorg je ook zo goed voor wie je bent als voor wat je doet?',
    },
    {
      keywords: ['moed', 'bang', 'angst', 'durven', 'eng', 'spannend'],
      text: 'Laches dacht dat moed betekende: standhouden. Wat zou moed betekenen in de situatie die jij beschrijft: blijven, of juist een stap terug durven doen?',
    },
    {
      keywords: ['vriend', 'vriendschap', 'liefde', 'samen', 'relatie'],
      text: 'Een vriend is iemand met wie je kunt nadenken zonder te hoeven winnen. Bij wie kun jij hardop twijfelen?',
    },
    {
      keywords: ['politiek', 'nieuws', 'debat', 'maatschappij', 'democratie', 'sociale media'],
      text: 'Ook op de agora riep iedereen door elkaar. Ik vroeg dan: wie van jullie weet het, en wie vindt het alleen maar? Wat geldt hier voor jou?',
    },
    {
      keywords: ['goed', 'slecht', 'juist', 'fout', 'eerlijk', 'oneerlijk'],
      text: 'Je noemt dit ‘{woord}’. Een mooi woord. Maar wat bedoel je er precies mee? Daar begint alles.',
    },
    {
      keywords: ['dood', 'verlies', 'afscheid', 'rouw', 'gemis', 'overleden'],
      text: 'Wat je schrijft raakt me. Niemand weet wat de dood is, ik ook niet. Maar ik weet wel dat het goed is om te blijven spreken over wie je mist. Ik denk aan je.',
    },
    {
      keywords: ['leren', 'school', 'studie', 'onderwijs', 'les', 'tentamen'],
      text: 'Ik heb nooit iemand iets geleerd. Ik hielp alleen gedachten ter wereld te komen, zoals mijn moeder kinderen. Welke gedachte probeert er bij jou geboren te worden?',
    },
    {
      keywords: ['dankbaar', 'blij', 'geluk', 'mooi', 'genieten'],
      text: 'Wat een mooie dag beschrijf je. Weet je wat ik me dan afvraag? Wat maakte hem góéd, en niet alleen prettig?',
    },
    {
      keywords: ['moe', 'stress', 'druk', 'haast', 'rust', 'drukte'],
      text: 'Bij Potidaea bleef ik eens van de ochtend tot de volgende ochtend staan, verdiept in één vraag. Welke vraag verdient bij jou zo’n stilte, midden in de drukte?',
    },
    {
      keywords: [],
      text: 'Wat je hier schrijft, verdient een vraag in plaats van een compliment: wat zou je zeggen tegen iemand die precies het tegenovergestelde denkt?',
    },
  ],

  reflectionQuestions: [
    'Welk woord gebruikte je vandaag vaak, zonder precies te weten wat het betekent?',
    'Waar ben je deze week van mening veranderd, al was het maar een beetje?',
    'Welke overtuiging zou je eens willen laten tegenspreken door iemand die je vertrouwt?',
    'Wat zou je doen als je zeker wist dat niemand je erom zou bewonderen of afkeuren?',
    'Waar zorg je deze week vooral voor: je reputatie of je karakter?',
  ],

  thoughts: [
    'Een kleine oefening voor vandaag: als iemand iets stelligs beweert, vraag dan vriendelijk: wat bedoel je daar precies mee? Je zult versteld staan.',
    'Wie weet dat hij iets niet weet, is wijzer dan wie denkt dat hij het weet. Vandaag mag je dus gerust zeggen: ik weet het niet.',
    'Een goede vraag is als een vroedvrouw: ze maakt niets nieuws, maar helpt iets geboren worden. Welke vraag stel jij vandaag?',
    'Op de agora hoor ik veel antwoorden en weinig vragen. Maak het vandaag eens andersom.',
    'Zorg vandaag net zo goed voor je karakter als voor je kleding. Het kost minder en het staat beter.',
    'Onderzoek is geen strafwerk. Het is de manier waarop een leven de moeite waard wordt.',
    'Spreekt iemand je vandaag tegen? Bedank hem. Hij doet je een dienst die een vleier je nooit zal bewijzen.',
  ],
};
