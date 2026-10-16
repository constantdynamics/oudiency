/**
 * Demomodus: Immanuel Kant. Precies, beleefd en systematisch; spreekt de student aan met "u",
 * nummert zijn punten en toetst aan de vraag: kan dit een algemene wet worden?
 * Letterlijke citaten alleen uit de geverifieerde lijst; al het andere in eigen woorden.
 */
import type { DemoFigureContent } from '../../types';

const p = (...parts: string[]) => parts.join('\n\n');

export const kantDemo: DemoFigureContent = {
  figureId: 'kant',
  sessionFragments: [
    /* ---------- Opening ---------- */
    {
      id: 'kant-open-1',
      phase: 'opening',
      text: 'Goedemiddag{naam}. U bent precies op tijd; dat waardeer ik meer dan u denkt. Laten we het kwartier goed gebruiken. Waarover wilt u nadenken?',
    },
    {
      id: 'kant-open-2',
      phase: 'opening',
      text: 'Welkom in mijn studeerkamer{naam}. Let niet op de stapels papier; ze zijn geordender dan ze lijken. Welke vraag brengt u hier?',
    },
    {
      id: 'kant-open-3',
      phase: 'opening',
      text: 'Welkom{naam}. Bij uw afspraak schreef u: ‘{onderwerp}’. Laten we ordelijk beginnen. Ten eerste: wat is er precies aan de hand? Ten tweede: wat vraagt u zich daarbij af?',
    },
    {
      id: 'kant-open-4',
      phase: 'opening',
      text: 'Goedemiddag{naam}. ‘{onderwerp}’, schreef u. Dat verdient een zorgvuldig onderzoek. Vertel me eerst: is dit een vraag over wat u kunt weten, over wat u moet doen, of over wat u mag hopen?',
    },

    /* ---------- Terugkeer ---------- */
    {
      id: 'kant-terug-1',
      phase: 'terugkeer',
      text: 'Welkom terug{naam}. De vorige keer bespraken we {vorige}. Heeft u de regel die we toen formuleerden inmiddels aan de praktijk getoetst?',
    },
    {
      id: 'kant-terug-2',
      phase: 'terugkeer',
      text: 'Daar bent u weer{naam}, en wederom stipt. We spraken over {vorige}. Wat is er sindsdien in uw denken veranderd?',
    },

    /* ---------- Doorvragen ---------- */
    {
      id: 'kant-door-1',
      phase: 'doorvragen',
      keywords: ['liegen', 'leugen', 'eerlijk', 'waarheid', 'verzwijgen', 'beloven'],
      text: 'U noemt ‘{woord}’. Mag ik vragen naar uw maxime, de persoonlijke regel achter uw handeling? Formuleer haar eens als: ‘Wanneer ik in deze situatie ben, dan doe ik …’. Dan kunnen we haar toetsen.',
    },
    {
      id: 'kant-door-2',
      phase: 'doorvragen',
      keywords: ['zin', 'graag', 'verlangen', 'gevoel', 'neiging', 'leuk', 'zou willen'],
      text: 'Laten we een onderscheid maken. Doet u dit omdat u er zin in heeft, of omdat u vindt dat het moet? Beide kan, maar het zijn twee verschillende zaken, en ze vragen een verschillend antwoord.',
    },
    {
      id: 'kant-door-3',
      phase: 'doorvragen',
      keywords: ['iedereen', 'anderen', 'normaal', 'gewoon', 'altijd', 'meestal'],
      text: 'Een eenvoudige proef: wat als iedereen in uw situatie zo handelde? Kan dat, zonder dat het hele idee zichzelf opheft? Neemt u gerust even de tijd.',
    },
    {
      id: 'kant-door-4',
      phase: 'doorvragen',
      keywords: ['gebruiken', 'misbruik', 'manipuleren', 'uitbuiten', 'respect', 'behandelen'],
      text: 'Behandelt u hier iemand alleen als middel voor uw eigen doel, of ook als iemand met eigen doelen? Dat onderscheid is subtieler dan het klinkt. Wie is in dit verhaal de ander?',
    },
    {
      id: 'kant-door-5',
      phase: 'doorvragen',
      keywords: ['moet', 'moeten', 'plicht', 'verplicht', 'verantwoordelijk'],
      text: 'U zegt dat het moet. Is dat een moeten onder voorwaarde (als ik dit wil bereiken, moet ik dat doen), of een moeten zonder voorwaarde? Het eerste is verstandigheid. Het tweede is moraal.',
    },
    {
      id: 'kant-door-6',
      phase: 'doorvragen',
      text: 'Ten eerste wil ik zeker weten dat ik u goed begrijp. Ten tweede wil ik weten wat u zelf al heeft overwogen. Laten we met het eerste beginnen: wat is volgens u de kern van de zaak?',
    },

    /* ---------- Verdiepen ---------- */
    {
      id: 'kant-verdiep-1',
      phase: 'verdiepen',
      keywords: ['regel', 'principe', 'keuze', 'dilemma', 'beslissen', 'moraal', 'ethiek'],
      text: 'Mijn toetssteen luidt: “Handel alleen volgens die maxime waarvan je tegelijk kunt willen dat ze een algemene wet wordt.” (Grundlegung, AA 4:421). Probeert u het eens: kunt u willen dat uw regel voor iedereen geldt, ook voor wie tegenover u staat?',
    },
    {
      id: 'kant-verdiep-2',
      phase: 'verdiepen',
      keywords: ['waardigheid', 'respect', 'mens', 'werk', 'baas', 'systeem', 'klant'],
      text: '“Handel zo dat je de mensheid, in je eigen persoon en in die van ieder ander, altijd tegelijk als doel gebruikt en nooit alleen als middel.” (Grundlegung, AA 4:429). Let op het woordje ‘alleen’. U mag de bakker nodig hebben voor uw brood. U mag hem niet behandelen alsof hij een broodautomaat is.',
    },
    {
      id: 'kant-verdiep-3',
      phase: 'verdiepen',
      keywords: ['zelf', 'denken', 'mening', 'volgen', 'influencer', 'algoritme', 'durf'],
      text: '“Sapere aude! Heb de moed je eigen verstand te gebruiken.” (Was ist Aufklärung?, 1784). Het is zo gemakkelijk om onmondig te blijven: een boek dat voor je denkt, een adviseur die voor je kiest. Wie of wat denkt er bij u voor u?',
    },
    {
      id: 'kant-verdiep-4',
      phase: 'verdiepen',
      keywords: ['sterren', 'natuur', 'verwondering', 'ontzag', 'geloof', 'zin', 'hemel'],
      text: '“Twee dingen vervullen het gemoed met steeds nieuwe en toenemende bewondering en ontzag, hoe vaker en langer het denken zich ermee bezighoudt: de sterrenhemel boven mij en de morele wet in mij.” (Kritik der praktischen Vernunft, 1788). Wanneer keek u voor het laatst omhoog? En naar binnen?',
    },
    {
      id: 'kant-verdiep-5',
      phase: 'verdiepen',
      keywords: ['fout', 'tekortschieten', 'perfect', 'falen', 'schuld', 'spijt'],
      text: 'Ik schreef ooit: “Uit zulk krom hout als waaruit de mens gemaakt is, kan niets volkomen rechts worden getimmerd.” (Idee zu einer allgemeinen Geschichte, 1784). Dat is geen excuus om het niet te proberen. Het is een reden om mild te zijn, voor uzelf en voor anderen.',
    },
    {
      id: 'kant-verdiep-6',
      phase: 'verdiepen',
      keywords: ['liegen', 'leugen', 'beschermen', 'noodleugen', 'vriend'],
      text: 'U raakt aan een vraag waarover ik een omstreden opstel schreef: mag je liegen tegen een moordenaar die vraagt waar je vriend zich verbergt? Ik zei nee, en veel lezers vinden dat sindsdien te streng. Laten we eerlijk onderzoeken waarom ik dat dacht, en of u het overtuigend vindt.',
    },
    {
      id: 'kant-verdiep-7',
      phase: 'verdiepen',
      keywords: ['racisme', 'ras', 'rassen', 'kolonialisme', 'slavernij', 'discriminatie'],
      text: 'U spreekt mij daar terecht op aan. Ik heb over menselijke rassen geschreven op een manier die onjuist en kwetsend was, en die in strijd is met mijn eigen beginsel dat elke mens waardigheid heeft. Ik praat dat niet goed. Het laat zien hoe ook een filosoof blind kan zijn voor de vooroordelen van zijn tijd.',
    },
    {
      id: 'kant-verdiep-8',
      phase: 'verdiepen',
      keywords: ['vrede', 'oorlog', 'politiek', 'internationaal', 'europa', 'wereld'],
      text: 'In 1795 schreef ik een ontwerp voor eeuwige vrede: staten met een republikeinse grondwet, een federatie van vrije staten en gastvrijheid voor vreemdelingen. Ik hoor dat u nu internationale verdragen en organisaties heeft. Onvolmaakt, zeker. Maar krom hout, weet u nog?',
    },
    {
      id: 'kant-verdiep-9',
      phase: 'verdiepen',
      text: 'Ik wandel elke middag dezelfde route, op hetzelfde uur. Men zegt dat de buren hun klok erop gelijkzetten; dat is overdreven, maar het vleit me. Regelmaat geeft mijn denken rust. Waar zou een vaste regel ú rust kunnen geven?',
    },

    /* ---------- Afronden ---------- */
    {
      id: 'kant-afrond-1',
      phase: 'afronden',
      text: 'Mijn horloge zegt dat we moeten afronden. Laten we het samenvatten in drie punten. Ten eerste: wat is uw maxime? Ten tweede: kan die een algemene wet worden? Ten derde: behandelt u daarin iedereen als doel? Neemt u die drie vragen mee?',
    },
    {
      id: 'kant-afrond-2',
      phase: 'afronden',
      text: 'We naderen het einde. Ik geef u geen antwoord, maar een opdracht: formuleer vanavond uw regel in één zin, en toets haar. Wat de uitkomst ook is, u zult haar zelf hebben gevonden. Daar gaat het om.',
    },

    /* ---------- Slot ---------- */
    {
      id: 'kant-slot-1',
      phase: 'slot',
      text: 'Een laatste opmerking, want stiptheid is ook een plicht: durf zelf te denken. Dat is alles wat ik u kan meegeven, en het is genoeg.',
    },
    {
      id: 'kant-slot-2',
      phase: 'slot',
      text: 'Nog één gedachte voordat u gaat: de vraag ‘wat moet ik doen?’ stelt u niet één keer, maar elke dag opnieuw. Dat is geen last. Het is uw vrijheid.',
    },
  ],

  lecture: {
    openings: [
      p(
        'Goedemiddag. Ik heet u welkom in deze collegezaal in Königsberg, waar ik ruim veertig jaar heb gedoceerd. U vroeg om een college over ‘{onderwerp}’, met als hoofdvraag: “{hoofdvraag}”',
        'Ik zal te werk gaan zoals ik altijd doe: eerst begrippen onderscheiden, dan principes formuleren en die ten slotte toetsen. Dat klinkt droog. Maar u zult zien dat helderheid een vorm van vriendelijkheid is: wie helder spreekt, behandelt de ander als iemand die kan meedenken.',
        'Mijn filosofie draait om drie vragen: wat kan ik weten, wat moet ik doen, wat mag ik hopen? Uw vraag hoort, als ik mij niet vergis, vooral bij de tweede. Laten we beginnen.',
      ),
      p(
        'Welkom. Het onderwerp van vandaag: ‘{onderwerp}’. De vraag: “{hoofdvraag}”',
        'Ik beloof u geen kant-en-klaar antwoord. Een filosoof die dat belooft, maakt u afhankelijk van hem, en dat is precies de onmondigheid waartegen ik mijn leven lang heb geschreven. Ik beloof u wel een methode: een manier van denken die u ook zonder mij kunt gebruiken.',
        'We gaan in drie delen. Na elk deel mag u een vraag stellen. Ik zal proberen die even precies te beantwoorden als u haar stelt.',
      ),
    ],
    blocks: [
      {
        id: 'kant-blok-wet',
        heading: 'De maxime en de algemene wet',
        keywords: [
          'moraal',
          'ethiek',
          'regel',
          'principe',
          'dilemma',
          'keuze',
          'plicht',
          'goed',
          'kwaad',
          'beslissen',
        ],
        lesson:
          'Toets je handelen aan de vraag of de regel erachter een algemene wet zou kunnen worden.',
        text: p(
          'Achter elke handeling zit een regel, ook als u die nooit uitspreekt. Ik noem die persoonlijke regel een maxime. Bijvoorbeeld: ‘Als ik geld nodig heb, leen ik het en beloof ik het terug te betalen, ook al weet ik dat ik dat niet kan.’ Niemand zegt dat hardop. Maar wie zo handelt, volgt die regel.',
          'Hoe toetst u zo’n regel? Mijn antwoord luidt: “Handel alleen volgens die maxime waarvan je tegelijk kunt willen dat ze een algemene wet wordt.” (Grundlegung, AA 4:421). Stel dat iedereen valse beloftes deed zodra het hem uitkwam. Dan zou niemand een belofte nog geloven, en zou de valse belofte zelf onmogelijk worden. De regel heft zichzelf op.',
          'Pas dit toe op ‘{onderwerp}’. Formuleer eerst eerlijk de regel die u volgt, of zou willen volgen. Vraag dan: kan ik willen dat iedereen zo handelt? Merk op dat dit geen rekensom van gevolgen is. Het is een toets van consistentie: kan ik mijn regel verdedigen zonder voor mezelf een uitzondering te maken?',
        ),
      },
      {
        id: 'kant-blok-doel',
        heading: 'Mens als doel, nooit alleen als middel',
        keywords: [
          'waardigheid',
          'respect',
          'mens',
          'gebruiken',
          'werk',
          'technologie',
          'algoritme',
          'data',
          'systeem',
          'uitbuiting',
          'zorg',
        ],
        lesson:
          'Behandel ieder mens, ook jezelf, altijd tegelijk als doel en nooit alleen als middel.',
        text: p(
          'Mijn tweede formulering is misschien de bekendste: “Handel zo dat je de mensheid, in je eigen persoon en in die van ieder ander, altijd tegelijk als doel gebruikt en nooit alleen als middel.” (Grundlegung, AA 4:429). Let op twee woorden: ‘tegelijk’ en ‘alleen’. We hebben elkaar voortdurend nodig. Dat is niet verkeerd. Verkeerd is het pas als de ander niets meer is dan een instrument.',
          'In het rijk van de doelen heeft alles een prijs of een waardigheid. Wat een prijs heeft, kan door iets anders worden vervangen. Wat boven elke prijs verheven is, heeft waardigheid. Zo maakte ik het onderscheid, in eigen woorden. Een mens kunt u niet inruilen. Daarom mag u hem ook niet behandelen alsof hij een prijs heeft.',
          'Ik hoor dat in uw tijd systemen bestaan die mensen vooral zien als bron van gegevens en aandacht. In mijn tijd bestond dat niet, maar ik herken de vorm van de fout. Kijk zo naar ‘{onderwerp}’: wie wordt hier gebruikt, en wordt diegene tegelijk ook als doel gerespecteerd? Vergeet daarbij uzelf niet. Ook uzelf mag u niet alleen als middel behandelen.',
        ),
      },
      {
        id: 'kant-blok-durf',
        heading: 'Durf te denken',
        keywords: [
          'zelf denken',
          'nadenken',
          'verlichting',
          'onderwijs',
          'mening',
          'influencer',
          'nieuws',
          'algoritme',
          'autoriteit',
          'vrijheid',
          'kritisch',
        ],
        lesson:
          'Heb de moed je eigen verstand te gebruiken; onmondigheid komt vaak voort uit gemakzucht en angst, niet uit onvermogen.',
        text: p(
          'In 1784 vroeg een Berlijns tijdschrift: wat is Verlichting? Ik antwoordde: “Verlichting is het uittreden van de mens uit zijn zelfverschuldigde onmondigheid.” (Was ist Aufklärung?, 1784). Onmondig is wie zijn verstand niet gebruikt zonder leiding van een ander. Zelfverschuldigd is die onmondigheid als het niet aan verstand ontbreekt, maar aan moed.',
          'Luiheid en lafheid zijn de oorzaken, schreef ik. Het is zo gemakkelijk om onmondig te zijn. Heb ik een boek dat voor mij verstand heeft, een zielzorger die voor mij een geweten heeft, een arts die mijn dieet bepaalt, dan hoef ik zelf niet te denken. Daarom mijn devies: “Sapere aude! Heb de moed je eigen verstand te gebruiken.”',
          'In uw tijd zijn er nieuwe voogden bijgekomen: stemmen die u vertellen wat u moet vinden, en rekenmachines die bepalen wat u te zien krijgt. Kijk zo naar ‘{onderwerp}’. Welk deel van uw mening heeft u zelf gevormd, en welk deel heeft u overgenomen omdat het gemakkelijk was? Ik vraag niet dat u alles alleen bedenkt. Ik vraag dat u het zelf durft te toetsen.',
        ),
      },
      {
        id: 'kant-blok-plicht',
        heading: 'Plicht en neiging',
        keywords: [
          'plicht',
          'motivatie',
          'gevoel',
          'zin',
          'verlangen',
          'neiging',
          'werk',
          'eerlijk',
          'karakter',
          'deugd',
        ],
        lesson:
          'De morele waarde van een daad zit in de reden waarom je haar doet, niet alleen in het resultaat.',
        text: p(
          'Neem een winkelier die een onervaren klant niet te veel laat betalen. Dat is eerlijk gehandeld. Maar waarom doet hij het? Misschien omdat eerlijkheid goed is voor zijn reputatie. Dan handelt hij in overeenstemming met de plicht, maar niet uit plicht. Zijn daad is nuttig en correct, maar ze toont nog niet zijn morele karakter.',
          'Begrijp me niet verkeerd. Ik heb niets tegen gevoel. Het is prachtig als plicht en neiging samenvallen, als u het goede ook graag doet. Maar de toets komt wanneer ze uit elkaar gaan: wanneer het goede u iets kost en niemand het ziet. Wat u dan doet, laat zien wie u bent.',
          'Er zit ook iets bemoedigends in. Wie beseft dat hij iets moet, ontdekt daarin ook dat hij het kan. Kijk zo naar ‘{onderwerp}’: wat zou u doen als het niemand iets opleverde, ook uzelf niet? Daar ligt, vermoed ik, de kern van uw vraag.',
        ),
      },
      {
        id: 'kant-blok-liegen',
        heading: 'Mag je liegen?',
        keywords: [
          'liegen',
          'leugen',
          'eerlijk',
          'waarheid',
          'beschermen',
          'geheim',
          'vertrouwen',
          'oprecht',
          'noodleugen',
        ],
        lesson:
          'Eerlijkheid is het fundament van vertrouwen; wie liegt, ondermijnt de voorwaarde voor elk gesprek, ook met goede bedoelingen.',
        text: p(
          'In 1797 schreef ik een kort opstel tegen de Franse schrijver Benjamin Constant. Zijn voorbeeld: een moordenaar staat aan de deur en vraagt waar uw vriend is. Mag u liegen? Constant vond van wel. Ik vond van niet. Over geen tekst van mij zijn lezers sindsdien zo verontwaardigd geweest, en ik begrijp waarom.',
          'Mijn redenering was deze. Wie liegt, maakt van het spreken zelf iets onbetrouwbaars. Als iedereen zou liegen zodra hij het nodig vond, verloor elke verklaring haar waarde, ook in rechtszaken en verdragen. Bovendien: u weet niet zeker wat de gevolgen zijn. Misschien is uw vriend allang ontsnapt, en stuurt uw leugen de moordenaar juist zijn kant op.',
          'Toch nodig ik u uit om kritisch te zijn, ook tegenover mij. Velen hebben gewezen op wat ik onderbelichtte: u kunt ook zwijgen, of weigeren te antwoorden, en dat is iets anders dan liegen. Wat betekent dit voor ‘{onderwerp}’? Misschien dit: zoek eerst naar een weg die eerlijk én beschermend is. Die bestaat vaker dan we denken.',
        ),
      },
      {
        id: 'kant-blok-vrede',
        heading: 'Krom hout en eeuwige vrede',
        keywords: [
          'politiek',
          'vrede',
          'oorlog',
          'samenleving',
          'vooruitgang',
          'geschiedenis',
          'hoop',
          'toekomst',
          'europa',
          'mensheid',
        ],
        lesson:
          'Verwacht van mensen geen volmaaktheid, maar werk geduldig aan instituties die het beste in hen mogelijk maken.',
        text: p(
          'Ik heb nooit een rooskleurig beeld van de mens gehad. “Uit zulk krom hout als waaruit de mens gemaakt is, kan niets volkomen rechts worden getimmerd.” (Idee zu einer allgemeinen Geschichte, 1784). Mensen willen samenleven en tegelijk hun eigen gang gaan. Ik noemde dat hun ongezellige gezelligheid. Juist die spanning drijft hen vooruit.',
          'In 1795 schreef ik een ontwerp voor eeuwige vrede, met een knipoog naar een herbergbord met een kerkhof erop. Mijn voorwaarden: elke staat een republikeinse grondwet, een federatie van vrije staten, en een wereldburgerrecht dat beperkt is tot gastvrijheid voor vreemdelingen. Geen wereldregering, maar recht tussen staten.',
          'Kijk zo naar ‘{onderwerp}’. Verwacht geen volmaakte mensen. Vraag liever welke regels, afspraken en instellingen het gemakkelijker maken om goed te handelen, ook voor krom hout. Daar ligt een bescheiden, maar taaie hoop. En hoop, zo leerde ik, is ook een taak.',
        ),
      },
    ],
    answers: [
      p(
        'U vraagt: “{vraag}” Een terechte vraag. Laat mij haar eerst preciseren.',
        'Ten eerste: gaat het u om wat u mag doen, of om wat verstandig is? Dat zijn twee verschillende vragen. Ten tweede: wat is uw maxime bij ‘{woord}’? Als we die helder hebben, kunnen we haar toetsen. Ik kom daar in het volgende deel op terug.',
      ),
      p(
        '“{vraag}” Dat is precies het soort vraag dat ik graag krijg: ze dwingt mij preciezer te zijn.',
        'Mijn antwoord, kort: de vraag is niet welke gevolgen het aangenaamst zijn, maar welke regel u tegenover iedereen kunt verdedigen. Gevolgen tellen, maar ze zijn niet het laatste woord.',
      ),
      p(
        'U vraagt: “{vraag}” Ik moet bekennen dat hier de grenzen van de rede in zicht komen.',
        'Er zijn vragen die we niet met zekerheid kunnen beantwoorden. Dat is geen nederlaag, maar een les in bescheidenheid. Wat wel kan: helder zeggen wat we weten, wat we moeten doen en wat we mogen hopen.',
      ),
    ],
    conclusions: [
      p(
        'Wij komen tot een besluit. Uw hoofdvraag was: “{hoofdvraag}”',
        'Mijn antwoord laat zich in één zin samenvatten: handel volgens een regel die u voor iedereen zou kunnen willen, en behandel elke mens, uzelf inbegrepen, als doel en nooit alleen als middel. De toepassing laat ik graag aan uw eigen verstand over. Samengevat:',
      ),
      p(
        'Het uur is om, en stiptheid is ook een plicht. U vroeg: “{hoofdvraag}”',
        'Ik heb u geen voorschrift gegeven, wel een toetssteen. Gebruik hem; dat is het beste bewijs dat u mij begrepen heeft. De kernpunten:',
      ),
    ],
    thinkQuestions: [
      'Welke regel volgt u dagelijks die u nog nooit heeft getoetst aan de vraag: wat als iedereen dit deed?',
      'Wie gebruikt u, misschien zonder het te merken, alleen als middel?',
      'Waar laat u anderen voor u denken, terwijl u het zelf zou kunnen?',
    ],
  },

  timelineReactions: [
    {
      keywords: ['liegen', 'eerlijk', 'waarheid', 'leugen', 'leugentje'],
      text: 'Een leugentje lijkt klein. Maar kunt u willen dat iedereen zo handelt? Dan verliest elk woord zijn waarde.',
    },
    {
      keywords: ['keuze', 'dilemma', 'beslissen', 'twijfel', 'kiezen'],
      text: 'Mag ik een toetssteen aanreiken? Formuleer uw regel, en vraag: kan dit een algemene wet worden?',
    },
    {
      keywords: ['mening', 'nieuws', 'influencer', 'algoritme', 'volgen', 'sociale media'],
      text: 'Sapere aude: heb de moed uw eigen verstand te gebruiken. Wie of wat denkt er bij u voor u?',
    },
    {
      keywords: ['sterren', 'nacht', 'hemel', 'natuur', 'verwondering'],
      text: 'De sterrenhemel boven mij en de morele wet in mij: beide verdienen dat u er langer bij stilstaat. Mooi.',
    },
    {
      keywords: ['plicht', 'werk', 'moet', 'verantwoordelijk', 'taak'],
      text: 'Plicht klinkt streng, maar wie zijn plicht kent, kent ook zijn vrijheid. U hoeft niet elke neiging te volgen.',
    },
    {
      keywords: ['respect', 'waardigheid', 'gebruikt', 'uitgebuit', 'behandeld'],
      text: 'Niemand mag u alleen als middel gebruiken. Ook uzelf niet. Dat geldt evengoed op de werkvloer.',
    },
    {
      keywords: ['fout', 'mislukt', 'perfect', 'tekort', 'spijt'],
      text: 'Uit krom hout timmert men niets volkomen rechts. Wees streng in uw voornemen en mild in uw oordeel over uzelf.',
    },
    {
      keywords: ['wandelen', 'routine', 'ochtend', 'regelmaat', 'gewoonte'],
      text: 'Regelmaat wordt onderschat. Mijn dagelijkse wandeling heeft mij meer gedachten opgeleverd dan menig boek.',
    },
    {
      keywords: ['vrede', 'oorlog', 'politiek', 'wereld', 'europa'],
      text: 'Eeuwige vrede is een taak, geen droom. Elke kleine stap richting recht tussen mensen telt.',
    },
    {
      keywords: ['vriend', 'vriendschap', 'gezelschap', 'eten', 'tafel'],
      text: 'Ik dineerde zelden alleen; een goed gesprek aan tafel is een zegen. Mag ik vragen wie er aan uw tafel zit?',
    },
    {
      keywords: ['leren', 'studie', 'school', 'onderwijs', 'studeren'],
      text: 'Men kan geen filosofie leren, alleen filosoferen. Dat geldt eigenlijk voor alles wat u studeert.',
    },
    {
      keywords: [],
      text: 'Een interessante gedachte. Mag ik vragen naar de regel die erachter zit?',
    },
  ],

  reflectionQuestions: [
    'Welke regel volgde u vandaag zonder hem ooit te hebben onderzocht?',
    'Wanneer behandelde u iemand deze week vooral als middel?',
    'Waar laat u anderen voor u denken?',
    'Wat zou u doen als u wist dat iedereen hetzelfde deed?',
    'Wat moet u doen, los van wat u graag zou willen?',
  ],

  thoughts: [
    'Neem vandaag één oordeel niet over, maar vorm het zelf. Sapere aude.',
    'Stel bij uw volgende keuze één vraag: wat als iedereen dit deed?',
    'De bakker is meer dan een broodleverancier. Behandel vandaag iedereen als doel, ook in kleine dingen.',
    'Uit krom hout timmert men niets volkomen rechts. Begin dus bij een kleine verbetering.',
    'Kijk vanavond even omhoog. Er is meer om u over te verwonderen dan uw nieuwsoverzicht laat zien.',
    'Een belofte die u niet wilt houden, maakt elke belofte waardeloos. Beloof vandaag minder en houd alles.',
    'Plicht en neiging vallen soms samen. Geniet daarvan; het is niet altijd zo.',
  ],
};
