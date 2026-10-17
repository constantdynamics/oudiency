import { CalendarPlus, CalendarX2, Repeat, Undo2 } from 'lucide-react';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { Avatar } from '@/components/Avatar';
import { AiLabel } from '@/components/Badges';
import { Button, ButtonLink } from '@/components/Button';
import { Card } from '@/components/Card';
import { CrisisCard } from '@/components/CrisisCard';
import { Dialog } from '@/components/Dialog';
import { toast } from '@/components/toastStore';
import { LIMITS } from '@/config/limits';
import type { FigureMeta } from '@/data/figures';
import type { Figure } from '@/data/types';
import { t } from '@/i18n/nl';
import { formatLongDate, formatTime, MINUTE, timeUntil } from '@/lib/dates';
import { downloadTextFile } from '@/lib/ics';
import { bookingStart, canChangeBooking } from '@/services/booking.service';
import { bookingIcs, cancelBooking } from '@/services/session.service';
import type { Booking, Session } from '@/store/schemas';
import { plainSource } from '@/lib/quoteCard';
import { ShareHighlightButton } from '../share/ShareHighlightButton';
import { whenLabel } from './format';
import { MessageList, ModeChoice, SummaryCard } from './sessionParts';

/** Agenda, verzetten en annuleren (zolang de afspraak nog niet begonnen is). */
export function BookingActions({
  booking,
  meta,
  now,
}: {
  booking: Booking;
  meta: FigureMeta;
  now: number;
}) {
  const navigate = useNavigate();
  const [confirm, setConfirm] = useState(false);
  const changeable = canChangeBooking(booking, now);
  const name = meta.shortName ?? meta.name;
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="secondary"
        size="sm"
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
      {changeable && (
        <>
          <ButtonLink
            variant="ghost"
            size="sm"
            icon={<Repeat aria-hidden className="size-4" />}
            to={`/sessies/boeken/${meta.id}?verzet=${booking.id}`}
          >
            {t.sessions.reschedule}
          </ButtonLink>
          <Button
            variant="ghost"
            size="sm"
            icon={<CalendarX2 aria-hidden className="size-4" />}
            onClick={() => setConfirm(true)}
          >
            {t.sessions.cancelBooking}
          </Button>
          <Dialog
            open={confirm}
            onClose={() => setConfirm(false)}
            title={t.sessions.cancelBooking}
            footer={
              <>
                <Button variant="secondary" onClick={() => setConfirm(false)}>
                  <Undo2 aria-hidden className="size-4" />
                  {t.app.cancel}
                </Button>
                <Button
                  variant="danger"
                  onClick={() => {
                    setConfirm(false);
                    if (cancelBooking(booking.id)) {
                      toast(t.sessions.cancelledToast, 'ok');
                      navigate('/sessies');
                    }
                  }}
                >
                  {t.sessions.cancelBooking}
                </Button>
              </>
            }
          >
            <p>{t.sessions.cancelConfirm}</p>
          </Dialog>
        </>
      )}
    </div>
  );
}

function StageHeader({
  meta,
  title,
  children,
}: {
  meta: FigureMeta;
  title: string;
  children?: ReactNode;
}) {
  return (
    <header
      className="rounded-3xl border border-line bg-fig-surface p-5 shadow-card motif-bg sm:p-7"
      data-motif={meta.theme.motif}
    >
      <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
        <Avatar figure={meta} size={96} decorative={false} />
        <div className="min-w-0">
          <p className="text-sm font-medium tracking-wide text-fig uppercase">{title}</p>
          <h1 className="mt-1 font-fig text-4xl leading-none text-fig">{meta.name}</h1>
          {children}
        </div>
      </div>
    </header>
  );
}

/** De deur is nog dicht: wanneer gaat hij open? */
export function BeforeStart({
  booking,
  meta,
  now,
}: {
  booking: Booking;
  meta: FigureMeta;
  now: number;
}) {
  const start = bookingStart(booking);
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <StageHeader meta={meta} title={t.sessions.upcoming}>
        <p className="mt-2 text-lg text-ink-2">{whenLabel(booking, now)}</p>
        <p className="mt-1 text-ink-2">
          {t.sessions.tooEarly(formatTime(start), timeUntil(start, now))}
        </p>
      </StageHeader>
      {booking.topicHint && <TopicCard topic={booking.topicHint} />}
      <BookingActions booking={booking} meta={meta} now={now} />
    </div>
  );
}

