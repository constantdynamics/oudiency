/**
 * UI-teksten voor bellen (spraakproef). Apart van nl.ts, zodat ze alleen met de spraakpagina's
 * meeladen en de startbundel klein blijft.
 */
import type { CallErrorKind } from '@/voice/callSession';
import type { KeyPermissionId } from '@/voice/permissions';
import type { CallEndReason } from '@/store/schemas';

interface PermissionText {
  /** Naam in het sleutelscherm van ElevenLabs. */
  area: string;
  alias?: string;
  /** Niveau dat Oudiency nodig heeft. */
  level: string;
  use: string;
}

const permissionItems: Record<KeyPermissionId, PermissionText> = {
  agents: {
    area: 'ElevenLabs Agents',
    alias: 'heette eerder Conversational AI',
    level: 'Write',
    use: 'de gespreksagent klaarzetten en bellen',
  },
  voices: { area: 'Voices', level: 'Write', use: 'de stem per denker bewaren' },
  textToVoice: {
    area: 'Text to Voice',
    alias: 'ook wel Voice Design',
    level: 'Access',
    use: 'stemvoorbeelden ontwerpen',
  },
  textToSpeech: { area: 'Text to Speech', level: 'Access', use: 'podcasts laten voorlezen' },
  user: { area: 'User', level: 'Read', use: 'je tegoed tonen (mag ook uit)' },
};

