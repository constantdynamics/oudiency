import { X } from 'lucide-react';
import { t } from '@/i18n/nl';
import { cx } from '@/lib/cx';
import { useToastStore } from './toastStore';

const TONES = {
  neutral: 'border-line bg-ink text-paper',
  ok: 'border-ok bg-ok text-white',
  warn: 'border-warn bg-warn text-white',
  danger: 'border-danger bg-danger text-white',
} as const;

export function Toasts() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);
  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed inset-x-0 bottom-[calc(5rem_+_var(--player-h))] z-50 flex flex-col items-center gap-2 px-4 md:bottom-[calc(1.5rem_+_var(--player-h))]"
    >
      {toasts.map((item) => (
        <div
          key={item.id}
          role="status"
          className={cx(
            'pointer-events-auto flex max-w-md items-center gap-3 rounded-full border px-4 py-2 text-sm shadow-lift animate-fade-in',
            TONES[item.tone],
          )}
        >
          <span>{item.text}</span>
          <button
            type="button"
            onClick={() => dismiss(item.id)}
            aria-label={t.app.close}
            className="-mr-1 inline-flex size-7 items-center justify-center rounded-full hover:bg-white/15"
          >
            <X aria-hidden className="size-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
