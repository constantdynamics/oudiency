import { cx } from '@/lib/cx';

export type ButtonVariant =
  'primary' | 'secondary' | 'ghost' | 'figure' | 'figure-outline' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors select-none disabled:opacity-55 disabled:pointer-events-none';

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-ink text-paper hover:bg-ink-2 shadow-card',
  secondary: 'border border-line-strong bg-card text-ink hover:bg-paper-2',
  ghost: 'text-ink-2 hover:bg-paper-2 hover:text-ink',
  figure: 'bg-fig text-white hover:opacity-90 shadow-card',
  'figure-outline': 'border border-fig text-fig bg-card hover:bg-fig-surface',
  danger: 'bg-danger text-white hover:opacity-90',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'min-h-9 px-3.5 text-sm',
  md: 'min-h-11 px-5 text-[0.95rem]',
  lg: 'min-h-12 px-6 text-base',
};

export function buttonClasses(
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'md',
  extra?: string,
) {
  return cx(BASE, VARIANTS[variant], SIZES[size], extra);
}