export const tv = {
  settings: {
    eyebrow: 'Proef',
    title: 'Stem & bellen',
    intro:
      'Bel live met de denkers: je praat gewoon, en de denker antwoordt met een eigen stem. Zet hier je sleutel en de stemmen klaar; bellen kan daarna in je sessies, of hier als proef.',
    howTitle: 'Zo werkt het',
    how: [
      'ElevenLabs luistert, spreekt en regelt de beurtwisseling; je kunt de denker gewoon onderbreken.',
      'Het brein is Claude Sonnet 5.5, via ElevenLabs. Je hebt daarvoor alleen een ElevenLabs-sleutel nodig.',
      'Je sleutel staat alleen in deze browser, gaat alleen naar ElevenLabs en nooit mee in een export.',
      'ElevenLabs bewaart geen opname en wist het gesprek direct. Het transcript staat alleen hier, op dit apparaat.',
      'Je hoort aan het begin altijd dat je met een AI-simulatie praat. Het is nooit de echte stem van de denker.',
    ],
    figuresLabel: 'Stem van welke denker?',
    hasVoice: 'stem gekozen',
    costTitle: 'Wat kost het?',
    cost: 'Indicatie: ongeveer $0,08 per minuut plus het gebruik van Claude, dus zo’n $1,50 tot $2 voor een gesprek van 15 minuten. Na elk gesprek zie je wat het echt kostte.',
  },
  key: {
    title: '1. Je ElevenLabs-sleutel',
    stepsTitle: 'Zo maak je een sleutel (eenmalig, 2 minuten)',
    steps: [
      'Log in op elevenlabs.io (of maak een account). Voor live gesprekken heb je tegoed nodig; een betaald abonnement werkt het best.',
      'Klik links in de zijbalk op Developers en open het tabblad API Keys. Kies Create API Key.',
      'Noem hem bijvoorbeeld Oudiency. Een nieuwe sleutel is standaard beperkt: zet de toegang aan die hieronder staat.',
      'Stel eventueel een kredietlimiet in voor deze sleutel, zodat de kosten nooit verrassen.',
      'Kopieer de sleutel meteen (je ziet hem maar één keer) en plak hem hieronder.',
    ],
    keysUrl: 'https://elevenlabs.io/app/developers/api-keys',
    openKeys: 'Open de API-sleutels bij ElevenLabs',
    label: 'ElevenLabs-sleutel',
    placeholder: 'sk_…',
    hint: 'Gebruik alleen je eigen sleutel, bij voorkeur een aparte met een lage limiet.',
    save: 'Opslaan en testen',
    retest: 'Opnieuw testen',
    clear: 'Sleutel wissen',
    cleared: 'De ElevenLabs-sleutel is gewist uit deze browser.',
    testing: 'Sleutel testen…',
    ok: 'De sleutel werkt.',
    okNoAccount:
      'De sleutel werkt, maar mag je tegoed niet lezen. Kosten tonen we dan alleen als ElevenLabs ze per gesprek meegeeft.',
    stored: 'Opgeslagen sleutel',
    plan: (tier: string) => `Abonnement: ${tier}`,
    credits: (used: string, limit: string) =>
      `Tegoed deze periode: ${used} van ${limit} credits gebruikt`,
    resets: (date: string) => `Vult weer aan op ${date}`,
  },
  permissions: {
    title: 'Toegang die de sleutel nodig heeft',
    where:
      'Pas de sleutel aan bij ElevenLabs: Developers → API Keys → het menu (⋯) bij je sleutel → Edit. Of maak een nieuwe sleutel met deze toegang.',
    items: permissionItems,
    missing: 'ontbreekt',
    other: (scope: string) => `Ook nodig volgens ElevenLabs: ${scope}`,
  },
  agent: {
    title: '2. Klaarzetten',
    body: 'De app maakt in jouw ElevenLabs-account één gespreksagent aan, “Oudiency · denkers”. Die speelt alle denkers: per gesprek krijgt hij de rol en de stem mee. Privé (alleen te bellen met jouw sleutel), zonder opnames, en gesprekken worden bij ElevenLabs direct gewist.',
    missing: 'Nog niet klaargezet.',
    ready: 'Klaar voor gesprekken.',
    minimal:
      'Klaar, met eenvoudigere instellingen (ElevenLabs accepteerde niet alle extra’s). Privacy en rol zijn gelijk.',
    outdated: 'Er zijn nieuwe instellingen; zet de agent opnieuw klaar.',
    action: 'Klaarzetten',
    update: 'Bijwerken',
    working: 'Bezig met klaarzetten…',
    done: 'De gespreksagent staat klaar.',
  },
  design: {
    title: (name: string) => `3. De stem van ${name}`,
    body: 'Je kiest zelf uit drie voorbeelden. De stem is ontworpen op basis van een beschrijving, met een licht accent van herkomst; het is nooit een kopie van een echte stem.',
    description: 'Stembeschrijving (voor ElevenLabs)',
    start: (name: string) => `Ontwerp de stem van ${name}`,
    working: 'Drie stemmen ontwerpen… (dat duurt zo’n tien seconden)',
    preview: (n: number) => `Stem ${n}`,
    choose: 'Kies deze stem',
    saving: 'Stem bewaren…',
    more: 'Drie andere voorbeelden',
    cancel: 'Annuleren',
    chosen: 'Stem gekozen.',
    redo: 'Andere stem ontwerpen',
    redoNote: 'De huidige stem wordt daarna uit je ElevenLabs-account verwijderd.',
    costNote: 'Elke ronde voorbeelden kost een beetje tegoed.',
    saved: (name: string) => `De stem van ${name} is bewaard.`,
  },
  trial: {
    title: '4. Proefgesprek',
    body: (name: string, minutes: number) =>
      `Bel ${name} voor een proefgesprek van hooguit ${minutes} minuten. Je kunt altijd eerder ophangen.`,
    call: (name: string) => `Bel ${name}`,
    notReady: 'Zet eerst je sleutel en de stem klaar (stap 1 en 3).',
    tips: [
      'Gebruik oortjes of een koptelefoon: dan hoort de denker zichzelf niet terug.',
      'Praat gewoon; stiltes om na te denken zijn prima. Onderbreken mag.',
      'Rond minuut 12 rondt de denker af, op 15 minuten neemt hij afscheid.',
    ],
  },
  history: {
    title: 'Eerdere proefgesprekken',
    empty: 'Nog geen proefgesprekken.',
    transcript: 'Transcript',
    clear: 'Wis proefgesprekken',
    cleared: 'De proefgesprekken zijn gewist.',
  },
  call: {
    eyebrow: 'Proefgesprek',
    lobbyNote: (name: string) =>
      `Je spreekt zo met een AI-simulatie van ${name}. Je stem gaat via ElevenLabs naar Claude; ElevenLabs bewaart geen opname. Het transcript blijft op dit apparaat.`,
    earphones: 'Tip: gebruik oortjes of een koptelefoon tegen echo.',
    start: (name: string) => `Bel ${name}`,
    connecting: (name: string) => `Verbinden met ${name}…`,
    listening: (name: string) => `${name} luistert`,
    speaking: (name: string) => `${name} spreekt`,
    farewell: (name: string) => `${name} neemt afscheid`,
    muted: 'Je microfoon staat uit',
    /** Vaste naam voor de wisselknop; de toestand staat in aria-pressed. */
    mute: 'Microfoon dempen',
    muteCaption: 'Dempen',
    hangUp: 'Ophangen',
    remaining: 'Resterende tijd',
    transcript: 'Transcript',
    you: 'Jij',
    app: 'App',
    ended: 'Gesprek beëindigd',
    duration: (time: string) => `Duur: ${time}`,
    costLoading: 'Kosten ophalen…',
    costUnknown:
      'De kosten zijn (nog) niet bekend. Je vindt ze ook in je ElevenLabs-account onder Usage.',
    costCredits: (credits: string) => `Kosten: ${credits} credits`,
    costFiat: (amount: string) => `(${amount})`,
    costFromBalance: 'gemeten aan je tegoed',
    again: 'Opnieuw bellen',
    toSettings: 'Naar Stem & bellen',
    retry: 'Opnieuw proberen',
    notReadyTitle: 'Nog niet klaar om te bellen',
    notReadyBody: 'Zet eerst je sleutel, de gespreksagent en de stem klaar.',
    unavailableTitle: 'Deze denker kun je nog niet bellen',
    unavailableBody:
      'Bellen kan met de kerndenkers van wie je de stem hebt klaargezet. De netwerkdenkers volgen later.',
    leaveWarning: 'Het gesprek loopt nog. Weet je zeker dat je weggaat?',
  },
  errors: {
    auth: 'ElevenLabs herkent deze sleutel niet. Controleer of je hem helemaal hebt gekopieerd.',
    permission: 'Deze sleutel mist toegang bij ElevenLabs.',
    quota: 'Je ElevenLabs-tegoed is op, of de limiet van deze sleutel is bereikt.',
    rate: 'ElevenLabs krijgt even te veel verzoeken. Probeer het over een minuut opnieuw.',
    not_found: 'Dit onderdeel bestaat niet (meer) in je ElevenLabs-account. Zet het opnieuw klaar.',
    invalid: 'ElevenLabs weigerde het verzoek.',
    network:
      'ElevenLabs is niet bereikbaar. Controleer je internetverbinding en probeer het opnieuw.',
    server: 'ElevenLabs heeft even een storing. Probeer het later opnieuw.',
    other: 'Er ging iets mis bij ElevenLabs.',
    microfoon:
      'Geen toegang tot je microfoon. Sta de microfoon toe via het slotje naast het webadres en probeer het opnieuw.',
    verbinding: 'De verbinding met ElevenLabs lukte niet. Probeer het opnieuw.',
  } satisfies Record<CallErrorKind, string>,
  endReasons: {
    tijd: 'De tijd is om.',
    gebruiker: 'Je hebt opgehangen.',
    crisis: 'Het gesprek is gestopt, omdat je iets zei waarbij hulp belangrijk is.',
    verbinding:
      'Het gesprek werd beëindigd, bijvoorbeeld na een lange stilte of door een verbindingsprobleem.',
    stilte: 'Het gesprek stopte na een lange stilte.',
    fout: 'Het gesprek stopte door een fout.',
  } satisfies Record<CallEndReason, string>,
} as const;
