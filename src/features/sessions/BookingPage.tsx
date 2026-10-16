import { CalendarClock, Landmark } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { Avatar } from '@/components/Avatar';
import { Button, ButtonLink } from '@/components/Button';
import { ChoiceChips } from '@/components/Chips';
import { EmptyState } from '@/components/EmptyState';
import { TextField } from '@/components/Field';
import { PageHeader } from '@/components/PageHeader';
import { ThemeFrame } from '@/components/ThemeFrame';
import { Thinking } from '@/components/Thinking';
import { toast } from '@/components/toastStore';
import { LIMITS } from '@/config/limits';
import { findMeta, useFigure } from '@/data/figures';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useNow } from '@/hooks/useNow';
import { t } from '@/i18n/nl';
import { localDateKey, relativeDayLabel } from '@/lib/dates';
import { bookingDays, daySlots } from '@/services/booking.service';
import { LimitError } from '@/services/limits.service';
import { BookingError, bookSession, rescheduleBooking } from '@/services/session.service';
import { useBookingStore } from '@/store/bookingStore';
import { useProfileStore } from '@/store/profileStore';
import type { Booking } from '@/store/schemas';
import { FigurePicker } from '@/features/figures/FigurePicker';
import { BookingConfirmation, SlotGrid } from './bookingParts';
import { whenLabel } from './format';

function SlotPicker({ figureId, rescheduleId }: { figureId: string; rescheduleId?: string }) {
  const navigate = useNavigate();
  const meta = findMeta(figureId);
  const { figure, status } = useFigure(meta?.id);
  const now = useNow(30_000);
  const bookings = useBookingStore((s) => s.bookings);
  const profile = useProfileStore((s) => s.profile);
  const days = bookingDays(now);
  const [day, setDay] = useState(() => bookingDays(now)[0] ?? localDateKey(now));
  const [time, setTime] = useState<string | undefined>();
  const [topic, setTopic] = useState('');
  const [confirmed, setConfirmed] = useState<Booking | null>(null);
  const moving = rescheduleId ? bookings.find((b) => b.id === rescheduleId) : undefined;
  useDocumentTitle(meta ? `${t.sessions.book}: ${meta.name}` : t.sessions.book);

  if (!meta) {
    return (
      <EmptyState
        className="mt-6"
        icon={<Landmark aria-hidden className="size-8" />}
        title={t.errors.figureNotFound}
        action={<ButtonLink to="/sessies/boeken">{t.sessions.chooseFigure}</ButtonLink>}
      />
    );
  }
  if (confirmed) return <BookingConfirmation booking={confirmed} meta={meta} />;
  if (!figure) {
    return status === 'error' ? (
      <p role="alert" className="mt-6 text-danger">
        {t.errors.generic}
      </p>
    ) : (
      <Thinking className="mt-10 justify-center" text={t.app.loading} />
    );
  }

  const limit = LIMITS.session.perDay[profile.tier];
  const usedOn = (dateKey: string) => profile.usageByDate[dateKey]?.sessions ?? 0;
  // Bij verzetten op dezelfde dag telt de oude afspraak niet mee.
  const dayFull = (dateKey: string) =>
    usedOn(dateKey) - (moving && moving.date === dateKey ? 1 : 0) >= limit;
  const slots = daySlots(figure, day, now, bookings);
  const free = slots.filter((s) => s.status === 'vrij').length;
  const full = dayFull(day);

  const confirm = () => {
    if (!time) return;
    try {
      if (moving) {
        const next = rescheduleBooking(moving.id, figure, { date: day, time });
        toast(t.sessions.rescheduled, 'ok');
        navigate(`/sessies/${next.id}`);
      } else {
        setConfirmed(bookSession(figure, { figureId: meta.id, date: day, time, topicHint: topic }));
      }
    } catch (error) {
      const message =
        error instanceof LimitError || error instanceof BookingError
          ? error.message
          : t.errors.generic;
      toast(message, 'warn');
      setTime(undefined);
    }
  };

  const todayKey = localDateKey(now);
  return (
    <ThemeFrame figure={meta}>
      <PageHeader
        eyebrow={moving ? t.sessions.rescheduleTitle : t.sessions.book}
        title={
          <span className="flex items-center gap-3">
            <Avatar figure={meta} size={56} />
            <span className="font-fig text-fig">{meta.name}</span>
          </span>
        }
        intro={moving ? `${t.sessions.rescheduleTitle}: ${whenLabel(moving)}` : t.sessions.intro}
      />
      <section aria-labelledby="dag">
        <h2 id="dag" className="mb-2 text-xl">
          {t.sessions.chooseDay}
        </h2>
        <ChoiceChips<string>
          label={t.sessions.chooseDay}
          value={day}
          onChange={(value) => {
            setDay(value);
            setTime(undefined);
          }}
          options={days.map((dateKey) => ({
            value: dateKey,
            label: relativeDayLabel(dateKey, todayKey),
            count: daySlots(figure, dateKey, now, bookings).filter((s) => s.status === 'vrij')
              .length,
          }))}
        />
      </section>
      <section aria-labelledby="tijd" className="mt-6">
        <h2 id="tijd" className="mb-2 text-xl">
          {t.sessions.chooseSlot}
        </h2>
        {full && (
          <p role="status" className="mb-3 rounded-xl border border-warn-soft bg-warn-soft p-3">
            {t.sessions.dayFull}{' '}
            {profile.tier === 'basis' && (
              <span className="text-ink-2">{t.sessions.premiumHint}</span>
            )}
          </p>
        )}
        {slots.length > 0 ? (
          <SlotGrid slots={slots} selected={time} disabled={full} onSelect={setTime} />
        ) : (
          <p className="text-ink-3">{t.sessions.noFreeSlots}</p>
        )}
        {slots.length > 0 && free === 0 && !full && (
          <p className="mt-2 text-ink-3">{t.sessions.noFreeSlots}</p>
        )}
      </section>
      {time && (
        <section aria-labelledby="bevestig" className="mt-6 max-w-xl space-y-4">
          <h2 id="bevestig" className="text-xl">
            {t.sessions.selectedSlot(whenLabel({ date: day, time }))}
          </h2>
          {!moving && (
            <TextField
              label={t.sessions.topicLabel}
              placeholder={t.sessions.topicPlaceholder}
              value={topic}
              maxLength={LIMITS.session.topicHintMaxLength}
              counter
              onChange={(event) => setTopic(event.target.value)}
            />
          )}
          <Button
            variant="figure"
            size="lg"
            icon={<CalendarClock aria-hidden className="size-5" />}
            onClick={confirm}
          >
            {moving ? t.sessions.rescheduleConfirm : t.sessions.confirm}
          </Button>
        </section>
      )}
    </ThemeFrame>
  );
}

export function BookingPage() {
  const { figureId } = useParams();
  const [params] = useSearchParams();
  useDocumentTitle(t.sessions.book);
  if (!figureId) {
    return (
      <>
        <PageHeader eyebrow={t.sessions.title} title={t.sessions.book} intro={t.sessions.intro} />
        <FigurePicker
          title={t.sessions.chooseFigure}
          hint={t.sessions.pickFigureHint}
          linkTo={(id) => `/sessies/boeken/${id}`}
        />
      </>
    );
  }
  return (
    <SlotPicker
      key={`${figureId}|${params.get('verzet') ?? ''}`}
      figureId={figureId}
      rescheduleId={params.get('verzet') ?? undefined}
    />
  );
}
