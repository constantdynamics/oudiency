/**
 * Dev-paneel (§5.6): alleen in dev of met ?dev=1. Tijd verschuiven, timers vooruitspoelen,
 * daglimieten resetten, credits, Premium, reactievertraging op 0 en de AI-bron wisselen.
 */
import { Bug, X } from 'lucide-react';
import { useState } from 'react';
import { useAiMode } from '@/ai';
import { Toggle } from '@/components/Field';
import { clock } from '@/lib/clock';
import { DAY, HOUR, localDateKey, MINUTE } from '@/lib/dates';
import { cx } from '@/lib/cx';
import { useNow } from '@/hooks/useNow';
import { bookingStart, nextBooking } from '@/services/booking.service';
import { runBackgroundTasks } from '@/services/background';
import { useBookingStore } from '@/store/bookingStore';
import { useNotificationStore } from '@/store/miscStores';
import { usePostStore } from '@/store/postStore';
import { useProfileStore } from '@/store/profileStore';
import { useSessionStore } from '@/store/sessionStore';
import { apiKeyStorage, useSettingsStore } from '@/store/settingsStore';

function DevButton({ onClick, children }: { onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg border border-line-strong bg-card px-2.5 py-1.5 text-xs font-medium hover:bg-paper-2"
    >
      {children}
    </button>
  );
}

function offsetLabel(ms: number): string {
  if (ms === 0) return 'echte tijd';
  const sign = ms > 0 ? '+' : '−';
  const abs = Math.abs(ms);
  if (abs >= DAY) return `${sign}${(abs / DAY).toFixed(2)} dagen`;
  if (abs >= HOUR) return `${sign}${(abs / HOUR).toFixed(2)} uur`;
  return `${sign}${Math.round(abs / MINUTE)} min`;
}

export default function DevPanel() {
  const [open, setOpen] = useState(false);
  const now = useNow(1000);
  const profile = useProfileStore((s) => s.profile);
  const settings = useSettingsStore((s) => s.settings);
  const update = useSettingsStore((s) => s.update);
  const mode = useAiMode();
  const bookings = useBookingStore((s) => s.bookings);
  const sessions = useSessionStore((s) => s.sessions);

  const shift = (ms: number) => {
    clock.advance(ms);
    void runBackgroundTasks();
  };
  const upcoming = nextBooking(bookings, now);
  const active = sessions.find((s) => s.status === 'actief');

  return (
    <div className="fixed bottom-[calc(5rem_+_var(--player-h))] left-3 z-40 md:bottom-[calc(1rem_+_var(--player-h))]">
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-full bg-warn px-3 py-2 text-xs font-semibold text-white shadow-lift"
        >
          <Bug aria-hidden className="size-4" /> Dev
        </button>
      )}
      {open && (
        <section
          aria-label="Dev-paneel"
          className="w-[min(22rem,calc(100vw-1.5rem))] rounded-2xl border border-line bg-card p-4 text-sm shadow-lift"
        >
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-display text-xl">Dev-paneel</h2>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Sluiten"
              className="rounded-full p-1 hover:bg-paper-2"
            >
              <X aria-hidden className="size-4" />
            </button>
          </div>
          <p className="text-xs text-ink-3">
            {new Date(now).toLocaleString('nl-NL')} ·{' '}
            <span className={cx(clock.offset() !== 0 && 'font-semibold text-warn')}>
              {offsetLabel(clock.offset())}
            </span>
          </p>

          <h3 className="mt-3 mb-1 text-xs font-semibold tracking-wide text-ink-3 uppercase">
            Tijd
          </h3>
          <div className="flex flex-wrap gap-1.5">
            <DevButton onClick={() => shift(-HOUR)}>−1 uur</DevButton>
            <DevButton onClick={() => shift(5 * MINUTE)}>+5 min</DevButton>
            <DevButton onClick={() => shift(15 * MINUTE)}>+15 min</DevButton>
            <DevButton onClick={() => shift(HOUR)}>+1 uur</DevButton>
            <DevButton onClick={() => shift(DAY)}>+1 dag</DevButton>
            <DevButton onClick={() => clock.reset()}>Echte tijd</DevButton>
            {upcoming && upcoming.status === 'gepland' && (
              <DevButton onClick={() => clock.travelTo(bookingStart(upcoming) + 5_000)}>
                Naar volgende afspraak
              </DevButton>
            )}
            {active && (
              <DevButton
                onClick={() => clock.travelTo(Date.parse(active.endsAt) - 3 * MINUTE + 2_000)}
              >
                Sessie: naar 3 min resterend
              </DevButton>
            )}
            {active && (
              <DevButton onClick={() => clock.travelTo(Date.parse(active.endsAt) - 15_000)}>
                Sessie: bijna voorbij
              </DevButton>
            )}
          </div>

          <h3 className="mt-3 mb-1 text-xs font-semibold tracking-wide text-ink-3 uppercase">
            Limieten &amp; status
          </h3>
          <div className="flex flex-wrap gap-1.5">
            <DevButton onClick={() => useProfileStore.getState().resetUsageDay(localDateKey(now))}>
              Daglimieten vandaag resetten
            </DevButton>
            <DevButton onClick={() => useProfileStore.getState().addCredits(5)}>
              +5 credits
            </DevButton>
            <DevButton
              onClick={() =>
                useProfileStore.getState().setTier(profile.tier === 'premium' ? 'basis' : 'premium')
              }
            >
              {profile.tier === 'premium' ? 'Premium uit' : 'Premium aan'}
            </DevButton>
            <DevButton
              onClick={() => {
                const iso = clock.iso();
                usePostStore.setState((s) => ({
                  posts: s.posts.map((p) => ({
                    ...p,
                    reactions: p.reactions.map((r) =>
                      Date.parse(r.visibleAt) > now ? { ...r, visibleAt: iso } : r,
                    ),
                  })),
                }));
                useNotificationStore.setState((s) => ({
                  notifications: s.notifications.map((n) =>
                    Date.parse(n.visibleAt) > now && n.kind !== 'afspraak'
                      ? { ...n, visibleAt: iso }
                      : n,
                  ),
                }));
                void runBackgroundTasks();
              }}
            >
              Wachtende reacties nu tonen
            </DevButton>
          </div>
          <p className="mt-1 text-xs text-ink-3">
            {profile.tier} · {profile.credits} credits
          </p>

          <div className="mt-2 border-t border-line pt-1">
            <Toggle
              label="Reactievertraging op 0"
              description="Reacties en demo-antwoorden direct, zonder typvertraging."
              checked={settings.devInstantReactions}
              onChange={(value) => update({ devInstantReactions: value })}
            />
            <Toggle
              label="Eigen API-key gebruiken"
              description={
                apiKeyStorage.get()
                  ? `Nu: ${mode === 'demo' ? 'demomodus' : 'eigen key'}`
                  : 'Stel eerst een key in via Profiel.'
              }
              checked={settings.aiSource === 'anthropic-browser'}
              disabled={!apiKeyStorage.get()}
              onChange={(value) => update({ aiSource: value ? 'anthropic-browser' : 'demo' })}
            />
          </div>
        </section>
      )}
    </div>
  );
}
