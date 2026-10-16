import type { ReactNode } from 'react';
import { cx } from '@/lib/cx';

export interface ChipOption<T extends string> {
  value: T;
  label: ReactNode;
  count?: number;
}

/** Een rij keuzechips (één tegelijk actief), als knoppen met aria-pressed. */
export function ChoiceChips<T extends string>({
  label,
  options,
  value,
  onChange,
  className,
}: {
  /** Toegankelijke naam van de groep. */
  label: string;
  options: readonly ChipOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}) {
  return (
    <div role="group" aria-label={label} className={cx('flex flex-wrap gap-1.5', className)}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={cx(
              'inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition-colors',
              active
                ? 'border-ink bg-ink text-paper'
                : 'border-line-strong bg-card text-ink-2 hover:bg-paper-2 hover:text-ink',
            )}
          >
            {option.label}
            {option.count !== undefined && (
              <span className={cx('text-xs', active ? 'text-paper/80' : 'text-ink-3')}>
                {option.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
