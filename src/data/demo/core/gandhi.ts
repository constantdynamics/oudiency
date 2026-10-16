/**
 * Demomodus: Mahatma Gandhi. Zacht, eenvoudig en persoonlijk; spreekt vanuit eigen ervaring,
 * noemt eigen fouten, vertaalt idealen naar kleine dagelijkse daden. Letterlijke citaten alleen
 * uit de geverifieerde lijst (de bekende "wees de verandering" alleen als parafrase benoemd).
 */
import type { DemoFigureContent } from '../../types';

const p = (...parts: string[]) => parts.join('\n\n');

export const gandhiDemo: DemoFigureContent = {
  figureId: 'gandhi',
  sessionFragments: [
    /* ---------- Opening ---------- */
    {
      id: 'gan-open-1',
      phase: 'opening',
      text: 'Welkom{naam}. Kom, ga zitten op de mat; stoelen hebben we hier niet veel. Ik spin nog even door terwijl we praten, als je dat niet erg vindt. Wat ligt er op je hart?',
    },
    {
      id: 'gan-open-2',
      phase: 'opening',
      text: 'Ah, je bent er{naam}. Hier noemen ze me Bapu, maar zeg gerust wat je wilt. Vertel me eens wat je hierheen brengt.',
    },
    {
      id: 'gan-open-3',
      phase: 'opening',
      text: 'Welkom{naam}. Bij je afspraak schreef je: ‘{onderwerp}’. Laten we bij het begin beginnen: wat is jouw waarheid in deze zaak, zo eerlijk als je haar kunt zeggen?',
    },
    {
      id: 'gan-open-4',
      phase: 'opening',
      text: 'Kom binnen{naam}. ‘{onderwerp}’, schreef je. Ik heb gemerkt dat grote vragen meestal beginnen bij iets kleins in ons eigen leven. Waar begint het bij jou?',
    },

    /* ---------- Terugkeer ---------- */
    {
      id: 'gan-terug-1',
      phase: 'terugkeer',
      text: 'Je bent teruggekomen{naam}, dat doet me goed. De vorige keer spraken we over {vorige}. Heb je er sindsdien mee geëxperimenteerd, in het klein?',
    },
    {
      id: 'gan-terug-2',
      phase: 'terugkeer',
      text: 'Welkom terug{naam}. We spraken over {vorige}. Wat heb je sindsdien over jezelf ontdekt? Dat is vaak het belangrijkste deel van een experiment.',
    },

    /* ---------- Doorvragen ---------- */
    {
      id: 'gan-door-1',
      phase: 'doorvragen',
      keywords: ['boos', 'woede', 'kwaad', 'haat', 'ruzie', 'conflict'],
      text: 'Je bent boos, hoor ik. Dat begrijp ik; ik ken die woede ook. Maar mag ik vragen: is je boosheid gericht op wat de ander doet, of op de ander als mens? Dat verschil is belangrijker dan het lijkt.',
    },
    {
      id: 'gan-door-2',
      phase: 'doorvragen',
      keywords: ['onrecht', 'oneerlijk', 'protest', 'actie', 'demonstratie', 'verzet'],
      text: 'Je ziet onrecht. Goed, dan zwijgen we er niet over. Maar wat wil je bereiken: dat de ander verliest, of dat de ander verandert? Daar hangt de hele aanpak van af.',
    },
    {
      id: 'gan-door-3',
      phase: 'doorvragen',
      keywords: ['waarheid', 'eerlijk', 'liegen', 'echt', 'oprecht'],
      text: 'Wat is jouw waarheid hier? Ik bedoel niet je mening, maar wat je in je hart zeker weet, ook als niemand je gelijk geeft.',
    },
    {
      id: 'gan-door-4',
      phase: 'doorvragen',
      keywords: ['beginnen', 'veranderen', 'verandering', 'zelf', 'iets doen'],
      text: 'Wat zou je morgen in je eigen dagelijks leven kunnen veranderen, hoe klein ook? Ik begon met spinnen, elke dag een uurtje. Dat leek niets, maar het werd een beweging.',
    },
    {
      id: 'gan-door-5',
      phase: 'doorvragen',
      text: 'Laat me herhalen wat ik hoor, zodat ik je niet verkeerd begrijp. Je wilt iets goeds, maar de weg ernaartoe voelt zwaar. Klopt dat?',
    },

    /* ---------- Verdiepen ---------- */
    {
      id: 'gan-verdiep-1',
      phase: 'verdiepen',
      keywords: ['geweld', 'vechten', 'terugslaan', 'oorlog', 'wraak', 'agressie'],
      text: '“Geweldloosheid is de wet van onze soort, zoals geweld de wet van het beest is.” (Young India, 1920). Daarmee zeg ik niet dat het makkelijk is. Het vraagt meer moed dan terugslaan. Waar zou die moed bij jou vandaan kunnen komen?',
    },
    {
      id: 'gan-verdiep-2',
      phase: 'verdiepen',
      keywords: ['laf', 'lafheid', 'bang', 'angst', 'zwijgen', 'wegkijken'],
      text: 'Misschien verbaast het je, maar ik schreef ook: “Ik geloof wel dat ik, waar alleen de keus is tussen lafheid en geweld, tot geweld zou raden.” (Young India, 1920). Geweldloosheid is geen excuus om weg te kijken. Ze is de moed van de sterke. Waar kijk jij misschien weg?',
    },
    {
      id: 'gan-verdiep-3',
      phase: 'verdiepen',
      keywords: [
        'zelfbeheersing',
        'verleiding',
        'discipline',
        'telefoon',
        'verslaving',
        'gewoonte',
      ],
      text: 'In Hind Swaraj schreef ik: “Echt zelfbestuur is zelfbeheersing.” (1909). Een land kan pas vrij zijn als zijn mensen meester zijn over zichzelf. Over welk stukje van je leven zou jij weer meester willen worden?',
    },
    {
      id: 'gan-verdiep-4',
      phase: 'verdiepen',
      keywords: ['verandering', 'wereld', 'activisme', 'klimaat', 'impact', 'verschil'],
      text: 'Mensen citeren mij vaak met: wees de verandering die je in de wereld wilt zien. Zo heb ik het nooit letterlijk geschreven; het is een vrije samenvatting van een langere gedachte. Maar de kern klopt: wat je van de wereld vraagt, begin je bij jezelf. Wat zou dat voor jou betekenen?',
    },
    {
      id: 'gan-verdiep-5',
      phase: 'verdiepen',
      keywords: [
        'tegenstander',
        'vijand',
        'polarisatie',
        'politiek',
        'discriminatie',
        'uitgesloten',
      ],
      text: 'In Zuid-Afrika werd ik uit een trein gezet, alleen vanwege mijn huidskleur. Die nacht, in de kou van het station van Pietermaritzburg, besloot ik te blijven en te strijden, maar zonder haat. Ik wilde mijn tegenstanders overtuigen, niet vernederen. Wie is jouw tegenstander, en wat zou hem kunnen overtuigen?',
    },
    {
      id: 'gan-verdiep-6',
      phase: 'verdiepen',
      keywords: ['eenvoud', 'spullen', 'kopen', 'consumptie', 'geld', 'luxe', 'bezit'],
      text: 'Ik heb mijn bezit in de loop der jaren teruggebracht tot bijna niets: wat kleren, mijn bril, mijn spinnewiel. Niet omdat armoede mooi is, maar omdat ik vrijer werd met elk ding dat ik losliet. Welk bezit bezit eigenlijk jou?',
    },
    {
      id: 'gan-verdiep-7',
      phase: 'verdiepen',
      keywords: ['twijfel', 'keuze', 'beslissen', 'armoede', 'helpen', 'zwakken'],
      text: 'Ik gaf mensen ooit een talisman mee, in eigen woorden: als je twijfelt, denk dan aan het gezicht van de armste en zwakste mens die je ooit zag, en vraag je af of je volgende stap die mens iets oplevert. Probeer het eens met jouw vraag. Wat verandert er?',
    },
    {
      id: 'gan-verdiep-8',
      phase: 'verdiepen',
      keywords: ['fout', 'fouten', 'spijt', 'schuld', 'mislukt', 'falen'],
      text: 'Ik heb grote fouten gemaakt. Eens riep ik op tot verzet voordat de mensen er klaar voor waren, en het liep uit op geweld. Ik noemde het publiekelijk een misrekening zo groot als de Himalaya, en ik blies de actie af. Een fout erkennen is geen zwakte. Het is schoonmaken.',
    },
    {
      id: 'gan-verdiep-9',
      phase: 'verdiepen',
      keywords: ['racisme', 'zwarte', 'zuid-afrika', 'schaduwkant', 'vooroordeel', 'kaste'],
      text: 'Je spreekt me aan op mijn schaduwkanten, en dat is goed. In mijn Zuid-Afrikaanse jaren schreef ik over zwarte Afrikanen met vooroordelen die ik niet kan verdedigen. Ik herhaal ze niet en praat ze niet goed. Ook mijn experimenten met de waarheid kenden mislukkingen, en dit was er een.',
    },

    /* ---------- Afronden ---------- */
    {
      id: 'gan-afrond-1',
      phase: 'afronden',
      text: 'Mijn draad wordt korter. Laten we het klein en concreet maken: wat is één daad die je deze week kunt doen, vanuit je waarheid en zonder iemand te kwetsen?',
    },
    {
      id: 'gan-afrond-2',
      phase: 'afronden',
      text: 'We ronden af. Wat ik je wil meegeven: wees zacht in je woorden en standvastig in je daden. Die twee samen zijn sterker dan je denkt.',
    },

    /* ---------- Slot ---------- */
    {
      id: 'gan-slot-1',
      phase: 'slot',
      text: 'Een laatste woord, want het gebed begint zo: begin bij jezelf. Daar heb je de meeste invloed, en daar begint elke grote verandering.',
    },
    {
      id: 'gan-slot-2',
      phase: 'slot',
      text: 'Nog één gedachte voor onderweg: middel en doel zijn als zaad en boom. Wie slecht zaad plant, kan geen goede boom verwachten.',
    },
  ],

  lecture: {
    openings: [
      p(
        'Welkom in de ashram. Ga zitten op de mat; het college van vandaag is eenvoudig, net als de kamer. Je vroeg mij iets te zeggen over ‘{onderwerp}’, met deze vraag: “{hoofdvraag}”',
        'Ik ben geen professor. Ik ben advocaat geweest, journalist en boer, en vooral een leerling van mijn eigen fouten. Mijn autobiografie noemde ik niet voor niets het verhaal van mijn experimenten met de waarheid. Wat ik vandaag vertel, zijn de uitkomsten van die experimenten, met de mislukkingen erbij.',
        'Laten we beginnen, rustig, zoals een draad die je spint: niet trekken, maar laten groeien.',
      ),
      p(
        'Welkom. Het onderwerp: ‘{onderwerp}’. Je vraag: “{hoofdvraag}”',
        'Ik zal je geen kant-en-klare antwoorden geven. Ik geloof niet in waarheden die je van een ander overneemt zonder ze zelf te beproeven. Wat ik je wel kan geven, is mijn ervaring, en de vragen die ik mezelf stelde.',
        'Na elk deel mag je me vragen stellen. Ik waardeer het als je het niet met me eens bent; dan zoeken we samen verder.',
      ),
    ],
    blocks: [
      {
        id: 'gan-blok-satyagraha',
        heading: 'Satyagraha: vasthouden aan de waarheid',
        keywords: [
          'verzet',
          'protest',
          'activisme',
          'actie',
          'onrecht',
          'demonstratie',
          'staking',
          'klimaat',
          'boycot',
          'burgerlijke ongehoorzaamheid',
          'geweldloos verzet',
        ],
        lesson:
          'Verzet je tegen onrecht met vasthoudendheid en zonder haat; je doel is de ander te overtuigen, niet te vernederen.',
        text: p(
          'In 1906 kwamen in Johannesburg duizenden Indiërs samen in een theater. De regering wilde ons dwingen ons te laten registreren met vingerafdrukken, als verdachten. We zwoeren de wet niet te gehoorzamen, wat het ook kostte. Voor die vorm van verzet zochten we een woord. Het werd satyagraha: vasthouden aan de waarheid, of de kracht die uit waarheid voortkomt.',
          'Satyagraha is geen passief verzet, en zeker geen zwakte. Het betekent: je weigert mee te werken aan onrecht, je aanvaardt de straf daarvoor zonder terug te slaan, en je blijft de tegenstander als mens behandelen. Het lijden neem je zelf op je, je legt het niet een ander op. Dat raakt het geweten, ook van wie je tegenover je hebt.',
          'Jaren later liep ik met een groep vrijwilligers vierentwintig dagen naar de zee bij Dandi, om daar zelf zout te maken, wat de Britse wet verbood. Een handvol zout, en een heel land kwam in beweging. Kijk zo naar ‘{onderwerp}’. Wat is het onrecht precies, en welke eenvoudige daad zou laten zien dat je er niet aan meewerkt, zonder haat?',
        ),
      },
      {
        id: 'gan-blok-ahimsa',
        heading: 'Ahimsa: geweldloos in daad, woord en gedachte',
        keywords: [
          'geweld',
          'conflict',
          'ruzie',
          'boosheid',
          'woede',
          'haat',
          'online',
          'polarisatie',
          'oorlog',
          'vrede',
        ],
        lesson: 'Geweldloosheid begint in je gedachten en woorden, en vraagt meer moed dan geweld.',
        text: p(
          'Ahimsa betekent letterlijk: niet schaden. Ik schreef in 1920: “Geweldloosheid is de wet van onze soort, zoals geweld de wet van het beest is.” (Young India, 1920). Maar ik schreef in hetzelfde stuk ook: “Ik geloof wel dat ik, waar alleen de keus is tussen lafheid en geweld, tot geweld zou raden.” Geweldloosheid is dus nooit een excuus om weg te kijken. Ze is de moed van de sterke, niet de vlucht van de zwakke.',
          'Geweld begint niet bij de vuist. Het begint bij een gedachte: dat de ander minder waard is. Het groeit in woorden die kwetsen en vernederen. Daarom zei ik vaak, in eigen woorden: haat de zonde, niet de zondaar. Dat is gemakkelijk te begrijpen en heel moeilijk om te doen.',
          'Ik hoor dat mensen elkaar in jouw tijd vaak via schermen toespreken, snel en hard, zonder elkaars gezicht te zien. In mijn tijd bestond dat niet, maar ik ken de verleiding. Kijk zo naar ‘{onderwerp}’. Waar is het geweld al begonnen, in gedachten of woorden? En wat zou het betekenen om daar te beginnen met ontwapenen?',
        ),
      },
      {
        id: 'gan-blok-swaraj',
        heading: 'Swaraj: echt zelfbestuur',
        keywords: [
          'zelfbeheersing',
          'vrijheid',
          'discipline',
          'verslaving',
          'consumptie',
          'telefoon',
          'onafhankelijkheid',
          'zelfstandig',
          'politiek',
          'democratie',
        ],
        lesson:
          'Vrijheid begint bij zelfbeheersing: wie zichzelf niet bestuurt, wordt bestuurd door zijn verlangens.',
        text: p(
          'In 1909 schreef ik op de terugreis van Londen naar Zuid-Afrika een klein boek, Hind Swaraj. Ik schreef het in tien dagen; als mijn rechterhand moe werd, schreef ik met links. Veel landgenoten wilden de Engelsen weg hebben, maar de Engelse manier van leven houden. Ik vroeg: is dat vrijheid, of alleen een andere meester?',
          'Mijn antwoord stond in het slothoofdstuk: “Echt zelfbestuur is zelfbeheersing.” (Hind Swaraj, 1909). Een volk dat zijn eigen hebzucht, angst en gemakzucht niet kan beteugelen, wordt altijd door iemand geregeerd, zo niet door een koning, dan wel door zijn eigen verlangens.',
          'Kijk zo naar ‘{onderwerp}’. Wie of wat bestuurt hier eigenlijk jouw keuzes? Zelfbeheersing is geen straf. Het is de vrijheid om zelf te kiezen in plaats van gekozen te worden. Ik vastte soms, niet om mezelf te kwellen, maar om te oefenen in die vrijheid. Wat zou jouw kleine oefening kunnen zijn?',
        ),
      },
      {
        id: 'gan-blok-eenvoud',
        heading: 'Eenvoud en het spinnewiel',
        keywords: [
          'eenvoud',
          'consumptie',
          'spullen',
          'kopen',
          'duurzaam',
          'klimaat',
          'kleding',
          'geld',
          'minimalisme',
          'lokaal',
        ],
        lesson:
          'Leef eenvoudig en dichtbij; wie minder nodig heeft, is vrijer en minder afhankelijk.',
        text: p(
          'Je kent mij misschien van foto’s met het spinnewiel. Dat was geen toneel. In mijn tijd werd katoen uit India naar Engeland verscheept, daar tot stof geweven en dan duur aan ons teruggekocht. Elke draad die we zelf sponnen, was een stukje vrijheid. We noemden dat swadeshi: gebruiken wat dichtbij gemaakt is, en zo je eigen gemeenschap sterk maken.',
          'Gaandeweg heb ik bijna al mijn bezit weggegeven. Niet omdat armoede mooi is; onvrijwillige armoede is een vloek. Maar ik merkte dat elk ding dat ik bezat ook iets van mij vroeg: zorg, angst om het te verliezen, tijd. Eenvoud gaf me ruimte voor wat er werkelijk toe deed.',
          'Ik hoor dat jullie nu meer spullen hebben dan ooit, en dat de aarde daaronder zucht. Kijk zo naar ‘{onderwerp}’. Wat zou je kunnen loslaten, of zelf maken, of dichtbij kopen? Begin klein. Mijn hele beweging begon met een uurtje spinnen per dag.',
        ),
      },
      {
        id: 'gan-blok-middelen',
        heading: 'Zoals het zaad, zo de boom',
        keywords: [
          'doel',
          'middelen',
          'strategie',
          'ethiek',
          'keuze',
          'compromis',
          'politiek',
          'werk',
          'succes',
          'resultaat',
        ],
        lesson: 'Het doel heiligt de middelen niet: zoals het zaad is, zo wordt de boom.',
        text: p(
          'Mensen zeiden vaak tegen mij: Gandhi, het doel is goed, dus wat maakt het uit hoe we het bereiken? Ik antwoordde, in eigen woorden: het middel is als het zaad en het doel als de boom. Uit het zaad van een onkruid groeit geen roos. Wie vrijheid wil bereiken met leugens en geweld, oogst een vrijheid vol leugens en geweld.',
          'Daarom keek ik altijd eerst naar de middelen. Is dit eerlijk? Schaadt dit iemand onnodig? Kan ik het openlijk doen, zonder iets te verbergen? Als het antwoord nee was, zocht ik een andere weg, ook als die langer duurde. Het doel zorgde dan meestal voor zichzelf.',
          'Kijk zo naar ‘{onderwerp}’. Welk doel heb je voor ogen, en welke middelen overweeg je? Zou je die middelen ook kiezen als iedereen kon meekijken? Zo niet, dan zit daar je antwoord, en misschien ook je volgende stap.',
        ),
      },
      {
        id: 'gan-blok-experimenten',
        heading: 'Experimenten met de waarheid',
        keywords: [
          'fout',
          'fouten',
          'leren',
          'groei',
          'zelfonderzoek',
          'eerlijk',
          'waarheid',
          'schuld',
          'spijt',
          'veranderen',
        ],
        lesson:
          'Behandel je leven als een reeks experimenten: erken je fouten openlijk en stel bij.',
        text: p(
          'Toen ik vijftien was, stal ik een stukje goud van de armband van mijn broer. Het zat me zo dwars dat ik een bekentenis opschreef voor mijn vader. Hij was ziek en las het in bed. Hij zei niets; er liepen alleen tranen over zijn wangen. Die tranen leerden mij meer over waarheid dan elke straf had gekund.',
          'Ik noemde mijn leven later een reeks experimenten met de waarheid. Experimenten mislukken soms. Eens riep ik op tot verzet voordat de mensen er klaar voor waren; het liep uit op geweld. Ik noemde het publiekelijk een misrekening zo groot als de Himalaya en blies de actie af. Ook in mijn jonge jaren in Zuid-Afrika had ik vooroordelen die ik niet kan verdedigen. Ook dat hoort bij de eerlijkheid.',
          'Kijk zo naar ‘{onderwerp}’. Wat zou je proberen als je het als een experiment zag, in plaats van als een examen? En welke fout zou je durven erkennen? Een fout toegeven is als het vegen van je eigen huis: het lucht op, en daarna kun je weer gasten ontvangen.',
        ),
      },
    ],
    answers: [
      p(
        'Je vraagt: “{vraag}” Dat is een eerlijke vraag, en ik wil haar eerlijk beantwoorden.',
        'Ik weet het niet zeker. Maar ik zou bij mezelf beginnen: wat kan ík doen met ‘{woord}’, zonder iemand te schaden? Dat is meestal de eerste draad. In het volgende deel spin ik verder.',
      ),
      p(
        '“{vraag}” Ah, daar heb je een moeilijke te pakken. Ook ik heb daar lang mee geworsteld.',
        'In Zuid-Afrika en in India leerde ik dat het antwoord pas komt als je iets probeert. Denken alleen is niet genoeg; je moet het beproeven, in het klein, en kijken wat er gebeurt. En eerlijk zijn als het misgaat.',
      ),
      p(
        'Je vraagt: “{vraag}” Mag ik je vraag eerst omkeren?',
        'Wat zou de zwakste persoon in deze situatie van je vragen? Begin daar. Vaak wordt een ingewikkelde vraag dan opeens eenvoudig, al is het antwoord niet altijd gemakkelijk.',
      ),
    ],
    conclusions: [
      p(
        'We komen bij het einde. Je vroeg: “{hoofdvraag}”',
        'Mijn antwoord: begin bij jezelf, kies middelen die even zuiver zijn als je doel, en wees niet bang om fouten te erkennen. Waarheid en geweldloosheid zijn zo oud als de heuvels; het enige nieuwe is dat jij ermee aan de slag gaat. Neem dit mee:',
      ),
      p(
        'Mijn draad is bijna op. Je vroeg: “{hoofdvraag}”',
        'Ik geef je geen antwoord dat je kunt vastpakken, maar een manier van lopen: zacht in woorden, standvastig in daden en eenvoudig in wat je nodig hebt. Dit wil ik je meegeven:',
      ),
    ],
    thinkQuestions: [
      'Wat is één kleine daad waarmee je deze week je waarheid kunt laten zien, zonder iemand te kwetsen?',
      'Wie is jouw tegenstander, en wat zou hem werkelijk kunnen overtuigen?',
      'Welk bezit of welke gewoonte zou je kunnen loslaten om vrijer te worden?',
    ],
  },

  timelineReactions: [
    {
      keywords: ['boos', 'woede', 'haat', 'ruzie', 'kwaad'],
      text: 'Ik ken die woede. Het gaat erom wat je ermee doet: richt haar op het onrecht, nooit op de mens.',
    },
    {
      keywords: ['onrecht', 'protest', 'actie', 'demonstratie', 'oneerlijk'],
      text: 'Goed dat je je stem laat horen. Houd haar zuiver: geen haat en geen leugens. Dan wordt ze sterker, niet zwakker.',
    },
    {
      keywords: ['eenvoud', 'opruimen', 'minder', 'spullen', 'minimalisme'],
      text: 'Elk ding dat je loslaat, maakt je een beetje vrijer. Ik spreek uit ervaring; ik heb niet veel meer over.',
    },
    {
      keywords: ['vasten', 'discipline', 'zelfbeheersing', 'verleiding', 'telefoon'],
      text: 'Zelfbeheersing is geen straf, maar vrijheid. Wie zichzelf bestuurt, hoeft niet door een ander bestuurd te worden.',
    },
    {
      keywords: ['fout', 'spijt', 'schuld', 'sorry', 'excuses'],
      text: 'Een fout toegeven is als het vegen van je eigen huis. Het lucht op. Goed gedaan.',
    },
    {
      keywords: ['klimaat', 'duurzaam', 'natuur', 'aarde', 'milieu'],
      text: 'Leef eenvoudig, zodat anderen eenvoudig kunnen leven. Het begint in je eigen keuken en kast.',
    },
    {
      keywords: ['wandelen', 'lopen', 'mars', 'stappen', 'tocht'],
      text: 'Ik liep eens vierentwintig dagen naar de zee, voor een handvol zout. Elke stap telt.',
    },
    {
      keywords: ['helpen', 'vrijwilliger', 'zorg', 'armoede', 'dienen'],
      text: 'Dienen geeft je leven een richting die geen succes je kan geven. Dank je dat je dat doet.',
    },
    {
      keywords: ['politiek', 'polarisatie', 'tegenstander', 'debat'],
      text: 'Bestrijd het idee, niet de mens. Wie de ander vernedert, heeft het gesprek al verloren.',
    },
    {
      keywords: ['waarheid', 'eerlijk', 'liegen', 'oprecht'],
      text: 'Voor mij is waarheid het hoogste. Blijf haar zoeken, ook als ze ongemakkelijk is.',
    },
    {
      keywords: ['dankbaar', 'blij', 'gebed', 'stilte', 'rust'],
      text: 'Een moment van stilte en dankbaarheid is als een gebed. Ik ben blij dat je het deelt.',
    },
    {
      keywords: [],
      text: 'Dank je voor je woorden. Mag ik vragen: wat kun jij hier zelf aan doen, hoe klein ook?',
    },
  ],

  reflectionQuestions: [
    'Wat is jouw waarheid, ook als niemand je gelijk geeft?',
    'Welk klein ding kun je zelf veranderen, in plaats van op anderen te wachten?',
    'Waar ben je hard in je woorden, terwijl je zacht zou kunnen zijn?',
    'Welk bezit of welke gewoonte bezit eigenlijk jou?',
    'Welke fout zou je deze week openlijk kunnen erkennen?',
  ],

  thoughts: [
    'Begin vandaag bij jezelf. Daar heb je de meeste invloed.',
    'Wees zacht in je woorden en standvastig in je daden.',
    'Het middel is het zaad, het doel is de boom. Let vandaag op wat je zaait.',
    'Denk bij twijfel aan de zwakste mens die je kent. Wat betekent je volgende stap voor hem?',
    'Elk ding dat je loslaat, maakt je wat vrijer.',
    'Een fout erkennen is geen nederlaag. Het is schoonmaken.',
    'Echt zelfbestuur is zelfbeheersing. Waar ben jij vandaag de baas over?',
  ],
};
