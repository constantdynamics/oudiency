import type { ExampleLecture } from '../../../types';

const p = (...parts: string[]) => parts.join('\n\n');

const lecture: ExampleLecture = {
  id: 'vb-kant-liegen',
  figureId: 'kant',
  topic: 'Mag je liegen om iemand te beschermen?',
  mainQuestion: 'Mag je liegen om iemand te beschermen, of is eerlijkheid altijd een plicht?',
  title: 'Mag je liegen om iemand te beschermen?',
  tags: ['liegen', 'eerlijkheid', 'ethiek', 'plicht', 'dilemma'],
  publishedAt: '2026-09-30T13:00:00.000Z',
  furtherReading: [9, 3, 8],
  segments: [
    {
      kind: 'opening',
      heading: 'Opening',
      text: p(
        'Goedemiddag. Ik heet u welkom in deze collegezaal in Königsberg. U stelt mij een vraag waarover ik in 1797 een kort opstel schreef, en waarover lezers zich sindsdien meer hebben opgewonden dan over al mijn dikke boeken samen: mag je liegen om iemand te beschermen, of is eerlijkheid altijd een plicht?',
        'Ik zal niet doen alsof die vraag eenvoudig is. Iedereen voelt meteen dat het antwoord ja moet zijn. Wie zou een vriend uitleveren aan een moordenaar, alleen om eerlijk te blijven? Toch heb ik nee gezegd, en ik wil u uitleggen waarom. Daarna zal ik u, zoals het een eerlijk filosoof betaamt, ook de bezwaren tegen mijn eigen antwoord laten zien.',
        'Mijn werkwijze kent u misschien: eerst de begrippen onderscheiden, dan het principe formuleren, en ten slotte toetsen. Laten we beginnen bij het geval zelf.',
      ),
    },
    {
      kind: 'deel',
      heading: 'De moordenaar aan de deur',
      text: p(
        'De Franse schrijver Benjamin Constant schreef in 1797 dat een plicht om de waarheid te spreken, als je haar onvoorwaardelijk nam, elke samenleving onmogelijk zou maken. Hij gaf een voorbeeld dat hij bij een Duitse filosoof had gelezen, en waarmee hij mij bedoelde. Een vriend die door een moordenaar wordt achtervolgd, heeft zich in uw huis verborgen. De moordenaar klopt aan en vraagt of uw vriend binnen is. Mag u liegen?',
        'Constant vond van wel. De plicht om de waarheid te spreken, zei hij, geldt alleen tegenover wie recht heeft op de waarheid. Een moordenaar heeft dat recht verspeeld. Dat klinkt redelijk, en ik begrijp waarom het u aanspreekt.',
        'Ik antwoordde met een opstel: Over een vermeend recht om uit mensenliefde te liegen. Mijn stelling was dat waarachtigheid in uitspraken die u niet kunt vermijden, een plicht is tegenover iedereen, hoe groot het nadeel voor uzelf of een ander ook is. Ik schreef dat met volle overtuiging. Ik schrijf het u nu met iets meer schroom, maar met dezelfde redenen.',
        'Laat mij eerst twee dingen ophelderen die vaak over het hoofd worden gezien. Ten eerste: ik zei niet dat u de moordenaar moet helpen. U hoeft hem uw vriend niet aan te wijzen. Ten tweede: mijn bezwaar gold de leugen, de bewuste onware verklaring. Of zwijgen, de deur dichtdoen of de vraag weigeren te beantwoorden toegestaan is, is een andere vraag. Daarover had ik in dat opstel te weinig gezegd, en daar kom ik straks op terug.',
        'Waarom dan toch die strengheid? Omdat ik vreesde wat er gebeurt als we de leugen toestaan zodra wij menen dat het goed uitkomt. Dat is de kern van het volgende deel.',
      ),
    },
    {
      kind: 'deel',
      heading: 'Waarom een leugen meer kapotmaakt dan je denkt',
      text: p(
        'Mijn eerste argument volgt uit mijn toetssteen: “Handel alleen volgens die maxime waarvan je tegelijk kunt willen dat ze een algemene wet wordt.” (Grundlegung, AA 4:421). Stel dat uw regel luidt: ik lieg wanneer ik meen dat een leugen een goed doel dient. Kunt u willen dat iedereen zo handelt? Dan wordt elke uitspraak verdacht. Niemand weet meer of een ander de waarheid spreekt of slechts meent dat liegen hier beter uitkomt. Verklaringen, getuigenissen, verdragen en beloften verliezen hun waarde.',
        'Mijn tweede argument gaat over de mens. “Handel zo dat je de mensheid, in je eigen persoon en in die van ieder ander, altijd tegelijk als doel gebruikt en nooit alleen als middel.” (Grundlegung, AA 4:429). Wie liegt, stuurt de ander via een onwaarheid. Hij neemt hem de mogelijkheid om zelf, op grond van de feiten, te beslissen. Ook een moordenaar is een mens, hoe verwerpelijk zijn doel ook is. Dat maakte voor mij het liegen tot een onrecht tegenover de mensheid als geheel, niet alleen tegenover hem.',
        'Mijn derde argument is praktischer, en het verrast mensen vaak. U weet niet wat de gevolgen van uw leugen zullen zijn. Stel dat u zegt dat uw vriend niet thuis is, terwijl hij intussen ongemerkt het huis heeft verlaten. De moordenaar gaat weg, loopt hem buiten tegen het lijf en doodt hem. Dan heeft uw leugen bijgedragen aan het onheil dat u wilde voorkomen. Spreekt u de waarheid en gaat het mis, dan is het onheil niet uw daad.',
        'In mijn latere Metafysica van de zeden voegde ik er nog iets aan toe. Wie liegt, beschadigt ook zichzelf. Hij maakt van zijn eigen woorden een masker, en daarmee van zichzelf iets minder dan een mens die met zijn woorden instaat voor wat hij denkt. De leugen is dus niet alleen een onrecht tegen de ander, maar ook een verraad aan de eigen waardigheid.',
        'U ziet: mijn bezwaar is niet dat ik de vriend minder belangrijk vind dan een principe. Mijn bezwaar is dat een samenleving waarin ieder voor zich bepaalt wanneer liegen gerechtvaardigd is, uiteindelijk niemand meer beschermt.',
      ),
    },
    {
      kind: 'deel',
      heading: 'Bezwaren, en een eerlijke uitweg',
      text: p(
        'Nu de tegenwerpingen, want een filosoof die zijn critici verzwijgt, is geen filosoof maar een prediker. De meeste lezers, ook velen die mijn ethiek waarderen, vinden mijn antwoord te streng. Ze wijzen erop dat de moordenaar zelf de situatie misbruikt: hij gebruikt uw eerlijkheid als instrument voor een moord. Wie zo vraagt, heeft van het gesprek al een wapen gemaakt. Is het dan nog een gewoon gesprek waarin waarachtigheid de regel moet zijn?',
        'Anderen merken op dat ik in mijn eigen ethiek ook plichten van hulp ken, en dat het beschermen van een onschuldige leven daar zeker onder valt. Als twee plichten botsen, schreef ik elders, is het eigenlijk niet zo dat twee plichten tegelijk gelden, maar dat de sterkere grond de doorslag geeft. Velen menen dat de grond om een leven te redden hier sterker is. Ik geef toe: die tegenwerping verdient meer aandacht dan ik haar in 1797 gaf.',
        'Laat mij u daarom een uitweg wijzen die mijn principe niet verraadt. In de meeste werkelijke situaties hoeft u niet te kiezen tussen een leugen en verraad. U kunt zwijgen. U kunt weigeren te antwoorden. U kunt de deur sluiten, hulp halen, tijd rekken. Waarachtigheid verplicht u niet om alles te zeggen wat u weet; ze verbiedt u alleen om iets te verklaren wat u onwaar weet. Dat is een groot verschil, en het laat veel meer ruimte dan het lijkt.',
        'En in uw eigen leven, waar zelden moordenaars aankloppen? Daar is mijn les misschien het nuttigst. Denk aan de kleine leugens om een ander te sparen, een gesprek te vermijden of uzelf beter te laten uitkomen. Vraag bij elk ervan: kan ik willen dat iedereen zo handelt? En: behandel ik de ander hier als iemand die de waarheid aankan, of als iemand die ik moet sturen? Vaak bestaat er een antwoord dat eerlijk én vriendelijk is. Het vraagt alleen meer moeite dan een leugentje.',
        'Uit zulk krom hout als waaruit de mens gemaakt is, timmert men niets volkomen rechts. Ik verwacht niet dat u nooit zult liegen. Ik vraag dat u uw leugens niet gaat rechtvaardigen als deugden.',
      ),
    },
    {
      kind: 'conclusie',
      heading: 'Conclusie',
      text: p(
        'Wij komen tot een besluit. U vroeg: mag je liegen om iemand te beschermen, of is eerlijkheid altijd een plicht? Mijn antwoord blijft dat de leugen zelf nooit een recht is: ze ondermijnt het vertrouwen waarop elke samenleving rust, en ze behandelt de ander alleen als middel. Maar waarachtigheid betekent niet dat u alles moet zeggen. Zwijgen, weigeren en beschermen zonder te liegen zijn vaak mogelijk, en daar ligt meestal de juiste weg. Waar ik in 1797 te weinig ruimte liet voor botsende plichten, laat ik het oordeel graag aan uw eigen verstand over.',
        '**Kernlessen**\n1. Toets een leugen aan de vraag of je regel een algemene wet kan worden; een wereld vol goedbedoelde leugens is een wereld zonder vertrouwen.\n2. Liegen stuurt de ander buiten zijn eigen oordeel om en behandelt hem alleen als middel.\n3. Eerlijkheid verplicht je niet om alles te zeggen: zwijgen, weigeren en beschermen zonder te liegen zijn vaak mogelijk.',
        '**Denkvraag**\nWelk klein leugentje vertelt u regelmatig, en hoe zou een antwoord eruitzien dat eerlijk én vriendelijk is?',
      ),
    },
  ],
};

export default lecture;
