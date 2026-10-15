import { RefreshCw } from 'lucide-react';
import { Link } from 'react-router';
import { buttonClasses } from '@/components/buttonClasses';
import { t } from '@/i18n/nl';
import { cx } from '@/lib/cx';
import { isChunkLoadError } from '@/lib/errors';

export function ErrorScreen({ error, fullPage = false }: { error: unknown; fullPage?: boolean }) {
  const newVersion = isChunkLoadError(error);
  return (
    <div
      role="alert"
      className={cx(
        'mx-auto flex max-w-xl flex-col items-center px-6 text-center',
        fullPage ? 'min-h-dvh justify-center' : 'py-16',
      )}
    >
      <p className="font-display text-6xl text-gold" aria-hidden>
        ⁂
      </p>
      <h1 className="mt-4 text-4xl">{newVersion ? t.errors.newVersionTitle : t.errors.title}</h1>
      <p className="mt-3 text-ink-2">{newVersion ? t.errors.newVersionBody : t.errors.pageBody}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={() => window.location.reload()}
          className={buttonClasses('primary', 'md')}
        >
          <RefreshCw aria-hidden className="size-4" />
          {t.errors.reload}
        </button>
        {!newVersion && (
          <Link to="/" className={buttonClasses('secondary', 'md')}>
            {t.errors.notFoundCta}
          </Link>
        )}
      </div>
    </div>
  );
}
