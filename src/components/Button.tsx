import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router';
import { cx } from '@/lib/cx';
import { buttonClasses, type ButtonSize, type ButtonVariant } from './buttonClasses';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  className,
  children,
  type,
  ...rest
}: ButtonProps) {
  return (
    <button type={type ?? 'button'} className={buttonClasses(variant, size, className)} {...rest}>
      {icon}
      {children}
    </button>
  );
}

interface ButtonLinkProps extends LinkProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
}

export function ButtonLink({
  variant = 'primary',
  size = 'md',
  icon,
  className,
  children,
  ...rest
}: ButtonLinkProps) {
  return (
    <Link
      className={buttonClasses(
        variant,
        size,
        typeof className === 'string' ? className : undefined,
      )}
      {...rest}
    >
      {icon}
      {children}
    </Link>
  );
}

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  children: ReactNode;
}

/** Icoonknop met verplicht toegankelijk label. */
export function IconButton({ label, className, children, type, ...rest }: IconButtonProps) {
  return (
    <button
      type={type ?? 'button'}
      aria-label={label}
      title={label}
      className={cx(
        'inline-flex size-11 items-center justify-center rounded-full text-ink-2 transition-colors hover:bg-paper-2 hover:text-ink',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
