/**
 * Demomodus: Benjamin Franklin. Hartelijk, geestig en nuchter; anekdotes uit drukkerij, Londen en
 * Parijs; vertaalt grote vragen naar kleine experimenten. Letterlijke citaten alleen uit de
 * geverifieerde lijst; al het andere in eigen woorden.
 */
import type { DemoFigureContent } from '../../types';

const p = (...parts: string[]) => parts.join('\n\n');

export const franklinDemo: DemoFigureContent = {
  figureId: 'franklin',
  sessionFragments: [
    /* ---------- Opening ---------- */
    {
      id: 'fra-open-1',
      phase: 'opening',
      text: 'Welkom{naam}! Kom binnen, en pas op voor de inkt: ik heb net een pamflet gezet. Ga zitten. Een goed gesprek is meer waard dan drie goede pamfletten. Wat brengt je hier?',
    },
    {
      id: 'fra-open-2',
      phase: 'opening',
      text: 'Ah{naam}, precies op tijd. Poor Richard zou trots zijn. Vertel eens: wat zou je graag anders zien in je leven, als het helemaal aan jou lag?',
    },
    {
      id: 'fra-open-3',
      phase: 'opening',
      text: 'Welkom{naam}. Bij je afspraak schreef je: ‘{onderwerp}’. Een praktische vraag, hoop ik? Dan zijn we samen een goed span. Vertel me hoe het er nu voor staat.',
    },
    {
      id: 'fra-open-4',
      phase: 'opening',
      text: 'Kom erbij{naam}. ‘{onderwerp}’, schreef je. Als ik me niet vergis, zit daar een probleem in dat we in kleine stukjes kunnen hakken. Waar begint het voor jou?',
    },

    /* ---------- Terugkeer ---------- */
    {
      id: 'fra-terug-1',
      phase: 'terugkeer',
      text: 'Kijk eens wie we daar hebben{naam}! De vorige keer ging het over {vorige}. Heb je het uitgeprobeerd, en heb je het bijgehouden? Ik ben benieuwd naar je aantekeningen.',
    },
    {
      id: 'fra-terug-2',
      phase: 'terugkeer',
      text: 'Welkom terug{naam}. We spraken over {vorige}. Wat werkte er, en wat niet? Een mislukt experiment leert vaak meer dan een geslaagd.',
    },

    /* ---------- Doorvragen ---------- */
    {
      id: 'fra-door-1',
      phase: 'doorvragen',
      keywords: ['gewoonte', 'gewoontes', 'discipline', 'uitstellen', 'volhouden', 'routine'],
      text: 'Je noemt ‘{woord}’. Laten we het klein maken. Wat zou je één week lang elke dag kunnen proberen, zonder dat het je meer dan tien minuten kost?',
    },
    {
      id: 'fra-door-2',
      phase: 'doorvragen',
      keywords: ['tijd', 'druk', 'agenda', 'weinig', 'moe', 'haast'],
      text: 'Mag ik je agenda eens bekijken, bij wijze van spreken? Waar gaat je tijd naartoe op een gewone dinsdag? Ik vraag het omdat verloren tijd nooit meer terugkomt.',
    },
    {
      id: 'fra-door-3',
      phase: 'doorvragen',
      keywords: ['ruzie', 'discussie', 'overtuigen', 'gelijk', 'collega', 'politiek'],
      text: 'Wat heb je al geprobeerd om de ander te overtuigen? Ik vraag het omdat ik vroeger een onuitstaanbare betweter was. Het heeft me jaren gekost om te leren hoe het beter kan.',
    },
    {
      id: 'fra-door-4',
      phase: 'doorvragen',
      keywords: ['geld', 'schuld', 'schulden', 'sparen', 'kopen', 'rekening', 'salaris'],
      text: 'Laten we nuchter zijn, zoals een goede boekhouder. Wat komt er binnen, wat gaat er uit, en welk deel van die uitgaven zou je over een jaar nog steeds een goed idee vinden?',
    },
    {
      id: 'fra-door-5',
      phase: 'doorvragen',
      text: 'Als ik het goed begrijp, en verbeter me gerust: je wilt iets veranderen, maar je weet niet goed waar je moet beginnen. Klopt dat ongeveer?',
    },

    /* ---------- Verdiepen ---------- */
    {
      id: 'fra-verdiep-1',
      phase: 'verdiepen',
      keywords: ['gewoonte', 'deugd', 'karakter', 'verbeteren', 'discipline', 'doelen'],
      text: 'Als jonge man bedacht ik een plan om moreel volmaakt te worden. Dertien deugden, elke week één, met een boekje vol kolommen en een zwart stipje voor elke misstap. Volmaakt werd ik niet, maar wel beter en gelukkiger. Welke deugd zou jij een week willen oefenen?',
    },
    {
      id: 'fra-verdiep-2',
      phase: 'verdiepen',
      keywords: ['trots', 'arrogant', 'betweter', 'gelijk', 'discussie', 'nederig'],
      text: 'Een quaker-vriend vertelde me eens vriendelijk dat ik als trots bekendstond. Dus zette ik nederigheid op mijn lijst. Veel kreeg ik er niet van, maar ik leerde wel ‘ik meen’ te zeggen in plaats van ‘zeker weten’. Dat scheelde de helft van mijn ruzies.',
    },
    {
      id: 'fra-verdiep-3',
      phase: 'verdiepen',
      keywords: ['doen', 'praten', 'plan', 'plannen', 'beloven', 'voornemen'],
      text: 'Poor Richard zei het al: “Goed gedaan is beter dan goed gezegd.” (Poor Richard’s Almanack, 1737). Je hebt een prachtig plan. Wat is het kleinste stukje ervan dat je morgen al kunt doen?',
    },
    {
      id: 'fra-verdiep-4',
      phase: 'verdiepen',
      keywords: ['tijd', 'geld', 'werk', 'uitstellen', 'productief', 'verspillen'],
      text: 'Aan een jonge handelaar schreef ik ooit: “Bedenk dat tijd geld is.” (Advice to a Young Tradesman, 1748). Ik bedoelde niet dat je elk uur moet verkopen. Ik bedoelde: tijd is kostbaar, dus geef haar bewust uit. Waar verkwist jij de jouwe?',
    },
    {
      id: 'fra-verdiep-5',
      phase: 'verdiepen',
      keywords: ['slapen', 'slaap', 'moe', 'ochtend', 'gezond', 'nacht'],
      text: '“Vroeg naar bed en vroeg weer op maakt een mens gezond, rijk en wijs.” (Poor Richard’s Almanack, 1735). Ik moet bekennen dat ik me er in Parijs niet altijd aan hield. Maar slaap is de goedkoopste investering die er bestaat. Hoe slaap jij?',
    },
    {
      id: 'fra-verdiep-6',
      phase: 'verdiepen',
      keywords: ['vrijheid', 'veiligheid', 'privacy', 'overheid', 'controle', 'regels'],
      text: 'In een antwoord van de Pennsylvania Assembly schreven we: “Wie wezenlijke vrijheid opgeeft om een beetje tijdelijke veiligheid te kopen, verdient vrijheid noch veiligheid.” (1755). Het ging toen over een belastingconflict met de gouverneur, niet over alles. Maar de vraag blijft goed: wat lever jij in, en wat krijg je ervoor terug?',
    },
    {
      id: 'fra-verdiep-7',
      phase: 'verdiepen',
      keywords: ['samen', 'vrienden', 'club', 'netwerk', 'buurt', 'gemeenschap', 'eenzaam'],
      text: 'In Philadelphia begon ik met een paar vrienden de Junto: elke vrijdagavond bespraken we vragen over moraal, politiek en natuurkunde, en hoe we elkaar en de stad konden helpen. Daaruit kwamen een bibliotheek en een brandweer voort. Met wie zou jij zo’n kringetje kunnen beginnen?',
    },
    {
      id: 'fra-verdiep-8',
      phase: 'verdiepen',
      keywords: ['nieuwsgierig', 'leren', 'experiment', 'wetenschap', 'uitvinden', 'ontdekken'],
      text: 'Ik heb nooit kunnen ophouden met prutsen: aan bliksem, kachels, brillen. Niet omdat ik een geleerde was, maar omdat ik nieuwsgierig bleef. Wat zou jij willen uitproberen, al was het maar uit nieuwsgierigheid?',
    },
    {
      id: 'fra-verdiep-9',
      phase: 'verdiepen',
      keywords: ['slavernij', 'racisme', 'schaduwkant', 'tot slaaf', 'discriminatie'],
      text: 'Je vraagt naar mijn schaduwkanten, en terecht. Ik heb mensen in slavernij gehouden en in mijn krant advertenties voor de verkoop van mensen afgedrukt. Pas laat in mijn leven werd ik voorzitter van een vereniging voor de afschaffing van de slavernij. Te laat, en dat hoort eerlijk gezegd te worden.',
    },

    /* ---------- Afronden ---------- */
    {
      id: 'fra-afrond-1',
      phase: 'afronden',
      text: 'De klok tikt door, en Poor Richard kijkt over mijn schouder mee. Laten we afspreken: één klein experiment, één week, en je houdt het bij op een velletje papier. Welk experiment wordt het?',
    },
    {
      id: 'fra-afrond-2',
      phase: 'afronden',
      text: 'We moeten afronden. Mijn advies in één zin, voor wat het waard is: maak het klein, maak het meetbaar, en vergeef jezelf de zwarte stipjes. Daar is het boekje voor.',
    },

    /* ---------- Slot ---------- */
    {
      id: 'fra-slot-1',
      phase: 'slot',
      text: 'Een laatste woord, want de drukpers wacht: goed gedaan is beter dan goed gezegd. Ga dus maar gauw iets doen.',
    },
    {
      id: 'fra-slot-2',
      phase: 'slot',
      text: 'Nog één ding voor je gaat. In deze wereld is weinig zeker. Maar dat je morgen een tikje beter kunt zijn dan vandaag, daar durf ik bijna op te wedden.',
    },
  ],

  lecture: {
    openings: [
      p(
        'Welkom in de drukkerij, die vandaag dienstdoet als collegezaal. Je vroeg mij om een college over ‘{onderwerp}’, met als vraag: “{hoofdvraag}”',
        'Ik ben geen professor. Ik ben drukker, schrijver, uitvinder en, als het moest, diplomaat. Ik ging maar een jaar of twee naar school; de rest leerde ik uit geleende boeken en uit mijn eigen fouten. Je krijgt dus geen verheven theorie van me, maar dingen die in de praktijk werkten, of juist niet.',
        'We gaan in drie stukken. Na elk stuk mag je me onderbreken met een vraag. Graag zelfs: de beste ideeën in mijn leven kwamen uit gesprekken waarin iemand zei: Ben, daar klopt iets niet.',
      ),
      p(
        'Kom binnen en ga zitten waar de inkt droog is. Het onderwerp van vandaag: ‘{onderwerp}’. De vraag: “{hoofdvraag}”',
        'Mijn methode is eenvoudig: een groot probleem hak je in kleine stukken, en elk stuk probeer je uit. Wat werkt, houd je. Wat niet werkt, schrap je zonder schaamte. Zo heb ik aan mijn karakter gewerkt, mijn drukkerij laten groeien en, als ik me niet vergis, de bliksem een beetje getemd.',
        'Laten we kijken of die methode ook voor jouw vraag werkt.',
      ),
    ],
    blocks: [
      {
        id: 'fra-blok-deugden',
        heading: 'Dertien deugden en een boekje met kolommen',
        keywords: [
          'gewoonte',
          'gewoontes',
          'deugd',
          'karakter',
          'discipline',
          'verbeteren',
          'zelfverbetering',
          'doelen',
          'voornemens',
          'routine',
        ],
        lesson: 'Verander niet alles tegelijk: oefen één ding per keer en houd bij hoe het gaat.',
        text: p(
          'Toen ik een jonge man was, besloot ik moreel volmaakt te worden. Een vermetel plan, dat geef ik toe. Ik maakte een lijst van dertien deugden: matigheid, stilte, orde, vastberadenheid, zuinigheid, vlijt, oprechtheid, rechtvaardigheid, gematigdheid, reinheid, kalmte, kuisheid en nederigheid. Elke deugd kreeg een korte regel, zodat ik wist wat ik ermee bedoelde.',
          'Toen ontdekte ik wat iedere tuinman weet: je kunt niet alle bedden tegelijk wieden. Dus gaf ik elke week aandacht aan één deugd. In een boekje tekende ik kolommen voor de dagen en regels voor de deugden, en zette ik een zwart stipje bij elke misstap. Het boekje raakte vol stipjes, en ik raakte vol bescheidenheid.',
          'Volmaakt werd ik nooit. Ik dacht aan de man die zijn bijl helemaal blank wilde laten slijpen, het halverwege zat werd en zei: eigenlijk vind ik een gevlekte bijl het mooist. Toch werd ik er beter en gelukkiger van. Probeer het eens met ‘{onderwerp}’: welke ene gewoonte zou je een week lang kunnen oefenen, en hoe houd je bij of het lukt?',
        ),
      },
      {
        id: 'fra-blok-tijd',
        heading: 'Tijd is geld, en meer dan dat',
        keywords: [
          'tijd',
          'geld',
          'productiviteit',
          'werk',
          'uitstellen',
          'agenda',
          'planning',
          'sparen',
          'schuld',
          'efficiëntie',
        ],
        lesson: 'Geef tijd en geld bewust uit; wat je niet bijhoudt, glipt tussen je vingers door.',
        text: p(
          'Aan een jonge handelaar schreef ik ooit: “Bedenk dat tijd geld is.” (Advice to a Young Tradesman, 1748). Die zin wordt vaak zo gelezen dat je elk uur moet verkopen. Zo bedoelde ik het niet. Ik bedoelde dat elk uur dat je verlummelt, je iets kost, ook als je er geen munt voor neerlegt.',
          'Daarom had ik een dagindeling. Ik stond vroeg op en vroeg mezelf elke ochtend, in eigen woorden: welk goed zal ik vandaag doen? ’s Avonds vroeg ik: welk goed heb ik gedaan? Daartussen: werk, maaltijden, lezen, gesprekken. Orde was overigens de deugd waarin ik het slechtst was. Mijn papieren lagen overal.',
          'Met geld deed ik hetzelfde. Wie meer uitgeeft dan hij verdient, werkt voor een ander, namelijk voor wie hem geld leende. Kijk zo naar ‘{onderwerp}’. Schrijf een week lang op waar je tijd en geld naartoe gaan, zonder te oordelen. Pas daarna beslis je wat je anders wilt. Je zult versteld staan.',
        ),
      },
      {
        id: 'fra-blok-overtuigen',
        heading: 'Overtuigen zonder te willen winnen',
        keywords: [
          'overtuigen',
          'discussie',
          'ruzie',
          'samenwerken',
          'polarisatie',
          'debat',
          'politiek',
          'communicatie',
          'conflict',
          'collega',
        ],
        lesson:
          'Vraag eerst, beweer later: wie bescheiden formuleert, overtuigt meer en maakt minder vijanden.',
        text: p(
          'Als jongen was ik een ruziezoeker. Ik won elke discussie en verloor elke vriend. Toen las ik bij Xenophon over Socrates, die nooit iets beweerde maar alleen vragen stelde. Ik deed hem na. Ik schrapte woorden als ‘zeker’ en ‘ongetwijfeld’ en zei voortaan ‘ik meen’ of ‘het lijkt me op dit moment’. Mijn ruzies werden korter en mijn vrienden talrijker.',
          'Een andere les leerde ik in de wetgevende vergadering. Een nieuw lid was fel tegen mij. In plaats van hem te bestrijden, vroeg ik of ik een zeldzaam boek van hem mocht lenen. Hij leende het me, ik gaf het met een vriendelijk briefje terug, en voortaan was hij beleefd en behulpzaam. We werden vrienden voor het leven. Wie je een gunst heeft bewezen, wil je vaak nog een tweede bewijzen.',
          'Pas dit toe op ‘{onderwerp}’. Met wie ben je het oneens? Wat zou er gebeuren als je die persoon eerst een oprechte vraag stelde, of om raad vroeg? Ik zeg niet dat je je mening moet inslikken. Ik zeg dat een mening beter aankomt als de ander zich gehoord voelt.',
        ),
      },
      {
        id: 'fra-blok-junto',
        heading: 'Samen meer dan alleen: de Junto',
        keywords: [
          'samen',
          'samenleving',
          'gemeenschap',
          'vrienden',
          'netwerk',
          'buurt',
          'vrijwilligers',
          'burgerzin',
          'club',
          'eenzaamheid',
        ],
        lesson:
          'Begin een kleine kring van mensen die elkaar willen helpen; uit zulke kringen groeien grote dingen.',
        text: p(
          'In 1727 begon ik in Philadelphia een club met een paar ambachtslieden en jonge handelaren: de Junto. Elke vrijdagavond kwamen we samen. Iedereen bracht vragen mee over moraal, politiek of natuurkunde, en we bespraken die zonder te willen winnen. Wie te stellig werd, kreeg een kleine boete.',
          'Uit die avonden groeide meer dan ik had durven dromen. Omdat we onze boeken deelden, ontstond een uitleenbibliotheek. Omdat we ons zorgen maakten over branden, kwam er een vrijwillige brandweer. Later volgden een ziekenhuis en een academie. Voor het ziekenhuis bedachten we een slimme regel: de overheid gaf pas geld als de burgers zelf ook een bedrag bijeen hadden gebracht.',
          'Kijk zo naar ‘{onderwerp}’. Met wie zou je samen verder komen dan alleen? Je hoeft geen vereniging op te richten. Drie mensen, één avond per maand en een goede vraag zijn genoeg om te beginnen. De rest komt, als ik me niet vergis, vanzelf.',
        ),
      },
      {
        id: 'fra-blok-nieuwsgierig',
        heading: 'Nieuwsgierigheid als levenshouding',
        keywords: [
          'nieuwsgierig',
          'leren',
          'experiment',
          'wetenschap',
          'uitvinden',
          'ontdekken',
          'innovatie',
          'technologie',
          'school',
          'ouder worden',
        ],
        lesson:
          'Blijf nieuwsgierig en probeer dingen uit; een mislukt experiment is ook een resultaat.',
        text: p(
          'Ik heb mijn hele leven geprutst. Aan een kachel die meer warmte gaf en minder rook. Aan een bril met twee soorten glas, zodat ik zowel mijn bord als mijn gasten kon zien. Aan een staaf op het dak die de bliksem veilig naar de grond leidde. Voor geen van die uitvindingen vroeg ik octrooi aan. Wij profiteren zo veel van de uitvindingen van anderen; dan mogen we de onze ook graag delen.',
          'Hoe ik dat deed? Door vragen te stellen en ze klein te maken. Is bliksem hetzelfde als de elektriciteit die we in een fles opslaan? Dat kun je testen. Werkt een idee niet, dan heb je toch iets geleerd: hoe het niet moet. Een mislukt experiment is geen schande. Een experiment dat je nooit durft te doen, dat is pas zonde.',
          'Wat betekent dit voor ‘{onderwerp}’? Misschien dat je niet meteen het hele antwoord hoeft te weten. Bedenk één kleine proef. Wat zou je kunnen uitproberen, welke uitkomst verwacht je, en wanneer kijk je of het klopte? Zo werd een drukker met twee jaar school toch nog een beetje geleerd.',
        ),
      },
      {
        id: 'fra-blok-vrijheid',
        heading: 'Vrijheid en veiligheid',
        keywords: [
          'vrijheid',
          'veiligheid',
          'privacy',
          'overheid',
          'democratie',
          'grondwet',
          'rechten',
          'controle',
          'surveillance',
          'politiek',
        ],
        lesson:
          'Weeg vrijheid en veiligheid bewust tegen elkaar af; wie te snel vrijheid inruilt, houdt vaak geen van beide over.',
        text: p(
          'In 1755 schreven wij, namens de Pennsylvania Assembly, aan de gouverneur: “Wie wezenlijke vrijheid opgeeft om een beetje tijdelijke veiligheid te kopen, verdient vrijheid noch veiligheid.” Het ging om een concreet conflict: de eigenaars van de kolonie wilden niet dat hun eigen land werd belast om de grens te verdedigen. De zin wordt vaak breder gebruikt dan we toen bedoelden, maar de kern blijft overeind.',
          'Toen we in 1787 de grondwet schreven, was ik de oudste in de zaal. Ik zei de afgevaardigden, in eigen woorden, dat ik hoe ouder ik werd, des te meer geneigd was aan mijn eigen oordeel te twijfelen. Ik steunde het ontwerp met al zijn gebreken, omdat ik niet verwachtte dat we iets beters zouden maken. Een dame vroeg me na afloop, zo wordt verteld, wat we haar hadden gegeven. Een republiek, zei ik, als jullie haar kunnen behouden.',
          'Kijk zo naar ‘{onderwerp}’. Welke vrijheid staat hier op het spel, en welke veiligheid wordt je beloofd? Zijn ze echt elkaars tegenpolen, of is er een manier om beide te bewaren? Die vraag stellen is al een vorm van burgerzin.',
        ),
      },
    ],
    answers: [
      p(
        'Goede vraag: “{vraag}” Als ik me niet vergis, zit daar een praktisch probleem in.',
        'Mijn voorstel: probeer het een week op de kleinst mogelijke schaal, en schrijf elke avond op wat er gebeurde met ‘{woord}’. Na een week weet je meer dan na een maand piekeren. In het volgende stuk vertel ik hoe ik dat zelf aanpakte.',
      ),
      p(
        '“{vraag}” Ha, daar heb je me. Ik moet bekennen dat ik daar zelf ook mee heb geworsteld.',
        'In Londen, in Parijs en in mijn eigen drukkerij leerde ik dat het antwoord zelden in één grote beslissing zit. Het zit in honderd kleine. Laten we kijken welke kleine beslissing je morgen kunt nemen.',
      ),
      p(
        'Je vraagt: “{vraag}” Mag ik eerst een wedervraag stellen, zoals mijn oude voorbeeld Socrates zou doen?',
        'Wat heb je al geprobeerd, en wat gebeurde er? Ik vraag het niet om je te plagen. Een goed experiment begint bij de gegevens die je al hebt.',
      ),
    ],
    conclusions: [
      p(
        'We komen bij het einde. Je vroeg: “{hoofdvraag}”',
        'Mijn antwoord, zonder omhaal: begin klein, houd bij wat je doet en verbeter het stap voor stap. Zoek een paar mensen die met je meedenken. En lach om je eigen zwakheden; dat maakt het volhouden een stuk lichter. Wat je meeneemt:',
      ),
      p(
        'Daar luidt de klok. Je vroeg: “{hoofdvraag}”',
        'Als ik het in een spreuk van Poor Richard moest gieten, zou die ongeveer zo luiden: wie wacht op het volmaakte plan, wacht een leven lang. Dus: een eerste stap, een velletje papier en een week geduld. Samengevat:',
      ),
    ],
    thinkQuestions: [
      'Welk klein experiment kun je deze week doen, en hoe houd je bij of het werkt?',
      'Welke deugd zou je een week lang willen oefenen, en waaraan merk je dat het lukt?',
      'Met wie zou je een kleine kring kunnen beginnen om samen beter te worden?',
    ],
  },

  timelineReactions: [
    {
      keywords: ['gewoonte', 'discipline', 'volhouden', 'routine', 'doel'],
      text: 'Een man naar mijn hart! Tip van een oude drukker: houd het bij op papier. Een zwart stipje per misstap, en wees er mild voor.',
    },
    {
      keywords: ['uitstellen', 'later', 'morgen', 'luiheid', 'lui'],
      text: 'Poor Richard zou zeggen: verloren tijd vind je nooit meer terug. Wat is het allerkleinste stukje dat je nu kunt doen?',
    },
    {
      keywords: ['slapen', 'moe', 'nacht', 'ochtend', 'wakker'],
      text: 'Vroeg naar bed en vroeg weer op… ik geef toe, in Parijs hield ik me er niet altijd aan. Maar het werkt wel.',
    },
    {
      keywords: ['geld', 'sparen', 'schuld', 'kopen', 'rekening'],
      text: 'Wie meer uitgeeft dan hij verdient, werkt voor een ander. Een nuchter overzicht is het halve werk.',
    },
    {
      keywords: ['ruzie', 'discussie', 'gelijk', 'overtuigen', 'politiek'],
      text: 'Ik leerde laat dat ‘ik meen’ beter werkt dan ‘zeker weten’. Probeer het eens; je ruzies worden de helft korter.',
    },
    {
      keywords: ['idee', 'uitvinding', 'experiment', 'nieuwsgierig', 'leren'],
      text: 'Prachtig! Probeer het uit en schrijf op wat er gebeurt. Een mislukt experiment is ook een resultaat.',
    },
    {
      keywords: ['samen', 'buurt', 'vrienden', 'club', 'vrijwilliger'],
      text: 'Uit mijn vrijdagavondclubje kwamen een bibliotheek en een brandweer voort. Wie weet wat er uit het jouwe groeit!',
    },
    {
      keywords: ['belasting', 'belastingen', 'zeker', 'onzeker', 'toekomst'],
      text: 'In deze wereld is niets zeker, behalve de dood en de belastingen. Al het andere is gelukkig nog te beïnvloeden.',
    },
    {
      keywords: ['werk', 'baan', 'vak', 'ondernemen', 'zaak', 'stage'],
      text: 'Ik begon als leerjongen in de drukkerij van mijn broer. Elk vak is een leerschool, als je er met open ogen in staat.',
    },
    {
      keywords: ['trots', 'nederig', 'arrogant', 'bescheiden'],
      text: 'Nederigheid stond als laatste op mijn lijst. Ik kreeg er niet veel van, maar het schijnt al te helpen dat je het probeert.',
    },
    {
      keywords: ['vrijheid', 'veiligheid', 'privacy', 'regels'],
      text: 'Vrijheid en veiligheid: weeg ze zorgvuldig. Wie de een te goedkoop ruilt voor de ander, houdt vaak geen van beide over.',
    },
    {
      keywords: [],
      text: 'Goed gezegd! Nu nog goed gedaan; dat is altijd het lastigste deel.',
    },
  ],

  reflectionQuestions: [
    'Welk klein experiment ga je deze week doen?',
    'Welke deugd zou je een week lang willen oefenen?',
    'Waar ging vandaag tijd verloren die je liever anders had besteed?',
    'Welk goed heb je vandaag gedaan?',
    'Met wie zou je samen beter kunnen worden?',
  ],

  thoughts: [
    'Vraag jezelf vanochtend: welk goed ga ik vandaag doen? En vanavond: welk goed heb ik gedaan?',
    'Goed gedaan is beter dan goed gezegd. Kies vandaag één ding om te doen in plaats van te bespreken.',
    'Verander niet alles tegelijk. Eén deugd per week is al een hele verbouwing.',
    'Een gevlekte bijl hakt ook hout. Volmaaktheid is geen voorwaarde om te beginnen.',
    'Zeg vandaag eens ‘ik meen’ in plaats van ‘zeker weten’. Let op wat er gebeurt.',
    'Verloren tijd vind je nooit meer terug. Gevonden tijd wel: kijk eens wat je kunt laten.',
    'Leen eens een boek van iemand met wie je het oneens bent. Bij mij werkte het wonderwel.',
  ],
};