function TopicCard({ topic }: { topic: string }) {
  return (
    <Card>
      <p className="text-sm font-medium text-ink-3">{t.sessions.topicShown}</p>
      <p className="mt-1">{topic}</p>
    </Card>
  );
}

/** De deur staat open: typen of bellen. */
export function DoorOpenView({
  booking,
  meta,
  figure,
  canCall,
  callReason,
  onType,
  onCall,
}: {
  booking: Booking;
  meta: FigureMeta;
  figure: Figure;
  canCall: boolean;
  callReason?: string;
  onType: () => void;
  onCall: () => void;
}) {
  const start = bookingStart(booking);
  const closesAt = start + LIMITS.session.startWindowMinutes * MINUTE;
  return (
    <div className="mx-auto max-w-2xl">
      <StageHeader meta={meta} title={t.sessions.appointmentAt(formatTime(start))}>
        <p className="mt-2 text-lg text-ink-2">{figure.microcopy.doorOpen}</p>
        <p className="mt-1 text-sm text-ink-3">{t.sessions.startUntil(formatTime(closesAt))}</p>
      </StageHeader>
      {booking.topicHint && (
        <div className="mt-4">
          <TopicCard topic={booking.topicHint} />
        </div>
      )}
      <ModeChoice
        canCall={canCall}
        callBlockedReason={callReason}
        setupLink={`/profiel/stem?denker=${meta.id}`}
        onType={onType}
        onCall={onCall}
      />
      <p className="mt-4 text-sm text-ink-3">
        <AiLabel className="mr-2" />
        {t.app.aiLabelLong}
      </p>
    </div>
  );
}

/** Gemist of geannuleerd: een nieuwe afspraak plannen. */
export function ClosedBooking({ meta, title }: { meta: FigureMeta; title: string }) {
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <StageHeader meta={meta} title={title} />
      <div className="flex flex-wrap gap-2">
        <ButtonLink to={`/sessies/boeken/${meta.id}`} variant="figure">
          {t.sessions.planNew}
        </ButtonLink>
        <ButtonLink to="/sessies" variant="secondary">
          {t.sessions.toSessions}
        </ButtonLink>
      </div>
    </div>
  );
}

/** Na afloop: samenvatting, reflectievraag en het gesprek om terug te lezen. */
export function SessionEnded({ session, meta }: { session: Session; meta: FigureMeta }) {
  const reason = session.endReason ? t.sessions.endedBy[session.endReason] : t.sessions.ended;
  const spoken = session.messages
    .filter((m) => m.role === 'figure' && !m.hidden && !m.error)
    .map((m) => plainSource(m.text))
    .join('\n\n');
  // Kom je hier vanuit het gesprek (zelfde adres), begin dan bovenaan, met de focus op de uitkomst.
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    document.documentElement.scrollTop = 0;
    ref.current?.focus({ preventScroll: true });
  }, []);
  return (
    <div ref={ref} tabIndex={-1} className="mx-auto max-w-3xl space-y-6 outline-none">
      <StageHeader meta={meta} title={t.sessions.endedEyebrow}>
        <p className="mt-2 text-ink-2">
          {formatLongDate(Date.parse(session.startedAt))} · {reason}
        </p>
      </StageHeader>
      {session.crisis && <CrisisCard />}
      <SummaryCard session={session} />
      <div className="flex flex-wrap gap-2">
        <ButtonLink to={`/sessies/boeken/${meta.id}`} variant="figure">
          {t.sessions.planNew}
        </ButtonLink>
        {spoken && !session.crisis && (
          <ShareHighlightButton
            figure={meta}
            source={spoken}
            sourceLabel={t.share.fromSession}
            label={t.sessions.shareFragment}
          />
        )}
        <ButtonLink to="/sessies" variant="secondary">
          {t.sessions.toSessions}
        </ButtonLink>
      </div>
      <section aria-labelledby="gesprek">
        <h2 id="gesprek" className="text-2xl">
          {t.sessions.transcript}
        </h2>
        <MessageList messages={session.messages} meta={meta} />
      </section>
    </div>
  );
}
