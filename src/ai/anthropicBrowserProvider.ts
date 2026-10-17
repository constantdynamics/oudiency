/**
 * BYOK-provider: de Messages API rechtstreeks vanuit de browser met de TypeScript SDK
 * (`dangerouslyAllowBrowser: true`). Bedoeld voor de product owner en testers, niet als
 * publieke oplossing: de key staat alleen in localStorage van deze browser en gaat alleen
 * naar api.anthropic.com.
 *
 * - SDK en zod-helper worden pas geladen als deze provider gebruikt wordt (kleinere bundel).
 * - Statische systeemprompt vooraan met cache-breakpoints; het gesprek via automatische caching.
 * - Effort per taak, constant binnen een gesprek.
 * - Server-side fallback bij weigeringen voor modellen die het ondersteunen; werkt dat in de
 *   browser niet, dan valt de provider automatisch terug op een gewone aanvraag.
 */
import type Anthropic from '@anthropic-ai/sdk';
import { FALLBACK_BETA, FALLBACK_CAPABLE_MODELS } from '@/config/models';
import { t } from '@/i18n/nl';
import { clock } from '@/lib/clock';
import { useUsageStore } from '@/store/miscStores';
import { taskModel, useSettingsStore } from '@/store/settingsStore';
import { aiErrorKindOf, isFallbackRejection } from './apiErrors';
import {
  AiError,
  type AIProvider,
  type ChatMessage,
  type StopReason,
  type StructuredRequest,
  type SystemBlock,
  type TextRequest,
  type TextResult,
  type TokenUsage,
} from './provider';

type AnthropicModule = { default: typeof Anthropic };

let sdkPromise: Promise<AnthropicModule> | null = null;
function loadSdk(): Promise<AnthropicModule> {
  sdkPromise ??= import('@anthropic-ai/sdk');
  return sdkPromise;
}

/** Wordt true als de fallback-beta in deze browser niet werkt (dan niet opnieuw proberen). */
let fallbackUnavailable = false;

function toSystem(blocks: SystemBlock[]): Anthropic.TextBlockParam[] {
  return blocks
    .filter((block) => block.text.trim().length > 0)
    .map((block) =>
      block.cache
        ? { type: 'text', text: block.text, cache_control: { type: 'ephemeral' } }
        : { type: 'text', text: block.text },
    );
}

function toMessages(messages: ChatMessage[]): Anthropic.MessageParam[] {
  return messages.map((message) => ({
    role: message.role,
    content:
      typeof message.content === 'string'
        ? message.content
        : message.content
            .filter((text) => text.length > 0)
            .map((text): Anthropic.TextBlockParam => ({ type: 'text', text })),
  }));
}

function mapStop(reason: string | null | undefined): StopReason {
  if (reason === 'end_turn' || reason === 'stop_sequence') return 'end_turn';
  if (reason === 'max_tokens') return 'max_tokens';
  if (reason === 'refusal') return 'refusal';
  return 'other';
}

interface UsageLike {
  input_tokens: number;
  output_tokens: number;
  cache_read_input_tokens?: number | null;
  cache_creation_input_tokens?: number | null;
}

function recordUsage(task: string, model: string, usage: UsageLike): TokenUsage {
  const tokens: TokenUsage = {
    inputTokens: usage.input_tokens ?? 0,
    outputTokens: usage.output_tokens ?? 0,
    cacheReadTokens: usage.cache_read_input_tokens ?? 0,
    cacheWriteTokens: usage.cache_creation_input_tokens ?? 0,
  };
  useUsageStore.getState().log({
    at: clock.iso(),
    task,
    model,
    inputTokens: tokens.inputTokens,
    outputTokens: tokens.outputTokens,
    cacheReadTokens: tokens.cacheReadTokens,
    cacheWriteTokens: tokens.cacheWriteTokens,
  });
  return tokens;
}

/** Type en melding uit de foutbody van de API (`{ type: 'error', error: { type, message } }`). */
function apiErrorInfo(error: { error?: unknown; type?: string | null }): {
  type?: string;
  message?: string;
} {
  const nested = (error.error as { error?: { type?: unknown; message?: unknown } } | undefined)
    ?.error;
  return {
    type: error.type ?? (typeof nested?.type === 'string' ? nested.type : undefined),
    message: typeof nested?.message === 'string' ? nested.message : undefined,
  };
}

/** Elke fout als AiError: een soort die de app uitlegt, plus de melding van Claude zelf. */
function toAiError(error: unknown, sdk: AnthropicModule): AiError {
  const A = sdk.default;
  if (error instanceof AiError) return error;
  if (error instanceof A.APIUserAbortError) {
    return new AiError('aborted', t.ai.errors.aborted, { cause: error });
  }
  if (error instanceof A.APIConnectionError) {
    return new AiError('network', t.ai.errors.network, { cause: error });
  }
  if (error instanceof A.APIError) {
    const info = apiErrorInfo(error);
    const kind = aiErrorKindOf(error.status, info.type, info.message);
    return new AiError(kind, t.ai.errors[kind], { cause: error, detail: info.message });
  }
  return new AiError('other', t.ai.errors.other, {
    cause: error,
    detail: error instanceof Error ? error.message : undefined,
  });
}

