/**
 * Demo-inhoud voor denkers zonder handgeschreven fragmenten (de netwerkdenkers): opgebouwd uit
 * hun eigen profiel (kernbegrippen, levensgebeurtenissen, geverifieerde citaten, kijk op nu).
 * Kerndenkers hebben rijkere, handgeschreven fragmenten in src/data/demo/core.
 */
import type { DemoFigureContent, Figure, LectureBlock, SessionFragment } from '@/data/types';
import { capitalize, joinDutch } from '@/lib/text';

function short(figure: Figure): string {
  return figure.shortName ?? figure.name;
}

function lowerFirst(text: string): string {
  return text ? text.charAt(0).toLowerCase() + text.slice(1) : text;
}

function stripPeriod(text: string): string {
  return text.replace(/[.!?]+$/, '');
}

export function genericDemoContent(figure: Figure): DemoFigureContent {
  const name = short(figure);
  const concepts = figure.keyConcepts;
  const quote = figure.quotes.find((q) => q.verified && q.status === 'authentiek');
  const event = figure.lifeEvents.find((e) => /\d/.test(e.year)) ?? figure.lifeEvents[0];
  const helps = figure.helpsWith;

  const fragments: SessionFragment[] = [
    {
      id: 'g-open-1',
      phase: 'opening',
      text: `Welkom{naam}. Ik ben ${figure.name}: ${lowerFirst(stripPeriod(figure.epithet))}. Je hebt maar een kwartier met mij, dus laten we het goed besteden. Waarover wil je nadenken?`,
    },
    {
      id: 'g-open-2',
      phase: 'opening',
      text: `Goed dat je er bent{naam}. Je wilde het hebben over {onderwerp}. Vertel me eerst: waarom houdt juist dit je nu bezig?`,
    },
    {
      id: 'g-terug-1',
      phase: 'terugkeer',
      text: `Daar ben je weer{naam}. De vorige keer spraken we over {vorige}. Is er sindsdien iets veranderd in hoe je erover denkt?`,
    },
    {
      id: 'g-door-1',
      phase: 'doorvragen',
      text: `Je noemt ‘{woord}’. Dat woord gebruiken mensen vaak zonder stil te staan bij wat ze ermee bedoelen. Wat bedoel jij er precies mee?`,
    },
    {
      id: 'g-door-2',
      phase: 'doorvragen',
      text: `Laat me eerlijk zijn: ik kijk naar jouw vraag door de bril van ${lowerFirst(figure.school)}. Vanuit die bril vraag ik: wat ligt hier werkelijk aan ten grondslag?`,
    },
    {
      id: 'g-door-3',
      phase: 'doorvragen',
      text: `Voordat ik iets zeg: wat heb je zelf al geprobeerd, en wat gebeurde er toen?`,
    },
  ];
  if (concepts[0]) {
    fragments.push({
      id: 'g-verdiep-1',
      phase: 'verdiepen',
      keywords: [concepts[0].term],
      text: `In mijn denken speelt ${concepts[0].native ? `${concepts[0].term} (${concepts[0].native})` : `het begrip ‘${concepts[0].term}’`} een grote rol. ${concepts[0].explanation} Als je dat op ‘{woord}’ toepast, wat zie je dan?`,
    });
  }
  if (concepts[1]) {
    fragments.push({
      id: 'g-verdiep-2',
      phase: 'verdiepen',
      keywords: [concepts[1].term],
      text: `Misschien helpt dit: ${lowerFirst(concepts[1].term)}. ${concepts[1].explanation} Ik vermoed dat daar iets in zit voor jou.`,
    });
  }
  if (event) {
    fragments.push({
      id: 'g-verdiep-3',
      phase: 'verdiepen',
      text: `Ik ken dit gevoel ergens van. ${capitalize(event.year)}: ${lowerFirst(event.text)} Zulke momenten dwingen je te kiezen wat er echt toe doet. Wat zou dat voor jou zijn?`,
    });
  }
  if (quote) {
    fragments.push({
      id: 'g-verdiep-4',
      phase: 'verdiepen',
      text: `Ik schreef ooit: “${quote.text}” (${quote.source}). Ik bedoelde het toen over mijn eigen tijd, maar misschien past het ook bij wat jij beschrijft.`,
    });
  }
  fragments.push(
    {
      id: 'g-verdiep-5',
      phase: 'verdiepen',
      text: `${figure.modernLens} En als ik dat zo zeg: herken je jezelf daarin, of juist niet?`,
    },
    {
      id: 'g-afrond-1',
      phase: 'afronden',
      text: `De tijd begint te dringen, dus laat me samenvatten wat ik hoorde: het gaat je om ‘{woord}’, en je zoekt een manier om daar anders mee om te gaan. Wat neem je mee uit dit gesprek?`,
    },
    {
      id: 'g-afrond-2',
      phase: 'afronden',
      text: `We hebben niet veel tijd meer. Eén ding wil ik je nog meegeven: begin klein, en wees eerlijk tegen jezelf over wat je echt wilt.`,
    },
    {
      id: 'g-slot-1',
      phase: 'slot',
      text: `Een laatste gedachte, want de volgende student wacht al: ${helps[0] ? `over ${helps[0]} valt nog veel meer te zeggen` : 'er valt nog veel meer te zeggen'}. Neem je vraag mee en kom terug als ze rijper is.`,
    },
  );

  const blocks: LectureBlock[] = concepts.slice(0, 4).map((concept, index) => ({
    id: `g-blok-${index + 1}`,
    heading: concept.term,
    keywords: [concept.term, ...(concept.native ? [concept.native] : [])],
    lesson: concept.explanation,
    text: [
      `${index === 0 ? 'Laten we beginnen bij' : 'Dan kom ik bij'} ${concept.native ? `${concept.term} (${concept.native})` : `wat ik ‘${concept.term}’ noem`}. ${concept.explanation}`,
      index === 0
        ? `Ik zeg dit niet zomaar. ${figure.bio.split('. ').slice(-2).join('. ')}`
        : `Denk eens aan je eigen week: waar kwam je dit tegen, zonder het zo te noemen? Juist in het gewone leven wordt een idee pas echt begrijpelijk.`,
      index === 1 && figure.modernLens
        ? figure.modernLens
        : `Dat is geen abstracte theorie. Het verandert hoe je kijkt naar wat je overkomt, en dus ook naar wat je kunt doen.`,
    ].join('\n\n'),
  }));

  return {
    figureId: figure.id,
    sessionFragments: fragments,
    lecture: {
      openings: [
        `Welkom bij dit college. Je vroeg mij, ${figure.name}, om iets te zeggen over {onderwerp}. Je hoofdvraag luidt: “{hoofdvraag}” Ik ben ${lowerFirst(stripPeriod(figure.epithet))}, en ik zal je vraag benaderen zoals ik dat in mijn eigen tijd deed: met de begrippen die mij lief waren. Laten we beginnen.`,
      ],
      blocks,
      answers: [
        `Een goede vraag: “{vraag}” Laat me eerlijk zijn: daar heb ik in mijn tijd ook mee geworsteld. Mijn antwoord zou zijn dat je het niet in één keer hoeft op te lossen. Kijk naar wat ‘{woord}’ voor jou betekent, en houd dat tegen het licht van wat we net bespraken.`,
      ],
      conclusions: [
        `We komen bij het einde. Je vroeg: “{hoofdvraag}” Mijn antwoord, in het kort: het begint bij helder zien wat er werkelijk speelt, en bij de moed om daarnaar te handelen. Neem dit mee:`,
      ],
      thinkQuestions: [
        `Waar in je eigen leven zie je deze week ${concepts[0] ? `iets van ‘${lowerFirst(concepts[0].term)}’` : 'dit idee'} terug?`,
      ],
    },
    timelineReactions: [
      {
        keywords: figure.tags,
        text: `Wat je schrijft raakt aan iets waar ik veel over heb nagedacht: ${joinDutch(figure.tags.slice(0, 2))}. Blijf erover nadenken.`,
      },
    ],
    reflectionQuestions: [
      `Wat zou ${name} je vragen om deze week anders te doen?`,
      `Welke vraag uit dit gesprek wil je over een week nog eens stellen?`,
    ],
    thoughts: concepts.map((c) => `${c.term}. ${c.explanation} Waar kom je dat vandaag tegen?`),
  };
}
