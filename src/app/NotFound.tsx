import { Link } from 'react-router';
import { buttonClasses } from '@/components/Button';
import { t } from '@/i18n/nl';

export function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center py-16 text-center">
      <p className="font-display text-6xl text-gold" aria-hidden>
        ⁂
      </p>
      <h1 className="mt-4 text-4xl">{t.errors.notFound}</h1>
      <p className="mt-3 text-ink-2">Zelfs Socrates zou toegeven dat hij deze pagina niet kent.</p>
      <Link to="/" className={buttonClasses('primary', 'md', 'mt-6')}>
        {t.errors.notFoundCta}
      </Link>
    </div>
  );
}
