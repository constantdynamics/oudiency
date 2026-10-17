import { afterEach, describe, expect, it, vi } from 'vitest';
import { AnthropicBrowserProvider } from '@/ai/anthropicBrowserProvider';
import { aiErrorKindOf, isFallbackRejection } from '@/ai/apiErrors';
import { describeAiError } from '@/ai';
import { AiError } from '@/ai/provider';

function apiError(status: number, type: string, message: string): Response {
  return new Response(JSON.stringify({ type: 'error', error: { type, message } }), {
    status,
    headers: { 'content-type': 'application/json', 'request-id': 'req_test' },
  });
}

const sessionRequest = {
  task: 'session' as const,
  system: [{ text: 'Je bent Socrates.' }],
  messages: [{ role: 'user' as const, content: 'Goedemiddag.' }],
  demo: { kind: 'test' as const },
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('fouten van Claude in gewone taal', () => {
  it('herkent de soort aan het type, de status of de melding', () => {
    const credit =
      'Your credit balance is too low to access the Anthropic API. Please go to Plans & Billing to upgrade or purchase credits.';
    expect(aiErrorKindOf(400, 'invalid_request_error', credit)).toBe('billing');
    expect(aiErrorKindOf(402, 'billing_error', 'Payment required')).toBe('billing');
    expect(aiErrorKindOf(401, 'authentication_error', 'invalid x-api-key')).toBe('auth');
    expect(aiErrorKindOf(403, 'permission_error', 'not allowed')).toBe('auth');
    expect(aiErrorKindOf(404, 'not_found_error', 'model: claude-x')).toBe('model');
    expect(aiErrorKindOf(429, 'rate_limit_error', 'slow down')).toBe('rate');
    expect(aiErrorKindOf(529, 'overloaded_error', 'Overloaded')).toBe('overloaded');
    // Midden in een stream: alleen het type, geen status.
    expect(aiErrorKindOf(undefined, 'overloaded_error', 'Overloaded')).toBe('overloaded');
    expect(aiErrorKindOf(400, 'invalid_request_error', 'messages: field required')).toBe('invalid');
    expect(aiErrorKindOf(undefined, undefined, undefined)).toBe('other');
  });

  it('weet wanneer de fallback zelf geweigerd wordt', () => {
    expect(
      isFallbackRejection(
        'Unexpected value(s) `server-side-fallback-2026-07-01` for the `anthropic-beta` header.',
      ),
    ).toBe(true);
    expect(isFallbackRejection('fallbacks: Extra inputs are not permitted')).toBe(true);
    expect(isFallbackRejection('Your credit balance is too low')).toBe(false);
  });

  it('describeAiError: altijd een Nederlandse uitleg, met de melding van de dienst erbij', () => {
    const billing = new AiError('billing', 'Je tegoed bij Anthropic is op.', {
      detail: 'Your credit balance is too low',
    });
    expect(describeAiError(billing)).toEqual({
      kind: 'billing',
      message: 'Je tegoed bij Anthropic is op.',
      detail: 'Your credit balance is too low',
    });
    expect(describeAiError(new TypeError('x is undefined'))).toEqual({
      kind: 'other',
      message: 'Er ging iets mis bij Claude.',
      detail: 'x is undefined',
    });
  });
});

describe('eigen key: de provider meldt wat er echt misging', () => {
  it('tegoed op: duidelijke soort en de melding van Claude, zonder zinloze herhaling', async () => {
    const fetchMock = vi.fn(async () =>
      apiError(
        400,
        'invalid_request_error',
        'Your credit balance is too low to access the Anthropic API.',
      ),
    );
    vi.stubGlobal('fetch', fetchMock);
    const provider = new AnthropicBrowserProvider('sk-ant-test-tegoed');
    const failure = await provider.streamText(sessionRequest, () => {}).catch((e: unknown) => e);
    expect(failure).toBeInstanceOf(AiError);
    expect(failure).toMatchObject({
      kind: 'billing',
      message: 'Je tegoed bij Anthropic is op, dus Claude kan nu niet antwoorden.',
      detail: 'Your credit balance is too low to access the Anthropic API.',
    });
    // Geen tweede poging zonder fallback: die zou op hetzelfde stranden.
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('wordt de fallback-beta geweigerd, dan opnieuw zonder', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        apiError(
          400,
          'invalid_request_error',
          'Unexpected value(s) `server-side-fallback-2026-07-01` for the `anthropic-beta` header.',
        ),
      )
      .mockResolvedValueOnce(apiError(401, 'authentication_error', 'invalid x-api-key'));
    vi.stubGlobal('fetch', fetchMock);
    const provider = new AnthropicBrowserProvider('sk-ant-test-beta');
    const failure = await provider.streamText(sessionRequest, () => {}).catch((e: unknown) => e);
    expect(failure).toMatchObject({ kind: 'auth', detail: 'invalid x-api-key' });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const betaHeader = (call: number) =>
      new Headers((fetchMock.mock.calls[call] as [unknown, RequestInit])[1].headers).get(
        'anthropic-beta',
      );
    expect(betaHeader(0)).toContain('server-side-fallback');
    expect(betaHeader(1)).toBeNull();
  });
});
