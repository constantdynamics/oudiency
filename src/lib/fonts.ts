/**
 * Lettertypen (self-hosted via @fontsource, open licenties). De broodletter en de standaard
 * displayletter laden we direct; de displayletters en schriften per denker pas wanneer een
 * thema ze nodig heeft (max. ~4 families tegelijk).
 */
import type { DisplayFontId, NativeScript } from '@/data/types';

export const DISPLAY_FONT_FAMILY: Record<DisplayFontId, string> = {
  cormorant: "'Cormorant Garamond Variable', 'Literata Variable', Georgia, serif",
  cinzel: "'Cinzel Variable', 'Cormorant Garamond Variable', Georgia, serif",
  'eb-garamond': "'EB Garamond Variable', 'Literata Variable', Georgia, serif",
  'im-fell': "'IM Fell English', 'EB Garamond Variable', Georgia, serif",
  literata: "'Literata Variable', Georgia, serif",
};

export const NATIVE_FONT_FAMILY: Record<NativeScript, string> = {
  latin: "'EB Garamond Variable', 'Literata Variable', Georgia, serif",
  // Cormorant heeft geen Grieks; EB Garamond wel.
  greek: "'EB Garamond Variable', 'Literata Variable', 'Noto Serif', Georgia, serif",
  han: "'Noto Serif SC', 'Songti SC', 'SimSun', serif",
  devanagari: "'Noto Serif Devanagari Variable', 'Kohinoor Devanagari', serif",
  gujarati: "'Noto Serif Gujarati Variable', 'Gujarati Sangam MN', serif",
};

const loaded = new Set<string>();

function once(key: string, loader: () => Promise<unknown>): void {
  if (loaded.has(key)) return;
  loaded.add(key);
  loader().catch(() => {
    // Laden mislukt (bijv. offline): de fallback-fonts nemen het over.
    loaded.delete(key);
  });
}

export function loadDisplayFont(id: DisplayFontId): void {
  switch (id) {
    case 'cinzel':
      once(id, () => import('@fontsource-variable/cinzel/wght.css'));
      break;
    case 'eb-garamond':
      once(id, () => import('@fontsource-variable/eb-garamond/wght.css'));
      break;
    case 'im-fell':
      once(id, () => import('@fontsource/im-fell-english/400.css'));
      break;
    case 'cormorant':
    case 'literata':
      // altijd al geladen (zie main.tsx)
      break;
  }
}

export function loadNativeFont(script: NativeScript): void {
  switch (script) {
    case 'greek':
    case 'latin':
      once('eb-garamond', () => import('@fontsource-variable/eb-garamond/wght.css'));
      break;
    case 'han':
      once('han', () => import('@fontsource/noto-serif-sc/400.css'));
      break;
    case 'devanagari':
      once('devanagari', () => import('@fontsource-variable/noto-serif-devanagari/wght.css'));
      break;
    case 'gujarati':
      once('gujarati', () => import('@fontsource-variable/noto-serif-gujarati/wght.css'));
      break;
  }
}

/** Welk schrift gebruikt deze tekst (voor het lazy laden van het juiste font)? */
export function detectScript(text: string): NativeScript {
  if (/[一-鿿㐀-䶿]/.test(text)) return 'han';
  if (/[઀-૿]/.test(text)) return 'gujarati';
  if (/[ऀ-ॿ]/.test(text)) return 'devanagari';
  if (/[Ͱ-Ͽἀ-῿]/.test(text)) return 'greek';
  return 'latin';
}

/** Wacht (kort) tot een font klaar is, bijvoorbeeld voordat we op een canvas tekenen. */
export async function ensureFontReady(family: string, sample = 'Aa'): Promise<void> {
  if (typeof document === 'undefined' || !('fonts' in document)) return;
  try {
    await Promise.race([
      document.fonts.load(`32px ${family}`, sample),
      new Promise((resolve) => setTimeout(resolve, 1500)),
    ]);
  } catch {
    // negeren: dan tekent de canvas met een fallback-font
  }
}
