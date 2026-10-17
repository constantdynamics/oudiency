import { AlertTriangle, ExternalLink, RefreshCw, Sparkles } from 'lucide-react';
import { Link } from 'react-router';
import type { AiErrorInfo } from '@/ai';
import { t } from '@/i18n/nl';
import { Button } from './Button';

/** Soorten waarbij de demomodus een uitweg is (het ligt aan de key of het tegoed, niet aan nu). */
const DEMO_HELPS = new Set<AiErrorInfo['kind']>(['auth', 'billing', 'model']);

/**
 * Waarom Claude niet antwoordde, wat je eraan doet en de melding van Claude zelf, met opnieuw
 * proberen en (bij key- of tegoedproblemen) verder in de demomodus.
 */
export function AiErrorNote({
  error,
  onRetry,
  retryLabel,
  onUseDemo,
  settingsLink = true,
}: {
  error: AiErrorInfo;
  onRetry?: () => void;
  retryLabel?: string;
  onUseDemo?: () => void;
  /** Uit op de instellingenpagina zelf. */
  settingsLink?: boolean;
}) {
  const fix = t.ai.fixes[error.kind];
  return (
    <div
      role="alert"
      className="flex gap-2 rounded-2xl border border-danger-soft bg-danger-soft px-4 py-3 text-ink"
    >
      <AlertTriangle aria-hidden className="mt-0.5 size-5 shrink-0 text-danger" />
      <div className="min-w-0 flex-1">
        <p>{error.message}</p>
        {fix && <p className="mt-1 text-sm">{fix}</p>}
        {error.kind === 'billing' && (
          <a
            href={t.ai.billingUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-info underline"
          >
            {t.ai.billingLink}
            <ExternalLink aria-hidden className="size-4" />
          </a>
        )}
        {settingsLink && (error.kind === 'auth' || error.kind === 'model') && (
          <Link to="/profiel" className="mt-1 inline-block text-sm font-medium text-info underline">
            {t.ai.settingsLink}
          </Link>
        )}
        {error.detail && <p className="mt-1 text-sm text-ink-2">{t.ai.detail(error.detail)}</p>}
        {(onRetry || (onUseDemo && DEMO_HELPS.has(error.kind))) && (
          <div className="mt-2 flex flex-wrap gap-2">
            {onRetry && (
              <Button
                size="sm"
                variant="secondary"
                icon={<RefreshCw aria-hidden className="size-4" />}
                onClick={onRetry}
              >
                {retryLabel}
              </Button>
            )}
            {onUseDemo && DEMO_HELPS.has(error.kind) && (
              <Button
                size="sm"
                variant="ghost"
                icon={<Sparkles aria-hidden className="size-4" />}
                onClick={onUseDemo}
              >
                {t.ai.useDemo}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
