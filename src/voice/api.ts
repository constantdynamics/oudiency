/**
 * ElevenLabs-API vanuit de browser, met de eigen sleutel van de gebruiker (BYOK). De sleutel gaat
 * alleen naar api.elevenlabs.io, in de header `xi-api-key`. We lezen en controleren alleen de
 * velden die de app gebruikt.
 */
import * as z from 'zod/mini';
import { VOICE } from '@/config/voice';
import { missingScope } from './permissions';

export type VoiceErrorKind =
  | 'auth'
  | 'permission'
  | 'quota'
  | 'rate'
  | 'not_found'
  | 'invalid'
  | 'network'
  | 'server'
  | 'other';

export class VoiceApiError extends Error {
  readonly kind: VoiceErrorKind;
  readonly status?: number;
  /** Foutcode van ElevenLabs, bijvoorbeeld `missing_permissions`. */
  readonly code?: string;
  /** Ontbrekende toestemmingen (technische namen, bijv. `convai_read`), als ElevenLabs ze noemt. */
  readonly missing: readonly string[];
  constructor(
    kind: VoiceErrorKind,
    message: string,
    options: { status?: number; code?: string; missing?: readonly string[]; cause?: unknown } = {},
  ) {
    super(message, { cause: options.cause });
    this.name = 'VoiceApiError';
    this.kind = kind;
    this.status = options.status;
    this.code = options.code;
    this.missing = options.missing ?? [];
  }
}

/** Bepaalt het soort fout uit de HTTP-status en de foutcode/melding van ElevenLabs. */
export function classifyError(status: number, code?: string, message?: string): VoiceErrorKind {
  const text = `${code ?? ''} ${message ?? ''}`.toLowerCase();
  if (text.includes('missing_permission') || text.includes('missing the permission')) {
    return 'permission';
  }
  if (text.includes('quota') || text.includes('insufficient') || status === 402) return 'quota';
  if (status === 401) return 'auth';
  if (status === 403) return 'permission';
  if (status === 404) return 'not_found';
  if (status === 429) return 'rate';
  if (status === 400 || status === 422) return 'invalid';
  if (status >= 500) return 'server';
  return 'other';
}

async function toError(response: Response): Promise<VoiceApiError> {
  let code: string | undefined;
  let message: string | undefined;
  try {
    const data = (await response.json()) as { detail?: unknown };
    const detail = data.detail;
    if (typeof detail === 'string') message = detail;
    else if (Array.isArray(detail)) {
      message = detail
        .map((item) => (item && typeof item === 'object' && 'msg' in item ? String(item.msg) : ''))
        .filter(Boolean)
        .join('; ');
    } else if (detail && typeof detail === 'object') {
      const record = detail as Record<string, unknown>;
      code = typeof record.status === 'string' ? record.status : undefined;
      message = typeof record.message === 'string' ? record.message : undefined;
    }
  } catch {
    // geen JSON in de foutmelding
  }
  const scope = missingScope(message);
  return new VoiceApiError(
    classifyError(response.status, code, message),
    message || `ElevenLabs antwoordde met status ${response.status}.`,
    { status: response.status, code, missing: scope ? [scope] : [] },
  );
}

function parse<T>(schema: z.ZodMiniType<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) throw new VoiceApiError('other', 'Onverwacht antwoord van ElevenLabs.');
  return result.data;
}

const SubscriptionSchema = z.object({
  tier: z.string(),
  character_count: z.number(),
  character_limit: z.number(),
  next_character_count_reset_unix: z.nullish(z.number()),
  voice_slots_used: z.nullish(z.number()),
  voice_limit: z.nullish(z.number()),
  currency: z.nullish(z.string()),
});

const AgentListSchema = z.object({
  agents: z.array(
    z.object({ agent_id: z.string(), name: z.string(), tags: z.nullish(z.array(z.string())) }),
  ),
});

const PreviewSchema = z.object({
  previews: z.array(
    z.object({
      audio_base_64: z.string(),
      generated_voice_id: z.string(),
      media_type: z.nullish(z.string()),
      duration_secs: z.nullish(z.number()),
    }),
  ),
});

const ConversationSchema = z.object({
  status: z.nullish(z.string()),
  metadata: z.nullish(
    z.object({
      call_duration_secs: z.nullish(z.number()),
      cost: z.nullish(z.number()),
      cost_fiat: z.nullish(z.number()),
    }),
  ),
});

const VoiceListSchema = z.object({
  voices: z.array(
    z.object({
      voice_id: z.string(),
      name: z.string(),
      category: z.nullish(z.string()),
      labels: z.nullish(z.record(z.string(), z.nullish(z.string()))),
    }),
  ),
});

