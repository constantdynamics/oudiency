/**
 * Lege vervanger voor `livekit-client` (via een alias in vite.config.ts). Oudiency belt via een
 * WebSocket (gesprekslink), dus de WebRTC-route van de ElevenLabs-SDK wordt nooit gebruikt. Dat
 * scheelt ruim 500 kB op de belpagina. Wordt hij toch aangeroepen, dan volgt een duidelijke fout.
 */
function unsupported(): never {
  throw new Error('WebRTC wordt in Oudiency niet gebruikt: bellen gaat via een WebSocket.');
}

export class Room {
  constructor() {
    unsupported();
  }
}

export const RoomEvent = {};
export const Track = { Source: {}, Kind: {} };
export const ConnectionState = {};

export function createLocalAudioTrack(): never {
  return unsupported();
}
