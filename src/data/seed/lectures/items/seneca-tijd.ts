import type { ExampleLecture } from '../../../types';

const p = (...parts: string[]) => parts.join('\n\n');

const lecture: ExampleLecture = {
  id: 'vb-seneca-tijd',
  figureId: 'seneca',
  topic: 'De kortheid van het leven',
  mainQuestion: 'Is het leven echt te kort, of gaan we er alleen slecht mee om?',
  title: 'Is het leven kort, of verspillen we het?',
  tags: ['tijd', 'leven', 'uitstellen', 'stoïcijnse filosofie', 'zin'],
  publishedAt: '2026-09-18T20:00:00.000Z',
  furtherReading: [1, 0],
  segments: [
    {
      kind: 'opening',
      heading: 'Opening',
      text: p(
        'Welkom, vriend. Ik schrijf dit college zoals ik mijn brieven aan Lucilius schreef: aan één mens tegelijk, ook al lezen er later velen mee. Je vraagt mij of het leven echt te kort is, of dat we er alleen slecht mee omgaan. Dat is precies de vraag waarover ik een heel essay schreef, aan mijn vriend Paulinus, die de graanvoorziening van Rome beheerde en geen tijd meer had om te leven.',
        'Laat mij eerst eerlijk zijn over wie hier tot je spreekt. Ik schreef over eenvoud terwijl ik een van de rijkste mannen van Rome was. Ik schreef over vrijheid terwijl ik jarenlang een gewelddadige keizer diende. Mijn tijdgenoten hebben me dat verweten, en ze hadden niet helemaal ongelijk. Neem mijn woorden dus aan als die van een medeleerling, niet als die van iemand die het al kan.',
        'We gaan in drie stappen: waarom het leven niet kort is, waarom bezig zijn nog geen leven is, en hoe je je tijd terugwint.',
      ),
    },
    {
      kind: 'deel',
      heading: 'Het leven is niet kort',
      text: p(
        'Bijna iedereen klaagt, zelfs de wijzen: de natuur geeft ons zo weinig tijd, en wat we krijgen, vliegt voorbij. Maar ik geloof dat niet. “Het is niet zo dat we weinig tijd hebben; we verspillen er veel van.” (Over de kortheid van het leven 1.3). Het leven is lang genoeg, en ruim gegeven om er grote dingen mee te doen, als het in zijn geheel goed wordt besteed.',
        'Kijk eens hoe zorgvuldig mensen zijn met hun geld. Niemand geeft zomaar zijn munten weg aan een voorbijganger. Wie zijn landgoed laat inpikken, stapt naar de rechter. Maar onze tijd laten we ons door iedereen afnemen, zonder protest, alsof het niets kost. Mensen zijn gierig met hun bezit, en verkwistend met het enige waarmee gierigheid eervol zou zijn.',
        'Waarom? Omdat tijd onzichtbaar is. Je ziet geen stapel uren slinken zoals je een geldbuidel ziet leeglopen. Pas aan het einde, als iemand ziek wordt of oud, schrikt hij: waar is het gebleven? Dan belooft hij dat hij, als hij beter wordt, rustiger zal leven. Maar dan is het vaak te laat.',
        'Probeer eens een rekensom. Hoeveel van je uren gaan naar dingen die je zelf hebt gekozen, en hoeveel naar wat anderen van je vragen, naar wachten, naar gewoonten die je nooit hebt onderzocht? Ik vermoed dat je, net als de meeste Romeinen, schrikt van de uitkomst. Niet omdat je lui bent, maar omdat je nooit hebt gekeken.',
      ),
    },
    {
      kind: 'deel',
      heading: 'Bezig zijn is nog geen leven',
      text: p(
        'Er is een soort mensen dat ik de drukbezetten noem. Ze rennen van de ene verplichting naar de andere, van de ene receptie naar de volgende, van rechtszaak naar feestmaal. Ze hebben het altijd druk, en toch zijn ze niet bezig met leven. Ze bestaan, maar ze leven niet. Een lange tijd hebben ze niet geleefd, ze zijn er alleen lang geweest.',
        'Het gevaarlijkste is het uitstel. Mensen zeggen: als ik vijftig ben, ga ik rustiger leven; als ik zestig ben, neem ik vrij. Wie garandeert je dat je die leeftijd haalt? En wie garandeert dat het dan nog lukt? In mijn eerste brief aan Lucilius schreef ik: “Terwijl het wordt uitgesteld, rent het leven voorbij.” (Brieven aan Lucilius 1.2). Je stelt het leven uit tot later, en intussen is het al begonnen en aan het eindigen.',
        'In diezelfde brief gaf ik hem een opdracht, in eigen woorden: eis jezelf voor jezelf op. Verzamel de tijd die je tot nu toe werd ontnomen, gestolen of die je ontglipte, en bewaar die. Het meeste van onze tijd verliezen we niet in grote rampen, maar in kleine lekken: een gesprek dat niets oplevert, een gewoonte die niemand meer dient, een uur waarin we niets doen en niets voelen.',
        'Ik hoor dat jullie apparaten hebben die je de hele dag iets te doen geven. In mijn tijd bestond dat niet, maar de drukbezetten van Rome hadden hun eigen afleidingen. Het principe is hetzelfde: wie altijd bezig is, heeft nooit tijd om te vragen waarvoor.',
      ),
    },
    {
      kind: 'deel',
      heading: 'Hoe je je tijd terugwint',
      text: p(
        'Wat kun je doen? Ik geef je drie gewoonten die ik zelf beoefende, met wisselend succes.',
        'Ten eerste: een avondonderzoek. Ik leerde het van de filosoof Sextius. Als het licht uit is en mijn vrouw, die mijn gewoonte kent, stil is geworden, overloop ik mijn hele dag. Wat heb ik vandaag goed gedaan? Waar ben ik tekortgeschoten? Waar heb ik tijd verloren aan iets wat het niet waard was? Ik verberg niets voor mezelf, en ik sla niets over. Wie zo elke avond rekenschap aflegt, merkt sneller waar zijn uren heen gaan.',
        'Ten tweede: lees weinig, maar goed. Wie overal is, is nergens, schreef ik aan Lucilius. Wie zijn leven doorbrengt met reizen, heeft veel gastvrijheid en geen vrienden. Zo is het ook met lezen en met kijken. Kies een paar schrijvers bij wie je terugkeert, en laat de rest gerust voorbijgaan.',
        'Ten derde: begin vandaag met wat je uitstelt. Niet omdat het makkelijk is, maar juist omdat het moeilijk lijkt. “Niet omdat het moeilijk is, durven we niet; omdat we niet durven, is het moeilijk.” (Brieven aan Lucilius 104.26). Vaak is de moeilijkheid een schaduw die groter wordt naarmate je er langer naar kijkt.',
        'Ik heb het zelf niet altijd gekund. Toen Nero mij liet weten dat ik moest sterven, had ik niet alles gedaan wat ik me had voorgenomen. Maar ik had wel geleerd dat een leven niet wordt gemeten aan zijn lengte, maar aan zijn volheid. Het is niet belangrijk hoe lang je leeft, maar hoe goed.',
      ),
    },
    {
      kind: 'conclusie',
      heading: 'Conclusie',
      text: p(
        'Je vroeg: is het leven echt te kort, of gaan we er alleen slecht mee om? Mijn antwoord: het leven is lang genoeg, als we het niet verspillen. We zijn zuinig met ons geld en kwistig met onze tijd, we verwarren bezig zijn met leven, en we stellen het leven uit tot later. Wie zijn tijd opeist, elke avond rekenschap aflegt en vandaag begint met wat hij uitstelt, zal merken dat het leven niet kort is, maar ruim.',
        '**Kernlessen**\n1. Het leven is niet kort, we verspillen er veel van: wees zo zuinig met je tijd als met je geld.\n2. Bezig zijn is nog geen leven; wie alles uitstelt tot later, laat het leven voorbijrennen.\n3. Win je tijd terug met een avondonderzoek, met minder maar beter lezen, en door vandaag te beginnen met wat je uitstelt.',
        '**Denkvraag**\nWaar lekte deze week de meeste tijd weg zonder dat je het merkte, en wat zou je met dat uur willen doen?',
      ),
    },
  ],
};

export default lecture;
