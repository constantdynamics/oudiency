/**
 * Emotie-aanwijzingen voor de expressieve stemmodellen (keuzes 3a en 9): Engelse woorden tussen
 * blokhaken, zoals [laughs] of [sighs]. Hooguit één per fragment; alleen uitgesproken door een
 * model dat ze begrijpt, en nooit zichtbaar in de tekst van de aflevering.
 */

/** Een aanwijzing: één tot vier kleine Engelse woorden tussen blokhaken. */
const TAG = /\[([a-z]+(?:[ -][a-z]+){0,3})\]/g;
const ANY_BRACKETS = /\[[^\]]*\]/g;

const tidy = (text: string) =>
  text
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.!?;:])/g, '$1')
    .trim();

/** Alleen de eerste geldige aanwijzing blijft staan; alle andere blokhaken verdwijnen. */
export function keepOneTag(text: string): string {
  let kept = false;
  const withTags = text.replace(ANY_BRACKETS, (match) => {
    const isTag = new RegExp(`^${TAG.source}$`).test(match);
    if (isTag && !kept) {
      kept = true;
      return match;
    }
    return ' ';
  });
  return tidy(withTags);
}

/** Zonder aanwijzingen (voor de tekst van de aflevering en voor modellen zonder ondersteuning). */
export function stripTags(text: string): string {
  return tidy(text.replace(ANY_BRACKETS, ' '));
}

export function hasTag(text: string): boolean {
  return new RegExp(TAG.source).test(text);
}
