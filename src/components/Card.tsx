import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '@/lib/cx';

interface CardProps extends HTMLAttributes<HTMLElement> {
  as?: 'div' | 'article' | 'section' | 'li' | 'aside';
  children: ReactNode;
  padded?: boolean;
}

export function Card({ as: Tag = 'div', className, children, padded = true, ...rest }: CardProps) {
  return (
    <Tag
      className={cx(
        'rounded-2xl border border-line bg-card shadow-card',
        padded && 'p-4 sm:p-5',
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}
