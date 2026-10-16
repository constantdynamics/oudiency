/**
 * Persistentie (Fase 1): Zustand-stores met de persist-middleware in localStorage, onder één
 * namespace (`oudiency:v1:<store>`), met een schemaversie en migraties per store.
 * Bij het laden valideren we met Zod; ongeldige data wordt niet stil overgenomen.
 *
 * Fase 2: dezelfde stores dienen als cache; de repositories (store/repos.ts) synchroniseren
 * met Supabase.
 */
import type * as z from 'zod/mini';
import { createJSONStorage, type PersistOptions } from 'zustand/middleware';
import { APP } from '@/config/app';

export type StoreName =
  | 'profile'
  | 'settings'
  | 'bookings'
  | 'sessions'
  | 'lectures'
  | 'posts'
  | 'dailyQuestions'
  | 'notifications'
  | 'library'
  | 'usage'
  | 'cache'
  | 'voice'
  | 'podcasts';

/** Sleutels (BYOK) staan los van de stores: ze gaan nooit mee in een export. */
export type SecretName = 'apikey' | 'elevenlabs-key';

export function storageKey(name: StoreName | SecretName): string {
  return `${APP.storageNamespace}:${name}`;
}

export type Migration = (state: unknown) => unknown;

export interface PersistSpec<S, P> {
  name: StoreName;
  version: number;
  /** Schema van het opgeslagen deel (na partialize). */
  schema: z.ZodMiniType<P>;
  partialize: (state: S) => P;
  /** Migraties per doelversie: migrations[2] zet versie 1 om naar 2, enzovoort. */
  migrations?: Record<number, Migration>;
}

/** Registry voor "Mijn data" (exporteren, importeren, wissen). */
export interface RegisteredStore {
  name: StoreName;
  version: number;
  schema: z.ZodMiniType<unknown>;
  migrations?: Record<number, Migration>;
  rehydrate: () => Promise<void> | void;
}

export const storeRegistry = new Map<StoreName, RegisteredStore>();

export function registerStore(entry: RegisteredStore): void {
  storeRegistry.set(entry.name, entry);
}

export function runMigrations(
  state: unknown,
  fromVersion: number,
  toVersion: number,
  migrations: Record<number, Migration> = {},
): unknown {
  let current = state;
  for (let v = fromVersion + 1; v <= toVersion; v++) {
    const migrate = migrations[v];
    if (migrate) current = migrate(current);
  }
  return current;
}

/** Bouwt de persist-opties voor een store, inclusief validatie en migraties. */
export function persistOptions<S, P>(spec: PersistSpec<S, P>): PersistOptions<S, P> {
  return {
    name: storageKey(spec.name),
    version: spec.version,
    storage: createJSONStorage(() => localStorage),
    partialize: spec.partialize,
    migrate: (persisted, version) =>
      runMigrations(persisted, version, spec.version, spec.migrations) as P,
    merge: (persisted, current) => {
      if (persisted === undefined || persisted === null) return current;
      const result = spec.schema.safeParse(persisted);
      if (!result.success) {
        console.warn(`[opslag] Ongeldige data in "${spec.name}" genegeerd.`, result.error.issues);
        try {
          // Bewaar een kopie, zodat niets onherroepelijk verloren gaat.
          const raw = localStorage.getItem(storageKey(spec.name));
          if (raw) localStorage.setItem(`${storageKey(spec.name)}:ongeldig`, raw);
        } catch {
          // geen opslag beschikbaar
        }
        return current;
      }
      return { ...current, ...result.data };
    },
  };
}
