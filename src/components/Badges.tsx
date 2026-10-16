import { BookMarked, FlaskConical, Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';
import { t } from '@/i18n/nl';
import { cx } from '@/lib/cx';

interface PillProps {
  children: ReactNode;
  tone?: 'neutral' | 'gold' | 'info' | 'ok' | 'warn' | 'danger' | 'figure';
  className?: string;
  title?: string;
  icon?: ReactNode;
}

const TONES: Record<NonNullable<PillProps['tone']>, string> = {
  neutral: 'border-line bg-paper-2 text-ink-2',
  gold: 'border-gold-soft bg-gold-soft text-gold',
  info: 'border-info-soft bg-info-soft text-info',
  ok: 'border-ok-soft bg-ok-soft text-ok',
  warn: 'border-warn-soft bg-warn-soft text-warn',
  danger: 'border-danger-soft bg-danger-soft text-danger',
  figure: 'border-fig/25 bg-fig-surface text-fig',
};

export function Pill({ children, tone = 'neutral', className, title, icon }: PillProps) {
  return (
    <span
      title={title}
      className={cx(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium leading-5 whitespace-nowrap',
        TONES[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}

/** Verplicht label bij elk gesprek, college en elke reactie (EU AI-verordening: transparantie). */
export function AiLabel({ className }: { className?: string }) {
  return (
    <Pill
      tone="info"
      className={className}
      title={t.app.aiLabelLong}
      icon={<Sparkles aria-hidden className="size-3" />}
    >
      {t.app.aiLabel}
    </Pill>
  );
}

export function ExampleBadge({ className }: { className?: string }) {
  return (
    <Pill tone="gold" className={className} icon={<BookMarked aria-hidden className="size-3" />}>
      {t.app.example}
    </Pill>
  );
}

export function DemoBadge({ className }: { className?: string }) {
  return (
    <Pill
      tone="warn"
      className={className}
      title={t.demo.inline}
      icon={<FlaskConical aria-hidden className="size-3" />}
    >
      {t.app.demoMode}
    </Pill>
  );
}
