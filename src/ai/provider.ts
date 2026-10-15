/**
 * AI-laag (§5.3): één interface, drie providers.
 *  - DemoProvider: vooraf geschreven, in-karakter fragmenten (standaard, zonder key)
 *  - AnthropicBrowserProvider: eigen API-key (BYOK), Messages API vanuit de browser
 *  - ProxyProvider: Fase 2, via een Supabase Edge Function (nu een stub)
 */
import type { z } from 'zod';
import type { AiTask } from '@/config/models';
import type { DemoContext } from './demoContext';

export type ProviderId = 'demo' | 'anthropic-browser' | 'proxy';

/** Een systeemblok; `cache` zet er een cache-breakpoint achter (statische delen vooraan). */
export interface SystemBlock {
  text: string;
  cache?: boolean;
}

/** Een bericht; meerdere tekstblokken worden als aparte blokken verstuurd. */
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string | string[];
}

export interface TextRequest {
  task: AiTask;
  system: SystemBlock[];
  messages: ChatMessage[];
  /** Gestructureerde context voor de demomodus (de echte provider negeert dit). */
  demo: DemoContext;
}

export interface StructuredRequest<T> extends TextRequest {
  schema: z.ZodType<T>;
}

export type StopReason = 'end_turn' | 'max_tokens' | 'refusal' | 'other';

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
}

export interface TextResult {
  text: string;
  stopReason: StopReason;
  usage?: TokenUsage;
  model?: string;
}

export interface AIProvider {
  readonly id: ProviderId;
  streamText(
    req: TextRequest,
    onDelta: (chunk: string) => void,
    signal?: AbortSignal,
  ): Promise<TextResult>;
  /** Zod-schema in `req`; het resultaat is gevalideerd. */
  structured<T>(req: StructuredRequest<T>): Promise<T>;
}

export type AiErrorKind =
  | 'auth'
  | 'rate'
  | 'overloaded'
  | 'network'
  | 'refusal'
  | 'aborted'
  | 'invalid'
  | 'other';

export class AiError extends Error {
  readonly kind: AiErrorKind;
  constructor(kind: AiErrorKind, message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = 'AiError';
    this.kind = kind;
  }
  get retryable(): boolean {
    return this.kind === 'rate' || this.kind === 'overloaded' || this.kind === 'network' || this.kind === 'other';
  }
}

export function isAbort(error: unknown): boolean {
  return (
    (error instanceof AiError && error.kind === 'aborted') ||
    (error instanceof DOMException && error.name === 'AbortError')
  );
}
