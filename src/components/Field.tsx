import { type InputHTMLAttributes, type TextareaHTMLAttributes, useId } from 'react';
import { cx } from '@/lib/cx';

const CONTROL =
  'w-full rounded-xl border border-line-strong bg-card px-3.5 py-2.5 text-ink placeholder:text-ink-3 focus:border-ink-2 focus:outline-none focus-visible:outline-3 focus-visible:outline-info';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  counter?: boolean;
}

export function TextField({ label, hint, counter, className, maxLength, value, ...rest }: TextFieldProps) {
  const id = useId();
  const hintId = useId();
  const length = typeof value === 'string' ? value.length : 0;
  return (
    <div className={className}>
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="font-medium">
          {label}
        </label>
        {counter && maxLength !== undefined && (
          <span className="text-xs text-ink-3" aria-hidden>
            {length}/{maxLength}
          </span>
        )}
      </div>
      <input id={id} aria-describedby={hint ? hintId : undefined} className={CONTROL} maxLength={maxLength} value={value} {...rest} />
      {hint && (
        <p id={hintId} className="mt-1 text-sm text-ink-3">
          {hint}
        </p>
      )}
    </div>
  );
}

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  hideLabel?: boolean;
  hint?: string;
  counter?: boolean;
}

export function TextArea({ label, hideLabel, hint, counter, className, maxLength, value, ...rest }: TextAreaProps) {
  const id = useId();
  const hintId = useId();
  const length = typeof value === 'string' ? value.length : 0;
  return (
    <div className={className}>
      <div className={cx('mb-1 flex items-baseline justify-between gap-2', hideLabel && 'sr-only')}>
        <label htmlFor={id} className="font-medium">
          {label}
        </label>
        {counter && maxLength !== undefined && (
          <span className="text-xs text-ink-3" aria-hidden>
            {length}/{maxLength}
          </span>
        )}
      </div>
      <textarea
        id={id}
        aria-describedby={hint ? hintId : undefined}
        className={cx(CONTROL, 'resize-y leading-relaxed')}
        maxLength={maxLength}
        value={value}
        {...rest}
      />
      {hint && (
        <p id={hintId} className="mt-1 text-sm text-ink-3">
          {hint}
        </p>
      )}
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  description,
  disabled,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}) {
  const id = useId();
  const descId = useId();
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <div>
        <label htmlFor={id} className="font-medium">
          {label}
        </label>
        {description && (
          <p id={descId} className="text-sm text-ink-3">
            {description}
          </p>
        )}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-describedby={description ? descId : undefined}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cx(
          'relative mt-0.5 inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition-colors disabled:opacity-50',
          checked ? 'border-ok bg-ok' : 'border-line-strong bg-paper-2',
        )}
      >
        <span
          aria-hidden
          className={cx(
            'inline-block size-5 rounded-full bg-white shadow transition-transform',
            checked ? 'translate-x-6' : 'translate-x-1',
          )}
        />
      </button>
    </div>
  );
}
