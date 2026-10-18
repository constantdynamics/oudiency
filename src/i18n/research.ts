/**
 * UI-teksten voor onderzoek op aanvraag. Apart van nl.ts, zodat ze met de onderzoekscode meeladen.
 */
import type { EssayLength, ResearchForm } from '@/config/research';
import type { CostKey } from '@/research/estimate';
import type { ResearchProblem } from '@/services/research.service';

export const tr = {
  problems: {
    sleutel: 'Onderzoek werkt alleen met je eigen Claude-sleutel (Profiel → Instellingen).',
    stemsleutel: 'Bellen kan alleen met een ElevenLabs-sleutel (Profiel → Stem & bellen).',
    vraag: 'Beschrijf wat je wilt laten uitzoeken in 5 tot 200 tekens.',
    denkers: 'Kies één tot drie denkers.',
    onbekend: 'Kies denkers die je al kent.',
    vorm: 'Kies hoe je het wilt hebben.',
    limiet:
      'Je hebt vandaag al het maximale aantal onderwerpen laten uitzoeken. Morgen kan het weer.',
    crisis: 'Dit zoeken we niet uit. Je hoeft dit niet alleen te dragen.',
  } satisfies Record<ResearchProblem, string>,
  forms: {
    tekst: 'Tekst',
    podcast: 'Podcast',
    college: 'College',
    bellen: 'Gesprek',
  } satisfies Record<ResearchForm, string>,
  formHints: {
    tekst: 'Een essay van de denker om te lezen.',
    podcast: 'Om naar te luisteren, met Sophie als presentator.',
    college: 'Een college om mee te lezen, met vragen tussendoor.',
    bellen: 'Tien minuten bellen met de denker.',
  } satisfies Record<ResearchForm, string>,
  lengths: {
    kort: 'Kort (±400 woorden)',
    lang: 'Lang (±1500 woorden)',
  } satisfies Record<EssayLength, string>,
  costs: {
    uitzoeken: 'Uitzoeken',
    tekst: 'Tekst schrijven',
    script: 'Podcast schrijven',
    voorlezen: 'Voorlezen (bij het afspelen)',
    college: 'College schrijven',
    gesprek: 'Gesprek van 10 minuten (als je belt)',
  } satisfies Record<CostKey, string>,
  refused:
    'Dit onderwerp zoeken we niet uit. Het telt niet mee voor je daglimiet; probeer een andere vraag.',
  failed: 'Het onderzoek kwam niet goed door. Probeer het opnieuw.',
  ready: (title: string) => `Je onderzoek is klaar: “${title}”.`,
  library: {
    title: 'Onderzoek op aanvraag',
    intro:
      'Laat een onderwerp uitzoeken in Wikipedia en Wikisource; denkers maken er daarna een tekst, podcast, college of gesprek van. Alles is een AI-simulatie.',
    back: 'Ontdekken',
    new: 'Nieuw onderzoek',
    perDay: (limit: number) => `${limit} per dag`,
    empty: 'Je hebt nog niets laten uitzoeken.',
    emptyHint: 'Kies een onderwerp of vraag, en wie er met je meedenkt.',
    today: (left: number, limit: number) =>
      left === 0
        ? 'Vandaag kun je niets meer laten uitzoeken; morgen weer.'
        : `Vandaag kun je nog ${left} van de ${limit} ${limit === 1 ? 'onderwerp' : 'onderwerpen'} laten uitzoeken.`,
    madeInto: 'Gemaakt als',
    status: {
      zoeken: 'Wordt uitgezocht',
      onderbroken: 'Onderbroken',
      fout: 'Niet gelukt',
    },
  },
  form: {
    title: 'Laat iets uitzoeken',
    intro:
      'De app zoekt je vraag uit in de Engelstalige Wikipedia en Wikisource (teksten van de denkers zelf) en vult aan met wat Claude weet. Jij krijgt alleen het eindresultaat.',
    question: 'Wat wil je laten uitzoeken?',
    questionHint:
      'Een onderwerp of een vraag; Wikipedia weet veel over geschiedenis, ideeën en wetenschap, minder over het nieuws van deze week.',
    questionPlaceholder: 'Waarom geloven mensen in complottheorieën?',
    figures: 'Wie denkt er mee?',
    figuresHint: 'Eén denker, of een panel van twee of drie. Alleen denkers die je al kent.',
    suggest: 'Stel denkers voor',
    suggesting: 'Even zoeken wie hierbij past …',
    suggestError: 'Voorstellen lukte even niet. Kies zelf of probeer het opnieuw.',
    suggestions: 'Voorgesteld bij je vraag',
    addSuggestion: (name: string) => `${name} toevoegen`,
    removeSuggestion: (name: string) => `${name} weghalen`,
    chooseYourself: 'Of kies zelf',
    search: 'Zoek een denker',
    chosen: 'Gekozen',
    unpick: (name: string) => `${name} weghalen`,
    full: 'Je hebt er al drie. Haal eerst iemand weg.',
    noMatch: 'Geen denker gevonden.',
    showAll: (count: number) => `Toon alle ${count}`,
    formTitle: 'Wat wil je ervan?',
    writer: 'Wie schrijft?',
    length: 'Lengte',
    podcastFormat: 'Vorm',
    panelPodcast: (names: string) => `${names} gaan met elkaar in gesprek.`,
    lecturer: 'Wie geeft het college?',
    guests: (names: string) => `Gastdocent: ${names}.`,
    callee: 'Met wie bel je?',
    estimate: 'Kosten ongeveer',
    costLine: (label: string, amount: string, service: string) =>
      `${label}: ${amount} (${service})`,
    total: (amount: string) => `Samen ongeveer ${amount}`,
    estimateNote:
      'Een indicatie met je eigen sleutels. Een extra vorm uit hetzelfde onderzoek telt niet mee voor je daglimiet.',
    review: 'Bekijk en bevestig',
    confirmTitle: 'Klaar om uit te zoeken?',
    confirm: (amount: string) =>
      `Dit kost ongeveer ${amount} aan tegoed bij Claude en telt als een van je onderzoeken van vandaag.`,
    start: 'Ja, zoek het uit',
    back: 'Nog aanpassen',
    started: 'Je onderwerp wordt uitgezocht.',
  },
  page: {
    back: 'Je onderzoeken',
    question: 'Je vraag',
    with: 'Met',
    working: 'We zoeken het uit …',
    workingHint:
      'Dit duurt meestal een halve tot een hele minuut. Je kunt deze pagina gerust verlaten: je krijgt een melding als het klaar is.',
    interrupted: 'Het uitzoeken is onderbroken (de app ging dicht).',
    retry: 'Opnieuw proberen',
    retryHint: 'Opnieuw proberen telt niet nog eens mee voor je daglimiet.',
    results: 'Wat ervan gemaakt is',
    essayBy: (name: string) => `Door ${name}`,
    furtherReading: 'Verder lezen',
    writing: (name: string) => `${name} schrijft je tekst …`,
    podcastWriting: 'Sophie en de denkers schrijven je aflevering …',
    listen: 'Luister',
    toEpisode: 'Naar de aflevering',
    listenNeedsKey:
      'De tekst staat klaar; om te luisteren heb je nog een ElevenLabs-sleutel nodig (Profiel → Stem & bellen).',
    episodeGone: 'Deze aflevering staat niet meer op dit apparaat.',
    callTitle: (name: string) => `Gesprek met ${name}`,
    callHint:
      'Tien minuten bellen over je onderzoek, wanneer het jou uitkomt. Je kunt vaker bellen.',
    call: (name: string) => `Bel ${name}`,
    outputInterrupted: 'Het maken is onderbroken.',
    outputFailed: 'Dit lukte niet.',
    makeMore: 'Maak er nog iets van',
    makeMoreHint:
      'Uit hetzelfde onderzoek, zonder opnieuw te zoeken. Telt niet mee voor je daglimiet.',
    make: 'Maak het',
    made: 'Wordt gemaakt.',
    remove: 'Verwijder onderzoek',
    keep: 'Bewaren',
    removeYes: 'Ja, verwijder',
    removeConfirm:
      'Dit onderzoek en de tekst eruit verwijderen? Podcasts en colleges die eruit zijn gemaakt, blijven bestaan.',
    removed: 'Onderzoek verwijderd.',
    notFound: 'Dit onderzoek bestaat niet (meer).',
  },
  call: {
    eyebrow: 'Onderzoek · bellen',
    subtitle: (minutes: number) => `Gesprek over je onderzoek · hooguit ${minutes} minuten`,
    note: (name: string) =>
      `Je praat met een AI-simulatie van ${name}: geen echt mens. Je stem gaat naar ElevenLabs om het gesprek mogelijk te maken.`,
    back: 'Terug naar je onderzoek',
    notFound: 'Dit onderzoek is er niet (meer), of deze denker hoort er niet bij.',
    notReady: 'Het onderzoek is nog niet klaar; bellen kan zodra het is uitgezocht.',
    needsKey:
      'Bellen kan met je eigen ElevenLabs-sleutel (Profiel → Stem & bellen); de sleutel heeft ook toegang tot ElevenLabs Agents nodig.',
    toSettings: 'Naar Stem & bellen',
    noVoice: 'Er is geen passende stem gevonden in je ElevenLabs-account.',
    thinking: (name: string) => `${name} denkt na …`,
  },
};
