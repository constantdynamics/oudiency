/**
 * Demomodus: Baruch de Spinoza. Rustig, helder en vriendelijk; redeneert stap voor stap, vraagt
 * naar oorzaken in plaats van schuld en helpt affecten te begrijpen. Letterlijke citaten alleen
 * uit de geverifieerde lijst; al het andere in eigen woorden.
 */
import type { DemoFigureContent } from '../../types';

const p = (...parts: string[]) => parts.join('\n\n');

export const spinozaDemo: DemoFigureContent = {
  figureId: 'spinoza',
  sessionFragments: [
    /* ---------- Opening ---------- */
    {
      id: 'spi-open-1',
      phase: 'opening',
      text: 'Welkom{naam}. Ga zitten bij het raam; daar is het licht het mooist. Excuses voor het glasstof, ik was een lens aan het slijpen. Wat zou je graag beter willen begrijpen?',
    },
    {
      id: 'spi-open-2',
      phase: 'opening',
      text: 'Kom binnen{naam}. Ik heb geen haast, en jij hoeft die ook niet te hebben. Vertel me rustig wat je bezighoudt.',
    },
    {
      id: 'spi-open-3',
      phase: 'opening',
      text: 'Welkom{naam}. Bij je afspraak schreef je: ‘{onderwerp}’. Laten we het behandelen zoals ik een lens behandel: eerst kijken wat het is, dan langzaam scherpstellen. Wat speelt er precies?',
    },
    {
      id: 'spi-open-4',
      phase: 'opening',
      text: 'Goed dat je er bent{naam}. ‘{onderwerp}’, schreef je. Voordat we oordelen, wil ik het begrijpen. Kun je beschrijven wat er gebeurt, alsof je een natuurverschijnsel beschrijft?',
    },

    /* ---------- Terugkeer ---------- */
    {
      id: 'spi-terug-1',
      phase: 'terugkeer',
      text: 'Welkom terug{naam}. De vorige keer spraken we over {vorige}. Is het beeld sindsdien wat scherper geworden?',
    },
    {
      id: 'spi-terug-2',
      phase: 'terugkeer',
      text: 'Daar ben je weer{naam}. We spraken over {vorige}. Wat begrijp je nu beter dan toen? En wat nog niet?',
    },

    /* ---------- Doorvragen ---------- */
    {
      id: 'spi-door-1',
      phase: 'doorvragen',
      keywords: ['boos', 'woede', 'kwaad', 'irritatie', 'ergernis', 'geïrriteerd'],
      text: 'Je voelt ‘{woord}’. Dat mag er zijn; het is een natuurlijk verschijnsel, zoals regen. Maar laten we de oorzaken zoeken. Wat ging eraan vooraf, en welk idee had je op dat moment over de ander?',
    },
    {
      id: 'spi-door-2',
      phase: 'doorvragen',
      keywords: ['bang', 'angst', 'zorgen', 'onrust', 'paniek', 'onzeker'],
      text: 'Angst is volgens mij een onbestendige droefheid over iets wat nog komen moet en waarvan we de afloop niet kennen. Wat verwacht je precies dat er gaat gebeuren? En hoe zeker ben je daarvan?',
    },
    {
      id: 'spi-door-3',
      phase: 'doorvragen',
      keywords: ['jaloers', 'jaloezie', 'afgunst', 'vergelijken', 'vergelijk'],
      text: 'Jaloezie ontstaat vaak doordat we onze vreugde afhankelijk maken van een ander. Wat zie je in die ander dat je bij jezelf meent te missen?',
    },
    {
      id: 'spi-door-4',
      phase: 'doorvragen',
      keywords: ['schuld', 'schuldig', 'fout', 'spijt', 'had moeten', 'verwijt'],
      text: 'Je spreekt over schuld. Mag ik die even opzijzetten? Ik vraag liever naar oorzaken dan naar schuld. Welke omstandigheden maakten dat het zo liep?',
    },
    {
      id: 'spi-door-5',
      phase: 'doorvragen',
      text: 'Laat me het stap voor stap bekijken, zoals ik dat graag doe. Als ik je goed begrijp, voel je iets wat je nog niet goed kunt plaatsen, en daardoor heeft het meer macht over je dan je wilt. Klopt dat?',
    },

    /* ---------- Verdiepen ---------- */
    {
      id: 'spi-verdiep-1',
      phase: 'verdiepen',
      keywords: ['emotie', 'gevoel', 'verdriet', 'pijn', 'lijden', 'overweldigd'],
      text: 'In mijn Ethica schreef ik: “Een affect dat een lijden is, houdt op een lijden te zijn zodra we er een helder en duidelijk idee van vormen.” (Ethica V, stelling 3). Het gevoel verdwijnt niet altijd. Maar het verandert van een storm in een landschap dat je kunt overzien. Wat zou je nodig hebben om dit gevoel helder te zien?',
    },
    {
      id: 'spi-verdiep-2',
      phase: 'verdiepen',
      keywords: ['oordeel', 'veroordelen', 'mensen', 'politiek', 'nieuws', 'ergernis'],
      text: 'Mijn voornemen was altijd: “Niet lachen, niet betreuren, niet verafschuwen, maar begrijpen.” (Tractatus politicus I.4). Dat geldt ook voor mensen die je ergeren. Wat zou je zien als je hen probeerde te begrijpen in plaats van te veroordelen?',
    },
    {
      id: 'spi-verdiep-3',
      phase: 'verdiepen',
      keywords: ['dood', 'sterven', 'ouder', 'ziek', 'verlies', 'eindig'],
      text: '“Een vrij mens denkt aan niets minder dan aan de dood, en zijn wijsheid is een overdenking niet van de dood, maar van het leven.” (Ethica IV, stelling 67). Ik bedoel niet dat je de dood moet negeren. Ik bedoel dat je kracht zit in het leven dat je nu hebt. Waaraan wil je die besteden?',
    },
    {
      id: 'spi-verdiep-4',
      phase: 'verdiepen',
      keywords: ['moeilijk', 'opgeven', 'zwaar', 'doorzetten', 'lukt niet', 'perfect'],
      text: 'Mijn Ethica eindigt met deze zin: “Alles wat voortreffelijk is, is even moeilijk als zeldzaam.” (Ethica V, stelling 42, toelichting). Dat het moeilijk is, betekent dus niet dat je verkeerd bezig bent. Misschien juist het tegendeel.',
    },
    {
      id: 'spi-verdiep-5',
      phase: 'verdiepen',
      keywords: ['vrijheid', 'meningsuiting', 'censuur', 'staat', 'democratie', 'tolerantie'],
      text: 'In mijn Tractatus theologico-politicus schreef ik: “Het doel van de staat is in werkelijkheid de vrijheid.” (hoofdstuk 20). Ik publiceerde het boek anoniem, want vrij denken was in mijn tijd niet zonder gevaar. Hoe vrij voel jij je om te zeggen wat je denkt?',
    },
    {
      id: 'spi-verdiep-6',
      phase: 'verdiepen',
      keywords: ['doorgaan', 'energie', 'kracht', 'motivatie', 'zin', 'leven'],
      text: '“Elk ding streeft ernaar, voor zover het in zich is, in zijn bestaan te volharden.” (Ethica III, stelling 6). Dat streven noem ik conatus. Het is geen zonde, het is je natuur. Wat versterkt jouw vermogen om te leven en te handelen, en wat verzwakt het?',
    },
    {
      id: 'spi-verdiep-7',
      phase: 'verdiepen',
      keywords: ['god', 'geloof', 'religie', 'natuur', 'kerk', 'spiritueel'],
      text: 'Voor mij zijn God en de Natuur één: Deus sive Natura. Geen koning in de hemel die beloont en straft, maar de oneindige samenhang van alles wat is. Om zulke gedachten werd ik uit mijn gemeenschap verbannen. Wat betekent het woord ‘God’ voor jou, als je het eerlijk bekijkt?',
    },
    {
      id: 'spi-verdiep-8',
      phase: 'verdiepen',
      keywords: ['blij', 'vreugde', 'geluk', 'droefheid', 'somber', 'verlangen'],
      text: 'Ik onderscheid drie basisgevoelens: vreugde, droefheid en verlangen. Vreugde is wat je vermogen om te handelen vergroot, droefheid wat het verkleint. Wat in jouw leven maakt je groter, en wat maakt je kleiner?',
    },
    {
      id: 'spi-verdiep-9',
      phase: 'verdiepen',
      keywords: ['eenzaam', 'alleen', 'uitgesloten', 'buitengesloten', 'anders'],
      text: 'Ik weet hoe het is om buitengesloten te worden. Toen ik drieëntwintig was, sprak mijn gemeenschap de ban over me uit. Ik verloor familie en vrienden. Maar ik vond nieuwe vrienden, die mijn gedachten deelden. Bij wie kun jij jezelf zijn?',
    },

    /* ---------- Afronden ---------- */
    {
      id: 'spi-afrond-1',
      phase: 'afronden',
      text: 'Het licht verandert al. Laten we samenvatten, stap voor stap: wat voel je, wat zijn de oorzaken, en welk idee zou je kunnen bijstellen? Als je die drie helder hebt, ben je al vrijer dan toen je binnenkwam.',
    },
    {
      id: 'spi-afrond-2',
      phase: 'afronden',
      text: 'We moeten afronden. Neem dit mee: je hoeft je gevoelens niet te bestrijden. Je hoeft ze alleen te begrijpen. Begrijpen is al een vorm van vrijheid.',
    },

    /* ---------- Slot ---------- */
    {
      id: 'spi-slot-1',
      phase: 'slot',
      text: 'Een laatste woord, en dan moet ik door: caute, wees voorzichtig. Niet angstig, maar zorgvuldig. Zorgvuldig met je gedachten, en zacht voor jezelf.',
    },
    {
      id: 'spi-slot-2',
      phase: 'slot',
      text: 'Nog één gedachte voor je gaat: wat je vandaag begreep, neemt niemand je meer af. Dat is het mooie van inzicht.',
    },
  ],

  lecture: {
    openings: [
      p(
        'Welkom in mijn kamer aan de Paviljoensgracht, die vandaag een collegezaal is. Je vroeg mij om een college over ‘{onderwerp}’, met de vraag: “{hoofdvraag}”',
        'Ik heb nooit een leerstoel bekleed. Toen de universiteit van Heidelberg me er een aanbood, heb ik beleefd bedankt; ik wilde mijn vrijheid van denken niet inruilen voor een salaris. Ik slijp lenzen voor mijn brood en ik denk voor mijn vreugde. Vandaag doe ik het tweede, voor jou.',
        'Ik ga te werk zoals in mijn Ethica: stap voor stap, van het eenvoudige naar het samengestelde. Geen haast. Een lens die je te snel slijpt, wordt nooit helder.',
      ),
      p(
        'Kom binnen, en let niet op het glasstof. Ons onderwerp is ‘{onderwerp}’, en je vraag luidt: “{hoofdvraag}”',
        'Mijn uitgangspunt is eenvoudig: alles heeft een oorzaak, ook wat we voelen en doen. Dat klinkt misschien kil, maar het is eigenlijk bevrijdend. Wat je begrijpt, beheerst jou niet meer.',
        'We gaan in drie stappen. Na elke stap mag je me een vraag stellen. Ik zal proberen haar te beantwoorden zoals ik een stelling bewijs: rustig, en met de vraag waarom.',
      ),
    ],
    blocks: [
      {
        id: 'spi-blok-affecten',
        heading: 'Gevoelens begrijpen in plaats van onderdrukken',
        keywords: [
          'emotie',
          'emoties',
          'gevoel',
          'gevoelens',
          'boosheid',
          'verdriet',
          'angst',
          'onderdrukken',
          'mentale gezondheid',
          'stress',
        ],
        lesson:
          'Een gevoel verliest zijn greep zodra je het helder begrijpt: zoek de oorzaken in plaats van ertegen te vechten.',
        text: p(
          'De meeste denkers voor mij behandelden gevoelens als fouten: zwakheden die je moet bestrijden of uitlachen. Ik koos een andere weg. In mijn Ethica bekeek ik menselijke handelingen en verlangens, in eigen woorden, alsof het ging om lijnen, vlakken en lichamen. Niet omdat mensen meetkundige figuren zijn, maar omdat ook gevoelens oorzaken hebben, die je kunt onderzoeken.',
          'Daaruit volgt iets bemoedigends: “Een affect dat een lijden is, houdt op een lijden te zijn zodra we er een helder en duidelijk idee van vormen.” (Ethica V, stelling 3). Zolang je niet begrijpt waarom je boos of bang bent, word je erdoor meegesleurd. Begrijp je de oorzaken, dan verandert er iets. Het gevoel wordt iets wat je hebt, in plaats van iets wat jou heeft.',
          'Pas dit eens toe op ‘{onderwerp}’. Welk gevoel speelt hier de hoofdrol? Probeer het te benoemen zonder oordeel. Vraag dan: wat ging eraan vooraf, welk idee heb ik over de situatie, en klopt dat idee? Onderdrukken maakt een gevoel vaak sterker. Begrijpen maakt het lichter.',
        ),
      },
      {
        id: 'spi-blok-oorzaken',
        heading: 'Oorzaken, geen schuld',
        keywords: [
          'schuld',
          'oordeel',
          'verwijt',
          'ruzie',
          'conflict',
          'begrip',
          'vergeving',
          'haat',
          'politiek',
          'mensen',
        ],
        lesson: 'Vraag naar oorzaken in plaats van schuld; begrijpen maakt milder en vrijer.',
        text: p(
          'Toen ik over de politiek schreef, nam ik me iets voor: “Niet lachen, niet betreuren, niet verafschuwen, maar begrijpen.” (Tractatus politicus I.4). Ik wilde de mensen nemen zoals ze zijn, met hun hartstochten, en niet zoals ik ze graag zou zien. Wie mensen veroordeelt omdat ze niet zijn zoals hij wil, begrijpt ze nooit.',
          'Dat lijkt toegeeflijk, maar het is het tegendeel. Wie de oorzaken van gedrag begrijpt, kan er ook iets aan doen. Wie alleen schuld uitdeelt, blijft hangen in boosheid. En haat die met haat wordt beantwoord, groeit. Ze kan, schreef ik in eigen woorden, worden overwonnen door liefde en edelmoedigheid. Dat is geen zwakte, maar inzicht.',
          'Kijk zo naar ‘{onderwerp}’. Wie wordt hier beschuldigd, door jou of door anderen? Wat zou je zien als je naar de oorzaken keek: de omstandigheden, de angsten, de ideeën die mensen ertoe brachten? Je hoeft niets goed te praten. Maar begrijpen geeft je meer ruimte om te handelen dan verwijten.',
        ),
      },
      {
        id: 'spi-blok-conatus',
        heading: 'Conatus: het streven om te bestaan',
        keywords: [
          'motivatie',
          'energie',
          'zin',
          'doorzetten',
          'kracht',
          'zelfzorg',
          'gezondheid',
          'burn-out',
          'levenslust',
          'werk',
        ],
        lesson:
          'Wat je vermogen om te leven en te handelen vergroot, is goed voor je; zoek dat bewust op.',
        text: p(
          'Een van de grondstellingen van mijn Ethica luidt: “Elk ding streeft ernaar, voor zover het in zich is, in zijn bestaan te volharden.” (Ethica III, stelling 6). Dat streven noem ik conatus. Een steen, een plant, een mens: alles wil blijven bestaan en zich ontplooien. Bij ons mensen heet dat streven, als we het ons bewust zijn, verlangen.',
          'Daaruit volgen mijn drie basisgevoelens. Vreugde is de overgang naar een groter vermogen om te handelen. Droefheid is de overgang naar een kleiner vermogen. Verlangen is het streven zelf. Goed noem ik wat ons werkelijk helpt te bestaan en te handelen, slecht wat ons daarin hindert. Geen geboden van bovenaf dus, maar een nuchtere vraag: wat maakt mij sterker, en wat zwakker?',
          'Kijk zo naar ‘{onderwerp}’. Wat vergroot hier je vermogen om te leven, en wat verkleint het? Let op: niet alles wat aangenaam voelt, maakt je sterker, en niet alles wat moeite kost, maakt je zwakker. Het gaat om wat je op den duur meer jezelf maakt.',
        ),
      },
      {
        id: 'spi-blok-natuur',
        heading: 'God oftewel de Natuur',
        keywords: [
          'god',
          'geloof',
          'religie',
          'natuur',
          'zingeving',
          'spiritualiteit',
          'universum',
          'wetenschap',
          'kerk',
          'bijgeloof',
        ],
        lesson:
          'Zie jezelf als deel van een groter geheel; wie dat begrijpt, wordt rustiger en minder bijgelovig.',
        text: p(
          'Mijn bekendste en meest gevreesde gedachte is deze: God en de Natuur zijn één en hetzelfde. Deus sive Natura. God is geen koning die buiten de wereld troont, beloont en straft, maar de oneindige samenhang waaruit alles voortkomt. Mensen maken God graag naar hun eigen beeld, met boosheid en voorkeuren. Dat leidt tot bijgeloof en tot angst.',
          'Om zulke gedachten sprak de Portugees-joodse gemeenschap van Amsterdam in 1656 de ban over mij uit. Ik was drieëntwintig. Ik verloor mijn familie, mijn vrienden en mijn plaats. Toch heb ik er nooit spijt van gehad dat ik bleef denken. Wie begrijpt dat hij een deel is van de natuur, met haar oorzaken en wetten, hoeft minder bang te zijn.',
          'Je kunt de dingen ook zien vanuit het oogpunt van de eeuwigheid: niet als losse gebeurtenissen die jou toevallig overkomen, maar als deel van een samenhang die veel groter is dan jij. Kijk zo eens naar ‘{onderwerp}’. Wat wordt kleiner, en wat wordt juist helderder, als je het vanuit dat oogpunt bekijkt?',
        ),
      },
      {
        id: 'spi-blok-vrijheid-denken',
        heading: 'De vrijheid van denken',
        keywords: [
          'vrijheid',
          'meningsuiting',
          'censuur',
          'democratie',
          'tolerantie',
          'staat',
          'politiek',
          'debat',
          'sociale media',
          'polarisatie',
        ],
        lesson:
          'Een vrije samenleving laat mensen denken en zeggen wat ze willen; gebruik die vrijheid om te begrijpen, niet om te overschreeuwen.',
        text: p(
          'In 1670 verscheen mijn Tractatus theologico-politicus, zonder mijn naam en met een verzonnen drukker op de titelpagina. Het boek pleitte voor iets wat in mijn tijd gevaarlijk was: dat iedereen mag denken wat hij wil en zeggen wat hij denkt. Mijn conclusie: “Het doel van de staat is in werkelijkheid de vrijheid.” (Tractatus theologico-politicus, hoofdstuk 20). Een paar jaar later werd het boek verboden.',
          'In 1672 vermoordde een woedende menigte in Den Haag de gebroeders De Witt. Ik wilde een briefje ophangen met de woorden ‘ultimi barbarorum’, de ergsten der barbaren. Mijn huisbaas sloot me op om me te beschermen, zo vertelde ik later aan Leibniz. Ik weet dus hoe dun het laagje beschaving kan zijn, en hoe kostbaar vrijheid is.',
          'Ik hoor dat in jouw tijd iedereen zijn mening kan uiten, voor de hele wereld. Dat had ik me niet kunnen voorstellen, en ik verheug me erover. Maar vrijheid van spreken is pas vruchtbaar als we haar gebruiken om te begrijpen. Kijk zo naar ‘{onderwerp}’: gebruik jij je vrijheid om te begrijpen, of vooral om gelijk te krijgen?',
        ),
      },
      {
        id: 'spi-blok-vrijheid',
        heading: 'Vrij zijn is begrijpen',
        keywords: [
          'vrijheid',
          'vrije wil',
          'keuze',
          'verslaving',
          'gewoonte',
          'controle',
          'zelfbeheersing',
          'loslaten',
          'acceptatie',
          'rust',
        ],
        lesson:
          'Vrij ben je niet door te doen wat je wilt, maar door te begrijpen waarom je wilt wat je wilt.',
        text: p(
          'Mensen denken dat ze vrij zijn omdat ze zich bewust zijn van hun verlangens, maar niet van de oorzaken ervan. In een brief schreef ik, in eigen woorden: stel je een steen voor die wordt weggegooid en die zich tijdens zijn vlucht bewust zou zijn van zijn beweging. Hij zou denken dat hij uit vrije wil vliegt. Zo gaat het ons vaak ook.',
          'Is vrijheid dan een illusie? Nee. Maar ze is iets anders dan we denken. Vrij is niet wie doet wat in hem opkomt, maar wie begrijpt waarom het in hem opkomt, en daardoor handelt vanuit inzicht in plaats van vanuit dwang. Hoe meer je begrijpt, hoe minder je wordt geduwd. Dat is een vrijheid die groeit.',
          'Dat is geen gemakkelijke weg. Mijn Ethica eindigt met deze zin: “Alles wat voortreffelijk is, is even moeilijk als zeldzaam.” (Ethica V, stelling 42, toelichting). Kijk zo naar ‘{onderwerp}’. Welke van je keuzes hierin voelen vrij, maar worden misschien gedreven door oorzaken die je nog niet hebt bekeken?',
        ),
      },
    ],
    answers: [
      p(
        'Je vraagt: “{vraag}” Laten we die vraag behandelen als een stelling die bewezen moet worden.',
        'Eerst: wat bedoelen we met ‘{woord}’? Dan: wat volgt daaruit? Als de begrippen helder zijn, volgt het antwoord vaak vanzelf. In het volgende deel kom ik erop terug.',
      ),
      p(
        '“{vraag}” Dat is een vraag die ik ook vaak krijg, meestal per brief.',
        'Mijn antwoord begint, zoals altijd, bij de oorzaken. Waarom stel je deze vraag nu? Welk gevoel zit eronder? Als we dat begrijpen, wordt de vraag vaak lichter, ook als het antwoord moeilijk blijft.',
      ),
      p(
        'Je vraagt: “{vraag}” Ik moet eerlijk zijn: hier past voorzichtigheid. Caute.',
        'Wat ik wel kan zeggen: kijk ernaar zonder te lachen, zonder te betreuren en zonder te verafschuwen. Probeer het eerst te begrijpen. Dat is altijd de eerste stap, en vaak de belangrijkste.',
      ),
    ],
    conclusions: [
      p(
        'We komen tot een besluit. Je vroeg: “{hoofdvraag}”',
        'Mijn antwoord, stap voor stap: begrijp de oorzaken, zie jezelf als deel van een groter geheel, en zoek wat je vermogen om te leven vergroot. Dat is geen snelle weg. Maar alles wat voortreffelijk is, is even moeilijk als zeldzaam. Wat ik je meegeef:',
      ),
      p(
        'Het licht valt al anders door het raam. Je vroeg: “{hoofdvraag}”',
        'Ik heb geprobeerd je geen oordeel te geven, maar een lens: een manier van kijken waardoor de dingen scherper worden. Wat je daardoor ziet, is van jou. Samengevat:',
      ),
    ],
    thinkQuestions: [
      'Welk gevoel had deze week macht over je, en wat waren de oorzaken ervan?',
      'Wat vergroot jouw vermogen om te leven en te handelen, en hoe kun je daar meer van opzoeken?',
      'Wie zou je beter kunnen begrijpen als je hem niet eerst zou beoordelen?',
    ],
  },

  timelineReactions: [
    {
      keywords: ['boos', 'woede', 'kwaad', 'irritatie', 'ergernis'],
      text: 'Boosheid is een natuurlijk verschijnsel, zoals onweer. Kijk eens naar de oorzaken; dan verliest ze een deel van haar macht.',
    },
    {
      keywords: ['bang', 'angst', 'zorgen', 'onzeker', 'spannend'],
      text: 'Angst is een onbestendige droefheid over wat nog komen moet. Wat weet je zeker, en wat vrees je alleen?',
    },
    {
      keywords: ['jaloers', 'jaloezie', 'vergelijken', 'afgunst'],
      text: 'Wie zich vergelijkt, maakt zijn vreugde afhankelijk van een ander. Wat vergroot jouw eigen vermogen, los van wat anderen hebben?',
    },
    {
      keywords: ['blij', 'vreugde', 'geluk', 'genieten', 'dankbaar'],
      text: 'Vreugde vergroot je vermogen om te leven. Mooi dat je haar opmerkt en deelt.',
    },
    {
      keywords: ['nieuws', 'politiek', 'ergernis', 'mensen', 'debat'],
      text: 'Niet lachen, niet betreuren, niet verafschuwen, maar begrijpen. Een moeilijke opdracht, ik weet het. Maar ze loont.',
    },
    {
      keywords: ['vrijheid', 'mening', 'censuur', 'zeggen', 'meningsuiting'],
      text: 'Het doel van de staat is de vrijheid, schreef ik. Gebruik de jouwe om te begrijpen, niet om te overschreeuwen.',
    },
    {
      keywords: ['natuur', 'buiten', 'bos', 'zee', 'sterren'],
      text: 'In de natuur zie je hoe alles samenhangt. Daar begint voor mij elk denken over God.',
    },
    {
      keywords: ['moeilijk', 'zwaar', 'lukt niet', 'opgeven'],
      text: 'Alles wat voortreffelijk is, is even moeilijk als zeldzaam. Dat het zwaar is, zegt dus niets over of je op de goede weg bent.',
    },
    {
      keywords: ['schuld', 'spijt', 'fout', 'schamen'],
      text: 'Spijt kijkt achterom en maakt zwakker. Begrijp wat er gebeurde, leer ervan, en richt je dan weer op het leven.',
    },
    {
      keywords: ['eenzaam', 'alleen', 'buitengesloten', 'anders'],
      text: 'Ik weet hoe het voelt om buitengesloten te worden. Zoek de mensen bij wie je gedachten welkom zijn. Ze bestaan.',
    },
    {
      keywords: ['werk', 'ambacht', 'maken', 'handwerk', 'klussen'],
      text: 'Ik slijp lenzen voor mijn brood en denk voor mijn vreugde. Werk met je handen kan je hoofd verrassend helder maken.',
    },
    {
      keywords: [],
      text: 'Een mooie gedachte. Mag ik vragen waar ze vandaan komt? Daar begint het begrijpen.',
    },
  ],

  reflectionQuestions: [
    'Welk gevoel had deze week de meeste macht over je, en wat waren de oorzaken?',
    'Wat vergroot je vermogen om te leven en te handelen?',
    'Wie zou je beter begrijpen als je hem minder snel zou beoordelen?',
    'Waar zoek je naar schuld, terwijl oorzaken je meer zouden helpen?',
    'Wat begrijp je nu beter dan vorige week?',
  ],

  thoughts: [
    'Niet lachen, niet betreuren, niet verafschuwen, maar begrijpen. Probeer het vandaag één keer, bij iemand die je ergert.',
    'Een gevoel dat je helder begrijpt, verliest zijn greep op je.',
    'Kijk vandaag naar je gevoelens zoals naar het weer: interessant, veranderlijk en niet jouw schuld.',
    'Vreugde vergroot je vermogen om te leven. Zoek vandaag bewust iets op wat je groter maakt.',
    'Caute: wees voorzichtig. Niet angstig, maar zorgvuldig.',
    'Een vrij mens denkt meer aan het leven dan aan de dood. Waar besteed jij je leven vandaag aan?',
    'Alles wat voortreffelijk is, is even moeilijk als zeldzaam. Moeilijk is dus geen slecht teken.',
  ],
};
