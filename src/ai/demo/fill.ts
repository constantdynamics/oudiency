/** Plaatshouders invullen in vooraf geschreven demo-teksten, met nette interpunctie. */

export interface FillVars {
  naam?: string;
  onderwerp?: string;
  woord?: string;
  vorige?: string;
  hoofdvraag?: string;
  vraag?: string;
}

export function fill(template: string, vars: FillVars): string {
  const out = template.replace(
    /\{(naam|onderwerp|woord|vorige|hoofdvraag|vraag)\}/g,
    (_, key: keyof FillVars) => {
      const value = vars[key];
      return value && value.trim() ? value.trim() : '';
    },
  );
  return tidy(out);
}

/** Ruimt lege plaatshouders op: ", ." → ".", dubbele spaties, lege aanhalingstekens. */
export function tidy(text: string): string {
  return text
    .replace(/[‘'"“]\s*[’'"”]/g, '')
    .replace(/\(\s*\)/g, '')
    .replace(/\s+,/g, ',')
    .replace(/,\s*([.!?;:])/g, '$1')
    .replace(/,(\s*,)+/g, ',')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/ +\n/g, '\n')
    .trim();
}

/** Het langste stuk tekst tussen plaatshouders: om te herkennen of een fragment al gebruikt is. */
export function anchorOf(template: string): string {
  const parts = template.split(/\{[^}]+\}/).map((p) => p.trim());
  return parts.sort((a, b) => b.length - a.length)[0]?.slice(0, 60) ?? '';
}
