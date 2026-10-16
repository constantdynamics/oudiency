import { CalendarCheck, CalendarPlus } from 'lucide-react';
import { Link } from 'react-router';
import { Avatar } from '@/components/Avatar';
import { Button, ButtonLink } from '@/components/Button';
import { Card } from '@/components/Card';
import type { FigureMeta } from '@/data/figures';
import { t } from '@/i18n/nl';
import { cx } from '@/lib/cx';
import { downloadTextFile } from '@/lib/ics';
import type { Slot } from '@/services/booking.service';
import { bookingIcs } from '@/services/session.service';
import type { Booking } from '@/store/schemas';
import { whenLabel } from './format';

const SLOT_STYLE: Record<Slot['status'], string> = {
  vrij: 'border-fig bg-card text-fig hover:bg-fig-surface',
  bezet: 'border-dashed border-line-strong bg-paper-2 text-ink-3',
  verlopen: 'border-line bg-paper-2 text-ink-3 line-through',
  'jouw-afspraak': 'border-ok bg-ok-soft text-ok',
  onbeschikbaar: 'border-dashed border-line-strong bg-paper-2 text-ink-3',
};

const SLOT_TEXT: Record<Slot['status'], string> = {
  vrij: t.sessions.slotFree,
  bezet: t.sessions.slotBusy,
  verlopen: t.sessions.slotPast,
  'jouw-afspraak': t.sessions.slotMine,
  onbeschikbaar: '',
};

/** Het spreekuur van één dag. */
export function SlotGrid({
  slots,
  selected,
  disabled,
  onSelect,
}: {
  slots: readonly Slot[];
  selected?: string;
  /** De dag zit vol (daglimiet): vrije slots zijn dan niet te kiezen. */
  disabled: boolean;
  onSelect: (time: string) => void;
}) {
  return (
    <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
      {slots.map((slot) => {
        const label = slot.note ?? SLOT_TEXT[slot.status];
        if (slot.status === 'jouw-afspraak' && slot.bookingId) {
          return (
            <li key={slot.time}>
              <Link
                to={`/sessies/${slot.bookingId}`}
                className={cx(
                  'flex min-h-16 flex-col justify-center rounded-xl border-2 px-3 py-2',
                  SLOT_STYLE[slot.status],
                )}
              >
                <span className="text-lg font-semibold tabular-nums">{slot.time}</span>
                <span className="text-xs">{label}</span>
              </Link>
            </li>
          );
        }
        const free = slot.status === 'vrij' && !disabled;
        const active = selected === slot.time;
        return (
          <li key={slot.time}>
            <button
              type="button"
              disabled={!free}
              aria-pressed={free ? active : undefined}
              onClick={() => onSelect(slot.time)}
              title={label}
              className={cx(
                'flex min-h-16 w-full flex-col justify-center rounded-xl border-2 px-3 py-2 text-left transition-colors focus-visible:outline-3 focus-visible:outline-info disabled:cursor-not-allowed',
                active ? 'border-fig bg-fig text-white' : SLOT_STYLE[slot.status],
              )}
            >
              <span className="text-lg font-semibold tabular-nums">{slot.time}</span>
              <span className={cx('text-xs leading-tight', active ? 'text-white/90' : '')}>
                {label}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/** Bevestiging met afspraakkaart en de .ics-download. */
export function BookingConfirmation({ booking, meta }: { booking: Booking; meta: FigureMeta }) {
  const name = meta.shortName ?? meta.name;
  return (
    <Card as="section" aria-labelledby="bevestigd" className="mx-auto max-w-xl border-fig/30">
      <div className="flex items-center gap-3">
        <CalendarCheck aria-hidden className="size-7 text-ok" />
        <h1 id="bevestigd" className="text-3xl">
          {t.sessions.confirmTitle}
        </h1>
      </div>
      <div className="mt-4 flex items-center gap-4 rounded-2xl border border-line bg-fig-surface p-4">
        <Avatar figure={meta} size={64} decorative={false} />
        <div>
          <p className="font-fig text-2xl text-fig">{meta.name}</p>
          <p className="text-ink-2">{whenLabel(booking)}</p>
          {booking.topicHint && <p className="mt-1 text-sm text-ink-3">{booking.topicHint}</p>}
        </div>
      </div>
      <p className="mt-4 text-ink-2">{t.sessions.confirmBody(name)}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          variant="figure"
          icon={<CalendarPlus aria-hidden className="size-4" />}
          onClick={() =>
            downloadTextFile(
              `afspraak-${meta.id}-${booking.date}.ics`,
              bookingIcs(booking, name),
              'text/calendar;charset=utf-8',
            )
          }
        >
          {t.sessions.addToCalendar}
        </Button>
        <ButtonLink to={`/sessies/${booking.id}`} variant="secondary">
          {t.sessions.viewBooking}
        </ButtonLink>
        <ButtonLink to="/sessies" variant="ghost">
          {t.sessions.toSessions}
        </ButtonLink>
      </div>
    </Card>
  );
}
