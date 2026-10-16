import {
  BookOpenText,
  CalendarClock,
  Compass,
  Landmark,
  MessagesSquare,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import { lazy, Suspense, useEffect, useRef } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router';
import { Toasts } from '@/components/Toasts';
import { APP } from '@/config/app';
import { useBackgroundTasks } from '@/services/background';
import { t } from '@/i18n/nl';
import { clock } from '@/lib/clock';
import { cx } from '@/lib/cx';
import { useNow } from '@/hooks/useNow';
import { useProfileStore } from '@/store/profileStore';
import { useSettingsStore } from '@/store/settingsStore';
import { DemoBanner } from './DemoBanner';
import { ErrorBoundary } from './ErrorBoundary';
import { NotificationBell } from './NotificationBell';
import { PageFallback } from './PageFallback';
import { isDevPanelAllowed } from './devAccess';
import { useHeaderHeight, useScrollRestoration } from './scroll';

const DevPanel = lazy(() => import('@/features/dev/DevPanel'));

const NAV_ITEMS = [
  { to: '/', label: t.nav.discover, icon: Compass, end: true },
  { to: '/timeline', label: t.nav.timeline, icon: MessagesSquare, end: false },
  { to: '/denkers', label: t.nav.figures, icon: Landmark, end: false },
  { to: '/sessies', label: t.nav.sessions, icon: CalendarClock, end: false },
  { to: '/colleges', label: t.nav.lectures, icon: BookOpenText, end: false },
] as const;

function Logo() {
  return (
    <Link
      to="/"
      className="group flex items-center gap-2.5 rounded-full pr-2"
      aria-label={`${APP.name}, naar Ontdekken`}
    >
      <svg viewBox="0 0 40 40" className="size-9 shrink-0" aria-hidden>
        <circle cx="20" cy="20" r="19" className="fill-gold" />
        <circle cx="20" cy="20" r="17" className="fill-paper" />
        <circle cx="20" cy="20" r="12.5" className="fill-none stroke-ink" strokeWidth="2.2" />
        <path d="M20 7.5v25M7.5 20h25" className="stroke-gold" strokeWidth="1" />
        <circle cx="20" cy="20" r="3" className="fill-ink" />
      </svg>
      <span className="font-display text-[1.65rem] leading-none font-semibold tracking-tight">
        {APP.name}
      </span>
    </Link>
  );
}

function ProfileLink() {
  const name = useProfileStore((s) => s.profile.displayName);
  const initial = name.trim().charAt(0).toUpperCase();
  return (
    <NavLink
      to="/profiel"
      aria-label={t.nav.profile}
      title={t.nav.profile}
      className={({ isActive }) =>
        cx(
          'inline-flex size-11 items-center justify-center rounded-full border-2 font-display text-lg font-semibold transition-colors',
          isActive
            ? 'border-ink bg-ink text-paper'
            : 'border-line-strong bg-card text-ink hover:border-ink-2',
        )
      }
    >
      {initial || <UserRound aria-hidden className="size-5" />}
    </NavLink>
  );
}

function DevTimeIndicator() {
  const now = useNow(30_000);
  const offset = clock.offset();
  if (offset === 0) return null;
  const hours = offset / 3_600_000;
  const label =
    Math.abs(hours) >= 24
      ? `${hours > 0 ? '+' : ''}${(hours / 24).toFixed(1)} d`
      : `${hours > 0 ? '+' : ''}${hours.toFixed(1)} u`;
  return (
    <div className="bg-warn px-4 py-1 text-center text-xs font-medium text-white" role="status">
      {t.app.devTimeShifted(label)} · {new Date(now).toLocaleString('nl-NL')}
    </div>
  );
}

export function AppLayout() {
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const firstRenderRef = useRef(true);
  const moderatorMode = useSettingsStore((s) => s.settings.moderatorMode);
  const devPanelEnabled = useSettingsStore((s) => s.settings.devPanelEnabled);
  const showDev = isDevPanelAllowed() || devPanelEnabled;

  useBackgroundTasks();
  useScrollRestoration();
  useHeaderHeight(headerRef);

  // Focus naar de hoofdinhoud bij navigatie (schermlezers horen de nieuwe pagina).
  useEffect(() => {
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      return;
    }
    mainRef.current?.focus({ preventScroll: true });
  }, [location.pathname]);

  return (
    <div className="flex min-h-dvh flex-col">
      <button
        type="button"
        onClick={() => mainRef.current?.focus()}
        className="sr-only-focusable fixed top-2 left-2 z-50 rounded-full bg-ink px-4 py-2 text-paper"
      >
        {t.app.skipToContent}
      </button>
      <DevTimeIndicator />
      <header
        ref={headerRef}
        className="sticky top-0 z-30 border-b border-line bg-paper/92 backdrop-blur supports-[backdrop-filter]:bg-paper/80"
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <Logo />
          <nav aria-label={t.nav.main} className="hidden md:block">
            <ul className="flex items-center gap-1">
              {NAV_ITEMS.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      cx(
                        'rounded-full px-3.5 py-2 text-[0.95rem] font-medium transition-colors',
                        isActive
                          ? 'bg-ink text-paper'
                          : 'text-ink-2 hover:bg-paper-2 hover:text-ink',
                      )
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
              {moderatorMode && (
                <li>
                  <NavLink
                    to="/moderatie"
                    className={({ isActive }) =>
                      cx(
                        'inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[0.95rem] font-medium',
                        isActive ? 'bg-ink text-paper' : 'text-ink-2 hover:bg-paper-2',
                      )
                    }
                  >
                    <ShieldCheck aria-hidden className="size-4" />
                    {t.nav.moderation}
                  </NavLink>
                </li>
              )}
            </ul>
          </nav>
          <div className="flex items-center gap-1">
            {moderatorMode && (
              <NavLink
                to="/moderatie"
                aria-label={t.nav.moderation}
                className="inline-flex size-11 items-center justify-center rounded-full text-ink-2 hover:bg-paper-2 md:hidden"
              >
                <ShieldCheck aria-hidden className="size-5" />
              </NavLink>
            )}
            <NotificationBell />
            <ProfileLink />
          </div>
        </div>
        <DemoBanner />
      </header>

      <main
        id="inhoud"
        ref={mainRef}
        tabIndex={-1}
        className="mx-auto w-full max-w-6xl flex-1 px-4 pt-6 pb-28 outline-none sm:px-6 md:pb-12"
      >
        <ErrorBoundary resetKey={location.pathname}>
          <Suspense fallback={<PageFallback />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </main>

      <footer className="hidden border-t border-line bg-paper-2/60 md:block">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-5 text-sm text-ink-3">
          <p>
            {APP.name} · {APP.tagline}. Alle gesprekken zijn een AI-simulatie.
          </p>
          <nav aria-label="Voettekst">
            <ul className="flex gap-4">
              <li>
                <Link className="underline-offset-4 hover:underline" to="/over">
                  Over &amp; privacy
                </Link>
              </li>
              <li>
                <Link className="underline-offset-4 hover:underline" to="/profiel">
                  Instellingen
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </footer>

      <nav
        aria-label={t.nav.main}
        className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      >
        <ul className="mx-auto grid max-w-lg grid-cols-5">
          {NAV_ITEMS.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cx(
                    'flex min-h-16 flex-col items-center justify-center gap-0.5 text-[0.7rem] font-medium',
                    isActive ? 'text-ink' : 'text-ink-3',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={cx(
                        'inline-flex h-7 w-12 items-center justify-center rounded-full transition-colors',
                        isActive && 'bg-gold-soft',
                      )}
                    >
                      <item.icon
                        aria-hidden
                        className="size-5"
                        strokeWidth={isActive ? 2.3 : 1.8}
                      />
                    </span>
                    {item.label}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <Toasts />
      {showDev && (
        <Suspense fallback={null}>
          <DevPanel />
        </Suspense>
      )}
    </div>
  );
}
