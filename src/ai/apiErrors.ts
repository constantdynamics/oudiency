/**
 * Fouten van de Claude API in soorten die de app kan uitleggen. De API geeft een type mee
 * (`billing_error`, `overloaded_error`, …); bij streams soms alleen in de body, zonder status.
 */
import type { AiErrorKind } from './provider';

export function aiErrorKindOf(
  status: number | undefined,
  type: string | undefined,
  message: string | undefined,
): AiErrorKind {
  const text = (message ?? '').toLowerCase();
  if (type === 'billing_error' || status === 402 || text.includes('credit balance')) {
    return 'billing';
  }
  if (type === 'authentication_error' || type === 'permission_error') return 'auth';
  if (status === 401 || status === 403) return 'auth';
  if (type === 'not_found_error' || status === 404) return 'model';
  if (type === 'rate_limit_error' || status === 429) return 'rate';
  if (type === 'overloaded_error' || type === 'api_error') return 'overloaded';
  if (status !== undefined && status >= 500) return 'overloaded';
  if (type === 'invalid_request_error' || type === 'request_too_large') return 'invalid';
  if (status === 400 || status === 413) return 'invalid';
  return 'other';
}

/** Weigert de API de fallback zelf (onbekende beta, of de parameter)? Dan zonder opnieuw. */
export function isFallbackRejection(message: string | undefined): boolean {
  return /fallback|anthropic-beta/i.test(message ?? '');
}
