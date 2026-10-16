/**
 * Audio van de podcasts op je apparaat (keuze 6a): elk gesproken fragment één keer maken, daarna
 * gratis opnieuw luisteren en doorspelen. IndexedDB, want MP3's zijn te groot voor localStorage.
 * Geen IndexedDB (privévenster, tests)? Dan alleen in het geheugen, zolang de pagina open is.
 * Gaat nooit mee in een export; "Alles wissen" wist ook dit.
 */
import { PODCAST } from '@/config/podcast';

const DB_NAME = 'oudiency-audio';
const STORE = 'fragmenten';

const memory = new Map<string, Blob>();
let dbPromise: Promise<IDBDatabase | null> | null = null;

function openDb(): Promise<IDBDatabase | null> {
  dbPromise ??= new Promise((resolve) => {
    if (typeof indexedDB === 'undefined') {
      resolve(null);
      return;
    }
    try {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => request.result.createObjectStore(STORE);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
      request.onblocked = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
  return dbPromise;
}

function done<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('IndexedDB-fout'));
  });
}

/** Sleutel per fragment, stem en model: een andere stem of een ander model maakt een nieuw fragment. */
export function audioKey(episodeId: string, segmentId: string, voiceId: string): string {
  return `${episodeId}/${segmentId}/${voiceId}/${PODCAST.ttsModel}`;
}

function episodeRange(episodeId: string): IDBKeyRange {
  return IDBKeyRange.bound(`${episodeId}/`, `${episodeId}/￿`);
}

export async function getAudio(key: string): Promise<Blob | undefined> {
  const db = await openDb();
  if (!db) return memory.get(key);
  try {
    const value = await done(db.transaction(STORE).objectStore(STORE).get(key));
    return value instanceof Blob ? value : undefined;
  } catch {
    return memory.get(key);
  }
}

export async function putAudio(key: string, blob: Blob): Promise<void> {
  const db = await openDb();
  if (!db) {
    memory.set(key, blob);
    return;
  }
  try {
    await done(db.transaction(STORE, 'readwrite').objectStore(STORE).put(blob, key));
  } catch {
    // Vol of geweigerd: dan alleen voor nu, in het geheugen.
    memory.set(key, blob);
  }
}

export async function deleteEpisodeAudio(episodeId: string): Promise<void> {
  for (const key of [...memory.keys()]) {
    if (key.startsWith(`${episodeId}/`)) memory.delete(key);
  }
  const db = await openDb();
  if (!db) return;
  try {
    await done(
      db.transaction(STORE, 'readwrite').objectStore(STORE).delete(episodeRange(episodeId)),
    );
  } catch {
    // niets te wissen
  }
}

export async function clearAudio(): Promise<void> {
  memory.clear();
  const db = await openDb();
  if (!db) return;
  try {
    await done(db.transaction(STORE, 'readwrite').objectStore(STORE).clear());
  } catch {
    // niets te wissen
  }
}

/** Hoeveel audio er op dit apparaat staat (voor de instellingen). */
export async function audioUsage(): Promise<{ fragments: number; bytes: number }> {
  const db = await openDb();
  let fragments = 0;
  let bytes = 0;
  for (const blob of memory.values()) {
    fragments += 1;
    bytes += blob.size;
  }
  if (!db) return { fragments, bytes };
  try {
    const values = await done(db.transaction(STORE).objectStore(STORE).getAll());
    for (const value of values) {
      if (value instanceof Blob) {
        fragments += 1;
        bytes += value.size;
      }
    }
  } catch {
    // alleen het geheugen telt dan
  }
  return { fragments, bytes };
}
