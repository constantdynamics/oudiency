/** Unieke id's voor lokaal opgeslagen records (Fase 2: UUID's uit de database). */
export function uid(prefix: string): string {
  const random =
    typeof globalThis.crypto?.randomUUID === 'function'
      ? globalThis.crypto.randomUUID().replace(/-/g, '').slice(0, 16)
      : Math.random().toString(36).slice(2, 12) + Math.random().toString(36).slice(2, 8);
  return `${prefix}_${random}`;
}
