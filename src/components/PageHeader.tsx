import type { ReactNode } from 'react';
import { cx } from '@/lib/cx';

export function PageHeader({
  title,
  intro,
  actions,
  eyebrow,
  className,
}: {
  title: ReactNode;
  intro?: ReactNode;
  actions?: ReactNode;
  eyebrow?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cx('mb-6 flex flex-wrap items-end justify-between gap-4', className)}>
      <div className="max-w-2xl">
        {eyebrow && <div className="mb-1 text-sm font-medium tracking-wide text-gold uppercase">{eyebrow}</div>}
        <h1 className="text-4xl sm:text-5xl">{title}</h1>
        {intro && <p className="mt-2 text-lg text-ink-2">{intro}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}

export function SectionTitle({ children, action, id }: { children: ReactNode; action?: ReactNode; id?: string }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <h2 id={id} className="text-2xl sm:text-3xl">
        {children}
      </h2>
      {action}
    </div>
  );
}
