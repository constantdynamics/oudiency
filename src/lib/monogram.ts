/** Monogram uit de naam: maximaal twee hoofdletters (zonder tussenvoegsels). */
const PARTICLES = new Set(['van', 'de', 'den', 'der', 'von', 'la', 'le', 'du', 'of', 'da', 'des']);

export function monogramFor(figure: { name: string; monogram?: string }): string {
  if (figure.monogram) return figure.monogram;
  const words = figure.name
    .replace(/[.()]/g, ' ')
    .split(/\s+/)
    .filter((w) => w && !PARTICLES.has(w.toLowerCase()));
  const first = words[0] ?? figure.name;
  if (words.length <= 1) return first.charAt(0).toUpperCase();
  return `${first.charAt(0)}${(words[words.length - 1] ?? '').charAt(0)}`.toUpperCase();
}
