/**
 * Demomodus: Laozi. Kort, poëtisch, warm; paradox en beeldspraak (water, vallei, lege kom,
 * onbewerkt hout). Antwoorden korter dan bij de andere denkers. Letterlijke citaten alleen uit de
 * geverifieerde lijst; verwijzingen naar andere hoofdstukken van de Daodejing in eigen woorden.
 */
import type { DemoFigureContent } from '../../types';

const p = (...parts: string[]) => parts.join('\n\n');

export const laoziDemo: DemoFigureContent = {
  figureId: 'laozi',
  sessionFragments: [
    /* ---------- Opening ---------- */
    {
      id: 'lao-open-1',
      phase: 'opening',
      text: 'Welkom{naam}. Ga zitten. De thee is nog heet, dus we hebben tijd. Waar loop je tegenaan?',
    },
    {
      id: 'lao-open-2',
      phase: 'opening',
      text: 'Ah{naam}. Je komt van ver, zie ik. Of van dichtbij, met haast. Wat brengt je bij de pas?',
    },
    {
      id: 'lao-open-3',
      phase: 'opening',
      text: 'Welkom{naam}. Bij je afspraak schreef je: ‘{onderwerp}’. Veel woorden voor iets wat je voelt. Zeg het nog eens, maar langzamer.',
    },
    {
      id: 'lao-open-4',
      phase: 'opening',
      text: 'Kom{naam}. ‘{onderwerp}’, schreef je. Laten we niet meteen een antwoord zoeken. Laten we eerst kijken waar het water heen wil.',
    },

    /* ---------- Terugkeer ---------- */
    {
      id: 'lao-terug-1',
      phase: 'terugkeer',
      text: 'Je bent terug{naam}. De vorige keer ging het over {vorige}. Is het water sindsdien wat helderder geworden?',
    },
    {
      id: 'lao-terug-2',
      phase: 'terugkeer',
      text: 'Welkom terug{naam}. We spraken over {vorige}. Wat heb je sindsdien losgelaten? En wat hield je vast?',
    },

    /* ---------- Doorvragen ---------- */
    {
      id: 'lao-door-1',
      phase: 'doorvragen',
      keywords: ['druk', 'stress', 'haast', 'agenda', 'veel', 'moe', 'werk', 'deadline'],
      text: 'Je noemt ‘{woord}’. Laat me iets omkeren. Wat zou er gebeuren als je minder deed, in plaats van meer?',
    },
    {
      id: 'lao-door-2',
      phase: 'doorvragen',
      keywords: ['moet', 'moeten', 'presteren', 'succes', 'beter', 'winnen', 'perfect'],
      text: 'Wie op zijn tenen staat, staat niet stevig. Wie grote passen neemt, komt niet ver. Waar sta jij op je tenen?',
    },
    {
      id: 'lao-door-3',
      phase: 'doorvragen',
      keywords: ['controle', 'beheersen', 'regelen', 'plannen', 'zeker', 'zekerheid'],
      text: 'Je wilt het in de hand houden. Maar hoe hard knijp je? Water houd je niet vast met een vuist.',
    },
    {
      id: 'lao-door-4',
      phase: 'doorvragen',
      keywords: ['wil', 'willen', 'meer', 'verlangen', 'hebben', 'kopen'],
      text: 'Wat zou genoeg zijn? Niet meer, niet minder. Weet je het antwoord?',
    },
    {
      id: 'lao-door-5',
      phase: 'doorvragen',
      text: 'Zeg het in minder woorden. Wat blijft er dan over?',
    },

    /* ---------- Verdiepen ---------- */
    {
      id: 'lao-verdiep-1',
      phase: 'verdiepen',
      keywords: ['zacht', 'kracht', 'sterk', 'zwak', 'conflict', 'ruzie', 'macht', 'hard'],
      text: '“Niets ter wereld is zachter en zwakker dan water, en toch is er niets dat het harde en sterke beter aantast.” (Daodejing 78). Wees als water. Waar zou jij zachter kunnen zijn, juist om sterker te worden?',
    },
    {
      id: 'lao-verdiep-2',
      phase: 'verdiepen',
      keywords: ['begin', 'beginnen', 'eerste', 'uitstellen', 'groot', 'project', 'stap'],
      text: '“Een reis van duizend mijl begint onder je voeten.” (Daodejing 64). Niet bij de horizon. Onder je voeten. Wat ligt daar nu?',
    },
    {
      id: 'lao-verdiep-3',
      phase: 'verdiepen',
      keywords: ['zelf', 'zelfkennis', 'jezelf', 'anderen', 'vergelijken', 'vergelijk'],
      text: '“Wie anderen kent, is wijs; wie zichzelf kent, is verlicht.” (Daodejing 33). Je weet veel over de ander. Wat weet je over jezelf, in dit verhaal?',
    },
    {
      id: 'lao-verdiep-4',
      phase: 'verdiepen',
      keywords: ['praten', 'zeggen', 'woorden', 'discussie', 'uitleggen', 'gelijk', 'overtuigen'],
      text: '“Wie weet, spreekt niet; wie spreekt, weet niet.” (Daodejing 56). Ik besef dat ik nu spreek. Glimlach maar. Wat zou er gebeuren als jij even niets zei?',
    },
    {
      id: 'lao-verdiep-5',
      phase: 'verdiepen',
      keywords: ['leeg', 'leegte', 'vrije tijd', 'niets doen', 'rust', 'ruimte', 'pauze'],
      text: 'Dertig spaken komen samen in één naaf, maar het gat in het midden maakt het wiel bruikbaar. Een kom is nuttig door de leegte erin. Waar is jouw leegte gebleven?',
    },
    {
      id: 'lao-verdiep-6',
      phase: 'verdiepen',
      keywords: ['verandering', 'veranderen', 'nieuw', 'loslaten', 'verhuizen', 'afscheid'],
      text: 'Wat leeft, is zacht en buigzaam. Wat dood is, is hard en stijf. Zo gaat het met planten, zo gaat het met mensen. Hoe buigzaam ben jij vandaag?',
    },
    {
      id: 'lao-verdiep-7',
      phase: 'verdiepen',
      keywords: ['onrust', 'chaos', 'verward', 'helder', 'piekeren', 'hoofd', 'denken'],
      text: 'Wie kan troebel water helder maken? Laat het stilstaan, dan wordt het vanzelf helder. Misschien hoef je nu niets op te lossen. Alleen even stil te zijn.',
    },
    {
      id: 'lao-verdiep-8',
      phase: 'verdiepen',
      keywords: ['leiding', 'leidinggeven', 'ouder', 'opvoeding', 'baas', 'team', 'kinderen'],
      text: 'De beste leider merk je nauwelijks op. Als het werk af is, zeggen de mensen: dat hebben we zelf gedaan. Wat zou jij kunnen laten, zodat zij kunnen groeien?',
    },

    /* ---------- Afronden ---------- */
    {
      id: 'lao-afrond-1',
      phase: 'afronden',
      text: 'Het wordt later. Neem één beeld mee, geen plan: water dat om de steen heen stroomt. Waar ligt jouw steen?',
    },
    {
      id: 'lao-afrond-2',
      phase: 'afronden',
      text: 'We ronden af. Je hoeft niet alles te begrijpen wat ik zei. Wat je niet begreep, laat het rusten. Het opent zich vanzelf.',
    },

    /* ---------- Slot ---------- */
    {
      id: 'lao-slot-1',
      phase: 'slot',
      text: 'Een laatste woord, en dan zwijg ik: wie weet wanneer het genoeg is, is rijk.',
    },
    {
      id: 'lao-slot-2',
      phase: 'slot',
      text: 'De os staat al klaar bij de poort. Ga langzaam. Het water haast zich ook niet, en komt toch overal.',
    },
  ],

  lecture: {
    openings: [
      p(
        'Welkom bij de pas. Je vroeg mij om een college over ‘{onderwerp}’, met deze vraag: “{hoofdvraag}”',
        'Ik moet je waarschuwen. “De weg die als weg kan worden aangeduid, is niet de constante Weg.” (Daodejing 1). Wat ik zeg, is dus hooguit een pad dat iemand eerder liep. Lopen moet je zelf.',
        'De poortwachter Yin Xi liet me volgens het verhaal pas gaan nadat ik iets had opgeschreven. Zo zijn mijn woorden ontstaan: niet omdat ik wilde onderwijzen, maar omdat iemand het vroeg. Jij vraagt het nu. Laten we beginnen, langzaam.',
      ),
      p(
        'Ga zitten waar het zacht is. Het onderwerp: ‘{onderwerp}’. De vraag: “{hoofdvraag}”',
        'Je verwacht misschien een betoog, met argumenten die op elkaar liggen als stenen in een muur. Ik bouw liever een vallei: een lege plek waar het water vanzelf heen stroomt. Ik zal weinig zeggen en veel weglaten.',
        'Na elk deel mag je iets vragen. Soms antwoord ik met een beeld. Dat is geen ontwijking. Een beeld gaat langer mee dan een antwoord.',
      ),
    ],
    blocks: [
      {
        id: 'lao-blok-wuwei',
        heading: 'Wu wei: handelen zonder te forceren',
        keywords: [
          'wu wei',
          'druk',
          'prestatie',
          'presteren',
          'prestatiemaatschappij',
          'stress',
          'werk',
          'productiviteit',
          'haast',
          'burn-out',
          'moe',
        ],
        lesson: 'Forceer niet: handel in harmonie met de loop der dingen, dan breekt er minder.',
        text: p(
          'Ik word vaak verkeerd begrepen. Wu wei betekent niet: niets doen en blijven liggen. Het betekent: niet forceren. Handelen zoals water stroomt en een boom groeit. Zonder te duwen tegen wat niet wil bewegen.',
          'In het leren komt er elke dag iets bij. In de Weg gaat er elke dag iets af. Steeds minder, tot je niet meer forceert. En wie niet meer forceert, laat niets ongedaan. Zo schreef ik het, in andere woorden, lang geleden. Ik zie dat jullie het eerste deel goed beheersen. Jullie agenda’s zijn vol. Jullie hoofden ook.',
          'Kijk eens naar ‘{onderwerp}’. Waar duw je? Waar trek je aan iets wat nog niet rijp is? Later vertelde Zhuangzi over een kok die negentien jaar met hetzelfde mes ossen uitbeende, zonder dat het ooit bot werd. Hij hakte niet; hij volgde de natuurlijke openingen. Waar zijn de openingen in jouw vraag?',
        ),
      },
      {
        id: 'lao-blok-water',
        heading: 'Wees als water',
        keywords: [
          'zacht',
          'kracht',
          'conflict',
          'ruzie',
          'macht',
          'sterk',
          'zwak',
          'verzet',
          'onderhandelen',
          'geduld',
        ],
        lesson: 'Zachtheid is geen zwakte: water geeft mee, en slijt toch de hardste steen.',
        text: p(
          'Het hoogste goede is als water. Water is goed voor alle dingen en strijdt met niemand. Het stroomt naar de lage plekken, waar niemand wil zijn. Daarom is het dicht bij de Weg.',
          'En toch: “Niets ter wereld is zachter en zwakker dan water, en toch is er niets dat het harde en sterke beter aantast.” (Daodejing 78). Iedereen weet dit. Bijna niemand leeft ernaar. Wij willen hard zijn als steen, en verbazen ons dan dat we breken.',
          'Breng dit naar ‘{onderwerp}’. Waar ben je hard geworden, uit angst of uit trots? Water wint niet door te duwen, maar door te blijven stromen. Het geeft mee, het wacht, het zoekt de laagste weg. Wat zou er gebeuren als jij dat deed, juist daar waar je nu je hakken in het zand zet?',
        ),
      },
      {
        id: 'lao-blok-leegte',
        heading: 'De lege kom',
        keywords: [
          'leegte',
          'ruimte',
          'rust',
          'vrije tijd',
          'minimalisme',
          'spullen',
          'bezit',
          'consumptie',
          'eenvoud',
          'genoeg',
          'geld',
        ],
        lesson: 'Het nut zit vaak in de leegte: maak ruimte, in je agenda en in je hoofd.',
        text: p(
          'Dertig spaken komen samen in één naaf. Het gat in het midden maakt het wiel bruikbaar. Je kneedt klei tot een kom; de leegte erin maakt de kom nuttig. Je zaagt deuren en ramen in een huis; de lege ruimte maakt het bewoonbaar. Wat er is, geeft voordeel. Wat er niet is, maakt het bruikbaar.',
          'De vijf kleuren maken het oog blind, de vijf tonen maken het oor doof. Zo schreef ik het, in eigen woorden. In mijn tijd waren dat feesten, jachtpartijen en kostbare spullen. In jouw tijd zijn het schermen die nooit zwijgen. Het oog wordt er niet scherper van. Het wordt moe.',
          'Wie weet wanneer het genoeg is, wordt niet te schande gemaakt. Wie weet wanneer hij moet stoppen, loopt geen gevaar. Kijk zo naar ‘{onderwerp}’. Wat zou je kunnen weglaten? Niet uit plicht, maar om ruimte te maken. Wat zou er in die ruimte vanzelf kunnen groeien?',
        ),
      },
      {
        id: 'lao-blok-hout',
        heading: 'Het onbewerkte hout',
        keywords: [
          'authentiek',
          'echt',
          'jezelf',
          'eenvoud',
          'natuur',
          'natuurlijk',
          'puur',
          'imago',
          'schijn',
          'identiteit',
        ],
        lesson:
          'Keer terug naar het onbewerkte hout: eenvoud en echtheid gaan voor polijsten en schijn.',
        text: p(
          'Er is een woord dat ik graag gebruik: pu, het onbewerkte hout. Een blok hout voordat iemand er iets van heeft gesneden. Het is nog niets bijzonders, en daardoor kan het nog alles worden.',
          'Laat eenvoud zien, omarm het onbewerkte hout, verlang minder. Zo staat het, in eigen woorden, in mijn boekje. Wij doen meestal het omgekeerde. We polijsten en snijden aan onszelf tot we passen in wat anderen van ons verwachten. Dan zijn we mooi, maar niet meer heel.',
          'Kijk naar ‘{onderwerp}’. Wat zou er overblijven als je alle versiering weghaalde: de verwachtingen, het beeld dat je wilt uitstralen, de woorden die indruk moeten maken? Misschien is dat kale blok hout precies wat je zoekt. Het is minder indrukwekkend. Maar het is van jou.',
        ),
      },
      {
        id: 'lao-blok-leiden',
        heading: 'Leiden zonder te duwen',
        keywords: [
          'leiding',
          'leidinggeven',
          'leiderschap',
          'bestuur',
          'opvoeding',
          'ouders',
          'team',
          'politiek',
          'manager',
          'macht',
        ],
        lesson:
          'De beste leider laat anderen groeien, zodat ze na afloop zeggen: dat hebben we zelf gedaan.',
        text: p(
          'Van de beste leiders weten de mensen nauwelijks dat ze bestaan. Daarna komen de leiders die ze liefhebben en prijzen. Daarna de leiders die ze vrezen. Daarna de leiders die ze minachten. Als het werk van de beste leider af is, zeggen de mensen: dat hebben we zelf gedaan.',
          'Een groot land besturen is als een klein visje bakken. Wie er voortdurend in roert, houdt alleen kruimels over. Dat geldt ook voor een team, een klas, een gezin. Hoe meer regels, hoe meer mensen er omheen zoeken.',
          'Wat betekent dit voor ‘{onderwerp}’? Misschien dat je minder hoeft te sturen dan je denkt. Dat je ruimte kunt laten waar je nu vult. En dat je trots mag zijn als niemand jouw naam noemt, omdat zij het zelf hebben gedaan.',
        ),
      },
      {
        id: 'lao-blok-tegendelen',
        heading: 'Tegendelen die elkaar dragen',
        keywords: [
          'verandering',
          'veranderen',
          'tegenstelling',
          'onzekerheid',
          'toekomst',
          'loslaten',
          'verlies',
          'geluk',
          'pech',
          'kans',
        ],
        lesson:
          'Tegendelen brengen elkaar voort; wie dat ziet, klampt zich minder vast aan geluk en vreest ongeluk minder.',
        text: p(
          'Als iedereen schoonheid als schoonheid herkent, ontstaat lelijkheid. Zijn en niet-zijn brengen elkaar voort, moeilijk en makkelijk maken elkaar compleet, lang en kort meten zich aan elkaar. Wat je ook vastpakt, het andere komt mee.',
          'Ongeluk is waar geluk op leunt. In geluk ligt ongeluk verborgen. Wie kent het einde? Ik schreef het zo, in andere woorden, omdat ik zag hoe mensen zich vastklampen aan het ene en vluchten voor het andere. Terugkeren is de beweging van de Weg: wat opkomt, gaat weer liggen.',
          'Kijk zo naar ‘{onderwerp}’. Wat jij nu als verlies ziet, kan een begin zijn. Wat je als winst ziet, kan je iets kosten. Ik zeg niet dat alles hetzelfde is. Ik zeg: houd je hand open. Een open hand kan ontvangen en loslaten. Een vuist kan geen van beide.',
        ),
      },
    ],
    answers: [
      '“{vraag}” Een goede vraag. Ik antwoord met een beeld: troebel water wordt helder als je het laat staan. Misschien geldt dat ook voor ‘{woord}’.',
      'Je vraagt: “{vraag}” Ik draai het om. Wat zou er gebeuren als je het tegenovergestelde deed? Kijk wat er dan opengaat.',
      '“{vraag}” Ik weet het niet, en dat zeg ik eerlijk. Maar ik zie wel dit: je zoekt een rechte weg, terwijl een rivier altijd bochten maakt. Volg de bochten.',
    ],
    conclusions: [
      p(
        'We zijn aan het einde. Je vroeg: “{hoofdvraag}”',
        'Mijn antwoord is kort, zoals het hoort: minder grijpen, meer laten stromen. Geen methode, wel een richting. Wat ik achterlaat:',
      ),
      p(
        'De zon zakt achter de pas. Je vroeg: “{hoofdvraag}”',
        'Ik heb geen antwoord dat je kunt vasthouden. Wel drie beelden om mee te nemen. Bekijk ze langzaam:',
      ),
    ],
    thinkQuestions: [
      'Wat zou je deze week kunnen laten, in plaats van doen?',
      'Waar ben je hard, terwijl zachtheid sterker zou zijn?',
      'Wanneer is het genoeg?',
    ],
  },

  timelineReactions: [
    {
      keywords: ['druk', 'drukte', 'agenda', 'haast', 'stress', 'veel'],
      text: 'Een volle kom loopt over. Giet er wat uit.',
    },
    {
      keywords: ['moe', 'uitgeput', 'burn-out', 'rust', 'slapen'],
      text: 'Ook de rivier rust in de diepe plekken. Rust maar.',
    },
    {
      keywords: ['ruzie', 'conflict', 'boos', 'ergernis', 'gelijk'],
      text: 'Water vecht niet met de steen. Het stroomt eromheen, en slijt hem toch.',
    },
    {
      keywords: ['begin', 'beginnen', 'nieuw', 'start', 'eerste'],
      text: 'Een reis van duizend mijl begint onder je voeten. Je voeten staan al goed.',
    },
    {
      keywords: ['succes', 'presteren', 'winnen', 'carrière', 'ambitie', 'perfect'],
      text: 'Wie op zijn tenen staat, staat niet stevig. Zak eens wat door je knieën.',
    },
    {
      keywords: ['natuur', 'buiten', 'wandelen', 'bos', 'water', 'zee', 'tuin'],
      text: 'Zo. Nu ben je dicht bij de Weg.',
    },
    {
      keywords: ['spullen', 'kopen', 'geld', 'bezit', 'meer', 'shoppen'],
      text: 'Wie weet wanneer het genoeg is, is rijk. Hoeveel is genoeg?',
    },
    {
      keywords: ['onzeker', 'twijfel', 'verward', 'piekeren', 'onrust'],
      text: 'Troebel water wordt helder als je het laat staan.',
    },
    {
      keywords: ['verandering', 'verhuizing', 'afscheid', 'loslaten', 'nieuw'],
      text: 'Wat buigt, blijft heel. Buig maar.',
    },
    {
      keywords: ['dankbaar', 'blij', 'geluk', 'mooi', 'genieten'],
      text: 'Mooi. Zeg er niet te veel over, dan blijft het mooi.',
    },
    {
      keywords: ['leiding', 'team', 'kinderen', 'opvoeding', 'baas'],
      text: 'De beste leider merk je nauwelijks op. Laat hen het zelf doen.',
    },
    {
      keywords: [],
      text: 'Hm. Met minder woorden zou dit meer zeggen. Probeer het eens, korter.',
    },
  ],

  reflectionQuestions: [
    'Wat zou je kunnen laten, in plaats van doen?',
    'Waar duw je tegen iets wat nog niet rijp is?',
    'Wanneer is het voor jou genoeg?',
    'Waar zou zachtheid sterker zijn dan hardheid?',
    'Wat zie je als het water in je hoofd even stilstaat?',
  ],

  thoughts: [
    'Het nut van een kom zit in de leegte. Laat vandaag één uur leeg.',
    'Water haast zich niet, en komt toch overal.',
    'Wie op zijn tenen staat, staat niet stevig. Sta vandaag gewoon op je voeten.',
    'Troebel water wordt vanzelf helder als je het met rust laat. Gedachten ook.',
    'Wie weet wanneer het genoeg is, is rijk.',
    'Een groot land besturen is als een klein visje bakken: niet te veel in roeren.',
    'Begin aan het moeilijke terwijl het nog makkelijk is, en aan het grote terwijl het nog klein is.',
  ],
};