export type RawVoice = z.infer<typeof VoiceListSchema>['voices'][number];

export interface SubscriptionInfo {
  tier: string;
  creditsUsed: number;
  creditLimit: number;
  /** Wanneer het tegoed weer aanvult (ms sinds epoch), als bekend. */
  resetsAt?: number;
  voiceSlotsUsed?: number;
  voiceLimit?: number;
  /** Valuta van het account (bijv. 'usd' of 'eur'). */
  currency?: string;
}

export interface VoicePreview {
  generatedVoiceId: string;
  /** MP3-audio als base64. */
  audioBase64: string;
  mediaType: string;
  durationSecs?: number;
}

export interface ConversationCost {
  status?: string;
  credits?: number;
  /** Kosten in geld (valuta van het account), als ElevenLabs die meegeeft. */
  fiat?: number;
  durationSecs?: number;
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  query?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
  signal?: AbortSignal;
}

export function createElevenLabsApi(
  key: string,
  fetchImpl: typeof fetch = (input, init) => fetch(input, init),
) {
  async function send(path: string, options: RequestOptions = {}): Promise<Response> {
    const url = new URL(path, VOICE.apiBase);
    for (const [name, value] of Object.entries(options.query ?? {})) {
      if (value !== undefined) url.searchParams.set(name, String(value));
    }
    const headers: Record<string, string> = { 'xi-api-key': key };
    if (options.body !== undefined) headers['Content-Type'] = 'application/json';
    let response: Response;
    try {
      response = await fetchImpl(url, {
        method: options.method ?? 'GET',
        headers,
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
        signal: options.signal,
        referrerPolicy: 'no-referrer',
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') throw error;
      throw new VoiceApiError('network', 'ElevenLabs is niet bereikbaar.', { cause: error });
    }
    if (!response.ok) throw await toError(response);
    return response;
  }

  async function request(path: string, options: RequestOptions = {}): Promise<unknown> {
    const text = await (await send(path, options)).text();
    return text ? (JSON.parse(text) as unknown) : undefined;
  }

  async function exists(path: string): Promise<boolean> {
    try {
      await request(path);
      return true;
    } catch (error) {
      if (error instanceof VoiceApiError && error.kind === 'not_found') return false;
      throw error;
    }
  }

  return {
    async subscription(signal?: AbortSignal): Promise<SubscriptionInfo> {
      const data = parse(SubscriptionSchema, await request('/v1/user/subscription', { signal }));
      return {
        tier: data.tier,
        creditsUsed: data.character_count,
        creditLimit: data.character_limit,
        resetsAt: data.next_character_count_reset_unix
          ? data.next_character_count_reset_unix * 1000
          : undefined,
        voiceSlotsUsed: data.voice_slots_used ?? undefined,
        voiceLimit: data.voice_limit ?? undefined,
        currency: data.currency ?? undefined,
      };
    },

    /** Zoekt een eerder aangemaakte Oudiency-agent in het account. */
    async findAgentId(): Promise<string | undefined> {
      const data = parse(
        AgentListSchema,
        await request('/v1/convai/agents', {
          query: { search: 'Oudiency', page_size: 30, show_only_owned_agents: true },
        }),
      );
      const match = data.agents.find(
        (agent) => agent.name === VOICE.agentName || agent.tags?.includes(VOICE.agentTag),
      );
      return match?.agent_id;
    },

    agentExists(agentId: string): Promise<boolean> {
      return exists(`/v1/convai/agents/${encodeURIComponent(agentId)}`);
    },

    async createAgent(payload: object): Promise<string> {
      const data = parse(
        z.object({ agent_id: z.string() }),
        await request('/v1/convai/agents/create', { method: 'POST', body: payload }),
      );
      return data.agent_id;
    },

    async updateAgent(agentId: string, payload: object): Promise<void> {
      await request(`/v1/convai/agents/${encodeURIComponent(agentId)}`, {
        method: 'PATCH',
        body: payload,
      });
    },

    /** Kortlevende gesprekslink: het gesprek zelf loopt daarover, zonder de sleutel. */
    async signedUrl(agentId: string): Promise<string> {
      const data = parse(
        z.object({ signed_url: z.string() }),
        await request('/v1/convai/conversation/get-signed-url', { query: { agent_id: agentId } }),
      );
      return data.signed_url;
    },

    /** Drie stemvoorbeelden op basis van een beschrijving (Voice Design). Kost tegoed. */
    async designVoice(input: {
      description: string;
      text: string;
      seed?: number;
      model?: string;
      signal?: AbortSignal;
    }): Promise<VoicePreview[]> {
      const data = parse(
        PreviewSchema,
        await request('/v1/text-to-voice/design', {
          method: 'POST',
          query: { output_format: VOICE.previewFormat },
          body: {
            voice_description: input.description,
            model_id: input.model ?? VOICE.voiceDesignModel,
            text: input.text,
            ...(input.seed === undefined ? {} : { seed: input.seed }),
          },
          signal: input.signal,
        }),
      );
      return data.previews.map((preview) => ({
        generatedVoiceId: preview.generated_voice_id,
        audioBase64: preview.audio_base_64,
        mediaType: preview.media_type ?? 'audio/mpeg',
        durationSecs: preview.duration_secs ?? undefined,
      }));
    },

    /** Bewaart het gekozen voorbeeld als stem in het account. */
    async createVoice(input: {
      name: string;
      description: string;
      generatedVoiceId: string;
      notSelected?: readonly string[];
    }): Promise<string> {
      const data = parse(
        z.object({ voice_id: z.string() }),
        await request('/v1/text-to-voice', {
          method: 'POST',
          body: {
            voice_name: input.name,
            voice_description: input.description,
            generated_voice_id: input.generatedVoiceId,
            ...(input.notSelected?.length
              ? { played_not_selected_voice_ids: input.notSelected }
              : {}),
          },
        }),
      );
      return data.voice_id;
    },

    voiceExists(voiceId: string): Promise<boolean> {
      return exists(`/v1/voices/${encodeURIComponent(voiceId)}`);
    },

    async deleteVoice(voiceId: string): Promise<void> {
      await request(`/v1/voices/${encodeURIComponent(voiceId)}`, { method: 'DELETE' });
    },

    /**
     * Tekst naar spraak (podcasts): één fragment als MP3. Kost tegoed per teken; de app bewaart
     * het resultaat op het apparaat, zodat het maar één keer gemaakt hoeft te worden.
     */
    async speech(input: {
      voiceId: string;
      text: string;
      model: string;
      languageCode?: string;
      outputFormat: string;
      settings?: { stability?: number; speed?: number };
      signal?: AbortSignal;
    }): Promise<Blob> {
      const response = await send(`/v1/text-to-speech/${encodeURIComponent(input.voiceId)}`, {
        method: 'POST',
        query: { output_format: input.outputFormat },
        body: {
          text: input.text,
          model_id: input.model,
          ...(input.languageCode ? { language_code: input.languageCode } : {}),
          ...(input.settings
            ? {
                voice_settings: {
                  similarity_boost: 0.75,
                  ...(input.settings.stability === undefined
                    ? {}
                    : { stability: input.settings.stability }),
                  ...(input.settings.speed === undefined ? {} : { speed: input.settings.speed }),
                },
              }
            : {}),
        },
        signal: input.signal,
      });
      const blob = await response.blob();
      return blob.type ? blob : new Blob([blob], { type: 'audio/mpeg' });
    },

    /** De stemmen in het account, met de kant-en-klare stemmen (premade) van ElevenLabs. */
    async libraryVoices(signal?: AbortSignal): Promise<RawVoice[]> {
      const data = parse(VoiceListSchema, await request('/v1/voices', { signal }));
      return data.voices;
    },

    /** Kosten van een afgerond gesprek (zolang ElevenLabs het gesprek nog kent). */
    async conversationCost(conversationId: string): Promise<ConversationCost> {
      const data = parse(
        ConversationSchema,
        await request(`/v1/convai/conversations/${encodeURIComponent(conversationId)}`),
      );
      return {
        status: data.status ?? undefined,
        credits: data.metadata?.cost ?? undefined,
        fiat: data.metadata?.cost_fiat ?? undefined,
        durationSecs: data.metadata?.call_duration_secs ?? undefined,
      };
    },
  };
}

export type ElevenLabsApi = ReturnType<typeof createElevenLabsApi>;

/** Meerdere weigeringen samen (de sleuteltest): alle ontbrekende toestemmingen in één melding. */
export function mergePermissionErrors(errors: readonly VoiceApiError[]): VoiceApiError {
  return new VoiceApiError('permission', [...new Set(errors.map((e) => e.message))].join(' · '), {
    missing: [...new Set(errors.flatMap((e) => e.missing))],
  });
}

/** Elke fout als VoiceApiError (onbekende fouten worden 'other'). */
export function toVoiceError(error: unknown): VoiceApiError {
  if (error instanceof VoiceApiError) return error;
  const message = error instanceof Error ? error.message : String(error);
  return new VoiceApiError('other', message, { cause: error });
}