/**
 * Lag het aan de fallback zelf? Een geweigerde beta of parameter, of een geblokkeerde aanvraag
 * (CORS staat de beta-header misschien niet toe). Dan zonder fallback opnieuw; bij een andere fout
 * (tegoed, key, model) helpt dat niet.
 */
function isFallbackProblem(error: unknown, sdk: AnthropicModule): boolean {
  const A = sdk.default;
  if (error instanceof A.APIConnectionError) return true;
  return error instanceof A.BadRequestError && isFallbackRejection(apiErrorInfo(error).message);
}

export class AnthropicBrowserProvider implements AIProvider {
  readonly id = 'anthropic-browser' as const;
  private client: Anthropic | null = null;
  private readonly apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async getClient(): Promise<{ client: Anthropic; sdk: AnthropicModule }> {
    const sdk = await loadSdk();
    this.client ??= new sdk.default({
      apiKey: this.apiKey,
      dangerouslyAllowBrowser: true,
      maxRetries: 2,
    });
    return { client: this.client, sdk };
  }

  private wantsFallback(model: string): boolean {
    return (
      !fallbackUnavailable &&
      useSettingsStore.getState().settings.serverFallback &&
      FALLBACK_CAPABLE_MODELS.has(model)
    );
  }

  async streamText(
    req: TextRequest,
    onDelta: (chunk: string) => void,
    signal?: AbortSignal,
  ): Promise<TextResult> {
    const { client, sdk } = await this.getClient();
    const config = taskModel(req.task);
    const params = {
      model: config.model,
      max_tokens: config.maxTokens,
      system: toSystem(req.system),
      messages: toMessages(req.messages),
      output_config: { effort: config.effort },
      // Automatische caching van het groeiende gesprek (naast de breakpoints in system).
      cache_control: { type: 'ephemeral' as const },
    };
    const useFallback = this.wantsFallback(config.model);
    let emitted = false;
    const emit = (delta: string) => {
      emitted = true;
      onDelta(delta);
    };

    try {
      if (useFallback) {
        const stream = client.beta.messages.stream(
          { ...params, betas: [FALLBACK_BETA], fallbacks: 'default' },
          { signal },
        );
        stream.on('text', emit);
        const final = await stream.finalMessage();
        const text = final.content
          .filter((block): block is Anthropic.Beta.BetaTextBlock => block.type === 'text')
          .map((block) => block.text)
          .join('');
        return {
          text,
          stopReason: mapStop(final.stop_reason),
          usage: recordUsage(req.task, final.model, final.usage),
          model: final.model,
        };
      }
      const stream = client.messages.stream(params, { signal });
      stream.on('text', emit);
      const final = await stream.finalMessage();
      const text = final.content
        .filter((block): block is Anthropic.TextBlock => block.type === 'text')
        .map((block) => block.text)
        .join('');
      return {
        text,
        stopReason: mapStop(final.stop_reason),
        usage: recordUsage(req.task, final.model, final.usage),
        model: final.model,
      };
    } catch (error) {
      if (useFallback && !emitted && !signal?.aborted && isFallbackProblem(error, sdk)) {
        fallbackUnavailable = true;
        return this.streamText(req, onDelta, signal);
      }
      throw toAiError(error, sdk);
    }
  }

  async structured<T>(req: StructuredRequest<T>): Promise<T> {
    const { client, sdk } = await this.getClient();
    const config = taskModel(req.task);
    const base = {
      model: config.model,
      max_tokens: config.maxTokens,
      system: toSystem(req.system),
      messages: toMessages(req.messages),
    };
    const useFallback = this.wantsFallback(config.model);
    try {
      if (useFallback) {
        const { betaZodOutputFormat } = await import('@anthropic-ai/sdk/helpers/beta/zod');
        const response = await client.beta.messages.parse({
          ...base,
          betas: [FALLBACK_BETA],
          fallbacks: 'default',
          output_config: { effort: config.effort, format: betaZodOutputFormat(req.schema) },
        });
        recordUsage(req.task, response.model, response.usage);
        if (response.stop_reason === 'refusal') {
          throw new AiError('refusal', t.ai.errors.refusal);
        }
        if (response.parsed_output == null) throw new AiError('invalid', 'Onleesbaar antwoord.');
        return req.schema.parse(response.parsed_output);
      }
      const { zodOutputFormat } = await import('@anthropic-ai/sdk/helpers/zod');
      const response = await client.messages.parse({
        ...base,
        output_config: { effort: config.effort, format: zodOutputFormat(req.schema) },
      });
      recordUsage(req.task, response.model, response.usage);
      if (response.stop_reason === 'refusal') {
        throw new AiError('refusal', t.ai.errors.refusal);
      }
      if (response.parsed_output == null) throw new AiError('invalid', 'Onleesbaar antwoord.');
      return req.schema.parse(response.parsed_output);
    } catch (error) {
      if (useFallback && isFallbackProblem(error, sdk)) {
        fallbackUnavailable = true;
        return this.structured(req);
      }
      throw toAiError(error, sdk);
    }
  }

  /** Controleer de key zonder tokens te verbruiken (Models API). */
  async testConnection(): Promise<void> {
    const { client, sdk } = await this.getClient();
    try {
      await client.models.retrieve('claude-haiku-5-5');
    } catch (error) {
      throw toAiError(error, sdk);
    }
  }
}
