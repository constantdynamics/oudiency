/** Tekst-hulpjes: normaliseren, trefwoorden, leestijd. Gebruikt door demomodus, zoeken en matching. */

const STOPWORDS = new Set(
  `aan al alle alles als altijd ander andere anders ben bij daar daarom dan dat de der deze die dit doch doe doen door dus een eens en er ga gaan gaat geen geweest had heb hebben heeft hem het hier hij hoe hoeveel hun iemand iets ik in is ja je jij jou jouw jullie kan kon kun kunnen laat maar me meer men met mij mijn mijzelf moet moeten na naar niet niets nog nu of om omdat ons onze ook op over reeds sinds te tegen toch toen tot u uit uw van veel voor vaak waar waarom wanneer want was wat we wel welk welke werd wie wij wil wilt word wordt worden zal ze zei zelf zich zij zijn zo zoals zonder zou zouden echt gewoon even heel best weet weten denk denken vind vinden soms nooit iemand iets eigenlijk misschien beetje elke elk mezelf jezelf hun hen haar hare onszelf zichzelf daarna daarvan ervan erop eraan ervoor hierover daarover dingen ding mensen mens jaar jaren dag dagen keer week manier vraag vragen goed goede slecht nieuwe nieuw grote groot kleine klein lang veel weinig moment tijd`.split(
    /\s+/,
  ),
);

/** Kleine letters, zonder diakritische tekens (é → e) en zonder leestekens. */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Betekenisvolle woorden (zonder stopwoorden), genormaliseerd. */
export function tokenize(text: string): string[] {
  return normalize(text)
    .split(' ')
    .map((word) => word.replace(/^-+|-+$/g, ''))
    .filter((word) => word.length > 2 && !STOPWORDS.has(word));
}

/**
 * Heel eenvoudige stam: knipt veelvoorkomende Nederlandse meervoud- en verbuigingsuitgangen af,
 * zodat 'vrijheid' en 'vrijheden', 'angst' en 'angsten' elkaar vinden.
 */
export function stem(word: string): string {
  const w = normalize(word);
  if (w.length <= 4) return w;
  for (const suffix of ['heden', 'ingen', 'eren', 'elen', 'en', 'es', 'er', 'e', 's']) {
    if (w.endsWith(suffix) && w.length - suffix.length >= 4) {
      return suffix === 'heden' ? `${w.slice(0, -5)}heid` : w.slice(0, -suffix.length);
    }
  }
  return w;
}

export function stems(text: string): Set<string> {
  return new Set(tokenize(text).map(stem));
}

/**
 * Hoeveel trefwoorden komen voor in de tekst? Trefwoorden mogen woordgroepen zijn
 * ('wu wei') of stammen ('vrijhe' matcht 'vrijheid'): we zoeken op stam én op substring.
 */
export function keywordScore(text: string, keywords: readonly string[]): number {
  const normalized = ` ${normalize(text)} `;
  const textStems = stems(text);
  let score = 0;
  for (const keyword of keywords) {
    const k = normalize(keyword);
    if (!k) continue;
    if (k.includes(' ')) {
      if (normalized.includes(` ${k}`)) score += 2;
      continue;
    }
    if (textStems.has(stem(k)) || normalized.includes(` ${k}`)) score += 1;
  }
  return score;
}

/** Het meest 'veelzeggende' woord uit een tekst: langste niet-stopwoord. */
export function salientWord(text: string): string | undefined {
  const words = text
    .split(/\s+/)
    .map((w) => w.replace(/^[^\p{L}]+|[^\p{L}]+$/gu, ''))
    .filter((w) => w.length > 3 && !STOPWORDS.has(normalize(w)));
  if (words.length === 0) return undefined;
  return [...words].sort((a, b) => b.length - a.length)[0]?.toLowerCase();
}

/** Inkorten op een woordgrens, met ellips. */
export function truncate(text: string, maxLength: number): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= maxLength) return clean;
  const cut = clean.slice(0, maxLength - 1);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > maxLength * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[,;:.\s]+$/, '')}…`;
}

export function wordCount(text: string): number {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

/** Leestijd in minuten (Nederlands, rustig tempo ~220 woorden per minuut). */
export function readingMinutes(words: number, wordsPerMinute = 220): number {
  return Math.max(1, Math.round(words / wordsPerMinute));
}

/** 'a, b en c' */
export function joinDutch(items: readonly string[]): string {
  if (items.length <= 1) return items[0] ?? '';
  return `${items.slice(0, -1).join(', ')} en ${items[items.length - 1]}`;
}

/** Eerste letter hoofdletter. */
export function capitalize(text: string): string {
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : text;
}

/** Extraheer #hashtags uit tekst (zonder #, kleine letters, uniek). */
export function extractHashtags(text: string): string[] {
  const tags = new Set<string>();
  for (const match of text.matchAll(/#([\p{L}\p{N}_-]{2,40})/gu)) {
    if (match[1]) tags.add(match[1].toLowerCase());
  }
  return [...tags];
}
