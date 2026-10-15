/**
 * Deterministische willekeur. Gebruikt voor alles wat na herladen gelijk moet blijven:
 * bezette spreekuurslots (seed = datum + denker), de dagvraag, de denker van de dag.
 */

/** cyrb53-hash: snelle, goed verspreide 53-bits hash van een string. */
export function hashString(input: string, seed = 0): number {
  let h1 = 0xdeadbeef ^ seed;
  let h2 = 0x41c6ce57 ^ seed;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

export type Rng = () => number;

/** mulberry32: kleine PRNG met 32-bits state; levert getallen in [0, 1). */
export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seededRng(seed: string): Rng {
  return mulberry32(hashString(seed) % 4294967296);
}

export function randomInt(rng: Rng, min: number, maxInclusive: number): number {
  return min + Math.floor(rng() * (maxInclusive - min + 1));
}

export function chance(rng: Rng, probability: number): boolean {
  return rng() < probability;
}

export function pick<T>(rng: Rng, items: readonly T[]): T | undefined {
  if (items.length === 0) return undefined;
  return items[Math.floor(rng() * items.length)];
}

/** Fisher–Yates op een kopie. */
export function shuffle<T>(rng: Rng, items: readonly T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = copy[i] as T;
    copy[i] = copy[j] as T;
    copy[j] = tmp;
  }
  return copy;
}

export function sample<T>(rng: Rng, items: readonly T[], n: number): T[] {
  return shuffle(rng, items).slice(0, Math.max(0, n));
}

/** Kies met gewichten (gewicht ≤ 0 telt niet mee). */
export function weightedPick<T>(
  rng: Rng,
  items: readonly T[],
  weight: (item: T) => number,
): T | undefined {
  const total = items.reduce((sum, item) => sum + Math.max(0, weight(item)), 0);
  if (total <= 0) return undefined;
  let r = rng() * total;
  for (const item of items) {
    r -= Math.max(0, weight(item));
    if (r < 0) return item;
  }
  return items[items.length - 1];
}
