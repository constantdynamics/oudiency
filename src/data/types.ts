/**
 * Typen voor de vaste inhoud: denkers, citaten, voorbeeldcolleges, dagvragen, demo-fragmenten.
 * Datamodel volgens BRIEFING.md §10, met een paar aanvullingen (gemarkeerd met "extra").
 */

/** Jaartal; vóór Christus negatief. */
export type Year = number;

export type QuoteStatus = 'authentiek' | 'parafrase' | 'toegeschreven';

export interface Quote {
  /** Nederlandse tekst (eigen vertaling of publiek-domeinvertaling). */
  text: string;
  original?: string;
  /** Werk + passage, bijv. "Plato, Apologie 38a". */
  source: string;
  status: QuoteStatus;
  translation: 'eigen' | 'publiek-domein';
  verified: boolean;
  /** extra: korte toelichting, verplicht bij 'parafrase' en 'toegeschreven'. */
  note?: string;
}

export type Relation =
  | 'leraar'
  | 'leerling'
  | 'invloed'
  | 'navolger'
  | 'tijdgenoot'
  | 'gesprekspartner'
  | 'correspondent'
  | 'vriend'
  | 'rivaal'
  | 'mentor'
  | 'criticus'
  | 'tegenpool'
  | 'andere school'
  | 'geestverwant'
  | 'commentator'
  | 'bewonderaar'
  | 'voorbeeld'
  | 'protegé';

export type MotifId =
  | 'meander'
  | 'laurel'
  | 'inkwash'
  | 'stars'
  | 'kite'
  | 'charkha'
  | 'lens'
  | 'botanical'
  | 'column'
  | 'scroll'
  | 'quill'
  | 'compass'
  | 'lotus'
  | 'wave'
  | 'tulip'
  | 'flame';

export type DisplayFontId =
  | 'cormorant'
  | 'cinzel'
  | 'eb-garamond'
  | 'im-fell'
  | 'literata';

/** extra: schrift van de eigen naam, om het juiste font lazy te laden. */
export type NativeScript = 'latin' | 'greek' | 'han' | 'devanagari' | 'gujarati';

export interface FigureTheme {
  /** Hoofdkleur: tekst/knoppen op `surface` en wit; moet AA-contrast halen. */
  primary: string;
  secondary: string;
  /** Decoratieve accentkleur (niet voor kleine tekst). */
  accent: string;
  /** Lichte achtergrondtint van het thema. */
  surface: string;
  motif: MotifId;
  displayFont: DisplayFontId;
}

export interface KeyConcept {
  term: string;
  native?: string;
  explanation: string;
}

export interface KeyWork {
  title: string;
  year?: string;
  note?: string;
}

export interface LifeEvent {
  year: string;
  text: string;
}

export interface NetworkLink {
  id: string;
  relation: Relation;
  note?: string;
}

export interface Voice {
  register: string;
  method: string;
  habits: string[];
  nativePhrases: { phrase: string; translation: string }[];
  avoid: string[];
}

export interface Figure {
  id: string;
  tier: 'kern' | 'netwerk';
  name: string;
  /** extra: korte naam voor in zinnen ("Marcus Aurelius vraagt …"). */
  shortName?: string;
  nativeName?: string;
  /** extra */
  nativeScript?: NativeScript;
  /** extra: één regel typering, bijv. "Stoïcijnse keizer". */
  epithet: string;
  born: Year;
  died: Year;
  approximate?: boolean;
  /** extra: vrije weergave van de jaren als die onzeker zijn ("traditioneel 6e eeuw v.Chr."). */
  displayYears?: string;
  /** extra: monogram op het medaillon (standaard: initialen). */
  monogram?: string;
  origin: string;
  school: string;
  tags: string[];
  bio: string;
  keyConcepts: KeyConcept[];
  keyWorks: KeyWork[];
  lifeEvents: LifeEvent[];
  quotes: Quote[];
  /** extra: specificaties voor de profiel-timeline ("Hoofdwerk: …"). */
  specs: { label: string; value: string }[];
  voice: Voice;
  modernLens: string;
  controversies: string[];
  theme: FigureTheme;
  avatar: { kind: 'svg' | 'publiek-domein'; src?: string; credit?: string; license?: string };
  availability: { slots: string[] };
  network: NetworkLink[];
  /** extra: waar je met deze denker goed over kunt praten (voor "Wie kan mij helpen?"). */
  helpsWith: string[];
  /** extra: microcopy met karakter. */
  microcopy: {
    /** Laadstate, bijv. "Spinoza slijpt een lens …" */
    thinking: string;
    /** Startvenster open, bijv. "De deur van de stoa staat open" */
    doorOpen: string;
    /** Afscheid aan het eind van een sessie (moet door naar een andere student). */
    farewells: string[];
    /** Optioneel: waarom een tijdstip niet beschikbaar is (bijv. Kants wandeling). */
    unavailableNote?: { time: string; text: string };
  };
}

/** Voorbeeldcollege (vooraf geschreven, gelabeld als Voorbeeld). */
export interface ExampleLecture {
  id: string;
  figureId: string;
  topic: string;
  mainQuestion: string;
  title: string;
  tags: string[];
  /** Publicatiedatum (ISO), voor ranking. */
  publishedAt: string;
  segments: {
    kind: 'opening' | 'deel' | 'antwoord' | 'conclusie';
    heading: string;
    text: string;
  }[];
  /** Indexen in figure.keyWorks voor "Verder lezen". */
  furtherReading: number[];
}

export type DailyQuestionKind =
  | 'persoonlijk'
  | 'ethisch dilemma'
  | 'gedachte-experiment'
  | 'samenleving'
  | 'werk'
  | 'relaties'
  | 'dankbaarheid';

export interface DailyQuestion {
  id: string;
  kind: DailyQuestionKind;
  text: string;
  /** Denkers die deze vraag goed zouden kunnen stellen. */
  askers: string[];
  followUp: string;
  tags: string[];
}

/** Demo: een vooraf geschreven sessiefragment. */
export type SessionPhase = 'opening' | 'terugkeer' | 'doorvragen' | 'verdiepen' | 'afronden' | 'slot';

export interface SessionFragment {
  id: string;
  phase: SessionPhase;
  /** Trefwoorden die dit fragment extra passend maken. */
  keywords?: string[];
  /**
   * Tekst met optionele plaatshouders:
   *  {naam} = weergavenaam, {onderwerp} = opgegeven onderwerp, {woord} = opvallend woord
   *  uit het laatste bericht, {vorige} = onderwerp van een vorige sessie.
   */
  text: string;
}

/** Demo: een lesblok waaruit colleges op elk onderwerp worden opgebouwd. */
export interface LectureBlock {
  id: string;
  heading: string;
  keywords: string[];
  text: string;
  /** Kernles voor de conclusie. */
  lesson: string;
}

export interface DemoTimelineReaction {
  keywords: string[];
  text: string;
}

export interface DemoFigureContent {
  figureId: string;
  sessionFragments: SessionFragment[];
  lecture: {
    openings: string[];
    blocks: LectureBlock[];
    answers: string[];
    conclusions: string[];
    thinkQuestions: string[];
  };
  timelineReactions: DemoTimelineReaction[];
  reflectionQuestions: string[];
  thoughts: string[];
}
