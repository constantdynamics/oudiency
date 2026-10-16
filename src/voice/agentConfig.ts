/**
 * Configuratie van de ElevenLabs-agent die alle denkers speelt. Eén agent per account; de rol,
 * stem en openingszin komen per gesprek mee (overrides). Privacy staat zo strak mogelijk:
 * geen audio-opname, bewaartermijn 0 (wissen), audio en transcript wissen. Het transcript
 * bewaart alleen Oudiency zelf, lokaal.
 */
import { VOICE, VOICE_AGENT_TEXT } from '@/config/voice';

export interface AgentPayloadOptions {
  /**
   * Minimale variant: alleen wat het gesprek echt nodig heeft. Gebruikt als ElevenLabs de
   * volledige configuratie weigert (bijvoorbeeld een veld dat het account niet kent).
   */
  minimal?: boolean;
}

export function agentPayload({ minimal = false }: AgentPayloadOptions = {}) {
  const prompt = {
    prompt: VOICE_AGENT_TEXT.basePrompt,
    llm: VOICE.llm,
    ...(minimal
      ? {}
      : {
          ignore_default_personality: true,
          backup_llm_config: { preference: 'override', order: [VOICE.backupLlm] },
        }),
  };
  return {
    name: VOICE.agentName,
    tags: [VOICE.agentTag],
    conversation_config: {
      agent: {
        first_message: '',
        language: VOICE.language,
        prompt,
        ...(minimal
          ? {}
          : {
              // De AI-melding in de openingszin moet altijd helemaal te horen zijn.
              disable_first_message_interruptions: true,
              max_conversation_duration_message: VOICE_AGENT_TEXT.maxDurationMessage,
            }),
      },
      tts: minimal
        ? { model_id: VOICE.ttsFallbackModel }
        : {
            model_id: VOICE.ttsModel,
            agent_output_audio_format: VOICE.outputAudioFormat,
          },
      turn: {
        turn_timeout: VOICE.turnTimeoutSeconds,
        silence_end_call_timeout: VOICE.silenceEndCallSeconds,
        ...(minimal
          ? {}
          : {
              // Filosofische gesprekken hebben denkpauzes: niet te snel invallen.
              turn_eagerness: 'patient',
              soft_timeout_config: {
                timeout_seconds: 3,
                message: VOICE_AGENT_TEXT.fillers[0],
                additional_soft_timeout_messages: VOICE_AGENT_TEXT.fillers.slice(1),
                randomize_fillers: true,
                disable_until_first_user_message: true,
              },
            }),
      },
      conversation: {
        max_duration_seconds: VOICE.maxDurationSeconds,
      },
    },
    platform_settings: {
      // Privé: een gesprek starten kan alleen met een gesprekslink die je sleutel aanvraagt.
      auth: { enable_auth: true },
      overrides: {
        conversation_config_override: {
          agent: { first_message: true, language: true, prompt: { prompt: true } },
          tts: { voice_id: true, speed: true, stability: true },
          asr: { keywords: true },
        },
      },
      privacy: {
        record_voice: false,
        retention_days: 0,
        delete_audio: true,
        delete_transcript_and_pii: true,
      },
      call_limits: {
        agent_concurrency_limit: VOICE.callLimits.concurrent,
        daily_limit: VOICE.callLimits.perDay,
        bursting_enabled: false,
      },
    },
  };
}

export type AgentPayload = ReturnType<typeof agentPayload>;
