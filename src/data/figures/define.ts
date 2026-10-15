/**
 * Hulpjes om denkers te definiëren. Kerndenkers schrijven we volledig uit; netwerkdenkers
 * krijgen een compact profiel waarvan de rest (stem, microcopy, spreekuur, thema) hier wordt
 * aangevuld met verstandige standaardwaarden.
 */
import { seededRng } from '@/lib/seeded-rng';
import type {
  DisplayFontId,
  Figure,
  FigureTheme,
  KeyConcept,
  KeyWork,
  LifeEvent,
  MotifId,
  NativeScript,
  NetworkLink,
  Quote,
} from '../types';

export type ThemeFamily =
  | 'grieks'
  | 'romeins'
  | 'chinees'
  | 'indiaas'
  | 'verlichting'
  | 'amerikaans'
  | 'gouden-eeuw'
  | 'romantiek'
  | 'renaissance'
  | 'middeleeuws'
  | 'brits';

/** Thema-families voor netwerkdenkers: één systeem, herkenbare sferen. */
export const FAMILY_THEMES: Record<ThemeFamily, FigureTheme> = {
  grieks: {
    primary: '#34506a',
    secondary: '#7b93a6',
    accent: '#b7a57a',
    surface: '#f1f2ef',
    motif: 'column',
    displayFont: 'cormorant',
  },
  romeins: {
    primary: '#6b2a23',
    secondary: '#a5633a',
    accent: '#c29d55',
    surface: '#f6eee7',
    motif: 'laurel',
    displayFont: 'cinzel',
  },
  chinees: {
    primary: '#2f3d36',
    secondary: '#6a8577',
    accent: '#a8473d',
    surface: '#f2f1ea',
    motif: 'inkwash',
    displayFont: 'cormorant',
  },
  indiaas: {
    primary: '#6b3912',
    secondary: '#b46d2d',
    accent: '#2f6b55',
    surface: '#f7f0e2',
    motif: 'lotus',
    displayFont: 'cormorant',
  },
  verlichting: {
    primary: '#2a3e5b',
    secondary: '#5c7291',
    accent: '#b8944a',
    surface: '#eff1f4',
    motif: 'compass',
    displayFont: 'eb-garamond',
  },
  amerikaans: {
    primary: '#4a3423',
    secondary: '#7c5f42',
    accent: '#9b3a2b',
    surface: '#f5eee2',
    motif: 'quill',
    displayFont: 'im-fell',
  },
  'gouden-eeuw': {
    primary: '#2b4951',
    secondary: '#5e7f87',
    accent: '#bf893d',
    surface: '#f0f3f0',
    motif: 'tulip',
    displayFont: 'eb-garamond',
  },
  romantiek: {
    primary: '#3d2e4f',
    secondary: '#6b5981',
    accent: '#ae824e',
    surface: '#f3f0f4',
    motif: 'flame',
    displayFont: 'cormorant',
  },
  renaissance: {
    primary: '#5a2c39',
    secondary: '#8d5967',
    accent: '#b7944a',
    surface: '#f5eff0',
    motif: 'scroll',
    displayFont: 'eb-garamond',
  },
  middeleeuws: {
    primary: '#3a395d',
    secondary: '#6d6b93',
    accent: '#b7994d',
    surface: '#f2f1f6',
    motif: 'scroll',
    displayFont: 'eb-garamond',
  },
  brits: {
    primary: '#2e4a3b',
    secondary: '#5f7d6c',
    accent: '#a5743c',
    surface: '#f0f3ef',
    motif: 'wave',
    displayFont: 'eb-garamond',
  },
};

/** Spreekuur: 8 vaste tijden tussen 09:00 en 21:00, per denker iets anders (deterministisch). */
export function generateSlots(id: string): string[] {
  const rng = seededRng(`${id}|spreekuur`);
  const quarters: string[] = [];
  for (let minutes = 9 * 60; minutes <= 20 * 60 + 45; minutes += 15) {
    quarters.push(`${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`);
  }
  const chosen = new Set<string>();
  // Verdeel over de dag: twee per blok van drie uur.
  const blocks = [
    [9 * 60, 12 * 60],
    [12 * 60, 15 * 60],
    [15 * 60, 18 * 60],
    [18 * 60, 21 * 60],
  ] as const;
  for (const [from, to] of blocks) {
    const options = quarters.filter((q) => {
      const [h, m] = q.split(':').map(Number);
      const total = (h ?? 0) * 60 + (m ?? 0);
      return total >= from && total < to;
    });
    while ([...chosen].filter((q) => options.includes(q)).length < 2 && options.length > 0) {
      const pickIndex = Math.floor(rng() * options.length);
      const value = options[pickIndex];
      if (value) chosen.add(value);
    }
  }
  return [...chosen].sort();
}

export interface NetworkFigureInput {
  id: string;
  name: string;
  shortName?: string;
  nativeName?: string;
  nativeScript?: NativeScript;
  epithet: string;
  born: number;
  died: number;
  approximate?: boolean;
  displayYears?: string;
  origin: string;
  school: string;
  family: ThemeFamily;
  /** Optioneel: eigen accenten bovenop de familie. */
  theme?: Partial<FigureTheme> & { motif?: MotifId; displayFont?: DisplayFontId };
  tags: string[];
  bio: string;
  keyConcepts: KeyConcept[];
  keyWorks: KeyWork[];
  lifeEvents: LifeEvent[];
  quotes?: Quote[];
  specs?: { label: string; value: string }[];
  voice: { register: string; method: string; habits?: string[]; nativePhrases?: { phrase: string; translation: string }[]; avoid?: string[] };
  modernLens: string;
  controversies?: string[];
  network: NetworkLink[];
  helpsWith: string[];
  monogram?: string;
}

/** Bouw een volledig Figure-object voor een netwerkdenker. */
export function networkFigure(input: NetworkFigureInput): Figure {
  const short = input.shortName ?? input.name.split(' ').slice(-1)[0] ?? input.name;
  return {
    id: input.id,
    tier: 'netwerk',
    name: input.name,
    shortName: input.shortName,
    nativeName: input.nativeName,
    nativeScript: input.nativeScript,
    epithet: input.epithet,
    born: input.born,
    died: input.died,
    approximate: input.approximate,
    displayYears: input.displayYears,
    origin: input.origin,
    school: input.school,
    tags: input.tags,
    bio: input.bio,
    keyConcepts: input.keyConcepts,
    keyWorks: input.keyWorks,
    lifeEvents: input.lifeEvents,
    quotes: input.quotes ?? [],
    specs: input.specs ?? [],
    voice: {
      register: input.voice.register,
      method: input.voice.method,
      habits: input.voice.habits ?? [],
      nativePhrases: input.voice.nativePhrases ?? [],
      avoid: input.voice.avoid ?? [
        'Verzonnen citaten of titels',
        'Uitspraken die na de eigen tijd liggen presenteren alsof je ze toen deed',
      ],
    },
    modernLens: input.modernLens,
    controversies: input.controversies ?? [],
    theme: { ...FAMILY_THEMES[input.family], ...input.theme },
    avatar: { kind: 'svg' },
    availability: { slots: generateSlots(input.id) },
    network: input.network,
    helpsWith: input.helpsWith,
    monogram: input.monogram,
    microcopy: {
      thinking: `${short} denkt even na …`,
      doorOpen: `De deur staat open: ${short} wacht op je.`,
      farewells: [
        `De tijd is om, en er wacht al een andere student. Ik moet nu door naar een andere student. Dank je voor je vragen — neem ze mee.`,
      ],
    },
  };
}
