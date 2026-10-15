/** Classnames samenvoegen (alleen volledige, statische classnames — nooit samengestelde Tailwind-namen). */
export function cx(...parts: Array<string | false | null | undefined | 0>): string {
  return parts.filter(Boolean).join(' ');
}
