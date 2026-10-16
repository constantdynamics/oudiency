import { CalendarX2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { activeProviderId } from '@/ai';
import { ButtonLink } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { ThemeFrame } from '@/components/ThemeFrame';
import { Thinking } from '@/components/Thinking';
import { toast } from '@/components/toastStore';
import { findMeta, useFigure } from '@/data/figures';
import { voiceSpecFor } from '@/data/voices';
import { CallLobby } from '@/features/voice/callParts';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useNow } from '@/hooks/useNow';
import { t } from '@/i18n/nl';
import { startWindow } from '@/services/booking.service';
import { BookingError, memoryFor, startSession } from '@/services/session.service';
import { summarizeSession, type TurnContext } from '@/services/sessionAi';
import { useBookingStore } from '@/store/bookingStore';
import { useProfileStore } from '@/store/profileStore';
import { useSessionStore } from '@/store/sessionStore';
import { useShallow } from 'zustand/react/shallow';
import { elevenLabsKeyStorage, useHasSecret } from '@/store/settingsStore';
import { useVoiceStore } from '@/store/voiceStore';
import type { CallSession } from '@/voice/callSession';
import { BeforeStart, ClosedBooking, DoorOpenView, SessionEnded } from './sessionViews';
import { TextSession } from './TextSession';
import { createSessionCall } from './voiceCall';
import { VoiceSession } from './VoiceSession';

const NO_MEMORY: string[] = [];

export function SessionPage() {
  const { id } = useParams();
  const booking = useBookingStore((s) => s.bookings.find((b) => b.id === id));
  const meta = findMeta(booking?.figureId);
  const { figure } = useFigure(meta?.id);
  const sessions = useSessionStore((s) => s.sessions);
  const session = booking?.sessionId ? sessions.find((s) => s.id === booking.sessionId) : undefined;
  const displayName = useProfileStore((s) => s.profile.displayName);
  const hasKey = useHasSecret(elevenLabsKeyStorage);
  const hasVoice = useVoiceStore((s) => (meta ? Boolean(s.voices[meta.id]) : false));
  const now = useNow(1000);
  const [call, setCall] = useState<CallSession | null>(null);
  const [voiceLobby, setVoiceLobby] = useState(false);
  useDocumentTitle(meta ? `${t.sessions.title}: ${meta.name}` : t.sessions.bookingNotFound);

  // Het geheugen blijft gelijk tijdens een gesprek (alleen afgeronde gesprekken tellen).
  const sessionId = session?.id;
  const memory = useSessionStore(
    useShallow((s) => (meta ? memoryFor(s.sessions, meta.id, sessionId) : NO_MEMORY)),
  );
  const turn: TurnContext | null = useMemo(
    () => (figure ? { figure, studentName: displayName, memory } : null),
    [figure, displayName, memory],
  );

  // Na afloop: de samenvatting maken (één keer, ook als de pagina later opnieuw opent).
  const summarizeId = session?.status === 'afronden' ? session.id : undefined;
  useEffect(() => {
    if (summarizeId && figure) void summarizeSession(summarizeId, figure);
  }, [summarizeId, figure]);

  // Een belgesprek ophangen als je de pagina verlaat (of opnieuw belt).
  useEffect(() => () => call?.dispose(), [call]);

  if (!booking || !meta) {
    return (
      <EmptyState
        className="mt-6"
        icon={<CalendarX2 aria-hidden className="size-8" />}
        title={t.sessions.bookingNotFound}
        action={<ButtonLink to="/sessies">{t.sessions.toSessions}</ButtonLink>}
      >
        {t.sessions.bookingNotFoundBody}
      </EmptyState>
    );
  }

  if (!figure || !turn) {
    return (
      <ThemeFrame figure={meta}>
        <Thinking className="mt-10 justify-center" text={t.app.loading} />
      </ThemeFrame>
    );
  }

  const name = meta.shortName ?? meta.name;
  const callable = Boolean(voiceSpecFor(meta.id));
  const canCall = callable && hasKey && hasVoice;
  const callReason = callable ? t.sessions.callNeedsSetup(name) : t.sessions.callUnavailable;

  const startText = () => {
    try {
      startSession(booking, 'tekst', activeProviderId());
    } catch (error) {
      toast(error instanceof BookingError ? error.message : t.errors.generic, 'warn');
    }
  };

  const startCall = () => {
    try {
      const started = session ?? startSession(booking, 'bellen', activeProviderId());
      const next = createSessionCall(started.id, figure, turn);
      if (!next) return;
      setVoiceLobby(false);
      setCall(next);
      void next.start();
    } catch (error) {
      toast(error instanceof BookingError ? error.message : t.errors.generic, 'warn');
    }
  };

  let content;
  if (session && session.status !== 'actief') {
    content = <SessionEnded session={session} meta={meta} />;
  } else if (session && session.mode === 'bellen') {
    content = (
      <VoiceSession
        session={session}
        meta={meta}
        figure={figure}
        call={call}
        onCallAgain={startCall}
      />
    );
  } else if (session) {
    content = <TextSession session={session} meta={meta} figure={figure} turn={turn} />;
  } else if (booking.status === 'geannuleerd') {
    content = <ClosedBooking meta={meta} title={t.sessions.cancelled} />;
  } else if (booking.status === 'gemist' || startWindow(booking, now) === 'gemist') {
    content = <ClosedBooking meta={meta} title={t.sessions.missed} />;
  } else if (startWindow(booking, now) === 'te-vroeg') {
    content = <BeforeStart booking={booking} meta={meta} now={now} />;
  } else if (voiceLobby) {
    content = (
      <CallLobby
        meta={meta}
        eyebrow={t.sessions.title}
        subtitle={`${t.sessions.doorOpen} · 15 minuten`}
        onStart={startCall}
        onBack={() => setVoiceLobby(false)}
        backLabel={t.sessions.chooseMode}
      />
    );
  } else {
    content = (
      <DoorOpenView
        booking={booking}
        meta={meta}
        figure={figure}
        canCall={canCall}
        callReason={canCall ? undefined : callReason}
        onType={startText}
        onCall={() => setVoiceLobby(true)}
      />
    );
  }

  return (
    <ThemeFrame figure={meta} className="pb-6">
      {content}
    </ThemeFrame>
  );
}
