import { useNow } from '@/hooks/useNow';
import { cx } from '@/lib/cx';
import { formatCountdown } from '@/lib/dates';
import { screenReaderAnnouncement, timerState, type TimerColor } from '@/services/session-timer';

const COLORS: Record<TimerColor, string> = {
  groen: 'text-ok',
  oranje: 'text-warn',
  rood: 'text-danger',
};

/**
 * Resterende tijd van een gesprek, berekend uit `endsAt` (nooit aftellende state).
 * Groen > 5 min, oranje 3–5 min, rood < 3 min. Schermlezers horen hem alleen bij 3 en 1 minuut.
 */
export function SessionClock({
  startedAt,
  endsAt,
  label,
  className,
}: {
  startedAt: number;
  endsAt: number;
  label: string;
  className?: string;
}) {
  const now = useNow(500);
  const { remainingMs, color } = timerState(startedAt, endsAt, now);
  const text = formatCountdown(remainingMs);
  return (
    <span className={cx('inline-flex flex-col items-center', className)}>
      <span
        className={cx('font-semibold tabular-nums', COLORS[color])}
        aria-label={`${label}: ${text}`}
      >
        {text}
      </span>
      <span className="sr-only" aria-live="polite">
        {screenReaderAnnouncement(remainingMs) ?? ''}
      </span>
    </span>
  );
}
