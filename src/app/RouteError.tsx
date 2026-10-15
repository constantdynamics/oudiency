import { isRouteErrorResponse, Link, useRouteError } from 'react-router';
import { buttonClasses } from '@/components/buttonClasses';
import { t } from '@/i18n/nl';

export function RouteError() {
  const error = useRouteError();
  const notFound = isRouteErrorResponse(error) && error.status === 404;
  if (!notFound) console.error(error);
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col items-center justify-center px-6 text-center">
      <p className="font-display text-6xl text-gold" aria-hidden>
        ⁂
      </p>
      <h1 className="mt-4 text-4xl">{notFound ? t.errors.notFound : t.errors.title}</h1>
      <p className="mt-3 text-ink-2">
        {notFound
          ? 'Zelfs Socrates zou toegeven dat hij deze pagina niet kent.'
          : 'Er ging iets mis bij het laden van deze pagina. Herladen helpt meestal.'}
      </p>
      <Link to="/" className={buttonClasses('primary', 'md', 'mt-6')}>
        {t.errors.notFoundCta}
      </Link>
    </main>
  );
}
