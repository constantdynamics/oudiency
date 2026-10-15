import { Bell, BellRing, CalendarClock, CheckCheck, MessageCircleHeart, ShieldCheck, Sparkles } from 'lucide-react';
import { useId, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router';
import { Avatar } from '@/components/Avatar';
import { findMeta } from '@/data/figures';
import { useNow } from '@/hooks/useNow';
import { t } from '@/i18n/nl';
import { cx } from '@/lib/cx';
import { timeAgo } from '@/lib/dates';
import { useNotificationStore } from '@/store/miscStores';
import type { AppNotification } from '@/store/schemas';

const KIND_ICON = {
  reactie: MessageCircleHeart,
  ontdekt: Sparkles,
  afspraak: CalendarClock,
  moderatie: ShieldCheck,
  vervolgvraag: MessageCircleHeart,
  systeem: Bell,
} as const;

function NotificationItem({
  notification,
  now,
  onOpen,
}: {
  notification: AppNotification;
  now: number;
  onOpen: (notification: AppNotification) => void;
}) {
  const figure = findMeta(notification.figureId);
  const Icon = KIND_ICON[notification.kind];
  return (
    <li>
      <button
        type="button"
        onClick={() => onOpen(notification)}
        className={cx(
          'flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-paper-2',
          !notification.read && 'bg-gold-soft/40',
        )}
      >
        {figure ? (
          <Avatar figure={figure} size={36} />
        ) : (
          <span className="inline-flex size-9 items-center justify-center rounded-full bg-paper-2 text-ink-2">
            <Icon aria-hidden className="size-4" />
          </span>
        )}
        <span className="min-w-0 flex-1">
          <span className="block text-[0.95rem] leading-snug">{notification.text}</span>
          <span className="mt-0.5 block text-xs text-ink-3">{timeAgo(Date.parse(notification.visibleAt), now)}</span>
        </span>
        {!notification.read && <span aria-label="ongelezen" className="mt-2 size-2 shrink-0 rounded-full bg-terracotta" />}
      </button>
    </li>
  );
}

/** Bel met meldingen: reacties van denkers, afspraken, moderatie-uitslagen. */
export function NotificationBell() {
  const now = useNow(15_000);
  const notifications = useNotificationStore((s) => s.notifications);
  const markRead = useNotificationStore((s) => s.markRead);
  const markAllRead = useNotificationStore((s) => s.markAllRead);
  const navigate = useNavigate();
  const popoverId = useId().replace(/:/g, '');
  const popoverRef = useRef<HTMLDivElement>(null);

  const visible = useMemo(
    () =>
      notifications
        .filter((n) => Date.parse(n.visibleAt) <= now)
        .sort((a, b) => Date.parse(b.visibleAt) - Date.parse(a.visibleAt))
        .slice(0, 40),
    [notifications, now],
  );
  const unread = visible.filter((n) => !n.read).length;

  const open = (notification: AppNotification) => {
    markRead([notification.id]);
    popoverRef.current?.hidePopover?.();
    if (notification.link) navigate(notification.link);
  };

  return (
    <>
      <button
        type="button"
        popoverTarget={popoverId}
        aria-label={t.nav.openNotifications(unread)}
        title={t.notifications.title}
        className="relative inline-flex size-11 items-center justify-center rounded-full text-ink-2 transition-colors hover:bg-paper-2 hover:text-ink"
      >
        {unread > 0 ? <BellRing aria-hidden className="size-5" /> : <Bell aria-hidden className="size-5" />}
        {unread > 0 && (
          <span
            aria-hidden
            className="absolute top-1.5 right-1.5 inline-flex min-w-5 items-center justify-center rounded-full bg-terracotta px-1 text-[0.7rem] leading-5 font-semibold text-white"
          >
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>
      <div
        ref={popoverRef}
        id={popoverId}
        popover="auto"
        aria-label={t.notifications.title}
        className="fixed inset-auto top-16 right-2 m-0 max-h-[min(32rem,calc(100dvh-6rem))] w-[min(24rem,calc(100vw-1rem))] overflow-auto rounded-2xl border border-line bg-card p-2 text-ink shadow-lift sm:right-4"
      >
        <div className="flex items-center justify-between px-3 pt-1.5 pb-2">
          <h2 className="text-xl">{t.notifications.title}</h2>
          {unread > 0 && (
            <button
              type="button"
              onClick={() => markAllRead(now)}
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-sm text-ink-2 hover:bg-paper-2"
            >
              <CheckCheck aria-hidden className="size-4" />
              {t.notifications.markAllRead}
            </button>
          )}
        </div>
        {visible.length === 0 ? (
          <p className="px-3 pb-3 text-sm text-ink-3">{t.notifications.empty}</p>
        ) : (
          <ul className="space-y-0.5">
            {visible.map((notification) => (
              <NotificationItem key={notification.id} notification={notification} now={now} onOpen={open} />
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
