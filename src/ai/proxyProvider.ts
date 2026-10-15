/**
 * Fase 2: zelfde interface, maar de aanroep gaat naar een Supabase Edge Function die de
 * Claude-key server-side bewaart en de limieten (limits.service) afdwingt.
 * In Fase 1 alleen een stub.
 */
import {
  AiError,
  type AIProvider,
  type StructuredRequest,
  type TextRequest,
  type TextResult,
} from './provider';

export class ProxyProvider implements AIProvider {
  readonly id = 'proxy' as const;
  readonly endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  async streamText(_req: TextRequest, _onDelta: (chunk: string) => void): Promise<TextResult> {
    throw new AiError('other', 'De proxy-provider is pas beschikbaar in Fase 2.');
  }

  async structured<T>(_req: StructuredRequest<T>): Promise<T> {
    throw new AiError('other', 'De proxy-provider is pas beschikbaar in Fase 2.');
  }
}
