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
import { clock } from '@/lib/clock';
import { useUsageStore } from '@/store/miscStores';
import { taskModel, useSettingsStore } from '@/store/settingsStore';
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

type AnthropicModule = typeof import('@anthropic-ai/sdk');

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

function toAiError(error: unknown, sdk: AnthropicModule): AiError {
  const A = sdk.default;
  if (error instanceof AiError) return error;
  if (error instanceof A.APIUserAbortError) {
    return new AiError('aborted', 'Afgebroken.', { cause: error });
  }
  if (error instanceof A.AuthenticationError || error instanceof A.PermissionDeniedError) {
    return new AiError(
      'auth',
      'Je API-key wordt niet geaccepteerd. Controleer hem in Profiel → Instellingen.',
      { cause: error },
    );
  }
  if (error instanceof A.RateLimitError) {
    return new AiError('rate', 'Even te veel tegelijk (rate limit). Probeer het zo opnieuw.', {
      cause: error,
    });
  }
  if (error instanceof A.NotFoundError) {
    return new AiError('invalid', 'Het gekozen model is niet beschikbaar voor deze key.', {
      cause: error,
    });
  }
  if (error instanceof A.BadRequestError) {
    return new AiError('invalid', 'De aanvraag werd niet geaccepteerd.', { cause: error });
  }
  if (error instanceof A.InternalServerError) {
    return new AiError('overloaded', 'De AI-dienst is even overbelast.', { cause: error });
  }
  if (error instanceof A.APIConnectionError) {
    return new AiError('network', 'Geen verbinding met de AI-dienst.', { cause: error });
  }
  if (error instanceof A.APIError) {
    return new AiError('other', 'Er ging iets mis bij de AI-dienst.', { cause: error });
  }
  return new AiError('other', 'Er ging iets mis.', { cause: error });
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
      const A = sdk.default;
      const fallbackProblem =
        useFallback &&
        !emitted &&
        !(error instanceof A.APIUserAbortError) &&
        (error instanceof A.BadRequestError || error instanceof A.APIConnectionError);
      if (fallbackProblem) {
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
          throw new AiError('refusal', 'Hier kan de simulatie niet op ingaan.');
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
        throw new AiError('refusal', 'Hier kan de simulatie niet op ingaan.');
      }
      if (response.parsed_output == null) throw new AiError('invalid', 'Onleesbaar antwoord.');
      return req.schema.parse(response.parsed_output);
    } catch (error) {
      const A = sdk.default;
      if (
        useFallback &&
        (error instanceof A.BadRequestError || error instanceof A.APIConnectionError)
      ) {
        fallbackUnavailable = true;
        return this.structured(req);
      }
      if (error instanceof AiError) throw error;
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
