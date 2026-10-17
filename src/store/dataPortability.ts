/**
 * Profiel → Mijn data: exporteren (JSON), importeren en alles wissen.
 * API-sleutels (Anthropic, ElevenLabs) gaan nooit mee in een export: ze staan buiten de stores.
 * De moderatorpincode (hash) gaat ook niet mee.
 */
import * as z from 'zod/mini';
import { APP } from '@/config/app';
import { clock } from '@/lib/clock';
import { runMigrations, storageKey, storeRegistry, type StoreName } from './persist';
// Zorg dat alle stores geregistreerd zijn voordat we exporteren/importeren.
import './allStores';

const ExportFileSchema = z.object({
  app: z.literal('oudiency'),
  formatVersion: z.int(),
  exportedAt: z.string(),
  stores: z.record(
    z.string(),
    z.object({
      state: z.unknown(),
      version: z.int().check(z.minimum(0)),
    }),
  ),
});
export type ExportFile = z.infer<typeof ExportFileSchema>;

/** De moderatorpincode (hash) gaat niet mee: wie importeert, kiest zelf een nieuwe. */
function withoutModeratorPin(state: unknown): unknown {
  if (!state || typeof state !== 'object' || !('settings' in state)) return state;
  const settings = (state as { settings: Record<string, unknown> }).settings;
  const rest: Record<string, unknown> = { ...settings, moderatorMode: false };
  delete rest.moderatorPinHash;
  return { ...state, settings: rest };
}

export function exportData(): ExportFile {
  const stores: ExportFile['stores'] = {};
  for (const name of storeRegistry.keys()) {
    const raw = localStorage.getItem(storageKey(name));
    if (!raw) continue;
    try {
      const parsed = JSON.parse(raw) as { state: unknown; version?: number };
      stores[name] = {
        state: name === 'settings' ? withoutModeratorPin(parsed.state) : parsed.state,
        version: parsed.version ?? 0,
      };
    } catch {
      // onleesbare store overslaan
    }
  }
  return {
    app: 'oudiency',
    formatVersion: APP.exportFormatVersion,
    exportedAt: clock.iso(),
    stores,
  };
}

export interface ImportResult {
  imported: StoreName[];
  skipped: { name: string; reason: string }[];
}

/**
 * Valideert het hele bestand vóórdat er iets overschreven wordt. Onbekende stores worden
 * overgeslagen; bij een ongeldige store wordt niets geïmporteerd.
 */
export async function importData(json: string): Promise<ImportResult> {
  let data: unknown;
  try {
    data = JSON.parse(json);
  } catch {
    throw new Error('Dit bestand is geen geldige JSON.');
  }
  const file = ExportFileSchema.safeParse(data);
  if (!file.success) throw new Error('Dit is geen exportbestand van Oudiency.');
  if (file.data.formatVersion > APP.exportFormatVersion) {
    throw new Error('Dit exportbestand is gemaakt met een nieuwere versie van de app.');
  }

  const result: ImportResult = { imported: [], skipped: [] };
  const toWrite: { name: StoreName; state: unknown; version: number }[] = [];

  for (const [name, entry] of Object.entries(file.data.stores)) {
    const store = storeRegistry.get(name as StoreName);
    if (!store) {
      result.skipped.push({ name, reason: 'onbekend onderdeel' });
      continue;
    }
    if (entry.version > store.version) {
      throw new Error(`Onderdeel "${name}" komt uit een nieuwere versie van de app.`);
    }
    const migrated = runMigrations(entry.state, entry.version, store.version, store.migrations);
    const valid = store.schema.safeParse(migrated);
    if (!valid.success) {
      throw new Error(`Onderdeel "${name}" bevat ongeldige gegevens; er is niets geïmporteerd.`);
    }
    toWrite.push({ name: store.name, state: valid.data, version: store.version });
  }

  for (const item of toWrite) {
    localStorage.setItem(
      storageKey(item.name),
      JSON.stringify({ state: item.state, version: item.version }),
    );
    result.imported.push(item.name);
  }
  await Promise.all(toWrite.map((item) => storeRegistry.get(item.name)?.rehydrate()));
  return result;
}

/** Wis alle gegevens van deze app in deze browser. */
export function wipeAllData(options: { includeApiKeys: boolean }): void {
  const secrets = new Set([storageKey('apikey'), storageKey('elevenlabs-key')]);
  const prefix = `${APP.storageNamespace}:`;
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(prefix)) keys.push(key);
  }
  for (const key of keys) {
    if (!options.includeApiKeys && secrets.has(key)) continue;
    localStorage.removeItem(key);
  }
  try {
    localStorage.removeItem('oudiency:dev:clockOffset');
  } catch {
    // niets
  }
  // Ook de podcastaudio op dit apparaat (IndexedDB); los geladen, want zelden nodig.
  void import('@/podcast/audioCache').then((cache) => cache.clearAudio());
}
