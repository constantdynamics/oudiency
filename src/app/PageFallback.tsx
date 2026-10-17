import { t } from '@/i18n/nl';

/** Terwijl een pagina-chunk laadt (alleen zichtbaar bij een trage verbinding). */
export function PageFallback() {
  return (
    <div className="flex justify-center py-24" role="status" aria-live="polite">
      <span className="size-8 animate-spin rounded-full border-2 border-line-strong border-t-ink motion-reduce:animate-none" />
      <span className="sr-only">{t.app.loading}</span>
    </div>
  );
}
