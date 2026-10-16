import { FlaskConical, X } from 'lucide-react';
import { Link } from 'react-router';
import { useAiMode } from '@/ai';
import { t } from '@/i18n/nl';
import { useSettingsStore } from '@/store/settingsStore';

/** Duidelijke melding dat de app in demomodus draait (vooraf geschreven antwoorden). */
export function DemoBanner() {
  const mode = useAiMode();
  const dismissed = useSettingsStore((s) => s.settings.demoBannerDismissed);
  const update = useSettingsStore((s) => s.update);
  if (mode !== 'demo' || dismissed) return null;
  return (
    <div className="border-t border-warn-soft bg-warn-soft text-warn">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-1.5 text-sm sm:px-6">
        <FlaskConical aria-hidden className="size-4 shrink-0" />
        <p className="flex-1">
          <strong className="font-semibold">{t.app.demoMode}.</strong>{' '}
          <span className="hidden sm:inline">{t.demo.banner} </span>
          <Link to="/profiel#ai" className="font-medium underline underline-offset-2">
            {t.demo.bannerCta}
          </Link>
        </p>
        <button
          type="button"
          onClick={() => update({ demoBannerDismissed: true })}
          aria-label={t.demo.bannerDismiss}
          className="inline-flex size-8 items-center justify-center rounded-full hover:bg-white/50"
        >
          <X aria-hidden className="size-4" />
        </button>
      </div>
    </div>
  );
}
