/**
 * De echte verbinding via de ElevenLabs-SDK (WebSocket). Alleen geladen op het belscherm.
 * De audio-worklets en de resampler komen als losse bestanden van de eigen site (geen CDN en geen
 * data:-URL, `?no-inline`): zo blijft de CSP strikt (`script-src 'self'`).
 */
import { Conversation } from '@elevenlabs/client';
import audioConcatProcessorUrl from '@elevenlabs/client/worklets/audioConcatProcessor.js?url&no-inline';
import rawAudioProcessorUrl from '@elevenlabs/client/worklets/rawAudioProcessor.js?url&no-inline';
import { VOICE } from '@/config/voice';
import type { StartCall } from './callSession';
import resamplerUrl from './resamplerWorklet?worker&url';

export interface CallSetup {
  signedUrl: string;
  prompt: string;
  firstMessage: string;
  voiceId: string;
  speed: number;
  stability: number;
  keywords: string[];
}

/**
 * Maakt een `StartCall` voor de sessie. `prepare` draait pas na de tik op "Bel" (gesprekslink
 * ophalen, agent controleren); de SDK ontgrendelt de audio op iOS zelf bij die tik.
 */
export function elevenLabsStarter(prepare: () => Promise<CallSetup>): StartCall {
  return async (events) => {
    const setup = await prepare();
    const conversation = await Conversation.startSession({
      signedUrl: setup.signedUrl,
      connectionType: 'websocket',
      overrides: {
        agent: {
          prompt: { prompt: setup.prompt },
          firstMessage: setup.firstMessage,
          language: VOICE.language,
        },
        tts: { voiceId: setup.voiceId, speed: setup.speed, stability: setup.stability },
        asr: { keywords: setup.keywords },
      },
      workletPaths: {
        rawAudioProcessor: rawAudioProcessorUrl,
        audioConcatProcessor: audioConcatProcessorUrl,
      },
      libsampleratePath: resamplerUrl,
      useWakeLock: true,
      onConnect: ({ conversationId }) => events.connected(conversationId),
      onMessage: ({ message, role }) => events.message(role, message),
      onAgentResponseCorrection: (event) =>
        events.corrected(event.original_agent_response, event.corrected_agent_response),
      onModeChange: ({ mode }) => events.mode(mode),
      onDisconnect: (details) =>
        events.disconnected(
          details.reason,
          details.reason === 'error' ? details.message : undefined,
        ),
      onError: (message) => console.warn('[bellen]', message),
    });
    return {
      end: () => conversation.endSession(),
      setMuted: (muted) => conversation.setMicMuted(muted),
      sendContext: (text) => conversation.sendContextualUpdate(text),
      sendText: (text) => conversation.sendUserMessage(text),
    };
  };
}
