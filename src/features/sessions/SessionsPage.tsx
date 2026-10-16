import { CalendarPlus, Keyboard, MessageSquareQuote, Phone } from 'lucide-react';
import { Link } from 'react-router';
import { Avatar } from '@/components/Avatar';
import { Pill } from '@/components/Badges';
import { ButtonLink } from '@/components/Button';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { PageHeader, SectionTitle } from '@/components/PageHeader';
import { LIMITS } from '@/config/limits';
import { figureName, findMeta } from '@/data/figures';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useNow } from '@/hooks/useNow';
import { t } from '@/i18n/nl';
import { formatLongDate, formatTime, localDateKey, timeUntil } from '@/lib/dates';
import { bookingStart, startWindow } from '@/services/booking.service';
import { upcomingBookings } from '@/services/session.service';
import { useBookingStore } from '@/store/bookingStore';
import { useProfileStore } from '@/store/profileStore';
import type { Booking, Session } from '@/store/schemas';
import { useSessionStore } from '@/store/sessionStore';
import { whenLabel } from './format';

function UpcomingCard({ booking, now }: { booking: Booking; now: number }) {
  const meta = findMeta(booking.figureId);
  if (!meta) return null;
  const window = startWindow(booking, now);
  const active = booking.status === 'actief';
  const open = window === 'open' || active;
  const start = bookingStart(booking);
  return (
    <Card as="article" className="relative flex items-center gap-4">
      <Avatar figure={meta} size={56} />
      <div className="min-w-0 flex-1">
        <h3 className="font-display text-xl font-semibold">
          <Link
            to={`/sessies/${booking.id}`}
            className="after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none focus-visible:after:outline-3 focus-visible:after:outline-info"
          >
            {meta.name}
          </Link>
        </h3>
        <p className="text-ink-2">
          {whenLabel(booking, now)}
          {!open && <span className="text-ink-3"> · {timeUntil(start, now)}</span>}
        </p>
        {booking.topicHint && <p className="truncate text-sm text-ink-3">{booking.topicHint}</p>}
        {open && (
          <p className="mt-1.5">
            {active ? (
              <Pill tone="ok">{t.sessions.goOn}</Pill>
            ) : (
              <Pill tone="gold">{t.sessions.doorOpen}</Pill>
            )}
          </p>
        )}
      </div>
    </Card>
  );
}

function HistoryCard({ session }: { session: Session }) {
  const meta = findMeta(session.figureId);
  if (!meta) return null;
  const started = Date.parse(session.startedAt);
  const ended = session.endedAt ? Date.parse(session.endedAt) : Date.parse(session.endsAt);
  const minutes = Math.max(1, Math.round((ended - started) / 60_000));
  return (
    <Card as="article" className="relative">
      <div className="flex items-start gap-3">
        <Avatar figure={meta} size={48} />
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-xl font-semibold">
            <Link
              to={`/sessies/${session.bookingId}`}
              className="after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none focus-visible:after:outline-3 focus-visible:after:outline-info"
            >
              {figureName(session.figureId)}
            </Link>
          </h3>
          <p className="flex flex-wrap items-center gap-2 text-sm text-ink-3">
            {formatLongDate(started)}, {formatTime(started)} · {minutes} min
            <span className="inline-flex items-center gap-1">
              {session.mode === 'bellen' ? (
                <Phone aria-hidden className="size-3.5" />
              ) : (
                <Keyboard aria-hidden className="size-3.5" />
              )}
              {session.mode === 'bellen' ? t.sessions.viaCall : t.sessions.viaChat}
            </span>
          </p>
        </div>
      </div>
      {session.status === 'afronden' ? (
        <p className="mt-3 text-ink-3 italic">{t.sessions.summarizing}</p>
      ) : session.summary ? (
        <>
          <p className="mt-3 line-clamp-3 text-ink-2">{session.summary}</p>
          {session.reflectionQuestion && (
            <p className="mt-2 flex gap-2 font-fig text-lg text-fig">
              <MessageSquareQuote aria-hidden className="mt-1 size-4 shrink-0" />
              {session.reflectionQuestion}
            </p>
          )}
        </>
      ) : (
        <p className="mt-3 text-ink-3">{t.sessions.noSummary}</p>
      )}
    </Card>
  );
}

export function SessionsPage() {
  useDocumentTitle(t.sessions.title);
  const now = useNow(30_000);
  const bookings = useBookingStore((s) => s.bookings);
  const sessions = useSessionStore((s) => s.sessions);
  const profile = useProfileStore((s) => s.profile);
  const upcoming = upcomingBookings(bookings, now);
  const history = sessions
    .filter((s) => s.status !== 'actief')
    .sort((a, b) => Date.parse(b.startedAt) - Date.parse(a.startedAt));
  const used = profile.usageByDate[localDateKey(now)]?.sessions ?? 0;
  const limit = LIMITS.session.perDay[profile.tier];

  return (
    <>
      <PageHeader
        title={t.sessions.title}
        intro={t.sessions.intro}
        actions={
          <ButtonLink to="/sessies/boeken" icon={<CalendarPlus aria-hidden className="size-4" />}>
            {t.sessions.book}
          </ButtonLink>
        }
      />
      <p className="flex flex-wrap gap-x-4 gap-y-1 text-ink-2">
        <span>{t.sessions.today(used, limit)}</span>
        <span>{t.sessions.credits(profile.credits)}</span>
      </p>

      <section aria-labelledby="komend" className="mt-8">
        <SectionTitle id="komend">{t.sessions.upcomingList}</SectionTitle>
        {upcoming.length > 0 ? (
          <div className="space-y-3">
            {upcoming.map((booking) => (
              <UpcomingCard key={booking.id} booking={booking} now={now} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<CalendarPlus aria-hidden className="size-8" />}
            title={t.sessions.noUpcoming}
            action={<ButtonLink to="/sessies/boeken">{t.sessions.book}</ButtonLink>}
          >
            {t.sessions.noUpcomingBody}
          </EmptyState>
        )}
      </section>

      <section aria-labelledby="geschiedenis" className="mt-10">
        <SectionTitle id="geschiedenis">{t.sessions.history}</SectionTitle>
        {history.length > 0 ? (
          <div className="grid gap-3 lg:grid-cols-2">
            {history.map((session) => (
              <HistoryCard key={session.id} session={session} />
            ))}
          </div>
        ) : (
          <p className="text-ink-3">{t.sessions.noHistory}</p>
        )}
      </section>
    </>
  );
}
