/**
 * Uit een lange pagina de stukken halen die bij de vraag horen (pure functies, getest): de
 * inleiding altijd, daarna de alinea's met de meeste zoekwoorden, binnen een tekenbudget en in de
 * oorspronkelijke volgorde. De bronnen zijn Engels, dus de trefwoorden ook.
 */

export interface Paragraph {
  /** De sectiekop waaronder de alinea staat (leeg in de inleiding). */
  section: string;
  text: string;
}

const STOPWORDS = new Set(
  `a about above after again against all also am an and any are as at be because been before being below between both but by can could did do does doing down during each few for from further had has have having he her here hers herself him himself his how i if in into is it its itself just me more most my myself no nor not now of off on once only or other our ours ourselves out over own same she should so some such than that the their theirs them themselves then there these they this those through to too under until up very was we were what when where which while who whom why will with would you your yours yourself yourselves one two many much may might must upon within without thus also like`.split(
    /\s+/,
  ),
);

/** Kleine letters, zonder accenten en leestekens. */
export function normalizeEnglish(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Ruwe stam: meervouds- en werkwoordsuitgangen eraf, zodat 'emotions' en 'emotion' elkaar vinden. */
function stemEnglish(word: string): string {
  if (word.length <= 4) return word;
  for (const suffix of ['ing', 'ies', 'es', 'ed', 's']) {
    if (word.endsWith(suffix) && word.length - suffix.length >= 4) {
      return suffix === 'ies' ? `${word.slice(0, -3)}y` : word.slice(0, -suffix.length);
    }
  }
  return word;
}

/** De betekenisvolle woorden (gestemd en uniek) uit zoektermen of namen. */
export function searchTerms(texts: readonly string[]): string[] {
  const terms = new Set<string>();
  for (const text of texts) {
    for (const word of normalizeEnglish(text).split(' ')) {
      if (word.length > 2 && !STOPWORDS.has(word)) terms.add(stemEnglish(word));
    }
  }
  return [...terms];
}

/** Hoeveel verschillende zoekwoorden komen voor? De sectiekop telt half mee. */
export function relevance(paragraph: Paragraph, terms: readonly string[]): number {
  const words = new Set(normalizeEnglish(paragraph.text).split(' ').map(stemEnglish));
  const heading = new Set(normalizeEnglish(paragraph.section).split(' ').map(stemEnglish));
  let score = 0;
  for (const term of terms) {
    if (words.has(term)) score += 1;
    if (heading.has(term)) score += 0.5;
  }
  return score;
}

/** Secties die niets over het onderwerp zeggen (verwijzingen, lijsten, literatuur). */
const SKIP_SECTIONS =
  /^(see also|references|notes|footnotes|citations|sources|bibliography|works cited|further reading|external links|gallery|primary sources|secondary sources)$/i;

/**
 * Platte tekst van Wikipedia (TextExtracts, met `== Kop ==`-regels) als alinea's. Secties zonder
 * inhoud voor het onderwerp en hele korte regels (bijschriften, lijstjes) vallen weg.
 */
export function extractParagraphs(plain: string, minLength = 40): Paragraph[] {
  const paragraphs: Paragraph[] = [];
  let section = '';
  let skipping = false;
  for (const rawLine of plain.split('\n')) {
    const line = rawLine.trim();
    if (!line) continue;
    const heading = /^(=+)\s*(.*?)\s*\1$/.exec(line);
    if (heading) {
      const level = heading[1]!.length;
      const title = heading[2] ?? '';
      // Een subkop erft het overslaan van zijn hoofdsectie.
      if (level <= 2) skipping = SKIP_SECTIONS.test(title);
      else if (SKIP_SECTIONS.test(title)) skipping = true;
      section = title;
      continue;
    }
    if (skipping || line.length < minLength) continue;
    paragraphs.push({ section, text: line.replace(/\s+/g, ' ') });
  }
  return paragraphs;
}

/**
 * Kies alinea's binnen `budget` tekens: eerst de inleiding (tot een kwart van het budget, als
 * `keepLead`), dan de best passende. Alinea's die niets met de vraag te maken hebben, blijven weg.
 * Een te lange alinea wordt op een zinsgrens ingekort.
 */
export function selectPassages(
  paragraphs: readonly Paragraph[],
  terms: readonly string[],
  budget: number,
  keepLead = true,
): Paragraph[] {
  const picked = new Map<number, string>();
  let used = 0;
  const take = (index: number, text: string) => {
    picked.set(index, text);
    used += text.length;
  };

  if (keepLead) {
    const leadBudget = Math.round(budget / 4);
    for (let i = 0; i < paragraphs.length; i++) {
      const paragraph = paragraphs[i]!;
      if (paragraph.section || used >= leadBudget) break;
      const text = clip(paragraph.text, leadBudget - used);
      if (!text) break;
      take(i, text);
    }
  }

  const ranked = paragraphs
    .map((paragraph, index) => ({ index, score: relevance(paragraph, terms) }))
    .filter((entry) => entry.score > 0 && !picked.has(entry.index))
    .sort((a, b) => b.score - a.score || a.index - b.index);
  for (const { index } of ranked) {
    const room = budget - used;
    if (room < 200) break;
    const text = clip(paragraphs[index]!.text, room);
    if (text) take(index, text);
  }

  return [...picked.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([index, text]) => ({ section: paragraphs[index]!.section, text }));
}

/** Inkorten op de laatste zinsgrens binnen `max` tekens (of leeg als er geen hele zin past). */
export function clip(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const end = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('? '), cut.lastIndexOf('! '));
  return end > 80 ? cut.slice(0, end + 1) : '';
}

/** De gekozen stukken als tekst voor de prompt: een kopregel als de sectie wisselt. */
export function passagesText(passages: readonly Paragraph[]): string {
  const lines: string[] = [];
  let section: string | undefined;
  for (const passage of passages) {
    if (passage.section !== section) {
      if (passage.section) lines.push(`[${passage.section}]`);
      section = passage.section;
    }
    lines.push(passage.text);
  }
  return lines.join('\n');
}
