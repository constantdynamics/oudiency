/**
 * Achtergrondtaken die periodiek draaien zolang de app open is (elke 15 s, bij terugkeer naar
 * het tabblad en bij een verschuiving van de dev-klok):
 *  - gemiste afspraken afhandelen (dagplek komt vrij)
 *  - meldingen klaarzetten voor de starttijd van afspraken
 *  - denkers "ontdekken" zodra hun vertraagde reactie zichtbaar wordt
 *  - browsernotificaties tonen (optioneel, alleen als het tabblad open is)
 * Features kunnen eigen taken registreren (bijv. sessies die over tijd zijn afronden).
 */
import { useEffect } from 'react';
import { figureName } from '@/data/figures';
import { t } from '@/i18n/nl';
import { clock } from '@/lib/clock';
import { formatTime, MINUTE } from '@/lib/dates';
import { uid } from '@/lib/ids';
import { useBookingStore } from '@/store/bookingStore';
import { useNotificationStore } from '@/store/miscStores';
import { usePostStore } from '@/store/postStore';
import { useProfileStore } from '@/store/profileStore';
import { useSettingsStore } from '@/store/settingsStore';
import { bookingStart, findMissedBookings } from './booking.service';

type Task = (now: number) => void | Promise<void>;
const extraTasks = new Set<Task>();

export function registerBackgroundTask(task: Task): () => void {
  extraTasks.add(task);
  return () => {
    extraTasks.delete(task);
  };
}

export function handleMissedBookings(now: number): void {
  const { bookings, update } = useBookingStore.getState();
  for (const booking of findMissedBookings(bookings, now)) {
    update(booking.id, { status: 'gemist' });
    useProfileStore.getState().releaseUsage('sessions', booking.date);
    useNotificationStore.getState().add({
      id: uid('melding'),
      kind: 'afspraak',
      text: `Je afspraak met ${figureName(booking.figureId)} is gemist. De dagplek is weer vrij.`,
      link: '/sessies',
      figureId: booking.figureId,
      visibleAt: clock.iso(),
      read: false,
      sourceId: `gemist:${booking.id}`,
    });
  }
}

export function scheduleAppointmentNotifications(): void {
  const { bookings, update } = useBookingStore.getState();
  for (const booking of bookings) {
    if (booking.status !== 'gepland' || booking.notified) continue;
    const start = bookingStart(booking);
    useNotificationStore.getState().add({
      id: uid('melding'),
      kind: 'afspraak',
      text: `${figureName(booking.figureId)} is klaar voor je afspraak van ${formatTime(start)}. De deur staat open.`,
      link: `/sessies/${booking.id}`,
      figureId: booking.figureId,
      visibleAt: new Date(start).toISOString(),
      read: false,
      sourceId: `start:${booking.id}`,
    });
    update(booking.id, { notified: true });
  }
}

export function revealDiscoveries(now: number): void {
  const { posts } = usePostStore.getState();
  const profile = useProfileStore.getState();
  for (const post of posts) {
    for (const reaction of post.reactions) {
      if (reaction.discovery && Date.parse(reaction.visibleAt) <= now)
        profile.discover(reaction.figureId);
    }
  }
}

function pushBrowserNotifications(now: number): void {
  if (!useSettingsStore.getState().settings.browserNotifications) return;
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
  const { notifications, markPushed } = useNotificationStore.getState();
  for (const notification of notifications) {
    const visibleAt = Date.parse(notification.visibleAt);
    if (notification.pushed || notification.read || visibleAt > now) continue;
    if (now - visibleAt > 15 * MINUTE) {
      markPushed(notification.id);
      continue;
    }
    try {
      new Notification(t.notifications.browserTitle, {
        body: notification.text,
        tag: notification.id,
      });
    } catch {
      // sommige browsers staan dit alleen via een service worker toe
    }
    markPushed(notification.id);
  }
}

let running = false;

export async function runBackgroundTasks(): Promise<void> {
  if (running) return;
  running = true;
  try {
    const now = clock.now();
    handleMissedBookings(now);
    scheduleAppointmentNotifications();
    revealDiscoveries(now);
    for (const task of extraTasks) await task(now);
    pushBrowserNotifications(now);
  } finally {
    running = false;
  }
}

export function useBackgroundTasks(): void {
  useEffect(() => {
    const run = () => {
      void runBackgroundTasks();
    };
    run();
    const timer = setInterval(run, 15_000);
    const unsubscribe = clock.subscribe(run);
    const onVisible = () => {
      if (document.visibilityState === 'visible') run();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(timer);
      unsubscribe();
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);
}
