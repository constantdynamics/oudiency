/**
 * Toestemmingen van een ElevenLabs-sleutel. Een nieuwe sleutel is standaard beperkt; ElevenLabs
 * noemt bij een weigering één ontbrekende toestemming tegelijk (bijv. `convai_read`). De app toont
 * dan de hele lijst die Oudiency nodig heeft, zodat je de sleutel in één keer goed zet.
 */

export type KeyPermissionId = 'agents' | 'voices' | 'textToVoice' | 'textToSpeech' | 'user';

/** In de volgorde van het sleutelscherm; `user` is optioneel (alleen voor het tegoed). */
export const KEY_PERMISSIONS: readonly KeyPermissionId[] = [
  'agents',
  'voices',
  'textToVoice',
  'textToSpeech',
  'user',
];

/** Voorvoegsels van de technische namen die ElevenLabs in foutmeldingen gebruikt. */
const SCOPE_PREFIXES: Record<KeyPermissionId, readonly string[]> = {
  agents: ['convai'],
  voices: ['voices'],
  textToVoice: ['text_to_voice', 'voice_generation', 'voice_design'],
  textToSpeech: ['text_to_speech'],
  user: ['user'],
};

/** De technische naam uit een melding als "… is missing the permission convai_read to …". */
export function missingScope(message: string | undefined): string | undefined {
  return message
    ?.match(/missing (?:the )?permissions? [`'"]?([a-z][a-z0-9]*_[a-z0-9_]+)/i)?.[1]
    ?.toLowerCase();
}

/** Bij welk onderdeel van het sleutelscherm hoort een technische naam? */
export function permissionOf(scope: string): KeyPermissionId | undefined {
  return KEY_PERMISSIONS.find((id) =>
    SCOPE_PREFIXES[id].some((prefix) => scope === prefix || scope.startsWith(`${prefix}_`)),
  );
}
