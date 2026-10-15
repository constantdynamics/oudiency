import type { ReactNode } from 'react';
import { cx } from '@/lib/cx';

export function EmptyState({
  icon,
  title,
  children,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cx(
        'flex flex-col items-center rounded-2xl border border-dashed border-line-strong bg-card/60 px-6 py-10 text-center',
        className,
      )}
    >
      {icon && <div className="mb-3 text-gold">{icon}</div>}
      <p className="font-display text-2xl font-semibold">{title}</p>
      {children && <div className="mt-2 max-w-md text-ink-2">{children}</div>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
