import type { ExampleLecture } from '../../../types';

const p = (...parts: string[]) => parts.join('\n\n');

const lecture: ExampleLecture = {
  id: 'vb-socrates-agora',
  figureId: 'socrates',
  topic: 'Is sociale media een agora?',
  mainQuestion: 'Maakt sociale media ons wijzer, zoals een gesprek op de agora, of alleen luider?',
  title: 'Is sociale media een agora?',
  tags: ['sociale media', 'dialoog', 'waarheid', 'democratie', 'kennis'],
  publishedAt: '2026-09-21T09:00:00.000Z',
  furtherReading: [0, 4, 3],
  segments: [
    {
      kind: 'opening',
      heading: 'Opening',
      text: p(
        'Welkom, mijn vriend. Ga zitten op de trede; de steen is warm van de zon. Je vroeg mij of sociale media een agora is, en of het ons wijzer maakt of alleen luider. Ik moet je meteen iets bekennen: ik heb nog nooit een bericht geplaatst. Ik heb zelfs nooit een boek geschreven. Alles wat je van mij weet, komt van Plato, van Xenophon en van een komediedichter die mij belachelijk maakte. Je vraagt dus een man zonder pen om iets te zeggen over een wereld vol pennen.',
        'Toch denk ik dat ik iets kan bijdragen, juist daarom. Ik heb mijn hele leven op de agora doorgebracht, het plein van Athene waar gekocht en verkocht werd, waar politici spraken en waar ik iedereen aanklampte die maar wilde luisteren. Als jullie nieuwe plein daarop lijkt, dan ken ik zijn gevaren en zijn beloften.',
        'Waarom doet deze vraag ertoe? Omdat jullie er elke dag een paar uur doorbrengen, als ik de verhalen goed begrijp. Wat je dagelijks doet, vormt je. Een mens wordt wat hij herhaalt. Laten we dus onderzoeken wat dit plein van je maakt, in drie stappen: wat de agora werkelijk was, wat er gebeurt met woorden die niet kunnen antwoorden, en hoe je van een luid plein toch een plek van onderzoek maakt.',
      ),
    },
    {
      kind: 'deel',
      heading: 'Wat was de agora eigenlijk?',
      text: p(
        'Stel je een groot plein voor, omzoomd door zuilengangen. Onder de bomen verkopen boeren hun vijgen, een schoenmaker repareert sandalen, een groepje jongemannen luistert naar een sofist die voor veel geld leert hoe je elke discussie wint. Verderop staan de beelden van onze helden, de gebouwen van de raad, de rechtbank. Iedereen komt er langs. Wie iets te zeggen heeft, zegt het daar.',
        'Wat deed ik er? Ik stelde vragen. Ik vroeg een generaal wat moed is, een priester wat vroomheid is, een politicus wat rechtvaardigheid is. Meestal begonnen ze vol zelfvertrouwen. Na een paar vragen raakten ze in de war, want hun antwoorden spraken elkaar tegen. Sommigen werden boos. Anderen werden nieuwsgierig. Een paar jongemannen gingen me achterna om te zien hoe ik het deed, wat me later duur kwam te staan.',
        'Let goed op wat hier gebeurde, want daar zit het verschil met jullie plein. Op de agora stond ik tegenover één mens. Ik zag zijn gezicht, ik hoorde zijn aarzeling. Als hij iets zei wat ik niet begreep, vroeg ik: wat bedoel je daarmee? En hij moest antwoorden, ter plekke, met mij en de omstanders als getuigen. Een bewering kon niet wegvliegen. Ze werd vastgehouden, omgedraaid en onderzocht, tot we wisten wat ze waard was.',
        'Er was nog iets. Het gesprek had een tempo. Een dialoog duurt een middag, soms langer. Toen ik als soldaat bij Potidaea lag, bleef ik eens van de ochtend tot de volgende ochtend staan, verdiept in één vraag. Ik zeg niet dat jullie dat moeten doen. Maar een gedachte die nooit tijd krijgt, kan ook niet rijpen.',
        'De agora was dus geen paradijs. Er werd gelogen, gevleid en geroddeld, net als overal. Maar ze bood iets kostbaars: de mogelijkheid om iemand recht in de ogen te kijken en te vragen of hij weet wat hij zegt. Bewaart jullie plein die mogelijkheid? Dat is de vraag die we nu moeten stellen.',
      ),
    },
    {
      kind: 'deel',
      heading: 'Woorden die niet kunnen antwoorden',
      text: p(
        'Plato laat mij in een van zijn dialogen, de Faidros, een oud Egyptisch verhaal vertellen. De god Theuth vond het schrift uit en bood het trots aan koning Thamus aan. Dit zal de Egyptenaren wijzer maken, zei hij, en hun geheugen verbeteren. De koning was niet onder de indruk. Integendeel, zei hij: wie op het schrift vertrouwt, zal vergeten. Hij krijgt niet de wijsheid zelf, maar de schijn ervan. Hij zal veel gelezen hebben zonder onderricht, en denken dat hij veel weet, terwijl hij meestal niets weet.',
        'En dan het belangrijkste bezwaar. Een geschreven woord lijkt op een schilderij: het lijkt te leven, maar als je het iets vraagt, zwijgt het plechtig. Of het geeft steeds hetzelfde antwoord. Het kan zich niet verdedigen als het verkeerd begrepen wordt, en het kan niet kiezen tot wie het spreekt. Het zwerft rond, bij wie het begrijpt en bij wie het niet begrijpt.',
        'Als ik jullie nieuwe plein goed begrijp, dan is het precies dat: een zee van geschreven woorden die rondzwerven zonder hun schrijver. Een bericht wordt gedeeld door mensen die het niet hebben gelezen, met mensen die het niet kunnen bevragen. De woorden reizen sneller dan ooit, maar de vraag ‘wat bedoel je daarmee?’ reist niet mee.',
        'Daar komt nog iets bij. In een andere dialoog, de Gorgias, vergeleek ik de kunst van het overtuigen met de kookkunst. Een kok maakt wat lekker is; een arts maakt wat gezond is. Als een kok en een arts voor een groep kinderen moesten wedijveren wie het beste eten aanbiedt, zou de arts verhongeren. Zo gaat het ook met redenaars: wie vleit, wint het van wie de waarheid zegt, zolang het publiek geen tijd heeft om na te denken.',
        'Ik vermoed dat jullie plein vooral koks beloont. Wat smaakt, wordt gedeeld; wat schuurt, verdwijnt. Dat betekent niet dat iedereen er dommer van wordt. Het betekent dat wijsheid er geen vanzelfsprekende gast is. Je moet haar uitnodigen, en dat vraagt moeite.',
      ),
    },
    {
      kind: 'deel',
      heading: 'Hoe maak je er toch een agora van?',
      text: p(
        'Moeten we het nieuwe plein dan verlaten? Dat zou ik nooit zeggen. Ik heb Athene ook niet verlaten, zelfs niet toen het mij ter dood veroordeelde. Een plein is wat de mensen ervan maken. Laten we dus kijken wat jij kunt doen om er een plek van onderzoek van te maken, in plaats van een plek van lawaai.',
        'Ten eerste: stel de vraag die het geschreven woord niet kan stellen. Voordat je iets deelt of afwijst, vraag jezelf wat de schrijver precies bedoelt, en hoe hij dat weet. Als je het niet weet, zeg dat dan. Na de uitspraak van het orakel ging ik op zoek naar iemand die wijzer was dan ik. Bij een vermaard politicus kwam ik tot deze slotsom: “Hij denkt iets te weten terwijl hij het niet weet; ik daarentegen weet het niet, en ik denk het ook niet te weten.” (Plato, Apologie 21d). Op jullie plein is dat kleine beetje voorsprong goud waard.',
        'Ten tweede: zoek tegenspraak op in plaats van bijval. Wie alleen spreekt met mensen die het met hem eens zijn, staat in een spiegelzaal en denkt dat hij op een plein staat. Zoek iemand die het oneens is, en vraag hem waarom. Niet om hem te verslaan, maar om te ontdekken of je eigen mening de toets doorstaat. Een gedachte die nooit is tegengesproken, weet niet hoe sterk ze is.',
        'Ten derde: geef een gesprek tijd. Niet alles hoeft vandaag beantwoord. Als iets je boos maakt, laat het een nacht liggen. Ik weet dat het nieuwe plein snelheid beloont. Maar wat beloond wordt, is niet altijd wat goed is. Een arts die zich haast, maakt fouten; een denker ook.',
        'Ten vierde, en dat is misschien het moeilijkste: verplaats de belangrijkste gesprekken naar plekken waar je elkaar kunt aankijken. Het nieuwe plein is goed om elkaar te vinden. Om elkaar te begrijpen, heb je vaak een tafel, een wandeling of een trede in de zon nodig. Daar kan iemand vragen: wat bedoel je? En daar moet jij antwoorden.',
        'Je ziet: ik geef je geen regels voor het plein, maar gewoonten voor jezelf. Dat is altijd mijn methode geweest. Ik heb nooit geprobeerd Athene te veranderen met wetten. Ik probeerde het te veranderen met één gesprek tegelijk.',
      ),
    },
    {
      kind: 'conclusie',
      heading: 'Conclusie',
      text: p(
        'We komen bij het einde. Je vroeg: maakt sociale media ons wijzer, zoals een gesprek op de agora, of alleen luider? Mijn antwoord is dat het plein zelf geen van beide doet. Het versterkt wat we er al meebrengen. Wie komt om te winnen, wordt er luider. Wie komt om te onderzoeken, kan er wijzer worden, maar alleen als hij de vragen meeneemt die het geschreven woord zelf niet kan stellen.',
        '**Kernlessen**\n1. Een geschreven woord kan zich niet verdedigen; stel daarom zelf de vraag ‘wat bedoel je, en hoe weet je dat?’.\n2. Wie bijval zoekt, wordt luider; wie tegenspraak zoekt, wordt wijzer.\n3. Geef een gedachte tijd, en voer de belangrijkste gesprekken waar je elkaar kunt aankijken.',
        '**Denkvraag**\nWelke overtuiging heb je de laatste tijd vaak gedeeld of geliket, maar nooit hardop laten tegenspreken?',
      ),
    },
  ],
};

export default lecture;
