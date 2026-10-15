import { X } from 'lucide-react';
import { type ReactNode, useEffect, useId, useRef } from 'react';
import { t } from '@/i18n/nl';
import { cx } from '@/lib/cx';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  /** Extra beschrijving onder de titel. */
  description?: string;
}

/**
 * Toegankelijke dialoog op basis van het native <dialog>-element (focus-trap, Escape, inert
 * achtergrond door showModal).
 */
export function Dialog({ open, onClose, title, children, footer, className, description }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.setAttribute('open', '');
    } else if (!open && dialog.open) {
      if (typeof dialog.close === 'function') dialog.close();
      else dialog.removeAttribute('open');
    }
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
      className={cx(
        'm-auto w-[min(36rem,calc(100vw-1.5rem))] max-h-[calc(100dvh-2rem)] overflow-auto rounded-2xl border border-line bg-card p-0 text-ink shadow-lift backdrop:bg-ink/40 backdrop:backdrop-blur-[2px]',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4 border-b border-line px-5 pt-4 pb-3">
        <div>
          <h2 id={titleId} className="text-2xl">
            {title}
          </h2>
          {description && (
            <p id={descId} className="mt-1 text-sm text-ink-3">
              {description}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={t.app.close}
          className="-mr-2 inline-flex size-10 shrink-0 items-center justify-center rounded-full text-ink-2 hover:bg-paper-2"
        >
          <X aria-hidden className="size-5" />
        </button>
      </div>
      <div className="px-5 py-4">{children}</div>
      {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-line px-5 py-3">{footer}</div>}
    </dialog>
  );
}
