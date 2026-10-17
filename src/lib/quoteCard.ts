/**
 * Citaatkaart (§7.6): een fragment van max. 200 tekens dat letterlijk uit het gesprek of college
 * komt (inkorten mag, aanvullen niet), en de opmaak ervan op de kaart. Pure functies, getest.
 */
import { LIMITS } from '@/config/limits';
import { markdownToPlainText } from './markdown';

const MAX = LIMITS.share.highlightMaxLength;

/** Witruimte samenvoegen (de tekens zelf blijven zoals ze zijn). */
export function collapse(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

/** Witruimte samenvoegen en typografische varianten gelijktrekken, alleen voor de vergelijking. */
export function comparable(text: string): string {
  return text.replace(/[‘’]/g, "'").replace(/[“”„]/g, '"').replace(/\s+/g, ' ').trim();
}

/** De platte tekst van een bron (markdown eruit), zoals de lezer hem ziet. */
export function plainSource(markdown: string): string {
  return markdownToPlainText(markdown);
}

/** Een foutmelding, of undefined als het fragment mag. */
export function highlightProblem(passage: string, source: string): string | undefined {
  const clean = comparable(passage);
  if (!clean) return 'Kies een fragment.';
  if (clean.length > MAX) return `Maximaal ${MAX} tekens.`;
  if (!comparable(source).includes(clean)) {
    return 'Het fragment moet letterlijk uit het gesprek of college komen.';
  }
  return undefined;
}

/** Zinnen uit een tekst (op . ! ? … gevolgd door witruimte). */
export function sentences(text: string): string[] {
  return collapse(text)
    .split(/(?<=[.!?…])\s+(?=[A-ZÀ-Ý“"‘'(])/u)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Een voorstel: de eerste kernles, anders de eerste zin die past (max. 200 tekens). */
export function suggestHighlight(source: string): string {
  const lesson = /(?:^|\n)1\.\s+(.+)/.exec(source)?.[1];
  if (lesson && collapse(lesson).length <= MAX) return collapse(lesson);
  const fitting = sentences(source).find((s) => s.length >= 40 && s.length <= MAX);
  return (
    fitting ??
    collapse(source)
      .slice(0, MAX)
      .replace(/\s+\S*$/, '')
  );
}

/** Woorden over regels verdelen binnen een breedte (meet-functie van het canvas). */
export function wrapText(measure: (text: string) => number, text: string, maxWidth: number) {
  const lines: string[] = [];
  let line = '';
  for (const word of collapse(text).split(' ')) {
    const candidate = line ? `${line} ${word}` : word;
    if (line && measure(candidate) > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** De grootste lettergrootte waarbij de tekst in het vlak past. */
export function fitText(
  measure: (text: string, size: number) => number,
  text: string,
  box: { width: number; height: number },
  sizes: readonly number[],
  lineHeight = 1.25,
): { size: number; lines: string[] } {
  for (const size of sizes) {
    const lines = wrapText((s) => measure(s, size), text, box.width);
    if (lines.length * size * lineHeight <= box.height) return { size, lines };
  }
  const size = sizes[sizes.length - 1] ?? 32;
  return { size, lines: wrapText((s) => measure(s, size), text, box.width) };
}
