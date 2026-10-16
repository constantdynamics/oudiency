import { HeartHandshake, MessageCircle, Phone, Siren } from 'lucide-react';
import { CRISIS_RESOURCES } from '@/config/app';
import { t } from '@/i18n/nl';
import { cx } from '@/lib/cx';

/** Vaste hulpkaart bij signalen van crisis (§8.4). Altijd buiten de rol, van de app zelf. */
export function CrisisCard({ className }: { className?: string }) {
  return (
    <aside
      role="note"
      aria-label={t.crisis.title}
      className={cx('rounded-2xl border-2 border-info bg-info-soft p-4 text-ink sm:p-5', className)}
    >
      <div className="flex items-start gap-3">
        <HeartHandshake aria-hidden className="mt-0.5 size-6 shrink-0 text-info" />
        <div>
          <p className="font-display text-xl font-semibold">{t.crisis.title}</p>
          <p className="mt-1 text-ink-2">{t.crisis.body}</p>
          <ul className="mt-3 space-y-2">
            <li className="flex items-center gap-2">
              <Phone aria-hidden className="size-4 text-info" />
              <span>
                {t.crisis.org}:{' '}
                <a className="font-semibold underline" href={`tel:${CRISIS_RESOURCES.phone}`}>
                  {CRISIS_RESOURCES.phone}
                </a>{' '}
                of gratis{' '}
                <a
                  className="font-semibold underline"
                  href={`tel:${CRISIS_RESOURCES.freePhone.replace(/-/g, '')}`}
                >
                  {CRISIS_RESOURCES.freePhone}
                </a>
              </span>
            </li>
            <li className="flex items-center gap-2">
              <MessageCircle aria-hidden className="size-4 text-info" />
              <a
                className="font-semibold underline"
                href={CRISIS_RESOURCES.chatUrl}
                target="_blank"
                rel="noreferrer noopener"
              >
                {t.crisis.chat}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Siren aria-hidden className="size-4 text-danger" />
              <span>
                {t.crisis.emergency.replace(CRISIS_RESOURCES.emergency, '')}
                <a className="font-semibold underline" href={`tel:${CRISIS_RESOURCES.emergency}`}>
                  {CRISIS_RESOURCES.emergency}
                </a>
              </span>
            </li>
          </ul>
        </div>
      </div>
    </aside>
  );
}
